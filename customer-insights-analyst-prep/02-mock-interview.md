# Customer Insights Analyst — Mock Interview Questions & Model Answers

**How to use:** read the question, answer out loud in ≤2 minutes, *then* compare with the model answer. Model answers are deliberately structured so you can borrow the structure, but replace examples with your own experience wherever possible.

**Rounds covered**
- [A. Screening & motivation](#a-screening--motivation) (Q1–4)
- [B. Customer analytics & business acumen](#b-customer-analytics--business-acumen) (Q5–13)
- [C. SQL & data](#c-sql--data) (Q14–21)
- [D. Statistics & experimentation](#d-statistics--experimentation) (Q22–29)
- [E. Machine learning & AI](#e-machine-learning--ai) (Q30–37)
- [F. GenAI, automation, CDP & data platforms](#f-genai-automation-cdp--data-platforms) (Q38–43)
- [G. Stakeholders, communication & behavioural (STAR)](#g-stakeholders-communication--behavioural-star) (Q44–48)
- [H. Live case questions](#h-live-case-questions) (Q49–50)
- [Questions to ask the interviewer](#questions-to-ask-the-interviewer) · [STAR story map](#star-story-map)

---

## A. Screening & motivation

### Q1. Walk me through your background and why this role.
**Model answer (structure: Present → Past → Future, 90 seconds):**
"I'm currently a [title] at [company], where I analyze customer and transaction data to support marketing and CRM decisions — for example, I built [segmentation / retention dashboard / campaign measurement framework] that [quantified result, e.g., improved email ROI by 18%]. Before that I [relevant experience: SQL, Python, BI]. What excites me about this role is the combination of classic customer analytics — retention, segmentation, campaign measurement — with AI and a CDP environment, so the insights get activated rather than sitting in a deck. That's exactly the direction I want to grow in."

### Q2. What does a Customer Insights Analyst do that a BI/reporting analyst doesn't?
"Reporting tells you *what* happened; insights explain *why* and recommend *what to do next*. A BI analyst might report that active customers fell 4%. An insights analyst decomposes it — new vs retained vs reactivated, frequency vs AOV — finds the driver, quantifies the opportunity, recommends an action, and designs how to measure it."

### Q3. Which tools are you strongest in?
Be specific and honest. E.g., "SQL daily — window functions, CTEs, cohort analyses on Snowflake. Python (pandas, scikit-learn, statsmodels) for segmentation, propensity models and A/B analysis. Power BI/Tableau for dashboards. I use AI assistants (Copilot / ChatGPT Enterprise) to speed up code and documentation, always validating outputs. Familiar with dbt and CDP audience building."

### Q4. Why our company?
Research: their loyalty program, recent results (customer count, digital growth), CDP/tech announcements. "Your loyalty program has [X] million members and you've invested in [CDP/digital] — that's a rich dataset and a real opportunity to move from batch campaigns to personalized, measured journeys."

---

## B. Customer analytics & business acumen

### Q5. How would you define an "active customer" and "churn" for a retailer?
"Retail is non-contractual — customers don't cancel, they just stop buying — so churn is inferred. I'd look at the distribution of inter-purchase gaps; if 90% of repeat purchases happen within 120 days, then *no purchase in 120+ days* is a sensible lapse definition. Active = ≥1 purchase in the trailing 12 months is a common standard. I'd also tailor by category — a grocery shopper lapsing at 30 days is different from a furniture buyer — and agree the definition with stakeholders so everyone reports the same number."

### Q6. Sales are down 5% YoY. How do you investigate?
"First validate the data — is it real, is it complete, any calendar shifts (Easter, 53rd week)? Then decompose: Sales = active customers × frequency × AOV, and customers into new, retained, reactivated. Find which lever moved. Then slice by segment, channel, region, category, store, cohort. Check internal factors (pricing, promos, stock-outs, site changes, loyalty rule changes) and external ones (competitors, weather, macro). Finally form a recommendation with an estimated impact and a test to validate it."

### Q7. What is CLV and how would you use it?
"Customer Lifetime Value is the expected future margin from a customer, discounted. Simple version: AOV × annual frequency × margin × expected lifespan. For better accuracy in non-contractual retail I'd use BG/NBD + Gamma-Gamma or an ML model predicting next-12-month margin. Uses: setting acquisition budget (LTV:CAC), prioritizing retention spend, creating look-alike audiences from high-CLV customers, and deciding service levels or offer depth by value tier."

### Q8. Explain RFM segmentation and its limitations.
"Score each customer on Recency, Frequency and Monetary value — usually quintiles — and map combinations to segments like Champions, At-risk, Hibernating. It's simple, explainable and very actionable for CRM. Limitations: it's backward-looking, ignores *what* people buy (category, channel, promo sensitivity), quintile cut-offs shift over time, and it doesn't tell you who will respond to marketing. I'd complement it with behavioural clustering and propensity/uplift scores."

### Q9. How would you build a customer segmentation from scratch?
"1) Clarify the business purpose — CRM targeting? merchandising? brand positioning? 2) Pick features aligned to it: value, frequency, category mix, channel mix, discount share, tenure, engagement. 3) Clean, treat outliers, log-transform skewed spend, standardise. 4) Try k-means / Gaussian mixture / hierarchical; choose k using elbow, silhouette *and* actionability. 5) Profile and name segments, size them, estimate value. 6) Validate stability over time and with stakeholders. 7) Operationalise in the CDP and design a strategy per segment with KPIs. 8) Refresh regularly."

### Q10. What retention levers would you recommend for a loyalty program?
"Onboarding journey to drive the second purchase, tier progression nudges ('$40 to Gold'), personalized offers by category affinity, points expiry reminders, surprise-and-delight for Champions, triggered lapse-prevention at the point where churn risk spikes, and service recovery after bad experiences. Each needs a holdout so we know which ones create *incremental* value versus just subsidizing behavior that would happen anyway."

### Q11. A marketing manager wants to send a 20%-off coupon to all customers. What do you say?
"I'd ask the objective first. Blanket discounts usually give margin away to customers who'd buy anyway and can train customers to wait for promotions. I'd suggest targeting — e.g., lapsing customers or those with high uplift scores — with a randomized holdout so we measure incremental margin, not just redemptions. I'd model the break-even: with 40% margin, a 20% discount needs substantial incremental volume to pay back. If they still want broad reach, test a couple of offer levels."

### Q12. How do you measure loyalty program success?
"Incrementality is the core question: do members spend more *because* of the program? Simple member-vs-non-member comparisons are biased because heavy shoppers self-select into joining. Better: compare members' spend before vs after joining against a matched control (diff-in-diff), or use randomized program features. KPIs: identification rate, member sales share, retention and frequency, tier migration, redemption rate, points liability, incremental margin vs program cost, NPS."

### Q13. What is cannibalization / pull-forward and why does it matter?
"Pull-forward: a promotion makes customers buy earlier than they would have, so the next period dips — net impact is smaller than the spike. Cannibalization: sales shift from full-price items or other channels rather than being new. Both mean campaign lift should be measured over a longer post-period and across the total basket/business, not just the promoted item."

---

## C. SQL & data

### Q14. Write a query to find each customer's first and most recent purchase and the number of orders.
```sql
SELECT customer_id,
       MIN(order_date) AS first_order,
       MAX(order_date) AS last_order,
       COUNT(DISTINCT order_id) AS orders
FROM transactions
GROUP BY customer_id;
```

### Q15. Monthly cohort retention — how would you write it?
Describe: (1) CTE assigning cohort = month of first purchase; (2) CTE of distinct customer × active month; (3) join, compute months since first purchase; (4) count distinct customers per cohort/period; divide by the cohort size (period 0). See Tutorial §3.2 for full code. Mention you'd pivot it in BI as a triangle heatmap.

### Q16. Find the top 3 products by revenue in each category.
```sql
SELECT * FROM (
  SELECT p.category, p.product_id, SUM(ti.qty * ti.price) AS revenue,
         DENSE_RANK() OVER (PARTITION BY p.category ORDER BY SUM(ti.qty * ti.price) DESC) AS rnk
  FROM transaction_items ti
  JOIN products p USING (product_id)
  GROUP BY p.category, p.product_id
) x
WHERE rnk <= 3;
```
Mention `ROW_NUMBER` vs `RANK` vs `DENSE_RANK` handling of ties.

### Q17. Customers who bought in 2025 but not yet in 2026.
```sql
SELECT DISTINCT customer_id FROM transactions
WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'
EXCEPT
SELECT DISTINCT customer_id FROM transactions
WHERE order_date >= '2026-01-01';
```
Alternatives: `NOT EXISTS` or `LEFT JOIN ... WHERE x.customer_id IS NULL`. Avoid `NOT IN` when the subquery can return NULLs.

### Q18. Calculate a 7-day rolling average of daily sales.
```sql
SELECT order_date, daily_sales,
       AVG(daily_sales) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7d
FROM (SELECT order_date, SUM(net_sales) AS daily_sales FROM transactions GROUP BY order_date) d;
```
Caveat: missing dates — join to a calendar table first so the window is truly 7 days.

### Q19. Your query shows revenue 3× higher than finance reports. What happened?
"Most likely a fan-out join — e.g., joining orders to items or to campaign sends and then summing an order-level amount. I'd check row counts before/after each join, confirm the grain, and aggregate at the right level before joining. Other suspects: gross vs net (returns, tax, shipping), duplicates in source, time zone/fiscal calendar differences, test orders or employee transactions not excluded."

### Q20. How do you ensure the data you use is accurate?
"Reconcile totals to a trusted source (finance), check uniqueness of keys, null rates, ranges and freshness, compare with prior periods, and sense-check with business partners. I'd automate checks with dbt tests or similar, document metric definitions, and flag known limitations — e.g., only 70% of store sales are identified to a customer."

### Q21. What is identity resolution and why does it matter?
"Linking records that belong to the same person across sources — loyalty ID, email, phone, device IDs, guest checkout. Deterministic matching uses exact keys; probabilistic uses fuzzy name/address/device signals. Without it you overcount customers, undercount frequency and CLV, misclassify loyal omnichannel shoppers as two occasional shoppers, and send duplicate or conflicting messages. It's a core CDP function."

---

## D. Statistics & experimentation

### Q22. How would you design an A/B test for a new win-back email?
"Hypothesis: the email increases 30-day purchase rate among lapsed customers. Randomize eligible customers into test and control (e.g., 90/10, but check power). Primary metric: purchase rate within 30 days; secondary: sales and margin per customer, unsubscribe rate. Calculate sample size from baseline rate and minimum detectable effect. Fix the duration and analysis plan up front, avoid peeking, check randomization balance, then analyze with a two-proportion test and confidence interval, and compute incremental ROI."

### Q23. Test 11.0% vs control 10.0% response. Is that meaningful?
"Depends on sample size. With 90k vs 10k, a two-proportion z-test gives z ≈ 3.0, p ≈ 0.002 — statistically significant. Then business significance: 1-point absolute / 10% relative lift × 90k = ~900 incremental buyers. Multiply by incremental margin and subtract costs, including discounts given to the 10% who'd have bought anyway. Significant and profitable are different questions."

### Q24. Explain p-value and confidence interval to a marketer.
"The p-value is how surprising our result would be if the campaign actually had no effect — a small p-value means it's unlikely to be just luck. The confidence interval is the plausible range for the true lift — for example 'the campaign lifted response by between 0.4 and 1.6 points.' I'd usually lead with the interval, because it shows size and uncertainty together."

### Q25. What's statistical power and why do small control groups hurt?
"Power is the probability of detecting a real effect if it exists — we usually target 80%. Small control groups give noisy estimates of the baseline, so CIs are wide and we may miss real effects or overreact to noise. Marketers want small holdouts to maximize reach; I'd show the trade-off with a power calculation and suggest pooling holdouts across campaigns or using a persistent universal holdout."

### Q26. You can't run a randomized test. How do you measure impact?
"Quasi-experimental methods: difference-in-differences (treated vs untreated regions before and after), propensity-score matching to build a look-alike control, synthetic control for a single treated market, regression discontinuity if eligibility has a cut-off (e.g., tier threshold), or geo-tests for media. For channel budget allocation, marketing mix modeling. I'd be explicit about assumptions — e.g., parallel trends for DiD."

### Q27. What is Simpson's paradox? Give a customer example.
"A trend in aggregated data reverses within subgroups. Example: Email A has a higher overall conversion than Email B, but B wins within both the loyal and the new segments — because A was sent mostly to loyal customers, who convert more anyway. Fix: compare within segments or randomize properly."

### Q28. What is regression to the mean and how does it bias campaign analysis?
"Extreme observations tend to move toward the average next time. If we target customers whose spend dropped sharply last month, many will recover on their own — a pre/post comparison would credit the campaign. A randomized control group from the same selected population fixes this."

### Q29. Running 20 audience A/B tests at once, 1 is significant at 5%. Excited?
"Not yet — with 20 tests, we'd expect ~1 false positive by chance. I'd apply a multiple-comparison correction (Bonferroni or Benjamini-Hochberg), check whether the result was pre-registered as the primary hypothesis, and replicate it before scaling."

---

## E. Machine learning & AI

### Q30. How would you build a churn prediction model?
"Define churn (e.g., no purchase in the next 90 days among actives). Pick a snapshot date; build features only from data before it — RFM, spend trends, category breadth, discount reliance, returns, email engagement, service contacts, tenure, loyalty tier/points. Label from the following 90 days. Start with logistic regression as an interpretable baseline, then gradient boosting. Validate on a later snapshot (out-of-time). Evaluate AUC, top-decile lift, precision/recall and calibration. Explain with SHAP. Deploy as a monthly score in the CDP, and — most importantly — test interventions with a holdout, because predicting churn isn't the same as preventing it."

### Q31. What is data leakage? Example?
"Using information at training time that wouldn't be available at prediction time. Example: including 'number of win-back emails received' in a churn model — win-back emails are sent *because* customers lapsed, so the feature leaks the label. Or computing features over a window that overlaps the outcome window. Leakage gives great validation scores and poor real performance."

### Q32. Accuracy is 95% on the churn model. Good?
"Not necessarily — if 95% of customers don't churn, a model predicting 'no churn' for everyone gets 95%. For imbalanced problems I'd use AUC, precision/recall, PR-AUC and especially lift in the top deciles, because the business will only target the top slice. And tie it to value: expected saved margin from targeting the top decile vs cost."

### Q33. Propensity model vs uplift model?
"Propensity predicts who will buy; uplift predicts who will buy *because* we treat them. Propensity targeting often wastes offers on 'sure things'. Uplift models (two-model approach, class transformation, causal forests) need randomized historical data and identify 'persuadables'. They also flag 'sleeping dogs' who react negatively to contact."

### Q34. How do you explain a black-box model to marketing?
"Global: feature importance / SHAP summary — 'the biggest drivers of churn risk are a falling purchase frequency, no app usage, and heavy discount reliance.' Local: why one customer scored high. Then translate into actions: those drivers suggest an app-onboarding nudge and non-discount engagement. I'd also show a decile chart — the top 10% scored have 4× the average churn rate — because that's intuitive."

### Q35. How would you choose k in k-means? What if the segments aren't useful?
"Use the elbow method and silhouette score as guides, test stability across samples, but the final arbiter is actionability — can marketing build a distinct strategy for each? If the segments aren't useful, revisit the *features* (they define what 'similar' means), transform skewed variables, try other algorithms (GMM, hierarchical), or use a rules-based segmentation where clarity matters more."

### Q36. How would you build a 'next best product' recommendation?
"Start simple: association rules / co-purchase lift from basket data, and 'customers who bought X then bought Y' sequences. Then collaborative filtering (implicit ALS) or item embeddings; add business rules — in stock, margin, not recently bought, category diversity. Evaluate offline with precision@k / recall@k on held-out purchases, then online with an A/B test measuring incremental sales, not just click-through."

### Q37. How do you monitor a model in production?
"Track input data drift (feature distributions, PSI), score distribution drift, and performance as labels arrive (AUC, decile lift vs. baseline). Monitor the business outcome via holdouts. Retrain on a schedule or when drift thresholds trip, with versioning and documentation."

---

## F. GenAI, automation, CDP & data platforms

### Q38. How have you used / would you use generative AI in analytics?
"Four ways: (1) productivity — drafting SQL/Python, converting dialects, documenting code; (2) unstructured data — classifying survey verbatims and reviews into themes and sentiment at scale; (3) insight generation — auto-drafting weekly KPI commentary from computed metrics, which I then review; (4) self-service — natural-language questions over a governed semantic layer. Guardrails: never let the LLM compute numbers unchecked, keep PII in approved enterprise tools, validate outputs, keep a human in the loop."
*(Add a real example: "I used an LLM to categorize 40k NPS comments; spot-checking 300 showed ~90% agreement with manual coding, and it surfaced delivery delays as the top detractor theme, which led to…")*

### Q39. What risks do you see with GenAI in customer analytics?
"Hallucinated numbers or insights, privacy/PII leakage, inconsistent metric definitions in NL-to-SQL, bias in generated content or targeting, over-reliance by non-experts, and IP/compliance concerns. Mitigation: governed data, semantic layer, prompt templates, evaluation sets, human review, access controls, and clear policies."

### Q40. Which manual process would you automate first and how?
"The highest frequency × effort × error-risk one — usually the weekly campaign/KPI report. I'd move logic into SQL/dbt models in the warehouse with tests, schedule it with the orchestrator, publish to a BI dashboard, add anomaly alerts, and optionally an LLM-drafted summary for review. Measure success in hours saved and faster decisions — e.g., 'cut a 6-hour weekly process to 20 minutes.'"

### Q41. What is a CDP and how is it different from a data warehouse or CRM?
"A CDP unifies customer data from all sources into persistent profiles via identity resolution, and makes them available for audience building and real-time activation in marketing channels. A warehouse is the analytical store of all enterprise data — great for analysis, traditionally not built for activation. A CRM manages customer interactions/records, often sales or service-oriented. 'Composable CDP' uses the warehouse as the profile store with reverse-ETL for activation."

### Q42. Give an example CDP use case you'd implement and how you'd measure it.
"A lapse-prevention trigger: when a customer's predicted churn risk crosses a threshold or days-since-purchase hits ~75% of their typical gap, enter a journey — personalized content based on category affinity, then a modest offer if no response. Build the score as a computed attribute, define the audience, validate counts against the warehouse, hold out 10% randomly, and measure incremental 60-day purchase rate, margin per customer and ROI."

### Q43. How do you work with data engineering on new data needs?
"Write clear requirements: business question, grain, fields, definitions, freshness, history needed, and acceptance tests. Prototype in SQL to prove value, then hand over for productionising (dbt model, pipeline). Validate together, document in the data catalog, and agree ownership for data quality."

---

## G. Stakeholders, communication & behavioural (STAR)

### Q44. Tell me about an insight that changed a business decision.
**STAR template:**
- **S:** "Our CRM team planned to scale a monthly 15%-off email to all members."
- **T:** "I was asked to evaluate last quarter's results."
- **A:** "Conversion looked strong at 12%, but the holdout group converted at 11%. Segmenting showed the lift was concentrated in lapsing customers; Champions showed zero lift and just redeemed the discount."
- **R:** "We restricted the offer to lapsing and at-risk segments, and gave Champions non-discount perks. Discount cost fell 40% while incremental sales held — roughly $X margin a year."

### Q45. Tell me about a time a stakeholder disagreed with your findings.
"Merchandising believed a category decline was due to pricing. My analysis showed price-per-unit was stable; the drop came from fewer new customers entering the category. I walked them through the decomposition, invited their input on what had changed, and we found a reduced in-store display. Rather than arguing, I proposed a test — restoring displays in 20 stores vs matched controls — and the results confirmed it. Lesson: bring data, stay curious, and resolve disagreement with a test."

### Q46. How do you explain a complex analysis to non-technical people?
"Lead with the answer and the action, then the 2–3 pieces of evidence, using visuals and plain language — 'customers acquired through deep discounts are half as likely to come back' rather than coefficients. Quantify the size of the prize, state confidence and caveats honestly, and keep the technical detail in an appendix."

### Q47. How do you prioritise competing requests from multiple teams?
"By business impact, urgency and effort; I clarify the decision each request supports and its deadline. I keep a visible backlog, agree priorities with my manager and stakeholders, and look for reuse — three similar ad-hoc asks usually mean we need a self-service dashboard."

### Q48. Tell me about a mistake you made in an analysis.
Pick a real one: e.g., a double-counting join, a churn definition that didn't match finance. Show: you caught/owned it, fixed it fast, informed stakeholders, and put a control in place (reconciliation check, peer review, dbt test).

---

## H. Live case questions

### Q49. "Our new-customer second-purchase rate dropped from 32% to 26%. Diagnose and recommend."
**Strong answer structure:**
1. **Clarify:** window (e.g., 60 days), which cohorts, all channels?
2. **Validate data:** definition changes, identity resolution issues, returns, incomplete windows for the latest cohort (cohort not yet "matured").
3. **Mix vs rate:** is the acquisition mix different — more customers from a deep-discount promo, a marketplace, or a new channel, each with lower repeat rates? Compute repeat rate by acquisition source; if within-source rates are stable, it's mix.
4. **Experience:** first-order delivery delays, stock-outs, returns rate, NPS of first-time buyers.
5. **CRM:** did the onboarding journey change or break? Email deliverability?
6. **External:** competitor promos, seasonality.
7. **Recommend:** e.g., if driven by promo-acquired customers → shift acquisition to quality channels / set CAC by predicted CLV; strengthen onboarding with a second-purchase incentive tested vs holdout; fix experience issues.
8. **Size of prize:** 6 pts × 200k new customers/yr × $60 margin per repeat customer ≈ $720k.

### Q50. "Design a dashboard for the CMO on customer health."
- **Purpose:** monthly view of whether the customer base is growing in size and value.
- **Headline tiles:** active customers (12m), new customers, retention rate, reactivated, spend per customer, CLV of new cohort, loyalty identification rate — each vs LY and plan.
- **Drivers:** sales bridge (new / retained / reactivated / lost customers; frequency; AOV).
- **Segments:** customer counts and value by RFM/lifecycle segment with migration flows (Sankey or matrix).
- **Cohorts:** retention triangle.
- **Marketing:** incremental revenue and ROI by program (from holdouts).
- **Design:** filters (region, channel, segment), metric glossary, automated refresh, alerts on anomalies, a short written commentary (optionally AI-drafted, analyst-reviewed).

---

## Rapid-fire round (answer in one sentence each)

| Question | Answer |
|---|---|
| AOV formula? | Net sales ÷ number of orders. |
| Spend per customer? | AOV × purchase frequency. |
| LTV:CAC benchmark? | ~3:1 is a commonly cited healthy ratio. |
| Lift in association rules? | P(A and B) ÷ (P(A) × P(B)); >1 means positive association. |
| What does NTILE do? | Splits ordered rows into n roughly equal buckets. |
| WHERE vs HAVING? | WHERE filters rows before aggregation; HAVING filters groups after. |
| Type I vs Type II error? | False positive vs false negative. |
| Precision vs recall? | Of those flagged, how many were right vs of all actual positives, how many we caught. |
| Why standardize before k-means? | Distance-based — large-scale variables (spend) would dominate. |
| What is SHAP? | Game-theory-based attribution of each feature's contribution to a prediction. |
| What is a universal holdout? | A small, persistent group excluded from all marketing to measure total program incrementality. |
| Medallion architecture? | Bronze (raw) → silver (cleaned) → gold (business-ready) data layers. |
| What is reverse ETL? | Syncing modelled warehouse data back into operational tools (CRM, ESP, ad platforms). |
| Zero-party vs first-party data? | Data customers intentionally share (preferences) vs data observed from their behaviour with you. |

---

## Questions to ask the interviewer
1. What are the top two or three business questions you'd want this role to answer in the first 90 days?
2. How mature is the CDP today — which use cases are live, and how are audiences activated?
3. How are campaigns measured today — are holdouts standard practice?
4. What does the data stack look like (warehouse, BI, ML tooling), and how does analytics partner with data engineering?
5. Which GenAI tools are approved, and how is the team using them so far?
6. How is success measured for this role after one year?

---

## STAR story map
Prepare one real story for each JD theme (fill in your own):

| JD theme | Your story (S/T/A/R in one line each) | Quantified result |
|---|---|---|
| Segmentation / audiences | | |
| Retention / churn / reactivation insight | | |
| Campaign measurement & ROI | | |
| ML / AI applied to a business problem | | |
| Automation of manual reporting | | |
| Influencing a stakeholder / translating insight to action | | |
| Data quality issue found & fixed | | |
