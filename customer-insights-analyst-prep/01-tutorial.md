# Customer Insights Analytics — 2-Hour Tutorial

**Audience:** candidates preparing for a Customer Insights Analyst role (retail / loyalty / CRM / marketing analytics).
**Goal:** by the end you can define and calculate the core customer KPIs, write the SQL interviewers expect, build and explain segments and propensity models, measure campaigns properly (incrementality + ROI), and talk credibly about GenAI, CDPs, and dashboards.

## Agenda

| # | Module | Minutes | Running clock |
|---|---|---|---|
| 0 | Orientation: what this role really does | 5 | 0:05 |
| 1 | The customer data landscape (data model) | 10 | 0:15 |
| 2 | Core customer KPIs & the customer lifecycle | 15 | 0:30 |
| 3 | SQL for customer analytics (hands-on) | 25 | 0:55 |
| 4 | Customer segmentation (RFM → clustering) | 15 | 1:10 |
| 5 | Predictive analytics: churn, propensity, CLV | 15 | 1:25 |
| 6 | Campaign measurement, incrementality & ROI | 15 | 1:40 |
| 7 | GenAI & automation in the analytics workflow | 8 | 1:48 |
| 8 | CDPs, cloud data platforms & data quality | 7 | 1:55 |
| 9 | Dashboards & insight storytelling + wrap-up | 5 | 2:00 |
| 10 | Take-home case study (after the session) | — | — |

---

## Module 0 — Orientation (5 min)

The JD boils down to **one loop**:

```
Data (customer, txn, product, loyalty, campaign, digital)
   → Insight (trends, segments, drivers, predictions)
      → Action (targeting, offers, CRM journeys, merchandising)
         → Measurement (incrementality, ROI)
            → back to Data
```

Four things hiring managers are testing:
1. **Technical:** SQL, Python, statistics, ML basics.
2. **Commercial:** do you understand acquisition, retention, value, margin?
3. **Measurement rigor:** can you tell *correlation* from *incremental impact*?
4. **Communication:** can you turn analysis into a recommendation a marketer acts on?

> Rule of thumb for every answer you give: **"So what? Now what?"** An insight without a recommended action is just a fact.

---

## Module 1 — The Customer Data Landscape (10 min)

### Typical tables (star schema)

| Table | Grain | Key columns |
|---|---|---|
| `customers` | 1 row per customer | customer_id, signup_date, acquisition_channel, region, loyalty_tier, birth_year, opt_in_email |
| `transactions` | 1 row per order | order_id, customer_id, order_date, channel (store/web/app), store_id, net_sales, discount, margin |
| `transaction_items` | 1 row per line | order_id, product_id, qty, price, discount |
| `products` | 1 row per SKU | product_id, category, subcategory, brand, price_tier, private_label_flag |
| `loyalty_events` | 1 row per points event | customer_id, event_date, points_earned, points_redeemed, tier_change |
| `campaigns` / `campaign_sends` | 1 row per customer per send | campaign_id, customer_id, send_date, channel, test_control_flag, offer_type |
| `campaign_responses` | 1 row per event | customer_id, campaign_id, open/click/convert timestamps |
| `digital_events` | 1 row per web/app event | anonymous_id, customer_id (if known), event_type, page, timestamp |

### Things that always go wrong (and interviewers love)
- **Identity resolution:** same person with multiple emails / loyalty cards / guest checkouts. CDPs exist largely to solve this.
- **Returns:** net vs. gross sales; returns can be weeks later.
- **Anonymous transactions:** in-store cash purchases without a loyalty ID → your "customer" data only covers identified sales (know the **identification rate**).
- **Grain mistakes:** joining orders to items then summing order-level fields → double counting.
- **Time zones / fiscal calendars:** retail often uses a 4-5-4 fiscal calendar.
- **Survivorship:** analyzing "active customers" only hides churners.

---

## Module 2 — Core KPIs & the Customer Lifecycle (15 min)

