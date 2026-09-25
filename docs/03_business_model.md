# Business model and assumptions
Status: reconstructed, illustrative economics; no validated revenue, customer demand, supplier fee schedule, or original spreadsheet recovered.

## Who pays and why
| Stream | Proposed payer and value | Recognition in this model | Validation |
|---|---|---|---|
| Consumer upgrade | Member buys richer reporting/alerts | Active paid members × monthly price | Willingness to pay; cancellation and service terms |
| Provider matching | Supplier pays for a qualified activated account | New activated accounts × one-time fee | Permitted role, signed fee terms, attribution, collection |
| Savings-linked fee | Consenting customer pays for verified value | Gross positive eligible savings × fee rate | Legality, measurement, consent, overlap with other compensation |
| Manager dashboard/white-label | Community or manager buys administration service | Communities × paying share × monthly fee | Procurement, actual scope, support burden |
| Referrals | Third party pays for distinct ancillary conversion | Active members × conversion × fee | Separate from energy matching to avoid double counting |
| Sponsorship | Sponsor funds disclosed community placement | Communities × monthly sponsorship | Neutrality, labeling, moderation, willingness to pay |

The free tier is a preserved decision. Exact upgrade features and prices are proposals. Savings-linked fees, dashboard fees, ancillary referrals, and sponsorship default to zero in all cases until specifically enabled. Nonzero upgrade and provider matching assumptions are hypothetical sensitivity inputs, not approved billings. Provider fees do not enter member savings unless passed through; any passed-through cost must be included in the compared tariff/cost inputs.

## Model sequence and definitions
The model covers 12 illustrative operating months after the build. Month 1 is not assigned a calendar launch date. Build costs are a cash outflow before operating month 1. Feasibility and non-build launch costs are separate inputs, currently zero placeholders that must be estimated.

Community count is fixed per case. Reachable accounts = communities × accounts per community. Joined members = reachable accounts × target adoption × min(month/ramp months, 1). Active members = prior active × (1 − monthly churn) + this month’s newly joined members. This is a simplified cohort model with no reactivation, no community expansion and constant churn. Fractional counts are expected values and should not be mistaken for actual people.

Activated energy accounts = active members × eligibility fraction × supplier conversion. New activations = max(current activations − prior activations × (1 − churn), 0). A matching fee applies only to new activations, not every recurring month. Eligibility and supplier conversion are independent planning factors, never automatic consequences of joining.

Eligible monthly energy = activated accounts × kWh per account. Baseline comparable cost = eligible energy × baseline comparable rate. Alternative comparable cost = eligible energy × offer comparable rate. These two rates must represent the same complete charge scope. Gross savings = baseline − alternative; losses are retained. Savings fee = max(gross savings, 0) × fee rate. Community allocation = max(gross savings − savings fee, 0) × voluntary allocation rate. Member retained savings = gross savings − savings fee − community allocation. Allocation is a transfer, not additional value or platform revenue.

Paid members = active members × upgrade adoption. Subscriptions = paid members × price. Net member benefit after upgrades = retained savings − all modeled upgrade subscriptions. This conservative aggregate metric includes upgrade buyers who may never switch; it is not an individual household savings guarantee. Optional upgrades can also provide non-monetary value.

Total revenue = subscriptions + new-activation fees + savings fees + dashboard fees + ancillary referral fees + sponsorship. Payment cost = recurring revenue × payment cost rate (simplification; excludes provider matching fees). Variable cost = active members × monthly support/hosting allowance + payment cost. Contribution = total revenue − variable cost. Operating result = contribution − fixed monthly operating cost. Cumulative cash proxy = cumulative operating result − build cost − feasibility cost − other launch cost.

## Financial limits
The cash proxy assumes all revenue is collected and expenses paid in the same month. It excludes tax, VAT treatment, working capital, bad debts, financing, depreciation and shareholder compensation outside entered costs. It is not a full accounting forecast. Obtain tax/accounting advice and replace this proxy before funding commitments. Fixed cost covers proposed operating labor and overhead; variable cost covers incremental support/hosting/AI. Avoid including the same expense twice.

## Interpretation and sensitivity
Compare downside/base/upside in `scenario_summary.csv`; inspect month 12 separately from full-year totals. The differences illustrate adoption, conversion, savings spread, and cost sensitivity, not confidence intervals. Do not use the upside as a sales forecast. Zero eligibility or zero supplier conversion should eliminate energy matching revenue and energy savings while leaving independent membership costs and subscriptions intact. A higher offer cost should show losses, not zero them out.

Funding need proxy = largest cumulative cash deficit across months including initial costs. Break-even month is the first month with nonnegative cumulative cash; blank means not achieved within the 12-month horizon. This may differ from monthly operating break-even. A small pilot can remain loss-making while generating useful learning, but continuation needs a credible, separately validated path to sustainable economics.
