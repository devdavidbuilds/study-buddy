module.exports = {
  match: "Typography Fundamentals - Feel confident with type!",
  pt: "design-task",
  d: "Become confident with type. You will learn the anatomy and classifications of typefaces, choose fonts with purpose, build clear hierarchy, control leading, tracking, kerning, line length and alignment, pair fonts, design type for screens and accessibility, and critique typography like a professional designer.",
  sk: ["Typography", "Type anatomy", "Font selection", "Hierarchy", "Spacing and kerning", "Font pairing", "Web typography"],
  out: [
    "Describe type using correct anatomical terms",
    "Choose typefaces that suit a message and medium",
    "Create clear hierarchy with size, weight and spacing",
    "Set readable text with correct leading, tracking and line length",
    "Pair fonts and design accessible typography for screens",
  ],
  mods: [
    {
      t: "Understanding Type",
      s: "The vocabulary of type, the main families of typefaces, and how to choose a font for a purpose.",
      ls: [
        {
          t: "The Anatomy of Type",
          f: "Name the parts of letters and the measurements that affect readability",
          s: "Learn the terms designers use to describe letters, from baseline to x-height.",
          o: ["Identify baseline, cap height, x-height, ascenders and descenders", "Distinguish a typeface from a font", "Explain why x-height affects readability"],
          x: `To talk about type precisely, designers use a shared vocabulary.

**The invisible lines** every letter sits on:
- **Baseline** — the line most letters rest on.
- **x-height** — the height of lowercase letters without ascenders, like *x*, *a* and *n*.
- **Cap height** — the height of capital letters.
- **Ascenders** — parts that rise above the x-height (*b, d, h, k, l*).
- **Descenders** — parts that drop below the baseline (*g, j, p, q, y*).

**Parts of letters:**
- **Stroke** — any line forming a letter; **stems** are the main vertical strokes.
- **Serifs** — small finishing strokes at the ends of strokes (in serif typefaces).
- **Bowl** — the closed rounded part of letters like *b, d, o*.
- **Counter** — the enclosed or partly enclosed space inside letters (*o, e, a*). Open counters improve legibility at small sizes.
- **Terminal** — the end of a stroke without a serif.

**Why x-height matters:** typefaces with a **large x-height** look bigger and are easier to read at the same point size, which is why many screen fonts have generous x-heights. Two fonts both set at 16 px can look very different in size.

**Typeface vs font:** a **typeface** is the design (Helvetica); a **font** is a specific style and weight of it (Helvetica Bold 12 pt). A **family** groups all the weights and styles — light, regular, bold, italic.

Knowing these terms lets you explain *why* type works or fails — "the counters close up at small sizes", "the x-height is too small for body text" — instead of just "it looks wrong".`,
          c: [
            ["x-height", "The height of lowercase letters such as x, which strongly affects apparent size and readability."],
            ["Counter", "The enclosed or partly enclosed space inside a letter."],
            ["Typeface vs font", "The overall design versus one specific weight and style of it."],
          ],
          e: {
            t: "Comparing two fonts at the same size",
            s: "Set the word 'readability' at 16 px in Garamond and in Verdana and compare.",
            st: ["Notice Verdana looks noticeably larger", "Compare their x-heights relative to cap height: Verdana's is much larger", "Compare counters: Verdana's are wider and more open"],
            so: "Verdana appears bigger and is easier to read at small sizes on screen because of its large x-height and open counters, even though both are 16 px.",
          },
          a: ["Choosing fonts for small text and screens", "Communicating clearly with other designers"],
          m: [["Judging fonts only by point size", "Compare x-heights; the same size can look very different."], ["Using 'font' and 'typeface' interchangeably in briefs", "Specify the family, weight and style."]],
          tip: ["Type the same sentence in five fonts at the same size and compare their x-heights."],
          k: ["Letters sit on the baseline, with x-height and cap height above.", "Counters and x-height drive legibility.", "A typeface is the design; a font is one weight/style."],
          q: [
            ["What is the x-height?", ["The height of capital letters", "The height of lowercase letters like x", "The width of the letter x", "The space between lines"], 1, "x-height measures lowercase letters without ascenders."],
            ["Which letter has a descender?", ["h", "x", "p", "o"], 2, "p drops below the baseline."],
            ["Why do fonts with a large x-height read well at small sizes?", ["They are heavier", "Their lowercase letters appear larger", "They have no serifs", "They use less ink"], 1, "A large x-height makes text look bigger at the same size."],
          ],
        },
        {
          t: "Type Classifications",
          f: "Distinguish serif, sans-serif, slab, script, monospace and display type",
          s: "Recognise the main classifications of type and the personality and uses of each.",
          o: ["Identify the main type classifications", "Describe the tone each conveys", "Match classifications to suitable uses"],
          x: `Typefaces fall into broad **classifications**, each with a typical personality and use.

**Serif** — finishing strokes at the ends of letters.
- *Old-style* (Garamond): low contrast between thick and thin strokes, warm and classical — books.
- *Transitional* (Times, Baskerville): more contrast, crisp — newspapers, academic texts.
- *Modern / Didone* (Bodoni, Didot): extreme contrast, elegant — fashion magazines, luxury brands; poor for small text.

**Slab serif** (Rockwell, Roboto Slab) — thick, block-like serifs; sturdy, confident, a little retro — headlines, posters, branding.

**Sans-serif** — no serifs.
- *Grotesque/neo-grotesque* (Helvetica, Arial): neutral, modern.
- *Geometric* (Futura, Montserrat): built from circles and straight lines; clean, contemporary.
- *Humanist* (Gill Sans, Open Sans): based on handwritten forms; friendly and highly readable — interfaces and signage.

**Script** (Pacifico, Great Vibes) — imitate handwriting or calligraphy; personal, elegant or playful — invitations, short headlines only.

**Monospace** (Courier, Fira Code) — every character the same width — code, technical data, tables.

**Display / decorative** — strong personality for large sizes only — logos, posters, titles.

Classification gives you a quick shortlist: a law firm's report suggests a transitional serif; a fintech app a humanist or geometric sans; a children's book something rounded and friendly. **Personality must match the message** — a script font on a hospital's emergency sign, or a heavy slab for a meditation app, sends the wrong signal before anyone reads a word.`,
          c: [
            ["Stroke contrast", "The difference between thick and thin strokes in a typeface."],
            ["Humanist sans-serif", "A sans-serif based on handwritten letterforms, friendly and very readable."],
            ["Monospace", "A typeface where every character occupies the same width."],
          ],
          e: {
            t: "Matching type to three brands",
            s: "Choose classifications for a luxury perfume, a coding bootcamp and a children's library.",
            st: ["Luxury perfume: elegant, high contrast → a Didone serif such as Didot for the logo", "Coding bootcamp: technical, modern → a geometric sans for headings and a monospace for code", "Children's library: friendly, readable → a rounded humanist sans"],
            so: "Each brand's typography communicates its personality instantly: refined, technical or friendly.",
          },
          a: ["Brand identity and logo design", "Choosing fonts for documents and interfaces"],
          m: [["Using Didone or script fonts for body text", "Reserve them for large display sizes."], ["Choosing fonts by personal favourite", "Choose by the message, audience and medium."]],
          tip: ["Collect type you like in a swipe file, labelled by classification."],
          k: ["Main classes: serif (old-style, transitional, Didone), slab, sans (grotesque, geometric, humanist), script, mono, display.", "Each class carries a personality.", "Match the classification to the message and medium."],
          q: [
            ["Which classification has extreme thick–thin contrast and suits fashion headlines?", ["Old-style serif", "Didone (modern) serif", "Slab serif", "Monospace"], 1, "Didone faces like Bodoni have extreme stroke contrast."],
            ["What is special about a monospace typeface?", ["It has no serifs", "Every character has the same width", "It only has capitals", "It is handwritten"], 1, "Monospace aligns characters in columns, ideal for code."],
            ["Which is most appropriate for long body text in a user interface?", ["A decorative display font", "A humanist sans-serif", "A script font", "A Didone serif at 10 px"], 1, "Humanist sans-serifs are highly legible on screens."],
          ],
        },
        {
          t: "Choosing Typefaces with Purpose",
          f: "Select typefaces using legibility, tone, context and technical criteria",
          s: "Use a repeatable checklist to choose typefaces for any project.",
          o: ["Evaluate legibility and readability", "Check family completeness and language support", "Consider licensing and technical constraints"],
          x: `Choosing a typeface is a decision with criteria, not a matter of taste. Ask these questions:

**1. What is it for — display or text?** *Display* type (headlines, posters, logos) can be expressive. *Text* type (paragraphs, interfaces) must prioritise **readability**: moderate contrast, open counters, generous x-height, clear distinction between similar characters (I, l, 1; O, 0; rn and m).

**2. What tone does the message need?** Formal, friendly, technical, luxurious, playful? Use the classifications from the previous lesson to shortlist.

**3. Where will it be read?** Small screens favour sturdy sans-serifs with large x-heights; long printed reading often suits serifs; signage must work at distance and in motion; low-resolution displays punish thin strokes.

**4. Is the family complete?** A good text family has at least regular, italic, bold and bold italic, ideally more weights. Check numerals (lining vs old-style), punctuation and symbols such as **₹**.

**5. Does it support the languages you need?** If your project includes Tamil, Hindi or other scripts, check that the family — or a matching companion font such as those in the Noto family — supports them.

**6. Licensing and performance.** Commercial fonts need the right licence for print, web or apps. Free options such as **Google Fonts** (open licences) are reliable for most projects. On the web, each additional weight adds download size, so load only what you use.

Test with **real content**, not "Lorem ipsum": actual headlines, prices, long words and numbers reveal problems that placeholder text hides.`,
          c: [
            ["Readability", "How comfortably longer text can be read, influenced by typeface, size and spacing."],
            ["Font family", "The set of weights and styles (regular, italic, bold…) of one typeface."],
            ["Font licence", "The legal terms governing where and how a font may be used."],
          ],
          e: {
            t: "Choosing a font for a student app",
            s: "An app for Indian students needs a friendly, highly readable font that supports English, Hindi and Tamil.",
            st: ["Shortlist humanist sans-serifs with large x-heights", "Check support: the Noto Sans family covers Latin, Devanagari and Tamil with matching designs", "Test with real content — course names, prices with ₹, long words — at 14–16 px on a phone"],
            so: "Noto Sans (with its Devanagari and Tamil companions) meets the tone, readability and language requirements and is free to use under an open licence.",
          },
          a: ["Selecting fonts for brands, apps and publications", "Multilingual design projects"],
          m: [["Testing fonts with placeholder text only", "Use real headlines, numbers and long words."], ["Ignoring licensing", "Check the licence covers print, web or app use as needed."]],
          tip: ["Print or view your type choice at its real size on the real device before deciding."],
          k: ["Separate display and text needs.", "Check family completeness, symbols and language support.", "Consider licence and performance; test with real content."],
          q: [
            ["Which matters most for body (text) type?", ["Strong personality", "Readability", "Decorative swashes", "Extreme contrast"], 1, "Text type must be comfortable to read for long periods."],
            ["Why check that a family includes several weights and italics?", ["For decoration", "To create hierarchy and emphasis consistently", "To increase file size", "It is a legal requirement"], 1, "A complete family gives consistent emphasis and hierarchy."],
            ["Why test fonts with real content rather than Lorem ipsum?", ["Lorem ipsum is copyrighted", "Real content reveals problems with numbers, long words and symbols", "It loads faster", "Clients prefer Latin"], 1, "Placeholder text hides real-world issues."],
          ],
        },
      ],
    },
    {
      t: "Setting Type",
      s: "Building hierarchy, controlling spacing at every level, and managing line length and alignment.",
      ls: [
        {
          t: "Typographic Hierarchy",
          f: "Create hierarchy with size, weight, colour, spacing and position",
          s: "Guide readers through text with a clear order of importance using a type scale.",
          o: ["Explain the levels of typographic hierarchy", "Create hierarchy with size, weight, colour and spacing", "Use a modular type scale"],
          x: `**Hierarchy** shows readers what to read first, second and third. Without it, a page of text is a wall; with it, readers can scan and find what they need in seconds.

Typical levels:
1. **Primary** — the main headline or title.
2. **Secondary** — subheadings and section titles.
3. **Tertiary** — body text, captions, labels, metadata.

**Tools for hierarchy** (use the fewest that work):
- **Size** — the most obvious signal.
- **Weight** — bold vs regular creates contrast without changing size.
- **Colour and value** — a darker or accent colour stands out; lighter grey recedes (keep enough contrast to stay readable).
- **Case and spacing** — small, letter-spaced capitals make good labels.
- **Space and position** — space above a heading groups it with the text below; top and left positions are read first.

**Use a type scale.** Instead of picking sizes at random (17, 23, 29 px…), multiply by a fixed ratio. With a base of 16 px and a ratio of 1.25 ("major third"): **16 → 20 → 25 → 31 → 39 px**. A scale makes sizes feel related and gives clear steps between levels.

**Rules of thumb:**
- Make differences **clear**: a heading only slightly bigger than body text looks like a mistake.
- Limit yourself to **3–4 levels** in most designs.
- Keep hierarchy **consistent**: every subheading on every page uses the same style — this is the principle of repetition.

Test hierarchy by blurring your eyes or squinting: you should still see the headline first and the structure of the page.`,
          c: [
            ["Typographic hierarchy", "The visual order of importance in text, created by size, weight, colour and spacing."],
            ["Type scale", "A set of font sizes related by a fixed ratio, such as 1.25."],
            ["Contrast of weight", "Using bold versus regular to separate levels without changing size."],
          ],
          e: {
            t: "Building a scale for a report",
            s: "Create sizes for title, heading, subheading and body using base 16 px and ratio 1.25.",
            st: ["Body = 16 px", "Subheading = 16 × 1.25 = 20 px; heading = 20 × 1.25 = 25 px", "Title = 25 × 1.25 ≈ 31 px; use bold for title and heading, semibold for subheadings"],
            so: "The report uses 31 / 25 / 20 / 16 px — four clearly related levels that make the structure obvious at a glance.",
          },
          a: ["Reports, articles and presentations", "Websites and app interfaces"],
          m: [["Too many levels and sizes", "Use 3–4 levels from a consistent scale."], ["Differences too small to notice", "Make each level clearly distinct."]],
          tip: ["Define your type styles once (title, heading, body, caption) and reuse them everywhere."],
          k: ["Hierarchy tells readers what to read first.", "Use size, weight, colour, spacing and position — sparingly.", "A modular type scale keeps sizes related and consistent."],
          q: [
            ["With base 16 px and a 1.25 ratio, the next size up is…", ["17 px", "18 px", "20 px", "32 px"], 2, "16 × 1.25 = 20."],
            ["How many hierarchy levels do most designs need?", ["1", "3–4", "10", "As many as possible"], 1, "Three or four clear levels are usually enough."],
            ["Which creates hierarchy without changing font size?", ["Weight (bold vs regular)", "Line length", "Kerning only", "Justification"], 0, "Weight contrast distinguishes levels at the same size."],
          ],
        },
        {
          t: "Spacing: Leading, Tracking and Kerning",
          f: "Adjust line spacing, letter spacing and kerning for readability",
          s: "Control the space between lines, words and letters — the most important factor in readable type.",
          o: ["Set leading for body text and headlines", "Use tracking for capitals and small text", "Kern display type to fix uneven pairs"],
          x: `Good typography is mostly about **space**. Three controls matter most.

**Leading (line spacing)** — the distance from one baseline to the next.
- Body text: about **1.4–1.6 ×** the font size (16 px text → about 24 px line height).
- Headlines: tighter, about **1.1–1.25 ×**, because large lines look too far apart with body-text leading.
- Longer lines need slightly more leading so the eye can find the start of the next line.

**Tracking (letter spacing)** — uniform space added or removed across a whole word or block.
- **ALL CAPS** and small labels usually need a little **positive tracking** (for example +5% to +10%) to breathe.
- Large headlines often look better with slight **negative tracking**.
- Never letter-space lowercase body text heavily — it breaks up word shapes and slows reading.

**Kerning** — adjusting space between **specific pairs** of letters. Fonts include kerning tables, but at large sizes some pairs still look uneven: **AV, To, Wa, LT, Yo**. Kerning fixes the *optical* spacing so that letters look evenly spaced, even if the measured gaps differ. It matters most in logos, headlines and posters.

**Optical vs metric:** our eyes judge space by area, not distance. Round letters (O, C) need to sit slightly closer to their neighbours than straight letters (H, I) to *look* equally spaced.

A practical kerning trick: turn the word **upside down** or blur your eyes — you will see the spacing as shapes rather than letters, and uneven gaps become obvious.`,
          c: [
            ["Leading", "The vertical distance between baselines of consecutive lines."],
            ["Tracking", "Uniform adjustment of spacing across a group of letters."],
            ["Kerning", "Adjusting the space between a specific pair of letters for even optical spacing."],
          ],
          e: {
            t: "Fixing a poster headline",
            s: "The headline 'TRAVEL WAVES' set in capitals at 96 px looks gappy between A–V and W–A, and the lines feel far apart.",
            st: ["Reduce leading from 1.5 to about 1.1 for the large two-line headline", "Kern the A–V and W–A pairs tighter until the gaps match the rest of the word", "Add a little positive tracking to the small subtitle in capitals below"],
            so: "The headline now reads as a tight, even block, and the subtitle in capitals is comfortable to read.",
          },
          a: ["Logos, posters and headlines", "Readable body text in print and on screen"],
          m: [["Using the same leading for headlines and body text", "Tighten leading for large display type."], ["Heavily tracking lowercase body text", "Track capitals and small labels, not body paragraphs."]],
          tip: ["Turn a headline upside down to judge its kerning objectively."],
          k: ["Leading ~1.4–1.6× for body text, ~1.1–1.25× for headlines.", "Tracking adjusts whole words; kerning adjusts letter pairs.", "Space letters optically, not mathematically."],
          q: [
            ["What is a good leading for 16 px body text?", ["16 px", "About 24 px", "48 px", "8 px"], 1, "About 1.5 × 16 = 24 px."],
            ["Kerning adjusts…", ["Line spacing", "Space between specific letter pairs", "Font weight", "Paragraph indents"], 1, "Kerning targets individual letter pairs such as A–V."],
            ["Which text usually benefits from slight positive tracking?", ["Lowercase body paragraphs", "Small all-caps labels", "Script fonts", "Large lowercase headlines"], 1, "Capitals and small labels need extra air."],
          ],
        },
        {
          t: "Line Length, Alignment and Paragraphs",
          f: "Control measure, alignment, rag and paragraph spacing",
          s: "Set comfortable line lengths, choose alignment, and handle paragraphs, widows and orphans.",
          o: ["Choose a comfortable measure", "Choose between left, centred, right and justified alignment", "Avoid widows, orphans and bad rags"],
          x: `**Line length (measure)** has a huge effect on comfort. For body text aim for roughly **45–75 characters per line**, with about **66** often cited as ideal. Lines that are too long make the eye lose its place when returning to the next line; lines that are too short break up phrases and feel choppy. On wide screens, limit the text column (for example \`max-width: 65ch\` in CSS).

**Alignment:**
- **Left-aligned (flush left, ragged right)** — the best default for body text in left-to-right languages; even word spacing and a consistent starting point.
- **Centred** — fine for short, formal or display text (invitations, titles), but hard to read for paragraphs because every line starts in a different place.
- **Right-aligned** — occasionally for short captions or numbers in tables.
- **Justified** — both edges straight; looks tidy in books and columns but can create **rivers** (gaps running through paragraphs) unless hyphenation and careful spacing are used. Avoid it on the web for narrow columns.

**The rag** — the uneven right edge of left-aligned text — should look gently irregular, not jagged; adjust line breaks in headlines and key paragraphs to avoid odd shapes.

**Paragraphs:** separate them with **either** a first-line indent **or** space between paragraphs — not both. Space of about half to one line height works well on screens.

**Widows and orphans:** a single word left alone on the last line of a paragraph, or a lone line separated from its paragraph at the top or bottom of a column, looks awkward. Fix them by editing the text slightly, adjusting tracking a fraction, or changing the line break.

These details are small individually, but together they are what make text feel professionally set.`,
          c: [
            ["Measure", "The length of a line of text, ideally 45–75 characters for body copy."],
            ["Rag", "The uneven edge of non-justified text."],
            ["Widow / orphan", "A lone word or line separated from the rest of its paragraph at the end of a paragraph or column."],
          ],
          e: {
            t: "Fixing a web article",
            s: "An article on a wide monitor runs 140 characters per line, is centre-aligned and uses both indents and paragraph spacing.",
            st: ["Limit the column to about 65 characters (max-width: 65ch)", "Switch from centred to left-aligned text", "Remove first-line indents and keep about 0.75 em of space between paragraphs"],
            so: "The article becomes comfortable to read: lines are easy to track, every line starts at the same edge and paragraphs are clearly separated.",
          },
          a: ["Articles, reports and books", "Readable web pages and documentation"],
          m: [["Centring long paragraphs", "Left-align body text; centre only short display text."], ["Using indents and paragraph spacing together", "Choose one method of separating paragraphs."]],
          tip: ["Count the characters in a typical line — if it is over 80, narrow the column."],
          k: ["Aim for 45–75 characters per line.", "Left-aligned is the best default for body text.", "Separate paragraphs one way and fix widows and orphans."],
          q: [
            ["What is a comfortable line length for body text?", ["10–20 characters", "45–75 characters", "100–150 characters", "Unlimited"], 1, "About 45–75 characters per line reads best."],
            ["Which alignment is the best default for body paragraphs?", ["Centred", "Left-aligned", "Right-aligned", "Justified without hyphenation"], 1, "It gives even spacing and a consistent start for each line."],
            ["What is a 'river' in justified text?", ["A blue highlight", "A chain of gaps running down through the paragraph", "A long line", "A type of serif"], 1, "Uneven word spacing can line up into distracting rivers."],
          ],
        },
      ],
    },
    {
      t: "Typography in Practice",
      s: "Pairing fonts, designing type for screens and accessibility, and critiquing typography.",
      ls: [
        {
          t: "Pairing Fonts",
          f: "Combine typefaces through contrast, shared structure and superfamilies",
          s: "Combine typefaces that contrast clearly while sharing structure, or use one versatile family.",
          o: ["Explain contrast and concord in font pairing", "Create a heading/body pairing", "Use superfamilies and limit the number of fonts"],
          x: `Most designs need **one or two** typefaces; a third is rarely necessary. Pairing works when fonts are **different enough to contrast** but **similar enough to belong together**.

**Approaches that work:**
1. **One family, many weights.** A versatile family (Inter, Source Sans, Roboto) can carry an entire design using weight and size for hierarchy. Safe, consistent and fast to load.
2. **Serif + sans-serif.** The classic pairing: a serif for headings and a sans for body (or the reverse). Contrast comes from the serifs; harmony comes from similar proportions.
3. **Superfamilies.** Some typefaces are designed with serif and sans versions that share skeletons — *Merriweather & Merriweather Sans*, *IBM Plex Serif & Plex Sans*, *Noto Serif & Noto Sans*. Built-in harmony.
4. **Display + neutral.** An expressive display font for a few words, with a quiet, readable text font for everything else.

**What to match:** similar **x-height** and overall proportions make two fonts sit comfortably together. Similar *mood* matters too — a geometric sans pairs naturally with a geometric-influenced serif.

**What to avoid:**
- Two fonts that are *almost* the same (two similar sans-serifs) — it looks like an error rather than a choice.
- Two strongly expressive fonts competing for attention.
- More than two or three typefaces overall.

**Assign clear roles:** e.g. *Playfair Display* for headings only, *Source Sans* for body, captions and UI. Write these roles down so the pairing is used consistently. A quick test: set a real headline and paragraph in your pairing; if your eye moves naturally from one to the other without noticing a clash, the pairing works.`,
          c: [
            ["Contrast and concord", "Fonts different enough to distinguish roles but harmonious in proportion and mood."],
            ["Superfamily", "A typeface family with related serif and sans (and sometimes mono) versions."],
            ["Typographic roles", "Assigning each typeface a specific job, such as headings or body text."],
          ],
          e: {
            t: "Pairing for a college magazine",
            s: "The magazine wants an editorial feel for features but very readable body text.",
            st: ["Choose a high-contrast serif with editorial character (Playfair Display) for headlines", "Choose a humanist sans with a similar x-height (Source Sans) for body text and captions", "Test with a real feature headline, standfirst and two paragraphs"],
            so: "The pair gives the magazine an elegant, editorial voice in headings and comfortable reading in the body — two fonts with clear, separate roles.",
          },
          a: ["Magazines, websites and brand systems", "Presentations and posters"],
          m: [["Pairing two very similar fonts", "Pair clearly contrasting fonts, or use one family."], ["Using three or more typefaces", "Limit to two, with clear roles."]],
          tip: ["When unsure, use one good family in two or three weights."],
          k: ["Pair fonts with clear contrast and shared proportions.", "Superfamilies and single families are safe choices.", "Give each font a clear role and limit the total."],
          q: [
            ["Which is a classic font-pairing approach?", ["Two similar sans-serifs", "A serif heading with a sans-serif body", "Three scripts", "Different fonts for every heading"], 1, "Serif + sans provides clear contrast."],
            ["What is a superfamily?", ["Any very popular font", "Related serif and sans versions designed to work together", "A font with only bold weights", "A font licence"], 1, "Superfamilies share a common skeleton."],
            ["Why avoid pairing two very similar typefaces?", ["They are expensive", "The difference looks like a mistake rather than a choice", "They load slowly", "They cannot be bold"], 1, "Fonts that are almost the same create confusion, not contrast."],
          ],
        },
        {
          t: "Typography for Screens and Accessibility",
          f: "Set responsive, accessible type with web fonts and relative units",
          s: "Design type that is readable on every screen and accessible to every reader.",
          o: ["Use relative units and responsive type sizes", "Load web fonts efficiently", "Meet accessibility guidelines for size, contrast and spacing"],
          x: `Screens add challenges print never had: different sizes, resolutions, user settings and accessibility needs.

**Sizes and units**
- Body text on screens should be **at least 16 px**; smaller text strains the eyes.
- Use **relative units** (\`rem\`, \`em\`) instead of fixed pixels so text respects the user's browser font-size setting.
- **Responsive type** scales headings with the viewport: CSS \`clamp(1.75rem, 4vw, 3rem)\` grows a heading on large screens without making it enormous.

**Web fonts**
- Load only the weights you use; each adds download time.
- Use \`font-display: swap\` so text appears immediately in a fallback font while the web font loads.
- Provide a sensible **fallback stack**: \`font-family: "Inter", system-ui, sans-serif;\`.

**Accessibility (WCAG)**
- **Contrast:** at least **4.5:1** for body text and 3:1 for large text. Light grey text on white often fails.
- **Resizing:** text must remain usable when zoomed to 200%.
- **Spacing:** layouts should tolerate users increasing line height to 1.5 and letter spacing — avoid fixed-height text boxes that clip.
- **Avoid** long passages in all capitals, italics or very thin weights; avoid justified text on narrow screens.
- Never put important text inside images — it cannot be resized, translated or read by screen readers.

**Dark mode:** pure white on pure black can glow and cause halation; slightly off-white text on a dark grey background is more comfortable, and thin weights may need a little more weight in dark themes.

Accessible typography is simply good typography: if it works for someone with low vision on a small phone in sunlight, it works better for everyone.`,
          c: [
            ["Relative units (rem)", "Sizes relative to the root font size, so text respects user settings."],
            ["font-display: swap", "A CSS setting that shows fallback text immediately while a web font loads."],
            ["WCAG contrast", "Accessibility guideline of 4.5:1 contrast for normal text (3:1 for large text)."],
          ],
          e: {
            t: "Making a landing page accessible",
            s: "A landing page uses 13 px light-grey body text in pixels, loads six font weights, and has a headline baked into an image.",
            st: ["Set body text to 1rem (16 px) and darken the grey until contrast passes 4.5:1", "Load only regular and bold weights with font-display: swap", "Replace the image headline with real HTML text styled with CSS and clamp() sizing"],
            so: "The page loads faster, text is readable and resizable, passes contrast checks, and the headline can be read by screen readers and search engines.",
          },
          a: ["Websites, apps and dashboards", "Digital documents and presentations"],
          m: [["Body text smaller than 16 px on screens", "Use at least 16 px (1rem) for body text."], ["Text in images", "Use live text styled with CSS."]],
          tip: ["Test your design at 200% browser zoom and in dark mode."],
          k: ["Use ≥16 px body text and relative units; scale headings responsively.", "Load few font weights with font-display: swap and fallbacks.", "Meet contrast and resizing guidelines; never put text in images."],
          q: [
            ["What is the recommended minimum size for body text on screens?", ["10 px", "12 px", "16 px", "24 px"], 2, "16 px (1rem) is a widely recommended minimum."],
            ["Why use rem units for font sizes?", ["They are smaller", "They respect the user's browser font-size setting", "They load faster", "They are required for bold text"], 1, "Relative units scale with user preferences."],
            ["What is the WCAG minimum contrast ratio for normal body text?", ["2:1", "3:1", "4.5:1", "7:1 only"], 2, "4.5:1 is the AA requirement for normal text."],
          ],
        },
        {
          t: "Typographic Critique and Common Mistakes",
          f: "Evaluate typography with a checklist and fix the most common mistakes",
          s: "Use a structured checklist to critique typography and correct common errors.",
          o: ["Critique a design with a typographic checklist", "Recognise and fix common mistakes", "Use typographers' details such as quotes and dashes"],
          x: `Professional designers review their type systematically. Use this **checklist** on any design:

1. **Purpose** — does the typeface suit the message and audience?
2. **Hierarchy** — is it obvious what to read first, second and third? Are there too many levels?
3. **Readability** — body size ≥ 16 px on screen, leading about 1.5, line length 45–75 characters, sufficient contrast.
4. **Spacing** — consistent paragraph spacing, even kerning in headlines, appropriate tracking on capitals.
5. **Alignment and rag** — a clear alignment edge, no awkward rags, rivers, widows or orphans.
6. **Consistency** — every heading level, caption and button uses the same style throughout.
7. **Details** — correct punctuation and symbols.

**Common mistakes and fixes:**
- **Too many fonts** → reduce to one or two with clear roles.
- **Fake bold or italics** (software-generated) → use the real bold/italic fonts from the family.
- **Stretched or squashed type** → never distort letters; choose a condensed or extended font instead.
- **Straight quotes and wrong dashes** → use curly quotes (“ ” ‘ ’) and apostrophes (’), the **en dash** (–) for ranges (9–5, 2024–25), the **em dash** (—) for breaks in a sentence, and a hyphen (-) only within words.
- **Double spaces after full stops** → one space is the modern standard.
- **Underlining for emphasis** in print → use italic or bold; underline signals links on screens.
- **Low contrast for style** → elegant pale text that people cannot read is not elegant.

**Giving critique:** describe the issue, explain its effect and suggest a fix — "the body text runs about 110 characters per line, which makes it tiring to read; narrowing the column to about 65 would help." Specific, reasoned feedback improves the work and builds your own eye for type.`,
          c: [
            ["Faux bold / italic", "Bold or italic generated by software rather than designed fonts, which looks distorted."],
            ["En dash and em dash", "– for ranges; — for breaks in a sentence; distinct from the hyphen (-)."],
            ["Typographic checklist", "A structured list for reviewing purpose, hierarchy, readability, spacing and details."],
          ],
          e: {
            t: "Critiquing an event flyer",
            s: "A flyer uses four fonts, a stretched headline, straight quotes, '10-12 March' with a hyphen, and centred 120-character lines.",
            st: ["Reduce to a display font for the headline and one sans-serif for everything else", "Replace the stretched headline with a condensed font, and use curly quotes and an en dash: '10–12 March'", "Left-align the body text in a narrower column of about 60 characters"],
            so: "The flyer looks deliberate and professional: two fonts with clear roles, undistorted type, correct punctuation and readable body text.",
          },
          a: ["Reviewing your own and others' work", "Preparing portfolio pieces"],
          m: [["Stretching type to fit a space", "Choose a condensed or extended font, or change the size."], ["Using a hyphen for ranges", "Use an en dash: 2024–25, pages 10–15."]],
          tip: ["Run the checklist at the end of every project before sharing it."],
          k: ["Critique with a checklist: purpose, hierarchy, readability, spacing, alignment, consistency, details.", "Avoid too many fonts, fake styles and distorted type.", "Use correct quotes and dashes; give specific, reasoned feedback."],
          q: [
            ["Which character should be used for a range such as 9–5?", ["Hyphen (-)", "En dash (–)", "Em dash (—)", "Underscore (_)"], 1, "The en dash marks ranges."],
            ["What should you do instead of stretching type horizontally?", ["Stretch it vertically", "Use a condensed or extended font", "Add a shadow", "Underline it"], 1, "Distortion damages letterforms; use a designed width."],
            ["Which is a well-formed critique?", ["'It looks bad'", "'Change the font'", "'The 110-character lines are tiring; narrowing to ~65 would help'", "'Make it pop'"], 2, "Specific, reasoned feedback with a suggested fix is actionable."],
          ],
        },
      ],
    },
  ],
};