### Lifecycle stages
`Prospect → New (1st purchase) → Developing (2nd purchase) → Active/Loyal → At-risk/Lapsing → Lapsed/Churned → Reactivated`

The **second purchase** is the single most important conversion in most retail businesses — repeat rates jump sharply after it.

### KPI cheat sheet

| KPI | Definition | Notes |
|---|---|---|
| Active customers | Customers with ≥1 purchase in last N months (commonly 12) | Always state the window |
| New customers | First-ever purchase in period | Needs full history to define |
| Retention rate | % of customers active in period P-1 who are also active in P | Cohort-based is better |
| Churn rate | 1 − retention (contractual) or "no purchase in X days" (non-contractual) | In retail, churn is *inferred*: pick X from inter-purchase time distribution (e.g., 90th percentile) |
| Reactivation rate | % of lapsed customers who purchase again in period | |
| Purchase frequency | Orders ÷ active customers | |
| AOV (average order value) | Net sales ÷ orders | |
| Spend per customer | Net sales ÷ active customers = AOV × frequency | Key decomposition |
| Basket size (UPT) | Units per transaction | |
| Customer Lifetime Value | Expected future margin from a customer, discounted | Historical vs predictive |
| CAC | Acquisition cost ÷ new customers | LTV:CAC ≥ 3 is a common benchmark |
| Share of wallet | Customer spend with us ÷ total category spend | Needs survey/panel data |
| Loyalty penetration | % of sales from identified loyalty members | |
| Redemption rate | Points redeemed ÷ points issued | Also a liability metric |
| Campaign: open/click/conversion rate | Standard funnel | Conversion ≠ incrementality |
| Incremental lift | (Test rate − Control rate) ÷ Control rate | Module 6 |

### The sales decomposition (use this in every "why did sales drop?" question)

```
Sales = # Active customers × Frequency × AOV
      = (Retained + New + Reactivated customers) × Orders/customer × (Units/order × Price/unit)
```
Walk the tree: which lever moved? Then slice by segment, channel, region, category, cohort.

### Simple historical CLV
```
CLV ≈ AOV × Purchase frequency (per year) × Gross margin % × Expected lifespan (years)
    or with retention r and discount d:  CLV = m × r / (1 + d − r)   (m = annual margin per customer)
```

---

## Module 3 — SQL for Customer Analytics (25 min, hands-on)

Practice these until you can write them from memory. Syntax is ANSI-ish (works with minor tweaks on Snowflake, BigQuery, Databricks, Redshift).

### 3.1 First purchase, customer tenure, and new vs returning
```sql
WITH first_order AS (
  SELECT customer_id, MIN(order_date) AS first_order_date
  FROM transactions
  GROUP BY customer_id
)
SELECT
  DATE_TRUNC('month', t.order_date) AS month,
  COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', t.order_date) = DATE_TRUNC('month', f.first_order_date)
                      THEN t.customer_id END) AS new_customers,
  COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', t.order_date) > DATE_TRUNC('month', f.first_order_date)
                      THEN t.customer_id END) AS returning_customers
FROM transactions t
JOIN first_order f USING (customer_id)
GROUP BY 1
ORDER BY 1;
```

### 3.2 Cohort retention matrix (the #1 interview SQL question)
```sql
WITH cohorts AS (
  SELECT customer_id, DATE_TRUNC('month', MIN(order_date)) AS cohort_month
  FROM transactions GROUP BY 1
),
activity AS (
  SELECT DISTINCT customer_id, DATE_TRUNC('month', order_date) AS activity_month
  FROM transactions
)
SELECT
  c.cohort_month,
  DATEDIFF('month', c.cohort_month, a.activity_month) AS months_since_first,
  COUNT(DISTINCT a.customer_id) AS active_customers,
  COUNT(DISTINCT a.customer_id) * 1.0
    / FIRST_VALUE(COUNT(DISTINCT a.customer_id)) OVER (
        PARTITION BY c.cohort_month ORDER BY DATEDIFF('month', c.cohort_month, a.activity_month)
      ) AS retention_rate
FROM cohorts c
JOIN activity a USING (customer_id)
GROUP BY 1, 2
ORDER BY 1, 2;
```
**How to read it:** rows = cohorts, columns = months since acquisition. Look down a column to see if newer cohorts retain better/worse (e.g., did a promo-heavy acquisition month bring low-quality customers?).

