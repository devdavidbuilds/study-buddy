module.exports = {
  match: "Stock Trading: Ultimate Guide to swing trading stocks",
  pt: "calculation",
  d: "An educational, step-by-step guide to swing trading stocks — holding positions for days to weeks. You will learn how markets and price charts work, read candlesticks, support and resistance, trends, moving averages, momentum and volume, and then build a complete, risk-controlled trading plan with position sizing and a trading journal. Educational content only, not financial advice.",
  sk: ["Swing trading", "Candlestick charts", "Support and resistance", "Trend analysis", "Technical indicators", "Position sizing", "Trading psychology"],
  out: [
    "Explain how swing trading differs from investing and day trading",
    "Read candlestick charts, support, resistance and trends",
    "Use moving averages, RSI, MACD and volume to assess setups",
    "Size positions so that each trade risks a fixed small share of capital",
    "Write and follow a trading plan and review trades in a journal",
  ],
  mods: [
    {
      t: "Reading the Market",
      s: "What swing trading is, how to read candlestick charts, and where support and resistance come from.",
      ls: [
        {
          t: "What Swing Trading Is",
          f: "Compare swing trading with investing and day trading, and understand its risks",
          s: "Understand the swing-trading style, the time commitment it needs and the risks involved.",
          o: ["Define swing trading and its typical holding period", "Compare it with day trading and long-term investing", "Recognise the main risks and costs"],
          x: `**Swing trading** aims to capture short- to medium-term price moves — "swings" — that last from a few days to a few weeks. It sits between two other styles:

- **Day trading** — positions opened and closed within the same day; very time-intensive and stressful.
- **Long-term investing** — owning businesses for years, focusing on fundamentals such as earnings growth.
- **Swing trading** — holding for days or weeks, mainly using **technical analysis** (price, volume and indicators) to time entries and exits, with fundamentals as a filter.

Why people choose it: it can be done alongside a job or studies (analysis is often done in the evening), and trends that last days or weeks are easier to see than minute-by-minute noise.

The **risks** are real and must be understood before trading with money:
- Prices can **gap** overnight on news (results, policy changes), jumping past your stop-loss.
- Frequent trading creates **costs** — brokerage, taxes such as STT, and the bid–ask spread — which eat into returns.
- Studies of retail traders consistently find that **most lose money**, usually through poor risk management and emotional decisions, not lack of indicators.

This course therefore treats risk control as the core skill. A sensible path is to learn the concepts, **paper-trade** (simulate trades without real money) for at least a few weeks, and only then use small amounts you can afford to lose. Nothing here is financial advice; it is education about how the method works.`,
          c: [
            ["Swing trading", "Trading price moves that last from a few days to a few weeks."],
            ["Technical analysis", "Analysing price, volume and indicators to judge likely price behaviour."],
            ["Paper trading", "Recording simulated trades without real money to practise a strategy."],
          ],
          e: {
            t: "The real cost of frequent trading",
            s: "A trader makes 100 round-trip trades a year on ₹50,000 positions, paying about 0.25% per round trip in total costs.",
            st: ["Cost per trade = 0.25% × 50,000 = ₹125", "Annual cost = 100 × ₹125 = ₹12,500", "On ₹2,00,000 of capital, that is 6.25% a year before any profit"],
            so: "The trader must earn more than about 6% a year just to cover costs — a strong argument for fewer, higher-quality trades.",
          },
          a: ["Part-time trading alongside a job or studies", "Understanding market behaviour for investing"],
          m: [["Starting with real money immediately", "Paper-trade first and start with small, affordable amounts."], ["Ignoring costs and taxes", "Include brokerage, taxes and spreads in every calculation."]],
          tip: ["Track your paper trades exactly as if they were real, including costs."],
          k: ["Swing trades last days to weeks and rely mainly on technical analysis.", "Gaps, costs and emotions are the main risks.", "Learn and paper-trade before risking money."],
          q: [
            ["What is the typical holding period in swing trading?", ["Seconds to minutes", "Within one day", "A few days to a few weeks", "Many years"], 2, "Swing trades capture moves lasting days to weeks."],
            ["What is a 'gap'?", ["A pause in trading for lunch", "A price jump between one close and the next open", "The bid–ask spread", "A type of indicator"], 1, "News outside trading hours can make prices open far from the previous close."],
            ["What is paper trading?", ["Trading paper companies", "Simulating trades without real money", "Trading only with cash", "Printing charts"], 1, "It lets you practise a method risk-free."],
          ],
        },
        {
          t: "Candlestick Charts and Timeframes",
          f: "Read candlesticks, common patterns and choose chart timeframes",
          s: "Read the open, high, low and close from candlesticks and use multiple timeframes.",
          o: ["Read the OHLC information in a candlestick", "Recognise doji, hammer and engulfing patterns", "Use daily and weekly charts together"],
          x: `A **candlestick** shows four prices for one period (a day on a daily chart): **open, high, low and close** (OHLC).

- The **body** spans the open and close. It is usually green/white when the close is **above** the open (buyers won the period) and red/black when it is **below**.
- The **wicks** (shadows) show the high and low reached during the period.

Candle shapes summarise the battle between buyers and sellers:
- **Long bodies** — strong conviction in one direction.
- **Doji** — open and close almost equal: indecision.
- **Hammer** — small body near the top with a long lower wick after a decline: sellers pushed price down, but buyers drove it back up — a possible reversal signal.
- **Bullish engulfing** — a green body that completely covers the previous red body: buyers took control.
- **Bearish engulfing** — the opposite, at the top of a rise.

Patterns are **clues, not guarantees**. They matter far more when they appear at a meaningful location (such as support, in the next lesson) and are confirmed by the following candle or by volume.

**Timeframes.** Swing traders typically use the **daily chart** to find trades and the **weekly chart** to see the bigger trend. A simple rule: trade in the direction of the higher timeframe — look for buying setups on the daily chart only when the weekly trend is up. Lower timeframes (hourly) can fine-tune entries but add noise.`,
          c: [
            ["OHLC", "Open, high, low and close — the four prices a candlestick represents."],
            ["Doji", "A candle whose open and close are nearly equal, signalling indecision."],
            ["Engulfing pattern", "A candle whose body fully covers the previous candle's body, suggesting a shift in control."],
          ],
          e: {
            t: "Reading a reversal clue",
            s: "After falling for six days to ₹480, a share forms a candle: open ₹478, low ₹462, high ₹485, close ₹484.",
            st: ["Close (484) > open (478), so it is a green candle with a small body near the top", "The long lower wick from 462 shows strong buying after an early sell-off", "This is a hammer — wait for the next candle to close higher as confirmation"],
            so: "The hammer suggests sellers may be exhausted; a trader would watch for a higher close the next day (and ideally a support level nearby) before considering a long entry.",
          },
          a: ["Spotting potential turning points", "Reading market sentiment at a glance"],
          m: [["Trading every pattern in isolation", "Require context (support/resistance, trend) and confirmation."], ["Using only one timeframe", "Check the weekly trend before acting on daily signals."]],
          tip: ["Mark the weekly trend on your chart before looking at any daily pattern."],
          k: ["Candles show open, high, low and close.", "Doji, hammer and engulfing patterns hint at sentiment shifts.", "Trade daily setups in the direction of the weekly trend."],
          q: [
            ["A green (bullish) candle means…", ["The close was below the open", "The close was above the open", "There was no trading", "The high equals the low"], 1, "Green bodies close above their open."],
            ["What does a doji suggest?", ["Strong buying", "Indecision between buyers and sellers", "A guaranteed reversal", "High volume"], 1, "Open and close are nearly equal."],
            ["Which timeframe do swing traders commonly use to see the bigger trend?", ["1-minute", "Hourly", "Weekly", "Tick chart"], 2, "The weekly chart shows the broader trend for daily setups."],
          ],
        },
        {
          t: "Support and Resistance",
          f: "Identify support and resistance zones and role reversal",
          s: "Find price levels where buying or selling has repeatedly appeared, and use them to plan trades.",
          o: ["Identify support and resistance zones", "Explain role reversal after a breakout", "Use levels to plan entries and stops"],
          x: `**Support** is a price zone where falling prices have repeatedly stopped and turned up — buyers have stepped in there before. **Resistance** is a zone where rising prices have repeatedly stalled — sellers have appeared.

Why do they work? Market participants remember prices. Traders who missed buying at ₹400 may buy if it returns there; holders who bought at ₹520 and watched it fall may sell when price gets back to "break even". These collective decisions create real supply and demand at those levels.

How to draw them:
- Look for **multiple touches** — the more times price has reacted at a level, the more significant it is.
- Treat levels as **zones**, not exact lines (₹395–405, not ₹400.00).
- Use the **daily and weekly** charts; levels visible on higher timeframes matter more.
- **Round numbers** (₹500, ₹1,000) and previous swing highs and lows often act as levels.

**Role reversal:** when price breaks clearly through resistance, that old resistance often becomes new **support** on a pullback (and broken support often becomes resistance). A breakout followed by a successful retest is a classic swing setup.

**Using levels in a plan:**
- Buy near support in an uptrend, with the **stop-loss just below** the support zone (if it breaks, the idea is wrong).
- Take profit near the next **resistance**.
- Avoid buying just under strong resistance, where the potential reward is small.

Breakouts can fail ("false breakouts"), so many traders wait for a **daily close** beyond the level, ideally on rising volume.`,
          c: [
            ["Support", "A price zone where buying has repeatedly stopped declines."],
            ["Resistance", "A price zone where selling has repeatedly stopped advances."],
            ["Role reversal", "Broken resistance becoming support (or broken support becoming resistance)."],
          ],
          e: {
            t: "Planning a support bounce",
            s: "A share in an uptrend has bounced from ₹600–610 three times; the last high (resistance) was ₹690. It is now ₹615.",
            st: ["Entry near support: about ₹615", "Stop-loss below the zone: about ₹595", "Target near resistance: about ₹685 — reward ₹70 vs risk ₹20"],
            so: "The plan risks about ₹20 per share to make about ₹70 (3.5:1). If price closes below ₹595 the support has failed and the trade is exited.",
          },
          a: ["Choosing entry, stop and target prices", "Spotting breakout opportunities"],
          m: [["Drawing levels as exact lines", "Use zones; price rarely turns at an exact paisa."], ["Placing the stop exactly at support", "Place it a little beyond the zone to avoid normal noise."]],
          tip: ["Mark levels on the weekly chart first, then refine them on the daily chart."],
          k: ["Support and resistance are zones of repeated buying and selling.", "Broken levels often switch roles.", "Use levels to place entries, stops and targets."],
          q: [
            ["What does support represent?", ["A price where selling repeatedly appears", "A zone where declines have repeatedly stopped", "The highest price of the year", "A moving average"], 1, "Buyers have stepped in at support before."],
            ["After price breaks above resistance, that level often becomes…", ["Irrelevant", "New support", "Stronger resistance", "A gap"], 1, "This is role reversal."],
            ["Where should a stop-loss usually go for a long trade at support?", ["Exactly at support", "Just below the support zone", "Above resistance", "At the entry price"], 1, "If price falls below support, the trade idea is invalid."],
          ],
        },
      ],
    },
    {
      t: "Trends and Indicators",
      s: "Identifying trends with moving averages, measuring momentum with RSI and MACD, and confirming moves with volume.",
      ls: [
        {
          t: "Trends and Moving Averages",
          f: "Identify trends with swing highs and lows and moving averages",
          s: "Define trends by highs and lows and use the 20- and 50-day moving averages to follow them.",
          o: ["Identify uptrends, downtrends and ranges", "Calculate and interpret a simple moving average", "Use moving averages as trend filters"],
          x: `"The trend is your friend": trading in the direction of the trend tilts the odds in your favour.

**Defining trends with swings:**
- **Uptrend** — higher highs and higher lows.
- **Downtrend** — lower highs and lower lows.
- **Range (sideways)** — price oscillates between support and resistance without a clear direction.

**Moving averages** smooth out daily noise. A **simple moving average (SMA)** is the average closing price of the last *n* days; each day the oldest price drops out and the newest is added. The **exponential moving average (EMA)** weights recent prices more, so it reacts faster.

Common swing-trading settings:
- **20-day** — the short-term trend; in strong trends price often pulls back to it.
- **50-day** — the medium-term trend, widely watched by institutions.
- **200-day** — the long-term trend.

**Using them:**
- **Trend filter**: only look for long trades when price is above a rising 50-day average.
- **Dynamic support/resistance**: in an uptrend, pullbacks to the rising 20- or 50-day average can offer entries.
- **Crossovers**: the 20-day crossing above the 50-day suggests strengthening momentum (a "golden cross" usually refers to the 50 crossing above the 200).

Moving averages are **lagging** — they confirm a trend after it has started — and in sideways markets they produce many false signals (whipsaws). Use them to define direction, not as automatic buy and sell buttons.`,
          c: [
            ["Uptrend", "A series of higher highs and higher lows."],
            ["Simple moving average", "The average closing price over the last n periods, recalculated each period."],
            ["Lagging indicator", "An indicator that confirms price moves after they have begun."],
          ],
          e: {
            t: "Calculating a 5-day SMA",
            s: "Closing prices over five days: ₹102, ₹104, ₹103, ₹106, ₹110.",
            st: ["Add the closes: 102 + 104 + 103 + 106 + 110 = 525", "Divide by 5: SMA = ₹105", "The next day closes at ₹112: drop 102, add 112 → (104 + 103 + 106 + 110 + 112) ÷ 5 = ₹107"],
            so: "The SMA moves from ₹105 to ₹107 and price (₹112) is above it — consistent with a short-term uptrend.",
          },
          a: ["Filtering trades by trend direction", "Finding pullback entries in trends"],
          m: [["Buying stocks in clear downtrends because they look 'cheap'", "Trade with the trend; wait for higher highs and higher lows."], ["Trading every crossover in a sideways market", "Check whether the market is trending or ranging first."]],
          tip: ["Add only the 20- and 50-day averages to start; more lines add confusion, not clarity."],
          k: ["Trends are defined by the sequence of highs and lows.", "SMA/EMA smooth price; 20, 50 and 200 days are common.", "Moving averages lag and whipsaw in ranges."],
          q: [
            ["A series of lower highs and lower lows is…", ["An uptrend", "A downtrend", "A range", "A breakout"], 1, "Falling highs and lows define a downtrend."],
            ["Closes of 10, 12, 14 give a 3-day SMA of…", ["12", "14", "36", "10"], 0, "(10 + 12 + 14) ÷ 3 = 12."],
            ["Why do moving averages give false signals in sideways markets?", ["They predict the future", "They lag and price keeps crossing them back and forth", "They ignore closing prices", "They only work on weekly charts"], 1, "In ranges price whipsaws around the average."],
          ],
        },
        {
          t: "Momentum Indicators: RSI and MACD",
          f: "Interpret RSI and MACD readings and divergences",
          s: "Measure the strength of price moves with RSI and MACD and spot divergences.",
          o: ["Interpret RSI levels in trends and ranges", "Read MACD crossovers and the histogram", "Recognise bullish and bearish divergence"],
          x: `**Momentum indicators** measure how strong and fast price is moving. Two are used by most swing traders.

**RSI (Relative Strength Index)** — usually over 14 periods — compares the size of recent gains with recent losses on a scale from **0 to 100**.
- Above **70** is traditionally "overbought"; below **30** "oversold".
- But in strong uptrends RSI can stay above 70 for weeks. A more useful trend-following reading: in an uptrend, RSI tends to hold above about 40 on pullbacks, and a pullback that brings RSI back to 40–50 can offer an entry.

**MACD (Moving Average Convergence Divergence)** is built from exponential moving averages:
- **MACD line** = 12-period EMA − 26-period EMA
- **Signal line** = 9-period EMA of the MACD line
- **Histogram** = MACD line − signal line
MACD crossing **above** its signal line suggests rising bullish momentum; crossing below suggests falling momentum. MACD above zero means the shorter-term average is above the longer-term one.

**Divergence** is often the most informative signal:
- **Bearish divergence** — price makes a higher high but RSI or MACD makes a lower high: the rise is losing strength.
- **Bullish divergence** — price makes a lower low but the indicator makes a higher low: selling is weakening.

Indicators are calculated *from* price, so they cannot replace reading price itself. Use them to **confirm** what support, resistance and trend are telling you — and avoid stacking many indicators that say the same thing.`,
          c: [
            ["RSI", "A 0–100 momentum oscillator comparing recent gains and losses; 70 and 30 are traditional thresholds."],
            ["MACD", "The difference between the 12- and 26-period EMAs, with a 9-period signal line."],
            ["Divergence", "When price and a momentum indicator move in opposite directions, hinting that a trend is weakening."],
          ],
          e: {
            t: "Spotting a bearish divergence",
            s: "A share makes a high of ₹950 (RSI 78), pulls back, then makes a new high of ₹975 while RSI peaks at only 64.",
            st: ["Price: higher high (975 > 950)", "RSI: lower high (64 < 78)", "Conclusion: momentum is fading even though price rose"],
            so: "This bearish divergence is a warning, not a sell signal by itself: an existing long position might tighten its stop or take partial profits, and new longs deserve extra caution.",
          },
          a: ["Timing entries on pullbacks", "Spotting weakening trends early"],
          m: [["Shorting every time RSI is above 70", "Strong trends stay overbought; use RSI in context of the trend."], ["Using five indicators that all measure momentum", "One or two complementary indicators are enough."]],
          tip: ["Look for divergences only at meaningful levels, such as resistance or support."],
          k: ["RSI ranges 0–100; context matters more than 70/30.", "MACD crossovers and the histogram show momentum shifts.", "Divergences warn that a move is losing strength."],
          q: [
            ["On the RSI, readings below 30 are traditionally called…", ["Overbought", "Oversold", "Neutral", "Divergent"], 1, "Below 30 is traditionally oversold."],
            ["The MACD line is the difference between…", ["The 50- and 200-day SMAs", "The 12- and 26-period EMAs", "High and low prices", "Volume and price"], 1, "MACD = EMA(12) − EMA(26)."],
            ["Price makes a lower low while RSI makes a higher low. This is…", ["Bearish divergence", "Bullish divergence", "A golden cross", "A gap"], 1, "Selling momentum is weakening — a bullish divergence."],
          ],
        },
        {
          t: "Volume and Confirmation",
          f: "Use volume to confirm breakouts and judge the strength of moves",
          s: "Use trading volume to separate strong, genuine moves from weak or false ones.",
          o: ["Explain what volume shows", "Use volume to confirm breakouts", "Combine several factors into a setup checklist"],
          x: `**Volume** is the number of shares traded in a period. It shows the **participation** behind a price move: price tells you *what* happened; volume tells you *how much conviction* was behind it.

Useful principles:
- **Breakouts on high volume** (for example 1.5–2× the 20-day average volume) are more likely to be genuine — large participants are involved.
- **Breakouts on low volume** are more prone to fail and fall back into the range.
- In a healthy uptrend, volume tends to **rise on up days** and **fall on pullbacks**. Heavy volume on down days in an uptrend is a warning that selling is increasing.
- **Climactic volume** — an extreme spike after a long move — can mark exhaustion and a turning point.

Add a 20-day average line to the volume panel so "high" and "low" volume are judged relative to the stock's normal activity, not absolute numbers.

**Putting Modules 1 and 2 together — a setup checklist** for a long swing trade:
1. **Trend:** weekly trend up; price above a rising 50-day moving average.
2. **Location:** pullback to support or the 20/50-day average, or a breakout above resistance.
3. **Trigger:** a bullish candle (hammer, engulfing) or a daily close above the level.
4. **Confirmation:** volume above average on the trigger; RSI holding above about 40 or turning up.
5. **Room to move:** the next resistance is far enough away for at least a 2:1 reward-to-risk.

Not every box must be ticked, but the more factors agree (*confluence*), the higher the quality of the setup. Skipping trades that do not meet your checklist is itself a skill.`,
          c: [
            ["Volume", "The number of shares traded in a period, indicating participation and conviction."],
            ["Breakout confirmation", "Evidence such as a close beyond the level on above-average volume that a breakout is genuine."],
            ["Confluence", "Several independent factors agreeing on the same trade idea."],
          ],
          e: {
            t: "Judging a breakout",
            s: "Resistance at ₹540 has held for two months. Today the share closes at ₹552 on 3.1 million shares; its 20-day average volume is 1.4 million.",
            st: ["Price closed clearly above resistance (₹552 > ₹540)", "Volume ratio = 3.1 ÷ 1.4 ≈ 2.2× average", "The weekly trend is up and the next resistance is ₹600"],
            so: "A daily close above resistance on about 2.2× normal volume, in a weekly uptrend, is a high-quality breakout; a trader might buy a retest near ₹540–545 with a stop below about ₹528.",
          },
          a: ["Filtering false breakouts", "Ranking potential trades by quality"],
          m: [["Ignoring volume completely", "Check volume against its 20-day average on every signal."], ["Taking trades that fail most checklist items", "Wait for setups with confluence."]],
          tip: ["Keep your setup checklist next to your screen and tick it before every trade."],
          k: ["Volume measures conviction behind price moves.", "Breakouts on above-average volume are more reliable.", "Use a checklist and seek confluence."],
          q: [
            ["What does high volume on a breakout suggest?", ["The breakout is likely to fail", "Strong participation, making it more likely to be genuine", "Nothing", "The stock is cheap"], 1, "Heavy participation supports the move."],
            ["In a healthy uptrend, volume on pullbacks is usually…", ["Higher than on up days", "Lower than on up days", "Zero", "Unrelated to price"], 1, "Light volume on dips suggests little selling pressure."],
            ["Volume of 2.4 million vs a 20-day average of 1.2 million is…", ["0.5× average", "2× average", "1.2× average", "Below average"], 1, "2.4 ÷ 1.2 = 2."],
          ],
        },
      ],
    },
    {
      t: "Risk, Planning and Psychology",
      s: "Sizing every position from a fixed risk, writing a complete trading plan, and the journal and mindset that keep you disciplined.",
      ls: [
        {
          t: "Position Sizing and Risk per Trade",
          f: "Size positions from a fixed percentage risk and the stop-loss distance",
          s: "Decide how many shares to buy so that a losing trade costs only a small, fixed share of capital.",
          o: ["Apply the 1% risk rule", "Calculate position size from entry and stop", "Explain why survival depends on risk control"],
          x: `Everything so far helps you find trades. **Position sizing** decides whether you survive the inevitable losing streaks.

**Step 1 — fix your risk per trade.** Many traders risk **0.5–2%** of their account on any single trade. With ₹2,00,000 and a 1% rule, the maximum loss per trade is **₹2,000**.

**Step 2 — set the stop-loss from the chart**, at the price where the trade idea is wrong (below support, below the pullback low) — *not* at an arbitrary percentage.

**Step 3 — calculate the size:**

\`Shares = Amount at risk ÷ (Entry − Stop)\`

Entry ₹400, stop ₹385 → risk ₹15 per share → 2,000 ÷ 15 ≈ **133 shares** (a position of about ₹53,200).

Notice that the *position* is much larger than the *risk*: you are not risking ₹53,200, you are risking ₹2,000 — provided you honour the stop. Wider stops mean fewer shares; tighter stops allow more shares for the same risk.

**Why this matters:** even a good strategy has losing streaks. Risking 1% per trade, ten losses in a row costs about 10% of the account — painful but recoverable. Risking 10% per trade, the same streak wipes out about two-thirds. And recovery is asymmetric: a 50% loss needs a 100% gain to break even.

Also limit **total exposure**: for example no more than 5–6% of the account at risk across all open trades, and avoid several positions in the same sector that will move together. Remember that **gaps** can open beyond your stop, so actual losses can occasionally exceed the plan — another reason to keep risk per trade small.`,
          c: [
            ["Risk per trade", "The maximum amount of capital you accept losing on one trade, often 1%."],
            ["Position size", "Number of shares = amount at risk ÷ (entry − stop)."],
            ["Total portfolio heat", "The combined risk of all open positions."],
          ],
          e: {
            t: "Sizing two different setups",
            s: "Account ₹3,00,000, risk 1% (₹3,000). Setup A: entry ₹250, stop ₹244. Setup B: entry ₹1,500, stop ₹1,425.",
            st: ["A: risk/share = ₹6 → 3,000 ÷ 6 = 500 shares (₹1,25,000 position)", "B: risk/share = ₹75 → 3,000 ÷ 75 = 40 shares (₹60,000 position)", "Both trades lose the same ₹3,000 if stopped out"],
            so: "Position sizes differ greatly (500 vs 40 shares), but the risk is identical — which is exactly the point of sizing from the stop distance.",
          },
          a: ["Every individual trade decision", "Protecting capital during losing streaks"],
          m: [["Buying a 'round' number of shares by feel", "Calculate size from the stop distance every time."], ["Removing the stop when price approaches it", "The stop is the plan; moving it turns small losses into large ones."]],
          tip: ["Make a simple spreadsheet that calculates size from entry, stop and account size."],
          k: ["Risk a small fixed share (about 1%) per trade.", "Shares = amount at risk ÷ (entry − stop).", "Small risk per trade keeps losing streaks survivable."],
          q: [
            ["Account ₹1,00,000, 2% risk. What is the maximum loss per trade?", ["₹200", "₹2,000", "₹20,000", "₹1,000"], 1, "2% of ₹1,00,000 = ₹2,000."],
            ["Risk ₹1,500, entry ₹300, stop ₹290. How many shares?", ["15", "150", "50", "300"], 1, "1,500 ÷ 10 = 150 shares."],
            ["Where should the stop-loss be placed?", ["At a round percentage like 5%", "Where the chart shows the trade idea is wrong", "At the entry price", "It is not needed"], 1, "Stops come from the chart structure; size adjusts to them."],
          ],
        },
        {
          t: "Building a Trading Plan",
          f: "Write entry, exit, risk and review rules into a complete trading plan",
          s: "Combine everything in the course into a written plan with clear rules for every stage of a trade.",
          o: ["List the components of a trading plan", "Define entry, stop-loss and target rules", "Plan how trades are managed after entry"],
          x: `A **trading plan** is a written set of rules you follow for every trade. It removes in-the-moment guesswork, makes your results measurable and protects you from emotional decisions.

A complete plan answers:

1. **Market and universe** — which stocks? (e.g. liquid large- and mid-cap NSE stocks with average volume above 5 lakh shares.)
2. **Setup** — your checklist from Module 2: weekly uptrend, price above the rising 50-day MA, pullback to support or a breakout on volume.
3. **Entry trigger** — exactly what makes you buy (a bullish candle closing above the previous day's high).
4. **Stop-loss** — where the idea is invalid (below the pullback low or support zone).
5. **Position size** — 1% risk using the sizing formula.
6. **Targets and exits** — e.g. the next resistance, requiring at least 2:1 reward-to-risk; or a trailing stop below the 20-day MA once the trade is in profit.
7. **Trade management** — move the stop to break-even after a 1R gain (a gain equal to the initial risk); take partial profit at the first target.
8. **Limits** — maximum open trades, maximum total risk, and a rule such as "stop trading for the week after losing 4% of the account".
9. **Review** — when and how you analyse results (weekly journal review, monthly statistics).

Measure results in **R-multiples**: a trade that gains twice the initial risk is +2R; a stopped-out trade is −1R. The **expectancy** of a system is roughly (win rate × average win) − (loss rate × average loss). With a 45% win rate, average win 2R and average loss 1R: 0.45 × 2 − 0.55 × 1 = **+0.35R per trade** — profitable despite losing more than half the trades.`,
          c: [
            ["Trading plan", "A written set of rules covering what to trade, when to enter and exit, and how much to risk."],
            ["R-multiple", "A trade's profit or loss expressed as a multiple of its initial risk."],
            ["Expectancy", "Average result per trade: (win rate × average win) − (loss rate × average loss)."],
          ],
          e: {
            t: "Calculating expectancy from paper trades",
            s: "Over 40 paper trades: 16 winners averaging +2.5R and 24 losers averaging −1R.",
            st: ["Win rate = 16 ÷ 40 = 40%; loss rate = 60%", "Expectancy = 0.40 × 2.5 − 0.60 × 1 = 1.0 − 0.6", "= +0.4R per trade"],
            so: "Despite winning only 40% of trades, the system earns about +0.4R per trade on average (before costs) — evidence worth more testing before using real money.",
          },
          a: ["Running a consistent, testable strategy", "Comparing strategies objectively"],
          m: [["Keeping the plan only in your head", "Write it down and keep it visible while trading."], ["Changing rules after every loss", "Evaluate rules over a meaningful sample (30+ trades)."]],
          tip: ["Express every trade's result in R so trades of different sizes can be compared."],
          k: ["A plan defines setup, entry, stop, size, exits, limits and review.", "Measure results in R-multiples.", "Positive expectancy can come from a low win rate with good reward-to-risk."],
          q: [
            ["A trade risked ₹1,000 and made ₹3,000. Its R-multiple is…", ["+1R", "+3R", "−3R", "+0.3R"], 1, "3,000 ÷ 1,000 = 3R."],
            ["Win rate 50%, average win 2R, average loss 1R. Expectancy?", ["+0.5R", "+1R", "0", "−0.5R"], 0, "0.5 × 2 − 0.5 × 1 = 0.5R."],
            ["Why write a trading plan?", ["It guarantees profits", "To make decisions consistent and results measurable", "Brokers require it", "To trade more often"], 1, "Written rules reduce emotional decisions and allow evaluation."],
          ],
        },
        {
          t: "The Trading Journal and Psychology",
          f: "Keep a trading journal and manage fear, greed and discipline",
          s: "Use a journal to learn from every trade and manage the emotions that undermine plans.",
          o: ["Record trades in a structured journal", "Recognise fear, greed and revenge trading", "Use reviews to improve the plan"],
          x: `The difference between traders who improve and those who repeat mistakes is usually a **trading journal**.

**What to record for every trade:**
- Date, stock, setup type and a chart screenshot at entry
- Entry, stop, target, position size and risk
- *Why* you took the trade — which checklist items were met
- Your emotional state (calm, rushed, frustrated)
- Exit price and reason, result in ₹ and in **R**
- Lesson: did you follow the plan?

**Weekly review:** Which setups worked best? Were losses caused by the market (acceptable — they are a cost of doing business) or by rule-breaking (fixable)? Over 30–50 trades, patterns become obvious: perhaps breakouts work well for you but counter-trend trades do not.

**Psychology** — the main traps:
- **Fear** — skipping valid setups after losses, or exiting winners too early.
- **Greed** — oversizing after a winning streak, or removing targets hoping for more.
- **Revenge trading** — taking impulsive trades to "win back" a loss.
- **FOMO** — chasing a stock that has already run far from any sensible entry.
- **Overconfidence** — believing a few wins prove skill.

Countermeasures: follow the written plan; keep risk per trade small so no single trade matters emotionally; pre-set orders (stop and target) at entry; take a break after a set number of losses; and judge yourself on **following the process**, not on any single outcome.

Trading is a probabilistic activity: good decisions sometimes lose and bad ones sometimes win. Only a journal over many trades reveals whether your method has an edge. If after careful paper trading it does not, the honest conclusion is to stop — long-term investing in diversified funds may suit you better. This course is for education, not financial advice.`,
          c: [
            ["Trading journal", "A structured record of each trade's reasoning, execution, emotions and result."],
            ["Revenge trading", "Impulsive trading to recover a loss quickly, usually breaking the plan."],
            ["Process over outcome", "Judging decisions by whether the plan was followed, not by a single trade's result."],
          ],
          e: {
            t: "What a journal review reveals",
            s: "Thirty journal entries show breakout trades averaging +0.6R, while trades entered 'because it was moving fast' average −0.8R.",
            st: ["Group trades by setup type from the journal", "Compare average R for each group", "Update the plan: allow breakout setups; ban unplanned momentum chases"],
            so: "The journal identifies a profitable setup and a costly habit. Removing the impulsive trades alone improves overall expectancy.",
          },
          a: ["Improving any trading or investing method", "Building discipline in decision-making"],
          m: [["Only recording winning trades", "Record every trade — losses teach the most."], ["Trading to recover losses on the same day", "Stop after the daily or weekly loss limit and review instead."]],
          tip: ["Take a screenshot of the chart at entry and exit; memory rewrites the reasons later."],
          k: ["Journal every trade, including emotions and rule-following.", "Fear, greed, revenge trading and FOMO are the main traps.", "Judge the process; let the journal show whether you have an edge."],
          q: [
            ["What is revenge trading?", ["Trading against a friend", "Impulsive trades to win back a loss", "Following the plan strictly", "Taking profits early"], 1, "It is emotional, unplanned trading after a loss."],
            ["Why record emotional state in a journal?", ["For decoration", "Emotions often explain rule-breaking and poor results", "Brokers ask for it", "It improves indicators"], 1, "Patterns between mood and mistakes become visible."],
            ["A trade followed every rule but lost 1R. How should it be judged?", ["As a bad decision", "As a good decision with an acceptable loss", "As proof the system fails", "It should not be recorded"], 1, "Losses within the plan are a normal cost of trading."],
          ],
        },
      ],
    },
  ],
};
