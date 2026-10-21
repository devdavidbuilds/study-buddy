module.exports = {
  match: "Basics of Business Statistics (College Level)",
  pt: "calculation",
  d: "A college-level introduction to the statistics used in business decisions. You will describe data with averages and spread, use probability and the normal distribution, understand sampling and the central limit theorem, build confidence intervals, test hypotheses and measure relationships with correlation and regression — with worked business examples throughout.",
  sk: ["Descriptive statistics", "Probability", "Normal distribution", "Sampling", "Confidence intervals", "Hypothesis testing", "Regression"],
  out: [
    "Summarise data with measures of centre and spread",
    "Calculate probabilities and use the normal distribution",
    "Explain sampling distributions and the central limit theorem",
    "Construct confidence intervals and carry out hypothesis tests",
    "Measure and interpret correlation and simple linear regression",
  ],
  mods: [
    {
      t: "Describing Data",
      s: "Types of data and how they are collected, and the measures that summarise a data set's centre and spread.",
      ls: [
        {
          t: "Data, Variables and Sampling",
          f: "Classify variables and understand populations, samples and sampling methods",
          s: "Distinguish types of data and learn how samples are drawn from populations without bias.",
          o: ["Classify variables as categorical or numerical", "Distinguish a population from a sample", "Describe random, stratified and convenience sampling"],
          x: `Statistics is the science of learning from data to make better decisions under uncertainty — which is exactly what businesses do every day.

**Variables** are characteristics that vary between observations:
- **Categorical (qualitative)** — labels or groups: payment method, region, product type. *Ordinal* categories have a natural order (satisfaction: low / medium / high).
- **Numerical (quantitative)** — numbers you can do arithmetic with. *Discrete* values are counts (customers per hour); *continuous* values are measurements (delivery time, revenue).

The type of variable decides which summaries and charts make sense: you can average delivery times, but not payment methods.

A **population** is the entire group you care about (all customers of a bank). A **sample** is the subset you actually measure (500 customers surveyed). A number describing a population is a **parameter** (μ, the true mean); one calculated from a sample is a **statistic** (x̄, the sample mean), used to estimate the parameter.

How the sample is chosen matters more than its size:
- **Simple random sampling** — every member has an equal chance of selection.
- **Stratified sampling** — divide the population into groups (strata, e.g. regions) and sample randomly within each, so every group is represented.
- **Convenience sampling** — whoever is easiest to reach. Cheap but often **biased**.

**Bias** is a systematic error that makes the sample unrepresentative — for example surveying only customers who visit on weekdays. A large biased sample is still wrong; a modest random sample is often far more reliable.`,
          c: [
            ["Categorical vs numerical variable", "Labels or groups versus measured or counted quantities."],
            ["Population vs sample", "The whole group of interest versus the subset actually measured."],
            ["Sampling bias", "A systematic error that makes a sample unrepresentative of the population."],
          ],
          e: {
            t: "Designing a customer survey",
            s: "A retail chain with 60% urban and 40% rural customers wants feedback from 1,000 customers.",
            st: ["Define the population: all customers in the past year", "Use stratified sampling: 600 urban and 400 rural customers", "Select customers randomly within each stratum from the customer database"],
            so: "The sample mirrors the urban/rural mix, avoiding the bias of surveying only shoppers in big-city stores.",
          },
          a: ["Market research and customer surveys", "Quality checks on production batches"],
          m: [["Assuming a big sample is automatically representative", "Check how it was selected; bias does not shrink with size."], ["Averaging categorical codes (e.g. region 1, 2, 3)", "Use counts and percentages for categorical data."]],
          tip: ["Before analysing any data set, write down how it was collected."],
          k: ["Variables are categorical or numerical (discrete or continuous).", "Samples estimate population parameters.", "Random and stratified sampling reduce bias; convenience samples often do not."],
          q: [
            ["Delivery time in minutes is which type of variable?", ["Categorical", "Discrete numerical", "Continuous numerical", "Ordinal"], 2, "It is measured on a continuous scale."],
            ["A sample mean is an example of a…", ["Parameter", "Statistic", "Population", "Variable type"], 1, "Values calculated from a sample are statistics."],
            ["Dividing a population into regions and sampling randomly within each is…", ["Convenience sampling", "Stratified sampling", "Census", "Biased sampling"], 1, "Stratified sampling ensures each group is represented."],
          ],
        },
        {
          t: "Measures of Central Tendency",
          f: "Calculate and interpret the mean, median and mode",
          s: "Summarise the typical value of a data set and choose the right average for skewed data.",
          o: ["Calculate the mean, median and mode", "Choose the appropriate average", "Explain the effect of outliers and skewness"],
          x: `A **measure of central tendency** summarises a data set with one "typical" value.

**Mean** (arithmetic average): add all values and divide by how many there are.
\`x̄ = Σx ÷ n\`
Daily sales of 12, 15, 11, 18, 14 → mean = 70 ÷ 5 = **14**.

**Median**: the middle value when the data are sorted. With an even number of values, average the two middle ones. Sorted: 11, 12, **14**, 15, 18 → median = 14.

**Mode**: the most frequent value; the only average that works for categorical data (the most popular product size).

**Which one to use?** The mean uses every value, but it is pulled strongly by **outliers** (extreme values). Suppose five employees earn ₹30k, ₹32k, ₹35k, ₹38k and the owner ₹4,00,000 a month: the mean is ₹1,07,000, which describes nobody, while the median of ₹35,000 is a far better "typical" salary.

This links to **skewness**:
- **Symmetric** data: mean ≈ median.
- **Right-skewed** (a long tail of high values — incomes, house prices, order sizes): mean > median.
- **Left-skewed** (a long tail of low values): mean < median.

So for skewed business data such as income or transaction values, report the **median**, or both. A **weighted mean** is used when values have different importance: an average price weighted by the quantity sold at each price.`,
          c: [
            ["Mean", "The sum of the values divided by their number."],
            ["Median", "The middle value of the sorted data; resistant to outliers."],
            ["Skewness", "Asymmetry of a distribution; in right-skewed data the mean exceeds the median."],
          ],
          e: {
            t: "Average order value",
            s: "Seven orders (₹): 450, 520, 480, 610, 500, 470, 4,900.",
            st: ["Mean = (450 + 520 + 480 + 610 + 500 + 470 + 4,900) ÷ 7 = 7,930 ÷ 7 ≈ ₹1,133", "Sort: 450, 470, 480, 500, 520, 610, 4,900 → median = ₹500", "Compare: one bulk order of ₹4,900 drags the mean far above typical orders"],
            so: "The median (₹500) represents a typical order; the mean (≈ ₹1,133) is inflated by one outlier, so report the median — and investigate the bulk order separately.",
          },
          a: ["Reporting typical salaries, prices or order values", "Summarising survey and sales data"],
          m: [["Reporting only the mean for skewed data", "Use the median, or show both."], ["Forgetting to sort before finding the median", "Always order the data first."]],
          tip: ["If the mean and median differ a lot, look for outliers and skewness."],
          k: ["Mean = sum ÷ n; median = middle value; mode = most frequent.", "Outliers pull the mean but barely move the median.", "Right-skewed: mean > median — prefer the median."],
          q: [
            ["What is the median of 3, 9, 4, 7, 5?", ["4", "5", "5.6", "7"], 1, "Sorted: 3, 4, 5, 7, 9 — the middle value is 5."],
            ["Which average is best for typical household income?", ["Mean", "Median", "Mode", "Range"], 1, "Income is right-skewed, so the median is more representative."],
            ["In right-skewed data, how do the mean and median compare?", ["Mean < median", "Mean = median", "Mean > median", "They cannot be compared"], 2, "The long right tail pulls the mean upwards."],
          ],
        },
        {
          t: "Measures of Spread",
          f: "Calculate range, interquartile range, variance and standard deviation",
          s: "Measure how spread out data are, and use the standard deviation and coefficient of variation.",
          o: ["Calculate the range and interquartile range", "Calculate variance and standard deviation", "Compare variability with the coefficient of variation"],
          x: `Two data sets can have the same average but behave very differently. Two suppliers both deliver in **5 days on average**, but one always takes 4–6 days and the other 1–9 days. **Spread** (dispersion) captures that difference — and for planning, consistency often matters as much as the average.

**Range** = maximum − minimum. Simple, but determined entirely by the two most extreme values.

**Interquartile range (IQR)** = Q3 − Q1: the spread of the middle 50% of the data, where Q1 and Q3 are the 25th and 75th percentiles. It ignores extremes, so it pairs naturally with the median. A common outlier rule flags values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR.

**Variance and standard deviation** measure the typical distance of values from the mean. For a sample:

\`s² = Σ(x − x̄)² ÷ (n − 1)\`    and    \`s = √s²\`

Dividing by *n − 1* (rather than n) corrects the tendency of a sample to underestimate the population's spread. The **standard deviation** is in the same units as the data, which makes it easy to interpret: delivery times with mean 5 days and s = 0.8 days are very consistent.

**Coefficient of variation (CV)** = s ÷ x̄ × 100% compares variability between data sets with different units or scales — for example the volatility of two shares with very different prices.

Always report a measure of spread alongside an average: "mean 5 days, standard deviation 0.8" says far more than "5 days" alone.`,
          c: [
            ["Interquartile range", "Q3 − Q1, the spread of the middle half of the data."],
            ["Standard deviation", "The typical distance of observations from the mean, in the data's own units."],
            ["Coefficient of variation", "Standard deviation as a percentage of the mean, for comparing relative variability."],
          ],
          e: {
            t: "Comparing two suppliers",
            s: "Supplier A delivery times (days): 4, 5, 5, 6. Supplier B: 2, 4, 6, 8.",
            st: ["Both means: A = 20/4 = 5; B = 20/4 = 5", "A: deviations −1, 0, 0, 1 → Σ(x − x̄)² = 2 → s² = 2/3 → s ≈ 0.82 days", "B: deviations −3, −1, 1, 3 → Σ = 20 → s² = 20/3 → s ≈ 2.58 days"],
            so: "Same average, but A's standard deviation (0.82 days) is about a third of B's (2.58 days); A is far more reliable for planning stock.",
          },
          a: ["Assessing supplier and process consistency", "Measuring investment risk (volatility)"],
          m: [["Reporting an average without any spread", "Always add the standard deviation or IQR."], ["Using the range when there are outliers", "Use the IQR, which ignores extremes."]],
          tip: ["Pair the mean with the standard deviation, and the median with the IQR."],
          k: ["Spread measures consistency; averages alone hide it.", "IQR resists outliers; standard deviation uses every value.", "CV compares variability across different scales."],
          q: [
            ["What is the range of 12, 7, 19, 10?", ["7", "12", "19", "26"], 1, "19 − 7 = 12."],
            ["Why does the sample variance divide by n − 1?", ["To make calculations easier", "To correct the underestimate of population spread", "Because one value is always removed", "It is a rounding rule"], 1, "n − 1 gives an unbiased estimate of the population variance."],
            ["Which measure best compares variability of data in different units?", ["Range", "Variance", "Coefficient of variation", "Mode"], 2, "CV expresses spread relative to the mean, so it is unit-free."],
          ],
        },
      ],
    },
    {
      t: "Probability and Distributions",
      s: "The rules of probability, the normal distribution and z-scores, and how sample statistics behave.",
      ls: [
        {
          t: "Probability Basics",
          f: "Apply probability rules for unions, intersections and conditional probability",
          s: "Calculate probabilities with the addition and multiplication rules and conditional probability.",
          o: ["Calculate simple and complementary probabilities", "Apply the addition and multiplication rules", "Calculate conditional probabilities from a table"],
          x: `**Probability** measures how likely an event is, on a scale from **0** (impossible) to **1** (certain). When outcomes are equally likely:

\`P(A) = favourable outcomes ÷ total outcomes\`

In business, probabilities usually come from data: if 30 of 600 orders last month were returned, P(return) ≈ 30/600 = 0.05.

**Complement:** P(not A) = 1 − P(A). If 5% of orders are returned, 95% are not.

**Addition rule** (A *or* B):
\`P(A or B) = P(A) + P(B) − P(A and B)\`
The subtraction avoids counting the overlap twice. If events are *mutually exclusive* (cannot both happen), P(A and B) = 0.

**Multiplication rule** (A *and* B):
- Independent events (one does not affect the other): P(A and B) = P(A) × P(B). If two independent machines each fail on 2% of days, both fail on 0.02 × 0.02 = 0.0004 of days.
- In general: P(A and B) = P(A) × P(B | A).

**Conditional probability** — the probability of A *given* that B has happened:
\`P(A | B) = P(A and B) ÷ P(B)\`

Conditional probabilities are central to business analytics: the probability a customer buys *given* they clicked an advert, or that a loan defaults *given* a low credit score. A **contingency table** of counts makes them easy to calculate — divide the relevant cell by the total of the row or column you are conditioning on.`,
          c: [
            ["Complement rule", "P(not A) = 1 − P(A)."],
            ["Independent events", "Events where one occurring does not change the probability of the other."],
            ["Conditional probability", "P(A | B) = P(A and B) ÷ P(B), the probability of A given B."],
          ],
          e: {
            t: "Conversion rate given an advert",
            s: "Of 1,000 website visitors, 400 saw an advert. 60 of those 400 bought, and 40 of the other 600 bought.",
            st: ["P(buy) = (60 + 40) ÷ 1,000 = 0.10", "P(buy | saw advert) = 60 ÷ 400 = 0.15", "P(buy | no advert) = 40 ÷ 600 ≈ 0.067"],
            so: "Visitors who saw the advert bought at about 15% versus 6.7% — more than twice the rate (though an experiment would be needed to prove the advert caused it).",
          },
          a: ["Estimating risk of defaults, returns or failures", "Measuring conversion rates in marketing"],
          m: [["Adding probabilities of overlapping events without subtracting the overlap", "Use P(A) + P(B) − P(A and B)."], ["Multiplying probabilities of dependent events as if independent", "Use P(A) × P(B | A)."]],
          tip: ["Turn word problems into a contingency table of counts first."],
          k: ["Probabilities run from 0 to 1; P(not A) = 1 − P(A).", "Addition rule subtracts the overlap; multiplication rule uses independence or conditioning.", "P(A | B) = P(A and B) ÷ P(B)."],
          q: [
            ["If P(A) = 0.3, what is P(not A)?", ["0.3", "0.7", "1.3", "0"], 1, "1 − 0.3 = 0.7."],
            ["Two independent events each have probability 0.5. What is P(both)?", ["1", "0.5", "0.25", "0.75"], 2, "0.5 × 0.5 = 0.25."],
            ["P(A and B) = 0.12 and P(B) = 0.4. What is P(A | B)?", ["0.048", "0.3", "0.52", "0.12"], 1, "0.12 ÷ 0.4 = 0.3."],
          ],
        },
        {
          t: "The Normal Distribution and z-Scores",
          f: "Use the normal distribution, the empirical rule and z-scores",
          s: "Work with the bell-shaped normal distribution, standardise values with z-scores and find probabilities.",
          o: ["Describe the shape and parameters of the normal distribution", "Apply the 68–95–99.7 rule", "Calculate and interpret z-scores"],
          x: `Many business measurements — package weights, measurement errors, the average of large samples — follow a **normal distribution**: a symmetric, bell-shaped curve defined by its **mean μ** (centre) and **standard deviation σ** (spread). Mean, median and mode are equal, at the peak.

**The empirical (68–95–99.7) rule:**
- about **68%** of values lie within 1σ of the mean,
- about **95%** within 2σ,
- about **99.7%** within 3σ.

If cereal boxes have mean weight 500 g with σ = 5 g, about 95% weigh between 490 and 510 g, and a box under 485 g (3σ below) is very unusual.

**z-scores** standardise any value into "number of standard deviations from the mean":

\`z = (x − μ) ÷ σ\`

A box weighing 492 g has z = (492 − 500) ÷ 5 = **−1.6**. z-scores let you compare values from different distributions — an exam score of 78 where the class mean is 70 (σ = 4, z = 2) is more impressive than 85 where the mean is 80 (σ = 10, z = 0.5).

To find probabilities, convert to z and use a **standard normal table** or software (Excel: \`=NORM.DIST(x, mean, sd, TRUE)\` gives the probability of a value *below* x). For z = −1.6 the table gives about **0.055**, so roughly 5.5% of boxes weigh less than 492 g.

Quality-control charts, "six sigma" programmes and many risk models are built on exactly this logic.`,
          c: [
            ["Normal distribution", "A symmetric bell-shaped distribution described by its mean and standard deviation."],
            ["Empirical rule", "About 68%, 95% and 99.7% of normal data lie within 1, 2 and 3 standard deviations of the mean."],
            ["z-score", "(x − μ) ÷ σ: how many standard deviations a value is from the mean."],
          ],
          e: {
            t: "Delivery-time guarantee",
            s: "Delivery times are normal with mean 48 hours and σ = 6 hours. What share arrive within 60 hours?",
            st: ["z = (60 − 48) ÷ 6 = 2.0", "The standard normal table gives P(Z < 2.0) ≈ 0.977", "So about 97.7% arrive within 60 hours; about 2.3% take longer"],
            so: "A '60-hour delivery' promise would be met about 97.7% of the time — useful for deciding whether the promise is safe to advertise.",
          },
          a: ["Quality control and tolerance limits", "Setting service-level guarantees"],
          m: [["Assuming all data are normal", "Check a histogram first; incomes and waiting times are often skewed."], ["Forgetting the sign of z", "Negative z means below the mean."]],
          tip: ["Sketch the bell curve and shade the area you want before calculating."],
          k: ["The normal distribution is symmetric and defined by μ and σ.", "68–95–99.7% lie within 1, 2 and 3σ.", "z = (x − μ) ÷ σ converts values to a standard scale."],
          q: [
            ["About what percentage of normal data lie within 2 standard deviations of the mean?", ["68%", "90%", "95%", "99.7%"], 2, "The empirical rule gives about 95% within 2σ."],
            ["Mean 100, σ = 15. What is the z-score of 130?", ["1", "2", "15", "30"], 1, "(130 − 100) ÷ 15 = 2."],
            ["A z-score of −1.5 means the value is…", ["1.5 above the mean", "1.5 standard deviations below the mean", "Impossible", "Equal to the mean"], 1, "Negative z-scores lie below the mean."],
          ],
        },
        {
          t: "Sampling Distributions and the Central Limit Theorem",
          f: "Explain the standard error and the central limit theorem",
          s: "Understand how sample means vary and why the central limit theorem makes inference possible.",
          o: ["Explain what a sampling distribution is", "Calculate the standard error of the mean", "State and apply the central limit theorem"],
          x: `If you took many different samples from the same population, each sample mean x̄ would be slightly different. The distribution of all those possible means is the **sampling distribution of the mean** — and understanding it is the key to drawing conclusions from samples.

Two facts describe it:
1. Its centre is the population mean: the average of all possible x̄ values equals **μ** (the sample mean is an *unbiased* estimator).
2. Its spread is the **standard error**:

\`SE = σ ÷ √n\`

Larger samples give means that vary less. Note the square root: to halve the standard error you need **four times** the sample size.

**The central limit theorem (CLT)** says: for a reasonably large sample (a common rule of thumb is **n ≥ 30**), the sampling distribution of the mean is **approximately normal — whatever the shape of the population**. Even if individual purchase amounts are heavily skewed, the *average* purchase of 50 customers behaves like a normal variable.

This is why the normal distribution from the previous lesson is so powerful: we can use z-scores to ask how likely a particular sample mean is.

Example: a call centre's call lengths have μ = 6 minutes and σ = 3 minutes (skewed). For a sample of 36 calls, SE = 3 ÷ √36 = 0.5 minutes, so the sample mean will almost always (≈95%) fall within 6 ± 2×0.5, i.e. **5 to 7 minutes**. A sample mean of 7.5 minutes (z = 3) would strongly suggest something has changed.

Confidence intervals and hypothesis tests in the next module are built directly on this idea.`,
          c: [
            ["Sampling distribution", "The distribution of a statistic (such as x̄) over all possible samples."],
            ["Standard error", "σ ÷ √n, the standard deviation of the sampling distribution of the mean."],
            ["Central limit theorem", "For large n, sample means are approximately normal regardless of the population's shape."],
          ],
          e: {
            t: "Is the new process slower?",
            s: "Packing time historically has μ = 20 min, σ = 8 min. A sample of 64 packages under a new process averages 22.5 min.",
            st: ["SE = 8 ÷ √64 = 1 minute", "z = (22.5 − 20) ÷ 1 = 2.5", "P(z ≥ 2.5) ≈ 0.006, so such a high average would be very unlikely if nothing had changed"],
            so: "A sample mean this high would occur less than 1% of the time under the old process, so the new process is very likely slower.",
          },
          a: ["Deciding sample sizes for surveys and audits", "Monitoring averages in quality control"],
          m: [["Confusing σ (spread of individuals) with SE (spread of means)", "Divide σ by √n for sample means."], ["Applying the CLT to tiny samples from very skewed data", "Use n ≥ 30 as a rough minimum, more for strong skew."]],
          tip: ["Remember: quadruple the sample size to halve the standard error."],
          k: ["Sample means vary around μ with standard error σ ÷ √n.", "The CLT makes sample means approximately normal for large n.", "Larger samples give more precise estimates."],
          q: [
            ["σ = 12 and n = 36. What is the standard error?", ["12", "6", "2", "0.33"], 2, "12 ÷ √36 = 12 ÷ 6 = 2."],
            ["What does the central limit theorem say about sample means for large n?", ["They equal the population mean exactly", "They are approximately normally distributed", "They are always skewed", "They have no spread"], 1, "The sampling distribution of x̄ becomes approximately normal."],
            ["To halve the standard error, the sample size must be…", ["Doubled", "Halved", "Quadrupled", "Squared"], 2, "SE depends on √n, so n must increase fourfold."],
          ],
        },
      ],
    },
    {
      t: "Inference and Relationships",
      s: "Estimating with confidence intervals, testing claims with hypothesis tests, and measuring relationships between variables.",
      ls: [
        {
          t: "Confidence Intervals",
          f: "Construct and interpret confidence intervals for a mean",
          s: "Estimate a population mean with a range that reflects sampling uncertainty.",
          o: ["Construct a 95% confidence interval for a mean", "Interpret a confidence interval correctly", "Explain how sample size and confidence level affect width"],
          x: `A single sample mean is a **point estimate** — useful, but almost certainly not exactly right. A **confidence interval** gives a range of plausible values for the population mean:

\`x̄ ± z* × SE\`, where \`SE = s ÷ √n\`

For **95% confidence**, z* = **1.96**; for 90%, 1.645; for 99%, 2.576. (With small samples, statisticians use a slightly larger multiplier from the *t-distribution*; for large samples the values are almost identical.)

**Example.** A sample of 100 customers spends an average of ₹850 per visit with s = ₹200.
SE = 200 ÷ √100 = ₹20; margin of error = 1.96 × 20 = ₹39.2.
95% CI = ₹850 ± ₹39.2 = **₹810.8 to ₹889.2**.

**Interpretation:** "We are 95% confident that the true mean spending of all customers lies between ₹811 and ₹889." More precisely, the *method* captures the true mean in 95% of samples. It does **not** mean 95% of individual customers spend in that range.

**What controls the width?**
- **Larger samples** → smaller SE → narrower interval.
- **Higher confidence** (99% vs 95%) → wider interval: more certainty requires a wider net.
- **More variable data** → wider interval.

You can turn this around to plan research: the sample size needed for a margin of error E is roughly \`n = (z* × s ÷ E)²\`. To estimate spending within ±₹20 at 95% confidence with s = 200: n = (1.96 × 200 ÷ 20)² ≈ **385** customers.`,
          c: [
            ["Confidence interval", "A range, point estimate ± margin of error, likely to contain the population parameter."],
            ["Margin of error", "z* × SE: half the width of the confidence interval."],
            ["Confidence level", "The proportion of intervals, over repeated samples, that would contain the true parameter (e.g. 95%)."],
          ],
          e: {
            t: "Estimating average delivery time",
            s: "49 deliveries have mean 3.2 days and s = 0.7 days. Construct a 95% confidence interval.",
            st: ["SE = 0.7 ÷ √49 = 0.1 days", "Margin = 1.96 × 0.1 = 0.196 days", "CI = 3.2 ± 0.196 = 3.00 to 3.40 days"],
            so: "We are 95% confident the true mean delivery time is between about 3.0 and 3.4 days.",
          },
          a: ["Reporting survey results with a margin of error", "Planning how many observations to collect"],
          m: [["Saying '95% of customers fall in the interval'", "The interval is about the mean, not individual values."], ["Ignoring the margin of error when comparing results", "Overlapping intervals mean a difference may not be real."]],
          tip: ["Always report the confidence level and the margin of error together with the estimate."],
          k: ["CI = x̄ ± z* × s ÷ √n; z* = 1.96 for 95%.", "It estimates the population mean, not individual values.", "Bigger samples narrow intervals; higher confidence widens them."],
          q: [
            ["What multiplier is used for a 95% confidence interval (large sample)?", ["1.645", "1.96", "2.576", "3"], 1, "z* = 1.96 for 95% confidence."],
            ["x̄ = 50, SE = 2. What is the 95% CI (approximately)?", ["48 to 52", "46.08 to 53.92", "44 to 56", "49 to 51"], 1, "50 ± 1.96 × 2 = 50 ± 3.92."],
            ["How does increasing the sample size affect the interval?", ["Wider", "Narrower", "No change", "It shifts the centre"], 1, "Larger n reduces the standard error."],
          ],
        },
        {
          t: "Hypothesis Testing",
          f: "Set up hypotheses, calculate a test statistic and interpret p-values",
          s: "Test business claims with null and alternative hypotheses, test statistics and p-values.",
          o: ["Write null and alternative hypotheses", "Calculate a z test statistic and p-value", "Interpret results and Type I and II errors"],
          x: `A **hypothesis test** uses sample data to judge a claim about a population — "the new checkout design increases average order value", "the machine fills bottles with 1 litre on average".

**Steps:**
1. **State hypotheses.** The **null hypothesis H₀** is the default, no-change claim (μ = 1,000 ml). The **alternative H₁** is what you want evidence for (μ ≠ 1,000 ml, or μ > … for a one-sided test).
2. **Choose a significance level α**, commonly **0.05**: the risk you accept of rejecting a true H₀.
3. **Compute a test statistic**, e.g. \`z = (x̄ − μ₀) ÷ (s ÷ √n)\` — how many standard errors the sample is from the null value.
4. **Find the p-value**: the probability of results at least this extreme **if H₀ were true**.
5. **Decide.** If p ≤ α, **reject H₀** — the result is *statistically significant*. If p > α, you **fail to reject H₀** (which is not proof that H₀ is true).

**Errors:**
- **Type I error** — rejecting a true H₀ (a false alarm). Probability = α.
- **Type II error** — failing to reject a false H₀ (missing a real effect). More data reduces it.

**Statistical vs practical significance.** With huge samples, tiny differences become "significant". A ₹2 increase in average order value may be statistically significant but commercially meaningless — always look at the size of the effect and its confidence interval, not just the p-value.`,
          c: [
            ["Null hypothesis (H₀)", "The default claim of no effect or no difference, tested against the data."],
            ["p-value", "The probability of results at least as extreme as observed, assuming H₀ is true."],
            ["Type I and Type II errors", "Rejecting a true null (false alarm) vs failing to reject a false null (missed effect)."],
          ],
          e: {
            t: "Testing a bottle-filling machine",
            s: "Target fill is 1,000 ml. A sample of 64 bottles has mean 997 ml and s = 8 ml. Test at α = 0.05 (two-sided).",
            st: ["H₀: μ = 1,000; H₁: μ ≠ 1,000", "SE = 8 ÷ √64 = 1; z = (997 − 1,000) ÷ 1 = −3", "Two-sided p-value ≈ 2 × 0.00135 = 0.0027, which is below 0.05"],
            so: "Reject H₀: there is strong evidence the machine is under-filling by about 3 ml on average, so it should be recalibrated.",
          },
          a: ["A/B testing website changes", "Quality control and auditing claims"],
          m: [["Saying 'we proved H₀ is true'", "Say 'we failed to reject H₀' — absence of evidence is not proof."], ["Treating a tiny significant effect as important", "Report the effect size and confidence interval too."]],
          tip: ["Decide α and the hypotheses before looking at the data."],
          k: ["H₀ is the no-change claim; H₁ is what you seek evidence for.", "Reject H₀ when p ≤ α (often 0.05).", "Consider Type I/II errors and practical significance."],
          q: [
            ["A test gives p = 0.03 with α = 0.05. What do you conclude?", ["Fail to reject H₀", "Reject H₀", "Accept H₀ as proven", "Increase α"], 1, "p ≤ α, so the result is significant."],
            ["A Type I error is…", ["Failing to detect a real effect", "Rejecting a true null hypothesis", "Using the wrong sample size", "A calculation mistake"], 1, "It is a false alarm, with probability α."],
            ["What does a p-value measure?", ["The probability H₀ is true", "The probability of results this extreme if H₀ is true", "The size of the effect", "The sample size"], 1, "It is computed assuming the null hypothesis holds."],
          ],
        },
        {
          t: "Correlation and Simple Linear Regression",
          f: "Measure linear relationships and fit a regression line for prediction",
          s: "Measure how strongly two variables move together and use a regression line to make predictions.",
          o: ["Interpret a scatter plot and correlation coefficient", "Interpret the slope and intercept of a regression line", "Use r² and explain why correlation is not causation"],
          x: `Businesses constantly ask how two variables are related: does advertising spend relate to sales? Does price relate to demand?

Start with a **scatter plot** (one variable on each axis) to see the pattern.

**Correlation coefficient r** measures the strength and direction of a **linear** relationship, from **−1** to **+1**:
- r near +1: strong positive (both rise together)
- r near −1: strong negative (one rises as the other falls)
- r near 0: no *linear* relationship (there could still be a curved one)

**Simple linear regression** fits the best straight line through the data, minimising the squared vertical distances (*least squares*):

\`ŷ = b₀ + b₁x\`

- **Slope b₁** — the predicted change in y for each one-unit increase in x.
- **Intercept b₀** — the predicted y when x = 0 (only meaningful if x = 0 makes sense).

If sales (₹ lakh) are modelled as ŷ = 12 + 3.5 × advertising (₹ lakh), each extra ₹1 lakh of advertising is associated with about ₹3.5 lakh more sales.

**r²** (the coefficient of determination) is the share of the variation in y explained by x. r² = 0.64 means 64% of the variation in sales is explained by advertising spend.

Cautions:
- **Correlation is not causation.** Ice-cream sales and sunburn are correlated because both rise in summer — a *confounding* variable.
- Do not **extrapolate** far beyond the range of the data.
- Outliers can change the line dramatically — always look at the plot.`,
          c: [
            ["Correlation coefficient (r)", "A value from −1 to +1 measuring the strength and direction of a linear relationship."],
            ["Regression slope", "The predicted change in y for a one-unit increase in x."],
            ["r²", "The proportion of the variation in y explained by the regression on x."],
          ],
          e: {
            t: "Predicting sales from advertising",
            s: "A regression of monthly sales (₹ lakh) on advertising (₹ lakh) gives ŷ = 12 + 3.5x with r = 0.8.",
            st: ["Predict sales at x = 4: ŷ = 12 + 3.5 × 4 = ₹26 lakh", "r² = 0.8² = 0.64, so 64% of the variation in sales is explained", "Check that 4 is inside the range of advertising values used to fit the line"],
            so: "Predicted sales are about ₹26 lakh. Advertising explains 64% of the variation, so other factors (season, price, competition) still matter — and the line shows association, not proof of cause.",
          },
          a: ["Forecasting demand and sales", "Pricing and marketing analysis"],
          m: [["Concluding that x causes y from correlation alone", "Consider confounding variables and use experiments where possible."], ["Predicting far outside the data range", "Only predict within (or near) the observed x values."]],
          tip: ["Always plot the data before calculating r or fitting a line."],
          k: ["r measures linear association from −1 to +1.", "Regression ŷ = b₀ + b₁x predicts y; the slope is the change per unit of x.", "r² is the share of variation explained; correlation ≠ causation."],
          q: [
            ["Which r indicates the strongest linear relationship?", ["0.5", "−0.9", "0.1", "0"], 1, "Strength depends on |r|; −0.9 is strongest (negative)."],
            ["In ŷ = 20 + 4x, what does 4 mean?", ["y when x = 0", "The predicted change in y per one-unit increase in x", "The correlation", "The error"], 1, "The slope is the change in ŷ per unit of x."],
            ["If r = 0.7, what is r²?", ["0.7", "0.49", "1.4", "0.35"], 1, "0.7² = 0.49, so 49% of the variation is explained."],
          ],
        },
      ],
    },
  ],
};