### 3.3 RFM scoring with window functions
```sql
WITH base AS (
  SELECT
    customer_id,
    DATEDIFF('day', MAX(order_date), DATE '2026-09-30') AS recency_days,
    COUNT(DISTINCT order_id)                            AS frequency,
    SUM(net_sales)                                      AS monetary
  FROM transactions
  WHERE order_date >= DATE '2025-10-01'   -- 12-month window
  GROUP BY customer_id
)
SELECT
  customer_id, recency_days, frequency, monetary,
  6 - NTILE(5) OVER (ORDER BY recency_days) AS r_score,  -- lower recency = better
  NTILE(5) OVER (ORDER BY frequency)        AS f_score,
  NTILE(5) OVER (ORDER BY monetary)         AS m_score
FROM base;
```

### 3.4 Inter-purchase time (to define "churn" for a non-subscription business)
```sql
WITH ordered AS (
  SELECT customer_id, order_date,
         LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date
  FROM transactions
)
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY DATEDIFF('day', prev_date, order_date)) AS median_gap,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY DATEDIFF('day', prev_date, order_date)) AS p90_gap
FROM ordered
WHERE prev_date IS NOT NULL;
```
If p90 = 120 days → "lapsed = no purchase in 120+ days" is a defensible churn definition.

### 3.5 Second-purchase conversion within 60 days
```sql
WITH ranked AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn
  FROM transactions
),
pivoted AS (
  SELECT customer_id,
         MAX(CASE WHEN rn = 1 THEN order_date END) AS first_dt,
         MAX(CASE WHEN rn = 2 THEN order_date END) AS second_dt
  FROM ranked GROUP BY customer_id
)
SELECT
  DATE_TRUNC('month', first_dt) AS cohort,
  AVG(CASE WHEN second_dt <= first_dt + INTERVAL '60 day' THEN 1.0 ELSE 0 END) AS repeat_60d
FROM pivoted
GROUP BY 1 ORDER BY 1;
```

### 3.6 Market basket — which categories are bought together
```sql
SELECT a.category AS cat_a, b.category AS cat_b, COUNT(DISTINCT a.order_id) AS co_orders
FROM (SELECT ti.order_id, p.category FROM transaction_items ti JOIN products p USING (product_id)) a
JOIN (SELECT ti.order_id, p.category FROM transaction_items ti JOIN products p USING (product_id)) b
  ON a.order_id = b.order_id AND a.category < b.category
GROUP BY 1, 2
ORDER BY co_orders DESC
LIMIT 20;
```
Extend to **support, confidence, lift**: lift = P(A∩B) / (P(A)·P(B)); lift > 1 means bought together more than chance.

### 3.7 Campaign test vs control
```sql
SELECT
  s.test_control_flag,
  COUNT(DISTINCT s.customer_id) AS customers,
  COUNT(DISTINCT t.customer_id) AS purchasers,
  COUNT(DISTINCT t.customer_id) * 1.0 / COUNT(DISTINCT s.customer_id) AS response_rate,
  SUM(t.net_sales) / COUNT(DISTINCT s.customer_id) AS sales_per_customer
FROM campaign_sends s
LEFT JOIN transactions t
  ON t.customer_id = s.customer_id
 AND t.order_date BETWEEN s.send_date AND s.send_date + INTERVAL '14 day'
WHERE s.campaign_id = 'FALL26_REACTIVATION'
GROUP BY 1;
```
Note the **LEFT JOIN** (non-buyers must stay in the denominator) and the **same response window** for test and control.

