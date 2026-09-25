"""Reproducible illustrative Community Power model; Python 3 standard library."""
from pathlib import Path
import csv, math, sys

BASE = Path(__file__).resolve().parent
CASES = ('downside', 'base', 'upside')
EXPECTED = set('communities accounts_per_community target_adoption ramp_months monthly_churn eligible_fraction supplier_conversion upgrade_adoption upgrade_price matching_fee kwh_per_account baseline_rate offer_rate savings_fee_rate community_allocation_rate dashboard_paying_share dashboard_fee referral_conversion referral_fee sponsorship variable_cost payment_cost_rate fixed_opex build_cost feasibility_cost other_launch_cost'.split())
FRACTIONS = set('target_adoption monthly_churn eligible_fraction supplier_conversion upgrade_adoption savings_fee_rate community_allocation_rate dashboard_paying_share referral_conversion payment_cost_rate'.split())

def inputs():
    with (BASE/'assumptions.csv').open(encoding='utf-8-sig',newline='') as f:
        rows=list(csv.DictReader(f))
    ids=[r['parameter'] for r in rows]
    if len(ids)!=len(set(ids)) or set(ids)!=EXPECTED:
        raise ValueError('Missing, unknown or duplicate parameter IDs')
    cases={c:{} for c in CASES}
    for r in rows:
        for c in CASES:
            try: v=float(r[c])
            except (ValueError,TypeError): raise ValueError(f'Invalid value: {r["parameter"]}/{c}')
            k=r['parameter']
            if not math.isfinite(v) or v<0: raise ValueError(f'Nonnegative finite value required: {k}/{c}')
            if k in FRACTIONS and v>1: raise ValueError(f'Fraction above 1: {k}/{c}')
            if k in ('communities','accounts_per_community','ramp_months') and v!=int(v):
                raise ValueError(f'Integer required: {k}/{c}')
            if k=='ramp_months' and v<1: raise ValueError('Ramp must be at least one month')
            cases[c][k]=v
    return cases

def calculate(a,case):
    joined_prev=active_prev=activated_prev=0.
    initial=a['build_cost']+a['feasibility_cost']+a['other_launch_cost']
    cash=-initial; rows=[]
    for month in range(1,13):
        reachable=a['communities']*a['accounts_per_community']
        joined=reachable*a['target_adoption']*min(month/a['ramp_months'],1)
        new_joined=joined-joined_prev
        active=active_prev*(1-a['monthly_churn'])+new_joined
        activated=active*a['eligible_fraction']*a['supplier_conversion']
        new_activated=max(activated-activated_prev*(1-a['monthly_churn']),0)
        paid=active*a['upgrade_adoption']
        kwh=activated*a['kwh_per_account']
        baseline=kwh*a['baseline_rate']; offer=kwh*a['offer_rate']; gross=baseline-offer
        savings_fee=max(gross,0)*a['savings_fee_rate']
        allocation=max(gross-savings_fee,0)*a['community_allocation_rate']
        retained=gross-savings_fee-allocation
        subscriptions=paid*a['upgrade_price']
        matching=new_activated*a['matching_fee']
        dashboard=a['communities']*a['dashboard_paying_share']*a['dashboard_fee']
        referrals=active*a['referral_conversion']*a['referral_fee']
        sponsorship=a['communities']*a['sponsorship']
        recurring=subscriptions+savings_fee+dashboard+referrals+sponsorship
        revenue=recurring+matching
        variable=active*a['variable_cost']+recurring*a['payment_cost_rate']
        contribution=revenue-variable
        operating=contribution-a['fixed_opex']; cash+=operating
        rows.append(dict(scenario=case,month=month,communities=a['communities'],reachable_accounts=reachable,
            cumulative_joined=joined,new_joined=new_joined,active_members=active,activated_accounts=activated,
            new_activations=new_activated,paid_members=paid,eligible_kwh=kwh,baseline_cost=baseline,
            offer_cost=offer,gross_savings=gross,savings_fee=savings_fee,community_allocation=allocation,
            retained_savings=retained,upgrade_revenue=subscriptions,net_member_benefit=retained-subscriptions,
            matching_revenue=matching,dashboard_revenue=dashboard,referral_revenue=referrals,
            sponsorship_revenue=sponsorship,recurring_revenue=recurring,total_revenue=revenue,
            variable_cost=variable,contribution=contribution,fixed_opex=a['fixed_opex'],
            operating_result=operating,cumulative_cash_proxy=cash))
        joined_prev,active_prev,activated_prev=joined,active,activated
    total=lambda k:sum(r[k] for r in rows)
    s=dict(scenario=case,initial_cost=initial,year1_revenue=total('total_revenue'),
        year1_variable_cost=total('variable_cost'),year1_fixed_opex=total('fixed_opex'),
        year1_operating_result=total('operating_result'),year1_gross_savings=total('gross_savings'),
        year1_net_member_benefit=total('net_member_benefit'),month12_active_members=active,
        month12_activated_accounts=activated,month12_paid_members=paid,month12_recurring_revenue=recurring,
        month12_operating_result=operating,month12_cash_proxy=cash,
        funding_need_proxy=max(0,initial,max(-r['cumulative_cash_proxy'] for r in rows)),
        cumulative_break_even_month=next((r['month'] for r in rows if r['cumulative_cash_proxy']>=0),''))
    return rows,s

