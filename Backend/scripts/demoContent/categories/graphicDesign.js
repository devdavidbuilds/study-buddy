// Graphic Design curriculum — used for every Graphic Design course that has
// no course-specific content. {course} = course name, {topic} = tool or
// subject detected from the title (e.g. "Photoshop"), else "graphic design".
module.exports = {
  pt: "design-task",
  d: "{course} builds your skills in {topic} step by step: the elements and principles of design, colour theory, typography, grids and layout, working with images, a professional design process, branding, and preparing files for print and screen. Every lesson includes a design task and a short check; every module ends with a quiz.",
  sk: ["{topic}", "Design principles", "Colour theory", "Typography", "Layout and grids", "Branding", "Print and screen production"],
  out: [
    "Use the elements and principles of design to create clear compositions",
    "Choose effective colour palettes and accessible contrast",
    "Set type with clear hierarchy and readable spacing",
    "Lay out pages and screens on a grid",
    "Follow a professional process from brief to delivered files",
  ],
  mods: [
    {
      t: "Design Foundations",
      s: "The visual elements every design is built from, the principles that organise them, and how colour works.",
      ls: [
        {
          t: "The Elements of Design",
          f: "Identify and use line, shape, colour, texture, value and space",
          s: "Learn the basic building blocks — line, shape, colour, value, texture and space — and how designers use them.",
          o: ["Name the core elements of design", "Explain how value creates contrast and depth", "Use white (negative) space deliberately"],
          x: `Welcome to **{course}**. Whatever tool you use, every design is assembled from a small set of visual **elements**:

- **Line** — guides the eye, separates areas and suggests movement. Thick lines feel bold; thin lines feel delicate.
- **Shape** — *geometric* shapes (circles, squares) feel ordered and modern; *organic* shapes feel natural and friendly. Circles suggest unity, triangles energy or direction, squares stability.
- **Colour** — sets mood and draws attention (covered in depth later in this module).
- **Value** — how light or dark something is. Strong value contrast is what makes elements stand out; a design that still reads clearly in **greyscale** has good value structure.
- **Texture** — the real or implied surface quality (grain, paper, noise) that adds depth and personality.
- **Space** — the area around and between elements. **Negative space** (or white space) is not wasted space: it gives content room to breathe and makes a layout feel calm and professional.

Good designers choose elements on purpose. Before adding anything, ask: *what does this element do for the message?* If the answer is "nothing", leave it out. Simplicity is a decision, not a lack of effort.

As you work in {topic}, try converting your designs to greyscale and squinting at them: if the most important item no longer stands out, the value contrast needs work.`,
          c: [
            ["Value", "The lightness or darkness of a colour or area; the basis of visual contrast."],
            ["Negative space", "The empty space around and between elements, used to create focus and clarity."],
            ["Geometric vs organic shapes", "Precise, mathematical shapes versus irregular, natural ones."],
          ],
          e: {
            t: "Rescuing a cluttered poster",
            s: "An event poster has six colours, four decorative lines and text filling every corner.",
            st: ["Convert it to greyscale and identify what stands out (nothing does)", "Remove decorative lines and reduce the palette to two colours plus neutral", "Increase margins and spacing so the event name has clear negative space around it"],
            so: "With fewer elements, stronger value contrast and generous white space, the event name becomes the obvious focal point and the poster reads in seconds.",
          },
          a: ["Posters, social media graphics and slides", "Product packaging and app screens"],
          m: [["Filling every empty area", "Use negative space to give the main content focus."], ["Relying on colour alone for contrast", "Check the design in greyscale; value contrast must work too."]],
          tip: ["Squint at your design: the shapes that remain visible are what viewers see first."],
          k: ["Designs are built from line, shape, colour, value, texture and space.", "Value contrast makes things stand out — test in greyscale.", "Negative space is a tool, not an empty gap."],
          q: [
            ["What does 'value' describe in design?", ["The price of a design", "How light or dark an area is", "The number of colours", "The file size"], 1, "Value is lightness or darkness and drives contrast."],
            ["Why is negative space useful?", ["It saves ink only", "It gives content room and creates focus", "It hides mistakes", "It adds texture"], 1, "White space directs attention and makes layouts clearer."],
            ["Which test checks whether a design has good value contrast?", ["Printing it larger", "Viewing it in greyscale", "Adding more colours", "Changing the font"], 1, "In greyscale only value remains, so weak contrast becomes obvious."],
          ],
        },
        {
          t: "Principles of Design",
          f: "Apply contrast, alignment, repetition, proximity and hierarchy",
          s: "Organise elements with the core principles so that layouts are clear, unified and easy to scan.",
          o: ["Apply contrast, repetition, alignment and proximity", "Create a clear visual hierarchy", "Critique a layout using the principles"],
          x: `If the elements are the ingredients, the **principles** are the recipe. Four principles, often remembered as **C.R.A.P.**, fix most layout problems:

- **Contrast** — make different things *really* different (size, weight, colour, value). Weak contrast looks like a mistake; strong contrast creates focus.
- **Repetition** — reuse the same colours, fonts, spacing and styles throughout. Repetition creates consistency and makes a set of designs feel like one brand.
- **Alignment** — every element should line up with something else. Choose one strong alignment edge (often left-aligned text) instead of centring everything; invisible lines make a design feel organised.
- **Proximity** — place related items close together and unrelated items apart. Grouping tells the viewer what belongs together before they read a word.

These combine into **visual hierarchy**: the order in which a viewer notices things. A good hierarchy has one clear **focal point**, then secondary information, then details. Size, contrast, position (top-left is read first in left-to-right cultures) and white space all signal importance.

Other principles you will meet are **balance** (symmetrical feels formal, asymmetrical feels dynamic), **emphasis**, **movement** and **unity**.

Use the principles as a checklist when something "doesn't look right": usually there is weak contrast, mixed alignments, or items that are evenly spaced when they should be grouped.`,
          c: [
            ["Visual hierarchy", "The order of importance in which elements are noticed, created with size, contrast and position."],
            ["Proximity", "Grouping related items close together so they are understood as a unit."],
            ["Alignment", "Placing elements along shared edges or axes so the layout looks organised."],
          ],
          e: {
            t: "Fixing a business card",
            s: "A card has the name, title, phone, email and website all centred, the same size and evenly spaced.",
            st: ["Contrast: make the name larger and bolder than everything else", "Proximity: group phone, email and website together, away from the name and title", "Alignment: left-align all text to one edge, and repeat one accent colour for the name and the icons"],
            so: "The name now reads first, the contact details form one clear group, and the shared left edge makes the card look deliberate and professional.",
          },
          a: ["Resumes, flyers and presentation slides", "Website and app layouts"],
          m: [["Centring everything by default", "Pick one strong alignment edge, usually left."], ["Making several things equally important", "Choose one focal point and let other elements support it."]],
          tip: ["Ask someone to look at your design for three seconds, then tell you what they noticed first."],
          k: ["Contrast, repetition, alignment and proximity solve most layout problems.", "Hierarchy guides the eye from the focal point to the details.", "Group related items; separate unrelated ones."],
          q: [
            ["Placing related items close together applies which principle?", ["Contrast", "Proximity", "Repetition", "Balance"], 1, "Proximity groups related information visually."],
            ["What creates a strong focal point?", ["Making everything the same size", "Strong contrast in size, weight or colour", "Centring all elements", "Using many fonts"], 1, "Contrast makes one element dominate."],
            ["Reusing the same fonts and colours across a design is…", ["Alignment", "Repetition", "Proximity", "Texture"], 1, "Repetition builds consistency and unity."],
          ],
        },
        {
          t: "Colour Theory",
          f: "Choose colour harmonies, understand colour models and ensure accessible contrast",
          s: "Use the colour wheel, harmonies and the meaning of colour, and check that colour choices are readable.",
          o: ["Describe hue, saturation and value", "Build complementary and analogous palettes", "Check colour contrast for accessibility"],
          x: `Colour is the most emotional design element — and the easiest to overuse.

Every colour has three properties:
- **Hue** — the colour family (red, blue, green).
- **Saturation** — intensity, from vivid to grey.
- **Value / brightness** — how light or dark it is. A *tint* adds white; a *shade* adds black.

The **colour wheel** shows relationships that produce harmonious palettes:
- **Complementary** — opposites (blue and orange): maximum contrast, great for calls to action.
- **Analogous** — neighbours (blue, teal, green): calm and cohesive.
- **Triadic** — three evenly spaced hues: lively but balanced.
- **Monochromatic** — tints and shades of one hue: elegant and simple.

A reliable way to apply colour is the **60–30–10 rule**: about 60% a dominant neutral or base colour, 30% a secondary colour, 10% an accent for the most important elements.

Colour also carries **meaning**, which varies by culture and context: blue often signals trust (banks, tech), green nature or health, red urgency or energy. Choose colours that fit the message and audience.

**Accessibility matters.** Text must contrast enough with its background — the WCAG guideline is a contrast ratio of at least **4.5:1** for normal text. Never use colour as the *only* signal (for example red/green for errors); about 1 in 12 men has some colour-vision deficiency. Free contrast checkers make testing quick, and you can find exact colour values for {topic} work with an eyedropper tool.`,
          c: [
            ["Complementary colours", "Colours opposite each other on the wheel, giving the strongest contrast."],
            ["60–30–10 rule", "A balance of roughly 60% dominant, 30% secondary and 10% accent colour."],
            ["Contrast ratio", "A measure of luminance difference between text and background; WCAG asks at least 4.5:1."],
          ],
          e: {
            t: "Building a palette for a study app",
            s: "A study app should feel calm and trustworthy, with one clear colour for buttons.",
            st: ["Choose an analogous base of soft blues and teals for calm (60% light neutral, 30% blue)", "Add a complementary orange accent for buttons and key actions (10%)", "Check text colours against backgrounds with a contrast checker and adjust until they pass 4.5:1"],
            so: "A calm blue/teal interface with orange calls to action, where every text colour passes accessible contrast.",
          },
          a: ["Brand colour palettes", "Readable websites and presentations"],
          m: [["Using many saturated colours at once", "Use a neutral base and one or two accents (60–30–10)."], ["Light grey text on white", "Check contrast; aim for at least 4.5:1 for body text."]],
          tip: ["Start designs in greyscale, then add colour once the hierarchy works."],
          k: ["Hue, saturation and value describe every colour.", "Use harmonies and the 60–30–10 rule for balanced palettes.", "Check contrast and never rely on colour alone."],
          q: [
            ["Blue and orange are an example of which harmony?", ["Analogous", "Complementary", "Monochromatic", "Triadic"], 1, "They sit opposite each other on the colour wheel."],
            ["What minimum contrast ratio does WCAG recommend for normal text?", ["1.5:1", "3:1", "4.5:1", "10:1"], 2, "WCAG AA requires 4.5:1 for normal-size text."],
            ["Adding white to a hue creates a…", ["Shade", "Tint", "Tone", "Complement"], 1, "Tints are lighter versions; shades add black."],
          ],
        },
      ],
    },
    {
      t: "Type and Layout",
      s: "Setting readable, expressive type, organising pages and screens with grids, and working with images.",
      ls: [
        {
          t: "Typography Basics",
          f: "Choose typefaces and set type with clear hierarchy and spacing",
          s: "Learn type classifications, how to pair fonts and how spacing makes text readable.",
          o: ["Distinguish serif, sans-serif, script and display type", "Set a type hierarchy for headings and body text", "Adjust leading, tracking and line length for readability"],
          x: `Most designs are mainly text, so **typography** — choosing and arranging type — is one of the most valuable skills in {topic}.

**Classifications**
- **Serif** (Times, Georgia, Merriweather): small strokes at the ends of letters; traditional, trustworthy, good for long reading in print.
- **Sans-serif** (Helvetica, Roboto, Inter): clean and modern; the default for screens and interfaces.
- **Script** (handwriting styles): elegant or personal — only for short display text.
- **Display** (decorative): high personality, for headlines and logos only.

**Pairing.** One typeface family with several weights is often enough. If you use two, pair contrasting ones — a serif heading with a sans-serif body — and never more than two or three in one design.

**Hierarchy.** Use size, weight and spacing to separate headings, subheadings and body text. A simple scale (for example 32 / 24 / 16 px) is clearer than many slightly different sizes.

**Spacing** decides readability:
- **Leading** (line spacing): about **1.4–1.6 ×** the font size for body text.
- **Line length**: roughly **45–75 characters** per line; longer lines tire the eye.
- **Tracking** (letter spacing) adjusts whole words; **kerning** adjusts the space between specific pairs of letters, which matters most in logos and large headlines.

Body text should be at least 16 px on screens. Left-aligned text is usually easier to read than fully justified text, which creates uneven gaps.`,
          c: [
            ["Serif vs sans-serif", "Typefaces with or without small finishing strokes at the ends of letters."],
            ["Leading", "The vertical space between lines of text."],
            ["Kerning", "Adjusting the space between two specific letters."],
          ],
          e: {
            t: "Making an article readable",
            s: "A blog post uses a 12 px script font, 1.0 line spacing and lines 120 characters long.",
            st: ["Replace the script font with a sans-serif at 16–18 px for body text", "Set line spacing to about 1.5", "Limit the text column so lines are about 60–70 characters, and use a bold serif for headings"],
            so: "The article becomes comfortable to read for long periods, and the serif headings give clear contrast with the body text.",
          },
          a: ["Reports, posters and presentations", "Website and app interfaces"],
          m: [["Using decorative fonts for body text", "Keep script and display fonts for short headlines only."], ["Using too many typefaces", "Use one family or a single contrasting pair."]],
          tip: ["Set body text first; build heading sizes from it."],
          k: ["Serif, sans-serif, script and display fonts each have a role.", "Hierarchy comes from size, weight and spacing.", "Comfortable reading: 1.4–1.6 leading, 45–75 characters per line."],
          q: [
            ["What is leading?", ["Space between letters", "Space between lines", "The boldest weight", "A type of serif"], 1, "Leading is line spacing."],
            ["What line length is comfortable for body text?", ["10–20 characters", "45–75 characters", "120–150 characters", "Any length"], 1, "About 45–75 characters per line reads most comfortably."],
            ["Which fonts suit long body text on screens?", ["Script fonts", "Clean sans-serif fonts", "Decorative display fonts", "All caps fonts"], 1, "Sans-serifs are highly legible on screens."],
          ],
        },
        {
          t: "Grids and Layout",
          f: "Use margins, columns and grids to build consistent layouts",
          s: "Organise pages and screens with margins, columns and a consistent spacing system.",
          o: ["Explain margins, columns and gutters", "Lay out content on a column grid", "Use a consistent spacing scale"],
          x: `A **grid** is an invisible structure of columns and rows that holds a layout together. Grids make designs feel organised, speed up decisions and keep multi-page work consistent.

Parts of a grid:
- **Margins** — the space between the content and the edge of the page or screen.
- **Columns** — vertical divisions that content snaps to. A **12-column grid** is popular because it divides evenly into 2, 3, 4 and 6.
- **Gutters** — the gaps between columns.
- **Baseline grid** — horizontal lines that text sits on, so lines align across columns.

Elements may span several columns: a heading across all 12, an image across 8, a sidebar across 4. Breaking the grid occasionally — a photo bleeding off the edge — creates emphasis precisely *because* everything else follows it.

Use a **spacing scale** rather than random values: for example 4, 8, 16, 24, 32, 48 px. Consistent spacing is one of the clearest differences between amateur and professional layouts.

Layouts also follow reading patterns: viewers tend to scan text-heavy pages in an **F-pattern** and simpler pages in a **Z-pattern**, so place the most important content along those paths.

On screens, grids must be **responsive**: a 12-column desktop layout might become 4 columns on a phone, with elements stacking vertically. Most design tools, including those used for {topic}, let you set up column guides — use them from the start.`,
          c: [
            ["Gutter", "The space between columns in a grid."],
            ["12-column grid", "A flexible grid that divides evenly into halves, thirds, quarters and sixths."],
            ["Spacing scale", "A fixed set of spacing values used consistently throughout a design."],
          ],
          e: {
            t: "A magazine-style page",
            s: "Lay out a page with a headline, a large photo, body text and a quote.",
            st: ["Set up 12 columns with 20 px gutters and generous margins", "Headline spans 12 columns; photo spans 8; body text runs in two 4-column blocks; the quote sits in the remaining 4", "Use only spacing values from the scale (16 / 24 / 48 px) between blocks"],
            so: "Every element lines up on shared column edges and the spacing rhythm is consistent, so the page looks balanced and professional.",
          },
          a: ["Magazines, brochures and reports", "Websites and app screens"],
          m: [["Placing elements by eye with random gaps", "Use column guides and a spacing scale."], ["Margins that are too small", "Generous margins make content feel calmer and more premium."]],
          tip: ["Turn your guides on, then turn them off to judge the overall balance."],
          k: ["Grids = margins, columns and gutters (often 12 columns).", "A spacing scale keeps layouts consistent.", "Design for reading patterns and responsive screens."],
          q: [
            ["What is a gutter in a layout grid?", ["The outer page edge", "The space between columns", "A heading style", "A colour swatch"], 1, "Gutters separate columns."],
            ["Why is a 12-column grid popular?", ["It is required by printers", "It divides evenly into 2, 3, 4 and 6", "It uses less space", "It only works for websites"], 1, "Twelve divides into many common layouts."],
            ["What is the benefit of a spacing scale?", ["Larger files", "Consistent, professional spacing", "More colours", "Faster printing"], 1, "Reusing set values creates a visual rhythm."],
          ],
        },
        {
          t: "Working with Images",
          f: "Choose raster or vector formats, resolution and file types correctly",
          s: "Understand raster vs vector graphics, resolution, image formats and basic photo editing.",
          o: ["Explain raster vs vector images", "Choose the right resolution for print and screen", "Pick appropriate file formats"],
          x: `Images come in two fundamentally different kinds.

**Raster images** (photos, digital paintings) are grids of pixels. They capture rich detail but **lose quality when enlarged** — pixels become visible. Edited in tools such as Photoshop or GIMP.

**Vector graphics** (logos, icons, illustrations) are made of mathematical paths. They **scale to any size without losing sharpness** and have small file sizes. Created in Illustrator, Inkscape, Figma or Affinity Designer. Logos should always be designed as vectors.

**Resolution**
- Screen: what matters is the pixel dimensions (e.g. 1920 × 1080); export at 2× for sharp display on high-density screens.
- Print: **300 PPI** (pixels per inch) at the final printed size is the standard. A 10 × 15 cm photo needs roughly 1181 × 1772 pixels.

**File formats**
- **JPG** — photos; small files, lossy compression, no transparency.
- **PNG** — graphics with sharp edges or transparency; lossless.
- **WebP / AVIF** — modern web formats, smaller than JPG/PNG.
- **SVG** — vector graphics for the web.
- **PDF** — print-ready documents and vector artwork.

Basic editing — cropping for composition (the *rule of thirds*), adjusting exposure and colour, and **non-destructive** methods such as adjustment layers and masks — lets you improve images in {topic} while keeping the original recoverable. Always respect copyright: use your own photos, licensed stock, or free-licence sources, and credit where required.`,
          c: [
            ["Raster vs vector", "Pixel-based images that blur when enlarged vs path-based graphics that scale perfectly."],
            ["300 PPI", "The standard resolution for high-quality print at final size."],
            ["Non-destructive editing", "Editing with layers and masks so the original image can always be recovered."],
          ],
          e: {
            t: "Preparing one logo for every use",
            s: "A client needs their logo for a website, a social profile and a large banner.",
            st: ["Keep the master logo as a vector file (AI/SVG/PDF)", "Export SVG for the website and a PNG with transparency for social media", "Send the vector PDF to the printer for the banner"],
            so: "Because the master is vector, the banner prints perfectly sharp at any size, and each platform gets the format it handles best.",
          },
          a: ["Preparing photos for print and the web", "Delivering logos and icons in the right formats"],
          m: [["Enlarging a small raster logo for print", "Rebuild or source the logo as a vector."], ["Saving graphics with text as JPG", "Use PNG or SVG for sharp edges and transparency."]],
          tip: ["Keep an untouched copy of every original image before editing."],
          k: ["Raster = pixels (photos); vector = paths (logos, icons).", "Print at 300 PPI; screens care about pixel dimensions.", "JPG for photos, PNG for transparency, SVG for vectors, PDF for print."],
          q: [
            ["Which type of graphic scales to any size without losing quality?", ["JPG photo", "Raster", "Vector", "Screenshot"], 2, "Vectors are mathematical paths, not pixels."],
            ["What resolution is standard for print?", ["72 PPI", "150 PPI", "300 PPI", "1000 PPI"], 2, "300 PPI at final size gives crisp print quality."],
            ["Which format supports transparency and lossless quality?", ["JPG", "PNG", "BMP", "GIF only"], 1, "PNG is lossless and supports transparency."],
          ],
        },
      ],
    },
    {
      t: "Professional Practice",
      s: "Working from a brief through to final files: the design process, branding, and production for print and screen.",
      ls: [
        {
          t: "The Design Process",
          f: "Move from a client brief through research, sketches and feedback to a final design",
          s: "Follow a professional process — brief, research, ideation, refinement and feedback — instead of guessing.",
          o: ["Interpret a design brief", "Generate and refine ideas through sketching", "Give and use structured feedback"],
          x: `Professional designers rarely start in software. They follow a **process** that makes good results repeatable.

**1. Brief.** Clarify the problem: *Who is the audience? What must the design achieve? What are the constraints* (sizes, deadline, budget, brand rules)? A good brief prevents most later revisions. If the client has not provided one, ask these questions and write it down.

**2. Research.** Look at competitors and the wider category, collect references in a **mood board**, and note what works and what to avoid.

**3. Ideation.** Sketch many quick thumbnails on paper — quantity first. Twenty rough ideas in twenty minutes beat one polished first idea, because your first idea is usually the most obvious.

**4. Development.** Choose the strongest two or three concepts and build them in your tool ({topic} or another), applying the principles, colour and typography from earlier lessons.

**5. Feedback and iteration.** Present options with your reasoning, connected to the brief ("the bold red accent addresses the goal of standing out on crowded shelves"). Good feedback is specific and tied to goals — *"the price is hard to find"* — rather than personal taste. Revise, test, repeat.

**6. Delivery.** Supply final files in every needed format, organised and named clearly.

Treat critique as information about the work, not about you. Every revision cycle makes the design — and your skills — stronger.`,
          c: [
            ["Design brief", "A document defining the problem, audience, goals and constraints of a design project."],
            ["Mood board", "A collection of visual references that sets the style direction."],
            ["Iteration", "Repeatedly refining a design based on feedback and testing."],
          ],
          e: {
            t: "From brief to concepts for a café menu",
            s: "A café wants a new menu that feels 'cosy but modern' and is easy to read in dim light.",
            st: ["Write the brief: audience, goals (readability, cosy-modern), constraints (A4, printed)", "Build a mood board, then sketch 15 thumbnail layouts", "Develop the best 3 with a high-contrast palette and large, warm serif headings, then present them with reasons"],
            so: "The client chooses a concept quickly because each option is explained in terms of their goals, and only small revisions are needed.",
          },
          a: ["Freelance and agency projects", "College design assignments and competitions"],
          m: [["Jumping straight into software", "Sketch many ideas first — it is faster and more creative."], ["Feedback like 'I don't like it'", "Ask and answer: does it meet the brief? What specifically is not working?"]],
          tip: ["Write the project goal at the top of your artboard so every decision can be checked against it."],
          k: ["Brief → research → ideation → development → feedback → delivery.", "Sketch many ideas before refining any.", "Tie feedback and decisions to the brief."],
          q: [
            ["What should a design brief define?", ["Only the colours", "The problem, audience, goals and constraints", "The designer's fee only", "The final file names"], 1, "The brief frames the whole project."],
            ["Why sketch many thumbnails before using software?", ["Software is slow", "Quantity of ideas leads to better, less obvious solutions", "Clients require sketches", "It reduces file sizes"], 1, "Early ideas are often the most obvious; exploring widely finds better ones."],
            ["Which is the most useful feedback?", ["'I don't like it'", "'Make it pop'", "'The price is hard to find at a glance'", "'Use my favourite colour'"], 2, "Specific feedback tied to goals can be acted on."],
          ],
        },
        {
          t: "Branding and Visual Identity",
          f: "Design consistent brand identities with logos, colours and style guides",
          s: "Understand what a brand identity includes and how a style guide keeps it consistent.",
          o: ["Distinguish a brand from a logo", "List the parts of a visual identity", "Create a simple brand style guide"],
          x: `A **brand** is what people think and feel about an organisation. A **visual identity** is the set of design tools that shapes that perception — and the logo is only one of them.

A visual identity usually includes:
- **Logo** and its variations (full, icon-only, single-colour, light/dark versions)
- **Colour palette** with exact values (HEX/RGB for screen, CMYK/Pantone for print)
- **Typography** — the brand's heading and body typefaces
- **Imagery style** — photography, illustration, icons
- **Graphic elements** — patterns, shapes, layout conventions
- **Tone of voice** — how the brand writes

**Consistency builds recognition.** When every touchpoint — website, packaging, social posts, signage — uses the same system, people recognise the brand instantly and trust it more.

A **brand style guide** documents the rules so anyone can apply them correctly: logo clear space and minimum size, what *not* to do with the logo (stretching, recolouring, adding effects), colour codes, type sizes and examples of correct use.

Strong logos are **simple, memorable, scalable, relevant and timeless**: they work at favicon size and on a billboard, in one colour, and still feel right in ten years. Test any mark at very small sizes and in black and white before refining details.

For {topic} projects, think in systems: design the logo, colours and type together so they reinforce one personality.`,
          c: [
            ["Visual identity", "The system of logo, colours, typography and imagery that represents a brand."],
            ["Style guide", "A document of rules for applying a brand identity consistently."],
            ["Clear space", "The minimum empty area required around a logo."],
          ],
          e: {
            t: "A one-page style guide",
            s: "A student club has a new logo and needs volunteers to use it correctly.",
            st: ["Show the primary logo, icon version and single-colour versions", "List two brand colours with HEX and CMYK values and one typeface pair", "Add clear-space and minimum-size rules plus three 'don'ts' (stretching, recolouring, adding shadows)"],
            so: "Volunteers can make posters and posts that all look like the same club, without the designer checking every file.",
          },
          a: ["Start-up and small-business branding", "College clubs, events and personal brands"],
          m: [["Treating the logo as the whole brand", "Design the colour, type and imagery system too."], ["Logos that only work large and in colour", "Test small sizes and one-colour versions early."]],
          tip: ["Look at your logo at 16 × 16 pixels — if it is unrecognisable, simplify it."],
          k: ["A brand is perception; a visual identity is the design system behind it.", "Consistency across touchpoints builds recognition and trust.", "Style guides document the rules; good logos are simple and scalable."],
          q: [
            ["Which is true about a brand and a logo?", ["They are the same thing", "A logo is one part of a wider brand identity", "A brand is just colours", "A logo replaces a style guide"], 1, "The logo is one element of a broader identity system."],
            ["What does a brand style guide contain?", ["Only the company history", "Rules for using the logo, colours, typography and imagery", "Employee contracts", "Product prices"], 1, "It documents how to apply the identity consistently."],
            ["Which quality matters most for a logo used from favicons to billboards?", ["Complex detail", "Scalability and simplicity", "Many colours", "Gradient effects"], 1, "Simple, scalable marks stay recognisable at any size."],
          ],
        },
        {
          t: "Preparing Files for Print and Screen",
          f: "Set colour modes, bleed, resolution and export settings for final delivery",
          s: "Deliver production-ready files: colour modes, bleed and margins, fonts, and export settings.",
          o: ["Choose RGB or CMYK correctly", "Set up bleed, trim and safe areas for print", "Export and organise final files"],
          x: `A great design can still fail at the final step if the files are prepared incorrectly.

**Colour modes**
- **RGB** (red, green, blue light) — for screens. Wide, bright colour range.
- **CMYK** (cyan, magenta, yellow, black ink) — for printing. Some bright RGB colours cannot be printed and will look duller, so convert and check colours *before* sending print files. Brand colours are often specified as Pantone spot colours for exact matching.

**Print set-up**
- **Trim** — the final cut size.
- **Bleed** — artwork that extends beyond the trim (usually **3 mm**, or 0.125 in) so no white edges appear if the cut is slightly off.
- **Safe area** — keep important text and logos at least 3–5 mm *inside* the trim.
- Images at **300 PPI**; fonts **embedded** or converted to outlines; export a **print-ready PDF** (for example PDF/X) with crop marks if the printer asks.

**Screen export**
- Export at the exact pixel sizes each platform needs, often at 2× for sharp high-density displays.
- Compress images (WebP/JPG for photos, PNG/SVG for graphics) to keep pages fast.

**Organise delivery**: clear file names (\`brand-logo-primary-rgb.svg\`), folders for print and screen, and a short note explaining which file to use where.

Before delivering any {topic} project, run a **preflight check**: spelling, colour mode, resolution, bleed, fonts and links. Order a printed proof for important print jobs — screens do not show how ink will look on paper.`,
          c: [
            ["RGB vs CMYK", "Light-based colour for screens vs ink-based colour for print."],
            ["Bleed", "Artwork extending beyond the trim edge (often 3 mm) to avoid white edges after cutting."],
            ["Preflight", "A final technical check of files before printing or publishing."],
          ],
          e: {
            t: "Sending a flyer to the printer",
            s: "An A5 flyer designed in RGB, with a background photo touching the edges, must be printed.",
            st: ["Set the document to A5 with 3 mm bleed and extend the background photo into the bleed", "Convert to CMYK, check that brand colours still look right, and keep text 5 mm inside the trim", "Check images are 300 PPI, embed fonts and export a print-ready PDF with crop marks"],
            so: "The printed flyer has no white slivers at the edges, colours match expectations, and no text is cut off.",
          },
          a: ["Printing posters, flyers and business cards", "Delivering assets for websites and social media"],
          m: [["Sending RGB files for print without checking", "Convert to CMYK and review colours before sending."], ["Forgetting bleed", "Extend backgrounds 3 mm beyond the trim."]],
          tip: ["Ask the printer for their exact specifications before you start the layout."],
          k: ["RGB for screens, CMYK for print.", "Print files need bleed, safe margins, 300 PPI and embedded fonts.", "Name and organise final files and run a preflight check."],
          q: [
            ["Which colour mode is used for printing?", ["RGB", "CMYK", "HEX", "HSL"], 1, "Printers use cyan, magenta, yellow and black inks."],
            ["What is bleed?", ["Faded colours", "Artwork extending beyond the trim edge", "Blurry images", "Overlapping text"], 1, "Bleed prevents white edges when the paper is cut."],
            ["How far beyond the trim does bleed usually extend?", ["0.1 mm", "3 mm", "3 cm", "10 cm"], 1, "3 mm (about 0.125 in) is the common standard."],
          ],
        },
      ],
    },
  ],
};