### SQL pitfalls checklist
- `COUNT(DISTINCT)` vs `COUNT` after a fan-out join.
- `LEFT JOIN` + filter in `WHERE` on the right table silently becomes an `INNER JOIN` — put it in `ON`.
- NULL handling in averages (`AVG` ignores NULLs).
- Integer division (`* 1.0`).
- Window function vs `GROUP BY` — know `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG/LEAD`, `NTILE`, running sums.

---

## Module 4 — Customer Segmentation (15 min)

### Types of segmentation
| Type | Example | Best for |
|---|---|---|
| Value-based | Top 10% of customers = 50% of sales | Prioritizing investment |
| RFM / lifecycle | Champions, Loyal, At-risk, Hibernating, New | CRM journeys |
| Behavioral | Category affinity, channel preference (store vs. digital vs. omni), promo-sensitivity | Personalization, merchandising |
| Needs / attitudinal | Survey-based (convenience seekers, deal hunters) | Brand, proposition |
| Predictive / propensity | Top-decile likelihood to churn / buy category X | Targeting |
| Demographic / geographic | Age band, region, urban/rural | Media, store planning |

### RFM → named segments (common mapping)
| Segment | R | F/M | Action |
|---|---|---|---|
| Champions | 5 | 4–5 | Reward, early access, referral; don't over-discount |
| Loyal | 3–5 | 4–5 | Upsell, tier progression |
| Potential loyalists | 4–5 | 2–3 | Second/third purchase nudges |
| New | 5 | 1 | Onboarding journey |
| At-risk | 1–2 | 4–5 | High-priority win-back, service outreach |
| Hibernating | 1–2 | 1–2 | Low-cost reactivation or suppress |

**Omnichannel insight to quote:** customers who shop both store and digital typically spend 2–3× single-channel customers — but be careful: that's partly selection (heavy buyers naturally use more channels), not proof that pushing someone online causes higher spend.

### K-means clustering in Python
```python
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

df = pd.read_csv("customer_features.csv")   # one row per customer
features = ["recency_days", "frequency", "monetary", "pct_discounted",
            "n_categories", "pct_digital", "avg_basket_units"]

X = df[features].copy()
X[["frequency", "monetary"]] = np.log1p(X[["frequency", "monetary"]])  # tame skew
X = StandardScaler().fit_transform(X)

for k in range(3, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X)
    print(k, round(km.inertia_), round(silhouette_score(X, km.labels_), 3))

km = KMeans(n_clusters=5, n_init=10, random_state=42).fit(X)
df["segment"] = km.labels_
profile = df.groupby("segment")[features].mean().round(2)
profile["size_pct"] = df["segment"].value_counts(normalize=True).sort_index().round(3)
print(profile)
```

### What makes a segmentation *good* (say this in interviews)
1. **Distinct** — segments differ meaningfully on behaviour.
2. **Sizeable** — big enough to act on and measure.
3. **Actionable** — each has a clear strategy / journey.
4. **Stable** — customers don't flip every week (or, if they do, that's intended for lifecycle segments).
5. **Accessible** — can be activated in the CDP / email / paid media.
6. **Explainable** — named and profiled so marketers adopt it.

Choosing *k*: elbow + silhouette are only guides; the final choice is the most **actionable** solution.

---

## Module 5 — Predictive Analytics: Churn, Propensity, CLV (15 min)

### Framing a churn / propensity model
1. **Define the target** precisely: e.g., *"customer active in last 12 months who makes no purchase in the next 90 days."*
2. **Snapshot / observation window:** features computed as of a cut-off date using only past data (avoid **leakage**).
3. **Prediction window:** 90 days after the cut-off.
4. **Features:** RFM, trend features (spend last 3m vs prior 3m), category breadth, discount share, returns, channel mix, loyalty points balance, tier, email engagement, service contacts, tenure.
5. **Model:** start with logistic regression (explainable) → gradient boosting (XGBoost/LightGBM) for performance.
6. **Evaluate:** AUC, precision/recall at the top decile, **lift/gains chart**, calibration.
7. **Explain:** feature importance, SHAP values.
8. **Deploy:** score monthly → push top-decile audiences to the CDP → measure with a holdout.

