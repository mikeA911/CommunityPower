# Editable CSV model
Amounts are nominal Philippine pesos. Values are illustrative, not a valuation, quote, financial recommendation or validated forecast. User role: project sponsor/planner. Audience: feasibility and delivery reviewers.

## Run and edit
Edit `assumptions.csv` using a text editor or spreadsheet application and preserve its headers and parameter IDs. Rates are decimal fractions (0.08 = 8%). Keep zero distinct from blank: blank selected numeric values fail validation. Save UTF-8 CSV. Run from the package root:
```
python model/calculate.py
python model/calculate.py --check
python scripts/check.py
```
Python 3 standard library only. The first command regenerates `forecast.csv` and `scenario_summary.csv`. The second checks meaningful calculation boundaries and the current inputs without changing inputs. All three cases use the same calculation function; this is a simultaneous scenario comparison, not three different formula implementations. `mvp_budget.csv` is a separate proposed build-cost breakdown. Its low/base/high columns map inversely to downside/base/upside build costs.

## Outputs
`forecast.csv`: month, community/member funnel, new activations, eligible kWh, baseline/offer costs, gross/retained/net benefits, each revenue source, variable/fixed costs, contribution, operating result, cumulative cash proxy.

`scenario_summary.csv`: first-year totals and month-12 active/activated/paid counts, recurring revenue, initial cost, peak funding need and first cumulative break-even month (blank if none). `net_member_benefit` subtracts all upgrade subscriptions from retained energy savings; it does not monetize convenience or message-board benefits.

Outputs round to two decimals; the calculator retains full precision internally. Expected member counts may be fractional. They are planning quantities, never actual participant records. Spreadsheet applications display these files as data tables; they do not recalculate automatically when another CSV is edited.

## Source and assumption status
Every assumption has a status and definition. Sources S1/S2 and limitations are in `docs/00_provenance.md`. Only the 1–3 community range and PHP 400k–700k build envelope come from explicit planning anchors; all scenario values are illustrative. The 8–10 week target is documented in the delivery plan, not converted into operating revenue during build. Prices, usage, savings, eligibility, conversions and fees are unvalidated. Provider matching and upgrade revenue are speculative despite nonzero sample inputs. Other optional streams default off. Feasibility and other launch cost zeros are missing estimates.

## Equations and limitations
See `docs/03_business_model.md` for complete model logic. No calendar seasonality, variable adoption by community, offer start lag, collections lag, renewal fees, tax or working-capital schedule is modeled. Churn applies to active members and corresponding activated/paid shares. No reactivation. Variable costs apply to all active members, including those ineligible for energy switching. Matching revenue is one-time for newly activated accounts. Community allocation is a participant transfer and never platform revenue.

## Checks
The repository harness (`python scripts/check.py`) runs the calculator and its checks in a temporary directory, then verifies that both generated CSV snapshots match the working copies. It does not change the working copies. GitHub Actions uses the same command on Windows and Linux.

Checks cover zero eligibility, no supplier conversions, zero upgrade adoption, zero adoption, one-time activation fees after joining stops, negative savings preservation, fee/allocation reconciliation and revenue/component reconciliation. Input validation rejects nonnumeric/missing values, duplicate/unknown parameter IDs, impossible fractions and nonpositive ramp lengths. Budget totals and mappings to scenario build costs are checked. These are model arithmetic checks, not validation of the commercial assumptions.