def check(cases):
    for c,a in cases.items():
        rows,s=calculate(a,c)
        for r in rows:
            assert math.isclose(r['total_revenue'],sum(r[k] for k in ('upgrade_revenue','matching_revenue','savings_fee','dashboard_revenue','referral_revenue','sponsorship_revenue')),abs_tol=1e-7)
            assert math.isclose(r['gross_savings'],r['retained_savings']+r['savings_fee']+r['community_allocation'],abs_tol=1e-7)
        assert math.isclose(s['month12_cash_proxy'],s['year1_operating_result']-s['initial_cost'],abs_tol=1e-7)
    a=cases['base']
    for key in ('eligible_fraction','supplier_conversion'):
        rows,_=calculate(dict(a,**{key:0}),'test')
        assert all(r['activated_accounts']==r['matching_revenue']==r['gross_savings']==0 for r in rows)
    rows,_=calculate(dict(a,upgrade_adoption=0),'test')
    assert all(r['upgrade_revenue']==0 for r in rows)
    rows,_=calculate(dict(a,target_adoption=0),'test')
    assert all(r['active_members']==r['matching_revenue']==r['upgrade_revenue']==0 for r in rows)
    fixture=dict(a,communities=1,accounts_per_community=10,target_adoption=1,ramp_months=1,
                 monthly_churn=0,eligible_fraction=1,supplier_conversion=1,matching_fee=100)
    rows,_=calculate(fixture,'test')
    assert rows[0]['matching_revenue']==1000 and all(r['matching_revenue']==0 for r in rows[1:])
    rows,_=calculate(dict(fixture,baseline_rate=10,offer_rate=11,savings_fee_rate=.1,community_allocation_rate=.2),'test')
    assert all(r['gross_savings']<0 and r['savings_fee']==0 and r['community_allocation']==0 for r in rows)
    rows,_=calculate(dict(fixture,baseline_rate=10,offer_rate=9,savings_fee_rate=.1,community_allocation_rate=.2),'test')
    assert math.isclose(rows[0]['retained_savings'],rows[0]['gross_savings']*.9*.8)
    with (BASE/'mvp_budget.csv').open(encoding='utf-8-sig',newline='') as f: budget=list(csv.DictReader(f))
    for col,case in [('low_php','upside'),('base_php','base'),('high_php','downside')]:
        assert sum(float(r[col]) for r in budget[:-1])==float(budget[-1][col])==cases[case]['build_cost'], 'Update budget breakdown and scenario build cost consistently'

def write(name,rows):
    with (BASE/name).open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader()
        for r in rows:w.writerow({k:round(v,2) if isinstance(v,float) else v for k,v in r.items()})

if __name__=='__main__':
    cases=inputs();check(cases)
    if '--check' in sys.argv: print('PASS: inputs, scenarios, budget and boundary/reconciliation checks')
    else:
        forecast=[]; summaries=[]
        for c,a in cases.items():
            rows,s=calculate(a,c);forecast.extend(rows);summaries.append(s)
        write('forecast.csv',forecast);write('scenario_summary.csv',summaries)
        print('Generated 36 forecast rows and 3 scenario summaries; checks passed.')