```python
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import lightgbm as lgb
import pandas as pd

X, y = df[feature_cols], df["churned_next_90d"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=42)

model = lgb.LGBMClassifier(n_estimators=400, learning_rate=0.05, num_leaves=31)
model.fit(X_tr, y_tr)
p = model.predict_proba(X_te)[:, 1]
print("AUC:", roc_auc_score(y_te, p))

# Decile lift table
res = pd.DataFrame({"y": y_te.values, "p": p})
res["decile"] = pd.qcut(res["p"].rank(method="first"), 10, labels=False)
lift = res.groupby("decile")["y"].mean().sort_index(ascending=False) / res["y"].mean()
print(lift)   # top decile lift of 3x+ is typically strong
```

### Better: time-based validation
Train on snapshot Jan-2025, validate on snapshot Jan-2026. Random splits overstate performance when behaviour drifts.

### Propensity ≠ uplift
- **Propensity model:** who is *likely to buy*? (Many of them would buy anyway.)
- **Uplift model:** who is likely to buy *because* we contacted them? Requires historical test/control data. Segments: *Persuadables* (target), *Sure things* (don't waste discount), *Lost causes*, *Sleeping dogs* (contact makes them worse — e.g., triggers unsubscribe).

### CLV modelling options
| Approach | When |
|---|---|
| Historical CLV (sum of past margin) | Quick ranking |
| BG/NBD + Gamma-Gamma (`lifetimes` / `pymc-marketing`) | Non-contractual retail; predicts # future purchases and spend |
| ML regression on next-12-month spend | Rich features available |

### Other AI/ML use cases to mention
- **Next best product / offer:** collaborative filtering, association rules, two-tower recommenders.
- **Anomaly detection** on KPIs (automated alerts).
- **Price/promo sensitivity** scoring.
- **NLP** on reviews, surveys, call-centre notes — topic modelling or LLM classification for themes and sentiment.
- **Forecasting** active customers / sales by segment.

---

## Module 6 — Campaign Measurement, Incrementality & ROI (15 min)

### Why "conversion rate" lies
A loyalty email to Champions shows a 30% conversion — but 28% of Champions would have bought anyway. True incremental effect = 2 points.

### Gold standard: randomized holdout
- Randomly hold out (e.g., 10%) of the eligible audience **before** sending.
- Measure same outcome, same window, both groups.
- Lift = test rate − control rate (absolute) or ÷ control rate (relative).

### Worked example
| | Customers | Purchasers | Rate | Sales/customer |
|---|---|---|---|---|
| Test | 90,000 | 9,900 | 11.0% | $14.40 |
| Control | 10,000 | 1,000 | 10.0% | $12.80 |

- Incremental purchasers = (11.0% − 10.0%) × 90,000 = **900**
- Incremental sales = ($14.40 − $12.80) × 90,000 = **$144,000**
- Incremental margin at 35% = **$50,400**
- Cost: discounts redeemed $30,000 (note: discounts given to *non-incremental* buyers are pure cost) + execution $5,000 = $35,000
- **ROI** = (50,400 − 35,000) / 35,000 = **44%**

Then check **significance**: two-proportion z-test.
```python
from statsmodels.stats.proportion import proportions_ztest
z, p = proportions_ztest([9900, 1000], [90000, 10000])
print(z, p)   # p ≈ 0.002 → significant at 5%
```

### Sample size (before launching)
```python
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
es = proportion_effectsize(0.11, 0.10)
n = NormalIndPower().solve_power(effect_size=es, alpha=0.05, power=0.8, ratio=1)
print(round(n))   # ≈ 14,750 per group to detect 10% → 11%
```
Small control groups → wide confidence intervals; unequal splits need the `ratio` argument.

### When you can't randomize
| Method | Idea |
|---|---|
| Difference-in-differences | Compare change in treated vs untreated regions/stores before vs after |
| Matched control / propensity score matching | Find look-alike non-contacted customers |
| Synthetic control | Weighted combination of control regions mimics the treated one |
| Geo-experiments | Randomize at market level (for media/TV/paid social) |
| Marketing Mix Modelling (MMM) | Top-down regression of sales on spend by channel (e.g., Robyn, Meridian, PyMC-Marketing) |
| Multi-touch attribution | Bottom-up digital paths; weaker for causality |

### Measurement pitfalls
- **Regression to the mean** (targeting "low spenders last month" — they'd bounce back anyway).
- **Novelty effect**, seasonality, overlapping campaigns (customers in many tests).
- **Peeking** at results early and stopping when significant.
- **Halo/cannibalisation:** did the promo pull forward purchases or shift them from full-price items?
- Use a **long-term universal holdout** (e.g., 2–5% never receive CRM) to measure total program value.

---

## Module 7 — GenAI & Automation in the Analytics Workflow (8 min)

### Where GenAI genuinely helps
| Task | Example |
|---|---|
| Code acceleration | Draft SQL/Python, translate SQL dialects, write tests, document pipelines |
| Exploratory analysis | "Profile this table and flag anomalies"; AI notebook assistants (Snowflake Cortex, Databricks Assistant, BigQuery Gemini, Copilot) |
| Unstructured data | Classify NPS verbatims / reviews into themes + sentiment at scale |
| Insight narration | Auto-generate weekly KPI commentary from a metrics table |
| Self-service | Natural-language-to-SQL over a governed semantic layer |
| Segment personas | Turn cluster profiles into readable persona descriptions for marketers |
| Content | Variant subject lines/creative to test (with brand review) |

### Example: automate a weekly KPI narrative
```python
# pseudo-code
kpis = run_sql("SELECT * FROM kpi_weekly WHERE week = CURRENT_WEEK - 1")
prompt = f"""You are a retail customer analyst. Using ONLY the numbers below,
write 5 bullet points: what changed vs last week and last year, the likely driver
from the segment breakdown, and one recommended action. Flag any metric that moved >2 std dev.
DATA: {kpis.to_markdown()}"""
summary = llm(prompt)          # e.g., via an approved enterprise LLM endpoint
post_to_teams(summary)        # human reviews before wider distribution
```

### Guardrails (always mention)
- **Validate** every number the model writes; LLMs hallucinate. Feed it computed numbers, don't let it compute.
- **Data privacy / PII:** use enterprise-approved tools; no customer PII into public models; follow consent and GDPR/CCPA.
- **Governance:** NL-to-SQL should sit on a curated semantic layer with defined metrics.
- **Human in the loop** for anything customer-facing or decision-critical.
- **Bias & fairness** in targeting models (avoid proxies for protected attributes).

---

## Module 8 — CDPs, Cloud Data Platforms & Data Quality (7 min)

### Customer Data Platform (CDP)
Examples: Salesforce Data Cloud, Adobe Real-Time CDP, Segment (Twilio), Tealium, mParticle, ActionIQ, Treasure Data; "composable CDP" (Hightouch / Census on top of Snowflake/BigQuery/Databricks).

Core capabilities:
1. **Ingest** — POS, e-com, app, loyalty, email, service.
2. **Identity resolution** — deterministic (email, loyalty ID) + probabilistic matching → *golden record* / unified profile.
3. **Profile & computed attributes** — RFM scores, CLV, propensity scores, preferred category/store.
4. **Audience building** — segments for activation.
5. **Activation** — push to ESP, SMS, paid media (Meta, Google), onsite personalization.
6. **Consent management**.

**Analyst's role in CDP use cases:** define computed attributes and segment logic, write the requirements, validate audience counts vs the warehouse, design test/control, and measure outcomes.

Sample use cases: abandoned-cart journey, post-purchase cross-sell, lapse-prevention trigger at day 75, tier-upgrade nudge, suppressing recent purchasers from paid media (saves wasted spend), look-alike audiences from top CLV customers.

### Modern data stack vocabulary
- **Warehouse/lakehouse:** Snowflake, BigQuery, Databricks, Redshift, Azure Synapse/Fabric.
- **Transformation:** dbt (models, tests, docs), Spark.
- **Orchestration:** Airflow, Dagster, ADF.
- **BI:** Power BI, Tableau, Looker; semantic layer for consistent metrics.
- **Medallion architecture:** bronze (raw) → silver (cleaned) → gold (business-ready, e.g., `customer_360`).

### Data quality checklist (validate before you present)
- Row counts and totals reconcile to finance/source systems.
- Uniqueness of keys; no duplicate customers/orders.
- Null rates and unexpected values (negative prices, future dates).
- Freshness (did yesterday's load land?).
- Business sense check: does the number match intuition / last known value?
- Automate with dbt tests / Great Expectations and alerting.

---

## Module 9 — Dashboards & Insight Storytelling (5 min)

### Dashboard design
- Start with **the decision** the dashboard supports and **who** uses it.
- Top row: 4–6 headline KPIs with vs LY / vs plan.
- Then **drivers** (decomposition: customers × frequency × AOV), then **segments**, then detail.
- Consistent definitions (link a metric glossary); filters for time, region, channel, segment.
- Prefer self-service (governed datasets) over one-off reports; automate refresh.

### Storytelling: the Pyramid / SCR structure
1. **Situation** — "Active customers are down 4% YoY."
2. **Complication** — "Driven by a 9-pt drop in second-purchase rate among customers acquired via the summer 40%-off promo."
3. **Resolution (recommendation)** — "Shift the next acquisition promo to a 2nd-purchase incentive; launch an onboarding journey; test with a 10% holdout. Expected impact: +$1.2M margin."

Lead with the answer, then the evidence. One message per slide. Quantify impact. State confidence and caveats.

### Wrap-up: the 10 things to remember
1. Sales = customers × frequency × AOV — decompose every problem.
2. Define churn from inter-purchase time in non-contractual businesses.
3. Cohort retention is the most informative customer chart.
4. Second purchase is the key conversion.
5. Segments must be actionable, not just statistically distinct.
6. Propensity ≠ incrementality; use holdouts.
7. ROI uses *incremental* margin minus *all* costs (including discounts to non-incremental buyers).
8. Avoid leakage and use time-based validation.
9. GenAI accelerates, humans validate; protect PII.
10. Every insight ends in a recommendation with a size of prize.

---

## Module 10 — Take-Home Case Study (do after the session, ~90 min)

**Scenario:** A specialty retailer with 2M loyalty members reports that loyalty-member sales fell 6% YoY last quarter while non-member sales were flat. The CMO asks: *"What's going on and what should we do?"*

**Tasks**
1. List the hypotheses you'd test (structure them with the sales decomposition).
2. Write the SQL to compute active members, frequency and AOV by quarter, split by new/retained/reactivated.
3. Design a segmentation that would help target a response.
4. Propose two CRM campaigns, each with target audience, offer, KPI, and test design (incl. control size).
5. Estimate the size of prize and build a one-slide executive summary.

**Model answer outline**
- Hypotheses: fewer new members (sign-up drop at POS? staff incentive change?), lower retention in a specific cohort, lower frequency (competitor, fewer promotions), lower AOV (mix shift, deeper discounts), **identification issue** (members shopping without scanning — check identification rate; non-member sales being flat hints at this!), channel shift (app outage?), tier/points changes reducing engagement.
- Diagnose: decomposition shows active members −5%, frequency −2%, AOV +1%. Drop concentrated in retained mid-tier members; points-redemption rate fell after a program rule change. Identification rate dropped 3 pts in stores after a POS upgrade.
- Actions: fix POS prompt + staff incentive (data fix, not a marketing fix); targeted points-bonus win-back for lapsing mid-tier members (uplift-model targeted, 10% holdout); communicate program changes clearly.
- Size of prize: e.g., recover 50% of lost mid-tier frequency ≈ $X M sales, $Y M margin.
