// Business Finance curriculum — used for every Business Finance course that
// has no course-specific content. {course} = course name, {topic} = main
// subject detected from the title (e.g. "stock trading"), else "finance".
module.exports = {
  pt: "calculation",
  d: "{course} gives you a structured foundation in {topic}: the time value of money, reading financial statements and ratios, how markets price risk and return, valuation basics, budgeting, risk management and disciplined decision-making. Every lesson includes worked numbers and a short check; every module ends with a quiz.",
  sk: ["{topic}", "Financial statements", "Ratio analysis", "Risk and return", "Valuation", "Budgeting", "Risk management"],
  out: [
    "Calculate simple and compound growth and discount future cash flows",
    "Read an income statement, balance sheet and cash-flow statement",
    "Measure risk, return and the benefit of diversification",
    "Apply basic valuation measures such as P/E and discounted cash flow",
    "Build a budget and size positions to control risk",
  ],
  mods: [
    {
      t: "Financial Foundations",
      s: "Why money has a time value, and how a company's three financial statements and key ratios describe its health.",
      ls: [
        {
          t: "The Time Value of Money",
          f: "Calculate compound growth, present value and future value",
          s: "Learn why a rupee today is worth more than a rupee tomorrow, and compute future and present values.",
          o: ["Explain the time value of money", "Calculate future value with compound interest", "Discount a future amount to present value"],
          x: `Welcome to **{course}**. Almost every idea in {topic} rests on one principle: **money available today is worth more than the same amount in the future**, because today's money can be invested to earn a return (and because of inflation and risk).

**Simple interest** grows only on the original amount: \`Interest = P × r × t\`.

**Compound interest** also earns interest on past interest:
\`FV = PV × (1 + r)ⁿ\`
where *PV* is the present value, *r* the rate per period and *n* the number of periods. ₹10,000 at 8% a year for 10 years grows to 10,000 × 1.08¹⁰ ≈ **₹21,589** — more than double, while simple interest would give only ₹18,000.

Reversing the formula gives **present value** — what a future amount is worth today:
\`PV = FV ÷ (1 + r)ⁿ\`
₹50,000 received in 5 years, discounted at 10%, is worth 50,000 ÷ 1.10⁵ ≈ **₹31,046** today. The rate used here is the *discount rate*: the return you could earn elsewhere at similar risk.

A quick mental shortcut is the **Rule of 72**: money doubles in about 72 ÷ r years (at 8%, roughly 9 years).

Compounding explains why starting to save early matters so much, why debt with high interest grows quickly, and — in later lessons — how investments and whole companies are valued.`,
          c: [
            ["Compound interest", "Interest earned on both the original amount and previously earned interest."],
            ["Present value", "The value today of money received in the future, found by discounting."],
            ["Discount rate", "The return required to compensate for time and risk, used to convert future values to today's value."],
          ],
          e: {
            t: "Comparing two offers",
            s: "Would you rather have ₹1,00,000 today or ₹1,30,000 in 3 years, if you can earn 9% a year?",
            st: ["Discount ₹1,30,000 by 3 years at 9%: 1,30,000 ÷ 1.09³", "1.09³ ≈ 1.295, so PV ≈ ₹1,00,386", "Compare with ₹1,00,000 today"],
            so: "The future offer is worth about ₹1,00,386 today, only slightly more than ₹1,00,000 — so the two are almost equivalent at a 9% return; at any rate above about 9.1% the cash today is better.",
          },
          a: ["Comparing loans, deposits and investment offers", "Planning savings for a future goal"],
          m: [["Adding future amounts without discounting", "Convert all cash flows to the same point in time before comparing."], ["Mixing annual rates with monthly periods", "Match the rate to the period: 12% a year is about 1% a month."]],
          tip: ["Use the Rule of 72 to sanity-check compound growth calculations."],
          k: ["Money today is worth more than money tomorrow.", "FV = PV × (1 + r)ⁿ; PV = FV ÷ (1 + r)ⁿ.", "Compounding makes time the most powerful factor in growth."],
          q: [
            ["₹1,000 earns 10% compound interest a year. What is it worth after 2 years?", ["₹1,200", "₹1,210", "₹1,100", "₹1,020"], 1, "1,000 × 1.10² = 1,210; the extra ₹10 is interest on interest."],
            ["Which formula gives present value?", ["PV = FV × (1 + r)ⁿ", "PV = FV ÷ (1 + r)ⁿ", "PV = FV × r × n", "PV = FV − r"], 1, "Discounting divides by the growth factor (1 + r)ⁿ."],
            ["Using the Rule of 72, roughly how long does money take to double at 6%?", ["6 years", "8 years", "12 years", "72 years"], 2, "72 ÷ 6 = 12 years."],
          ],
        },
        {
          t: "Reading Financial Statements",
          f: "Interpret the income statement, balance sheet and cash-flow statement",
          s: "Understand what each of the three financial statements shows and how they connect.",
          o: ["Read an income statement", "Apply the balance-sheet equation", "Explain why profit and cash flow differ"],
          x: `Companies report their performance in three linked statements.

**1. Income statement (profit and loss)** — performance over a period:
Revenue − Cost of goods sold = **Gross profit**
Gross profit − Operating expenses = **Operating profit (EBIT)**
EBIT − Interest − Tax = **Net profit**

**2. Balance sheet** — a snapshot at one date, always obeying:
\`Assets = Liabilities + Equity\`
*Assets* are what the company owns or controls (cash, inventory, machinery); *liabilities* are what it owes (loans, unpaid bills); *equity* is what belongs to the owners.

**3. Cash-flow statement** — where cash actually came from and went:
- *Operating* cash flow from running the business
- *Investing* cash flow (buying equipment, selling assets)
- *Financing* cash flow (loans, issuing shares, paying dividends)

**Profit is not cash.** A sale made on credit counts as revenue immediately but brings no cash until the customer pays; buying a machine uses cash today but is expensed slowly as depreciation. Many profitable businesses fail because they run out of cash, so always read the cash-flow statement alongside the profit figure.

The statements connect: net profit flows into equity on the balance sheet (as retained earnings) and is the starting point of operating cash flow.`,
          c: [
            ["Income statement", "Shows revenue, expenses and profit over a period."],
            ["Balance-sheet equation", "Assets = Liabilities + Equity, true at every balance-sheet date."],
            ["Operating cash flow", "Cash generated by the company's normal business activities."],
          ],
          e: {
            t: "From revenue to net profit",
            s: "A shop has revenue ₹50 lakh, cost of goods ₹30 lakh, operating expenses ₹12 lakh, interest ₹1 lakh and tax at 25%.",
            st: ["Gross profit = 50 − 30 = ₹20 lakh", "Operating profit = 20 − 12 = ₹8 lakh; profit before tax = 8 − 1 = ₹7 lakh", "Tax = 25% × 7 = ₹1.75 lakh, so net profit = ₹5.25 lakh"],
            so: "Net profit is ₹5.25 lakh — a net margin of 10.5% of revenue.",
          },
          a: ["Judging whether a company you might invest in is healthy", "Understanding your own business's results"],
          m: [["Treating profit as cash in the bank", "Check operating cash flow, receivables and inventory as well."], ["Reading one statement in isolation", "Use all three together; each answers a different question."]],
          tip: ["Read the notes to the accounts — they explain the assumptions behind the numbers."],
          k: ["Income statement = performance; balance sheet = position; cash flow = cash movement.", "Assets always equal liabilities plus equity.", "Profit and cash differ — watch both."],
          q: [
            ["Which statement shows a company's position at a single date?", ["Income statement", "Balance sheet", "Cash-flow statement", "Budget"], 1, "The balance sheet is a snapshot of assets, liabilities and equity."],
            ["A company has assets of ₹80 crore and liabilities of ₹50 crore. What is its equity?", ["₹130 crore", "₹50 crore", "₹30 crore", "₹80 crore"], 2, "Equity = Assets − Liabilities = 80 − 50."],
            ["Why can a profitable company run out of cash?", ["Profit is always cash", "Sales on credit and investment spending can tie up cash even when profit is positive", "Taxes are paid in shares", "Depreciation creates cash"], 1, "Timing differences mean profit and cash can diverge sharply."],
          ],
        },
        {
          t: "Key Financial Ratios",
          f: "Use profitability, liquidity and leverage ratios to compare businesses",
          s: "Turn raw statement numbers into ratios that compare businesses of different sizes.",
          o: ["Calculate profit margins and return on equity", "Assess liquidity with the current ratio", "Assess leverage with the debt-to-equity ratio"],
          x: `Raw numbers are hard to compare — a ₹10 crore profit is impressive for a small firm and weak for a giant. **Ratios** put businesses on the same scale.

**Profitability**
- *Net profit margin* = Net profit ÷ Revenue — how much of each rupee of sales is kept as profit.
- *Return on equity (ROE)* = Net profit ÷ Shareholders' equity — how effectively owners' money is used. ROE of 15–20% is generally considered strong.

**Liquidity** — can the company pay its short-term bills?
- *Current ratio* = Current assets ÷ Current liabilities. Below 1 means short-term debts exceed short-term assets, a possible warning sign.

**Leverage** — how much the business relies on borrowing?
- *Debt-to-equity* = Total debt ÷ Equity. Debt magnifies returns in good years and losses in bad years, so high leverage increases risk.

**Efficiency**
- *Asset turnover* = Revenue ÷ Total assets — how much sales each rupee of assets generates.

Ratios only mean something **in context**: compare a company with its own history and with competitors in the *same industry* (a supermarket's 3% margin is normal; a software firm's would be poor). Look for trends over several years rather than a single number, and always check what is driving a change.`,
          c: [
            ["Net profit margin", "Net profit as a percentage of revenue."],
            ["Return on equity (ROE)", "Net profit divided by shareholders' equity."],
            ["Debt-to-equity", "Total debt divided by equity; a measure of financial leverage and risk."],
          ],
          e: {
            t: "Comparing two companies",
            s: "A: revenue ₹200 cr, net profit ₹20 cr, equity ₹100 cr, debt ₹150 cr. B: revenue ₹500 cr, net profit ₹30 cr, equity ₹300 cr, debt ₹60 cr.",
            st: ["Margins: A = 20/200 = 10%; B = 30/500 = 6%", "ROE: A = 20/100 = 20%; B = 30/300 = 10%", "Debt-to-equity: A = 1.5; B = 0.2"],
            so: "A is more profitable and earns a higher ROE, but much of that comes from heavy borrowing (D/E 1.5); B is less profitable but far safer. Which is better depends on how much risk you accept.",
          },
          a: ["Screening companies before investing", "Monitoring the health of your own business"],
          m: [["Comparing ratios across unrelated industries", "Benchmark against companies in the same sector."], ["Judging from one year", "Look at trends across 3–5 years."]],
          tip: ["When ROE is high, check debt-to-equity to see whether leverage is doing the work."],
          k: ["Ratios make different-sized businesses comparable.", "Profitability, liquidity, leverage and efficiency each tell part of the story.", "Always compare within an industry and over time."],
          q: [
            ["Net profit ₹15 lakh on revenue ₹1.5 crore gives what net margin?", ["1%", "10%", "15%", "150%"], 1, "15 lakh ÷ 150 lakh = 0.10 = 10%."],
            ["A current ratio below 1 suggests…", ["Very high profits", "Short-term liabilities exceed short-term assets", "No debt at all", "High share price"], 1, "The firm may struggle to pay bills due within a year."],
            ["Why can high debt-to-equity be risky?", ["It lowers revenue", "Debt magnifies losses as well as gains and interest must be paid regardless", "It reduces the number of shares", "It is illegal"], 1, "Leverage increases both potential return and risk."],
          ],
        },
      ],
    },
    {
      t: "Markets and Investing",
      s: "How financial markets work, the trade-off between risk and return, and the basics of valuing an investment.",
      ls: [
        {
          t: "How Financial Markets Work",
          f: "Understand stocks, bonds, exchanges and order types",
          s: "Learn what stocks and bonds are, how exchanges match buyers and sellers, and how orders work.",
          o: ["Distinguish stocks from bonds", "Explain how an exchange matches orders", "Choose between market, limit and stop orders"],
          x: `Financial markets connect people with money to invest and businesses or governments that need it.

**Stocks (shares)** are part-ownership of a company. Shareholders profit through *dividends* and *price changes*, but have no guaranteed return.
**Bonds** are loans: the issuer pays fixed *coupons* and returns the *principal* at maturity. Bonds are usually less risky than stocks, and their prices fall when interest rates rise.

Shares trade on **exchanges** such as the NSE and BSE in India or NYSE and Nasdaq in the US. The exchange keeps an *order book*: the highest price buyers will pay (**bid**) and the lowest price sellers will accept (**ask**). The gap is the **spread**; a trade happens when a bid and ask meet. Regulators (SEBI in India) supervise the market, and brokers give you access to it.

Order types control how you trade:
- **Market order** — buy or sell immediately at the best available price (fast, but the price may slip).
- **Limit order** — trade only at your price or better (price control, but it may never fill).
- **Stop-loss order** — becomes a market order once the price reaches a level, to limit losses.

Prices move because of **supply and demand**, which respond to company results, interest rates, economic news and investor sentiment. In the short term prices can be very volatile; over long periods they tend to follow business earnings.`,
          c: [
            ["Stock", "A share of ownership in a company, with returns from dividends and price changes."],
            ["Bid–ask spread", "The difference between the highest buy price and the lowest sell price in the order book."],
            ["Limit order", "An order to trade only at a specified price or better."],
          ],
          e: {
            t: "Choosing an order type",
            s: "A share's bid is ₹498 and ask ₹500. You want to buy, but not above ₹495.",
            st: ["A market order would fill now at about ₹500", "Place a limit buy order at ₹495", "Add a stop-loss below your entry once filled, e.g. at ₹470"],
            so: "The limit order guarantees you never pay more than ₹495 (it fills only if the price falls there), and the stop-loss caps the potential loss after you buy.",
          },
          a: ["Placing your first trade through a broker", "Understanding why prices react to news"],
          m: [["Using market orders in thinly traded shares", "Use limit orders where spreads are wide to avoid paying far more than expected."], ["Thinking bonds are risk-free", "Bond prices fall when rates rise, and issuers can default."]],
          tip: ["Check the bid–ask spread before trading; a wide spread is a hidden cost."],
          k: ["Stocks are ownership; bonds are loans.", "Exchanges match bids and asks; the spread is a trading cost.", "Market orders give speed, limit orders give price control."],
          q: [
            ["What does a bond holder receive?", ["Ownership of the company", "Fixed coupon payments and repayment of principal", "Voting rights only", "A share of every sale"], 1, "A bond is a loan that pays interest and returns principal."],
            ["Which order guarantees the price but not the execution?", ["Market order", "Limit order", "Stop-loss order", "Day order"], 1, "A limit order fills only at your price or better — or not at all."],
            ["When interest rates rise, existing bond prices usually…", ["Rise", "Fall", "Stay fixed", "Double"], 1, "New bonds pay more, so older lower-coupon bonds become less valuable."],
          ],
        },
        {
          t: "Risk, Return and Diversification",
          f: "Measure risk and return and reduce risk through diversification",
          s: "Understand why higher returns come with higher risk and how diversification reduces it.",
          o: ["Calculate a percentage return", "Explain volatility as a measure of risk", "Show how diversification reduces risk"],
          x: `**Return** is what an investment earns: \`(Ending value − Starting value + Income) ÷ Starting value\`. A share bought at ₹200 that pays a ₹6 dividend and ends at ₹220 returned (220 − 200 + 6) ÷ 200 = **13%**.

**Risk** is the uncertainty of that return. It is usually measured by **volatility** — the standard deviation of returns. A fixed deposit has almost none; a small technology stock may swing 40% in a year.

The central rule of investing: **higher expected return requires accepting higher risk.** Investors demand extra reward (a *risk premium*) for holding uncertain assets. Anyone promising high returns with no risk deserves suspicion.

Risk has two parts:
- **Specific (unsystematic) risk** — a factory fire, a failed product, a fraud at one company.
- **Market (systematic) risk** — recessions, interest-rate changes, crises that affect almost everything.

**Diversification** — spreading money across many companies, sectors and asset classes — cancels out much of the *specific* risk, because one company's bad news is offset by others. It cannot remove market risk. This is why index funds, which hold every company in an index, are a popular low-cost foundation for long-term investors.

**Asset allocation** — the mix of stocks, bonds and cash — matters most of all, and should match your goals, time horizon and ability to sit through losses.`,
          c: [
            ["Volatility", "How much an investment's returns vary, usually measured by standard deviation."],
            ["Risk premium", "The extra expected return investors demand for taking on risk."],
            ["Diversification", "Spreading investments so that losses in one are offset by others, reducing specific risk."],
          ],
          e: {
            t: "Return on a dividend-paying share",
            s: "You buy 50 shares at ₹400, receive ₹10 per share in dividends and sell at ₹380.",
            st: ["Price change per share = 380 − 400 = −₹20", "Total per share = −20 + 10 = −₹10", "Return = −10 ÷ 400 = −2.5%; total loss = 50 × ₹10 = ₹500"],
            so: "The return is −2.5% (a ₹500 loss): the dividend softened, but did not cancel, the fall in price.",
          },
          a: ["Choosing a mix of funds for long-term saving", "Evaluating whether a promised return is realistic"],
          m: [["Putting everything into one stock or sector", "Diversify across companies, sectors and asset classes."], ["Judging an investment only by past returns", "Consider the risk taken to earn them."]],
          tip: ["Ask of any investment: what could go wrong, and could I hold through a 30% fall?"],
          k: ["Return includes price change and income.", "Higher expected return comes with higher risk.", "Diversification removes specific risk, not market risk."],
          q: [
            ["Bought at ₹100, sold at ₹108, with ₹2 dividend: what is the return?", ["8%", "10%", "2%", "108%"], 1, "(108 − 100 + 2) ÷ 100 = 10%."],
            ["Which risk can diversification reduce?", ["Market-wide recession risk", "Company-specific risk", "All risk", "Inflation only"], 1, "Specific risks cancel out across many holdings; market risk remains."],
            ["What does high volatility mean?", ["Guaranteed high returns", "Returns that vary widely", "No risk", "Low trading volume"], 1, "Volatility measures how much returns swing around their average."],
          ],
        },
        {
          t: "Valuation Basics",
          f: "Estimate what an investment is worth using multiples and discounted cash flow",
          s: "Use price-to-earnings ratios and discounted cash flow to judge whether a price is reasonable.",
          o: ["Calculate and interpret a P/E ratio", "Explain the idea of discounted cash flow", "Recognise the limits of valuation estimates"],
          x: `**Price** is what you pay; **value** is what you get. Valuation estimates value so you can judge whether a price is reasonable.

**Multiples** compare a company's price with a measure of its business:
- *Earnings per share (EPS)* = Net profit ÷ Number of shares
- *Price-to-earnings (P/E)* = Share price ÷ EPS

A share at ₹600 with EPS of ₹30 has a P/E of **20**: investors pay ₹20 for each ₹1 of annual profit. A high P/E usually means the market expects fast growth; a low one may mean pessimism — or a bargain. Compare P/E only with similar companies and the company's own history.

**Discounted cash flow (DCF)** applies the time value of money from Module 1: a business is worth the **present value of the cash it will generate in the future**.
1. Forecast future free cash flows.
2. Choose a discount rate reflecting the investment's risk.
3. Discount each cash flow to today and add them up.

DCF is only as good as its assumptions. Small changes to growth or the discount rate change the answer a lot, so analysts test several scenarios and build in a **margin of safety** — buying only when the price is well below their estimate of value.

No valuation method is precise. Treat results as ranges, and combine several methods with an understanding of the business itself.`,
          c: [
            ["P/E ratio", "Share price divided by earnings per share."],
            ["Discounted cash flow", "Valuing an asset as the present value of its expected future cash flows."],
            ["Margin of safety", "The gap between estimated value and price that protects against estimation errors."],
          ],
          e: {
            t: "A simple discounted value",
            s: "An investment will pay ₹1,000 a year for 3 years. Your required return is 10%.",
            st: ["Year 1: 1,000 ÷ 1.10 = ₹909", "Year 2: 1,000 ÷ 1.21 = ₹826; Year 3: 1,000 ÷ 1.331 = ₹751", "Add: 909 + 826 + 751"],
            so: "Its value today is about ₹2,486 — less than the ₹3,000 total, because later payments are worth less today.",
          },
          a: ["Deciding whether a share looks expensive or cheap", "Evaluating a business or project investment"],
          m: [["Treating a low P/E as automatically cheap", "Check why: falling earnings or high risk may justify it."], ["Trusting one DCF number", "Test several assumptions and use a margin of safety."]],
          tip: ["Write down the key assumptions behind any valuation so you can revisit them."],
          k: ["Value is the present value of future cash flows.", "P/E compares price with earnings; compare like with like.", "Valuations are estimates — use ranges and a margin of safety."],
          q: [
            ["Share price ₹450, EPS ₹15. What is the P/E?", ["15", "30", "45", "6.75"], 1, "450 ÷ 15 = 30."],
            ["DCF values a business as…", ["Its total past profits", "The present value of its expected future cash flows", "Its number of employees", "Its share price times two"], 1, "DCF discounts expected future cash flows to today."],
            ["Why use a margin of safety?", ["To pay more than value", "Because valuation estimates can be wrong", "It is required by law", "To avoid taxes"], 1, "Buying well below estimated value cushions against errors."],
          ],
        },
      ],
    },
    {
      t: "Decisions and Discipline",
      s: "Planning cash, managing risk on every decision, and the habits and biases that decide long-term results.",
      ls: [
        {
          t: "Budgeting and Cash-Flow Planning",
          f: "Build a budget and forecast cash flow for a person or a small business",
          s: "Plan income and spending, build an emergency fund, and forecast cash so you never run short.",
          o: ["Build a monthly budget", "Explain the purpose of an emergency fund", "Prepare a simple cash-flow forecast"],
          x: `A **budget** is a plan for money before it is spent. Whether for a household or a small business, it answers: what comes in, what goes out, and what is left to save or invest?

A simple starting framework for personal finances is **50/30/20**: about 50% of take-home income for needs (rent, food, transport), 30% for wants, and 20% for savings and debt repayment. Adjust the shares to your situation; the point is to decide in advance.

Steps to build a budget:
1. List all income after tax.
2. Track actual spending for a month and group it into categories.
3. Set a target for each category, *paying yourself first* — move savings out on payday.
4. Review monthly and adjust.

An **emergency fund** of 3–6 months of essential expenses, kept in a safe and accessible place, stops an unexpected bill or job loss from forcing you into expensive debt or selling investments at a bad time.

Businesses do the same with a **cash-flow forecast**: month by month, opening cash + expected receipts − expected payments = closing cash. It shows in advance when cash will run low (for example when customers pay late or a large purchase is due), so the owner can arrange credit, delay spending or chase payments early.

Pay off high-interest debt (such as credit-card balances at 30–40% a year) before investing — few investments reliably earn that much.`,
          c: [
            ["Budget", "A plan allocating expected income to spending, saving and debt repayment."],
            ["Emergency fund", "Savings covering 3–6 months of essential expenses, kept accessible and safe."],
            ["Cash-flow forecast", "A projection of cash coming in and going out, period by period."],
          ],
          e: {
            t: "A three-month cash forecast",
            s: "A small business starts with ₹40,000 cash. Expected receipts: ₹60k, ₹45k, ₹70k. Expected payments: ₹55k, ₹65k, ₹50k.",
            st: ["Month 1: 40k + 60k − 55k = ₹45k", "Month 2: 45k + 45k − 65k = ₹25k", "Month 3: 25k + 70k − 50k = ₹45k"],
            so: "Cash never goes negative, but month 2 dips to ₹25k — the owner should avoid extra spending or arrange a small credit line for that month.",
          },
          a: ["Managing a student or household budget", "Avoiding cash shortages in a small business"],
          m: [["Budgeting from memory instead of real data", "Track actual spending for a month first."], ["Investing while carrying high-interest debt", "Clear expensive debt first; it is a guaranteed 'return'."]],
          tip: ["Automate savings on payday so saving does not depend on willpower."],
          k: ["Plan money before you spend it.", "Keep 3–6 months of essentials as an emergency fund.", "A cash-flow forecast reveals shortfalls before they happen."],
          q: [
            ["In the 50/30/20 guideline, what is the 20% for?", ["Wants", "Needs", "Savings and debt repayment", "Taxes"], 2, "20% goes to saving, investing and paying down debt."],
            ["Opening cash ₹10k, receipts ₹30k, payments ₹35k. Closing cash?", ["₹5k", "₹15k", "₹75k", "−₹5k"], 0, "10 + 30 − 35 = ₹5k."],
            ["Why keep an emergency fund?", ["To speculate", "To cover unexpected costs without expensive debt or forced selling", "To pay more tax", "It earns the highest return"], 1, "It is insurance against shocks, not an investment for growth."],
          ],
        },
        {
          t: "Managing Risk and Position Size",
          f: "Limit losses with position sizing, stop-losses and risk–reward analysis",
          s: "Decide how much to put into any one investment or trade so a single mistake can never do serious damage.",
          o: ["Size a position from a fixed risk per trade", "Calculate a risk–reward ratio", "Explain why limiting losses matters more than finding winners"],
          x: `Professional investors and traders spend more effort controlling **losses** than chasing gains, because losses are hard to recover: after a 50% loss you need a **100%** gain just to get back to where you started.

**Risk per decision.** A common rule is to risk only a small, fixed share of capital — often 1–2% — on any single trade or speculative position. With ₹2,00,000 and a 1% rule, the most you accept losing on one idea is ₹2,000.

**Position sizing** turns that limit into a quantity:
\`Position size = Amount at risk ÷ (Entry price − Stop-loss price)\`
Buying at ₹250 with a stop-loss at ₹240 risks ₹10 per share, so ₹2,000 ÷ ₹10 = **200 shares**.

**Risk–reward ratio** compares the potential gain with the potential loss. With a target of ₹280, the reward is ₹30 against ₹10 of risk — **3:1**. With a 3:1 ratio you can be wrong more often than right and still come out ahead.

Other tools: diversify so no single holding dominates; avoid leverage you do not fully understand (borrowing magnifies losses); and decide your exit *before* entering, when you are calm.

Risk management does not guarantee profit. It keeps you in the game long enough for good decisions to pay off — and in {topic}, survival comes first.`,
          c: [
            ["Position sizing", "Choosing how many units to buy so the loss at your stop equals your planned risk."],
            ["Stop-loss", "A predefined exit price that limits the loss on a position."],
            ["Risk–reward ratio", "Potential gain divided by potential loss on a decision."],
          ],
          e: {
            t: "Sizing a trade with the 1% rule",
            s: "Capital ₹5,00,000, risk 1%. Entry ₹1,200, stop-loss ₹1,150, target ₹1,350.",
            st: ["Amount at risk = 1% × 5,00,000 = ₹5,000", "Risk per share = 1,200 − 1,150 = ₹50, so size = 5,000 ÷ 50 = 100 shares", "Reward per share = 1,350 − 1,200 = ₹150, so risk–reward = 150 : 50 = 3:1"],
            so: "Buy 100 shares (₹1,20,000 position). If the stop is hit you lose about ₹5,000 (1%); if the target is reached you gain about ₹15,000.",
          },
          a: ["Planning trades and speculative investments", "Deciding how much to put into any single opportunity"],
          m: [["Moving the stop-loss further away to avoid taking a loss", "Respect the plan; widening stops turns small losses into large ones."], ["Sizing by gut feeling", "Calculate size from the amount you are willing to lose."]],
          tip: ["Remember the maths of recovery: −10% needs +11%, −50% needs +100%."],
          k: ["Protecting capital comes before seeking returns.", "Position size = amount at risk ÷ risk per unit.", "Favourable risk–reward lets you be wrong often and still profit."],
          q: [
            ["After a 50% loss, what gain is needed to break even?", ["50%", "75%", "100%", "150%"], 2, "Half the money must double to return to the start."],
            ["Risk ₹3,000, entry ₹150, stop ₹140. How many shares?", ["20", "300", "200", "30"], 1, "3,000 ÷ (150 − 140) = 300 shares."],
            ["Entry ₹100, stop ₹95, target ₹115. What is the risk–reward ratio?", ["1:3", "3:1", "1:1", "5:1"], 1, "Reward 15 vs risk 5 = 3:1."],
          ],
        },
        {
          t: "Behavioural Finance and Your Financial Plan",
          f: "Recognise common biases and build a written plan that guides decisions",
          s: "Spot the biases that cost investors money and turn everything in the course into a written plan.",
          o: ["Identify common behavioural biases", "Explain the value of a decision journal", "Write a simple financial plan"],
          x: `Knowledge is not enough; people lose money mainly through **behaviour**. Behavioural finance studies the predictable mental shortcuts that lead to poor decisions:

- **Loss aversion** — losses hurt about twice as much as equal gains please, so people hold losers too long hoping to "get back to even".
- **Overconfidence** — after a few successes we overrate our skill and take too much risk.
- **Herding / FOMO** — buying because everyone else is, usually near the top.
- **Anchoring** — fixating on a past price ("it used to be ₹500") instead of current value.
- **Confirmation bias** — seeking only information that supports what we already believe.

Two habits counter these biases:

1. **A written plan**, made when calm. It states your goals (amount and date), time horizon, risk limits, asset allocation or trading rules, and when you will review. When markets are emotional, you follow the plan rather than your feelings.
2. **A decision journal**. Before each decision, record why you are making it, what you expect and what would prove you wrong. Reviewing it later shows whether results came from skill or luck, and which mistakes repeat.

Finally, treat {topic} as a long-term skill. Start small, keep costs low, keep learning, and be very sceptical of anything that promises fast, guaranteed returns. This course is educational and is not personal financial advice.`,
          c: [
            ["Loss aversion", "The tendency to feel losses more strongly than equivalent gains."],
            ["Herding", "Copying what others are doing instead of acting on your own analysis."],
            ["Decision journal", "A written record of the reasoning and expectations behind each financial decision."],
          ],
          e: {
            t: "A one-page plan",
            s: "A 22-year-old wants ₹5 lakh for further study in 4 years and can save ₹8,000 a month.",
            st: ["Goal: ₹5 lakh in 4 years; horizon is short, so risk must be moderate", "Saving 8,000 × 48 months = ₹3.84 lakh; the rest must come from returns or more saving", "Plan: emergency fund first, then a mix of debt funds and some equity, reviewed every 6 months"],
            so: "Without returns the goal falls about ₹1.16 lakh short, so the plan either raises the monthly saving to about ₹9,500–10,000 or accepts some equity risk — a trade-off decided calmly in advance.",
          },
          a: ["Staying disciplined during market crashes", "Reviewing and improving your own decisions"],
          m: [["Changing strategy after every news headline", "Follow the written plan and review it on a schedule."], ["Only remembering your wins", "Keep a journal that records mistakes as well."]],
          tip: ["Before any big financial decision, wait 24 hours and re-read your plan."],
          k: ["Behaviour, not knowledge, causes most financial mistakes.", "A written plan and a decision journal counter biases.", "Be sceptical of fast, guaranteed returns."],
          q: [
            ["Holding a losing investment just to 'get back to even' reflects…", ["Diversification", "Loss aversion", "Compounding", "Liquidity"], 1, "Loss aversion makes realising losses feel worse than it rationally should."],
            ["Buying because everyone else is buying is called…", ["Hedging", "Herding", "Anchoring", "Budgeting"], 1, "Herding follows the crowd rather than analysis."],
            ["What is a decision journal for?", ["Recording tax receipts", "Recording the reasoning and expectations behind decisions to learn from them", "Tracking share prices", "Writing budgets"], 1, "It separates skill from luck and reveals repeated mistakes."],
          ],
        },
      ],
    },
  ],
};
