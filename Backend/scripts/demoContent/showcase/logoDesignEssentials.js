module.exports = {
  match: "Logo Design Essentials",
  pt: "design-task",
  d: "Learn to design logos the way professionals do. You will study what makes a logo effective and the main types of logo, write a design brief and research a brand, sketch and develop concepts, use shape, negative space, colour and type, build clean vector artwork, test logos at every size and in one colour, and present and deliver a complete logo package.",
  sk: ["Logo design", "Design briefs", "Sketching and ideation", "Shape and negative space", "Colour and typography", "Vector construction", "Brand presentation"],
  out: [
    "Explain what makes a logo simple, memorable and versatile",
    "Write a design brief and research a brand and its competitors",
    "Generate and develop logo concepts from sketches",
    "Build clean, scalable vector logos and test them in real conditions",
    "Present concepts and deliver a professional logo file package",
  ],
  mods: [
    {
      t: "Logo Foundations",
      s: "What a logo is for, the different types of logo, and how a brief and research shape the work.",
      ls: [
        {
          t: "What Makes a Logo Effective",
          f: "Understand the purpose of a logo and the qualities of effective logos",
          s: "Learn what a logo actually does and the five qualities shared by effective logos.",
          o: ["Explain the role of a logo within a brand", "Describe the qualities of effective logos", "Evaluate existing logos against those qualities"],
          x: `A **logo** is a symbol or wordmark that **identifies** an organisation. It is not the whole brand — the brand is what people think and feel about the organisation — but it is the most visible and repeated point of contact: on signs, apps, packaging, uniforms and social media.

A logo's main job is **identification**, not explanation. Few famous logos literally show what the company does: Apple does not sell apples, and Nike's swoosh is not a shoe. Meaning grows through years of association with the company's products and behaviour.

**Effective logos share five qualities:**
1. **Simple** — few elements, easy to recognise in a fraction of a second.
2. **Memorable** — distinctive enough that people can recall and roughly sketch it.
3. **Versatile** — works in full colour, in one colour, in reverse (white on dark), on screens and in print.
4. **Scalable** — readable as a 16 px favicon and on a billboard.
5. **Appropriate** — the style fits the audience and industry: a children's toy shop and a law firm need very different personalities.

A sixth quality, **timelessness**, comes from avoiding trends that date quickly (heavy gradients, drop shadows, fashionable effects).

**Evaluate logos critically:** shrink a logo to a tiny size, convert it to black only, and look at it for one second. If the core idea survives, it is strong. If it depends on fine detail, gradients or small text, it will fail in many real uses.

Designing a logo is therefore an exercise in **reduction** — finding the simplest form that is still distinctive.`,
          c: [
            ["Logo vs brand", "The logo is an identifying mark; the brand is the overall perception of the organisation."],
            ["Versatility", "A logo's ability to work in colour, one colour, reverse, print and screen."],
            ["Scalability", "Remaining recognisable from tiny icon sizes to very large formats."],
          ],
          e: {
            t: "The one-second test",
            s: "Evaluate a café logo featuring a detailed illustration of a cup with steam, a gradient and a slogan in small script.",
            st: ["Shrink it to 32 px: the steam and slogan disappear and the cup becomes a blob", "Convert it to black only: the gradient-based details vanish", "Look for one second: there is no single distinctive idea to remember"],
            so: "The logo fails on simplicity, scalability and versatility; a redesign should keep one clear idea (perhaps the cup silhouette) and remove the slogan and gradient.",
          },
          a: ["Assessing a client's existing logo", "Setting goals before designing a new one"],
          m: [["Trying to show everything the company does", "Focus on one clear, distinctive idea."], ["Relying on gradients and fine detail", "Make sure the logo works in flat, single colour."]],
          tip: ["Ask friends to sketch a famous logo from memory — notice how simple the ones they remember are."],
          k: ["A logo identifies; meaning grows through association.", "Effective logos are simple, memorable, versatile, scalable and appropriate.", "Test logos small, in one colour and at a glance."],
          q: [
            ["What is the primary job of a logo?", ["To explain everything a company does", "To identify the organisation", "To display a slogan", "To show product photos"], 1, "Logos are primarily identifiers."],
            ["Which quality means a logo works as a tiny favicon and a billboard?", ["Appropriateness", "Scalability", "Complexity", "Trendiness"], 1, "Scalable logos remain recognisable at any size."],
            ["Why avoid trendy effects such as heavy gradients?", ["They are illegal", "They date quickly and often fail in one-colour use", "They cannot be used on websites", "They make logos too simple"], 1, "Trends date fast, and effects often fail in single-colour or small use."],
          ],
        },
        {
          t: "Types of Logos",
          f: "Distinguish wordmarks, lettermarks, symbols, combination marks and emblems",
          s: "Compare the main logo types and choose the right one for a client.",
          o: ["Identify the main types of logos", "Describe the strengths and limits of each", "Choose a logo type for a given brief"],
          x: `Logos come in a handful of standard types. Choosing the right type is one of the first strategic decisions.

**1. Wordmark (logotype)** — the name set in distinctive type: Google, Coca-Cola, FedEx. Best when the name is **short and distinctive** and the business needs name recognition. Typography and custom lettering do all the work.

**2. Lettermark (monogram)** — initials: IBM, HP, CNN. Useful for **long names** (International Business Machines) but needs time and exposure to become meaningful.

**3. Pictorial mark (symbol)** — a recognisable image: the Apple apple, the Twitter/X bird. Powerful and language-independent, but a new company's symbol alone means little until people associate it with the name.

**4. Abstract mark** — a non-literal shape: the Nike swoosh, the Pepsi globe. Can express an idea or feeling (movement, unity) and is very ownable, but again needs exposure.

**5. Combination mark** — symbol + wordmark together: Adidas, Burger King, Mastercard. The most flexible choice for **new businesses**: the name builds recognition while the symbol grows in meaning, and the two parts can later be used separately (the symbol as an app icon, the wordmark on letterheads).

**6. Emblem** — text inside a shape or badge: Starbucks (classic), Harley-Davidson, university crests. Traditional and authoritative, but detailed emblems can struggle at small sizes.

**Mascots** — illustrated characters — are a further type used by food, sports and gaming brands.

**Choosing:** consider the name's length, the need for an icon (apps, social media), the industry's conventions (and whether to follow or break them), and the budget for building recognition. For most new small businesses and start-ups, a **combination mark with a simple symbol** is the safest and most versatile choice.`,
          c: [
            ["Wordmark", "A logo made purely of the brand name in distinctive type."],
            ["Combination mark", "A symbol and wordmark used together, often separable."],
            ["Emblem", "Text enclosed within a shape or badge."],
          ],
          e: {
            t: "Choosing a logo type for a start-up",
            s: "'Krishna Agro Fresh Distribution Services', a new produce delivery start-up, needs a logo for its app, trucks and invoices.",
            st: ["The full name is long — shorten the brand to 'KrishnaFresh' or use initials 'KF' for compact uses", "The app needs a strong square icon, so a symbol is required", "Choose a combination mark: a simple leaf/box symbol plus the 'KrishnaFresh' wordmark, usable separately"],
            so: "A combination mark gives name recognition on trucks and invoices while the symbol alone works as the app icon.",
          },
          a: ["Choosing a logo direction with a client", "Planning logo variations for different uses"],
          m: [["Using a complex emblem where tiny sizes are needed", "Plan a simplified symbol or icon version."], ["Choosing an abstract mark for an unknown start-up with no budget", "Combine it with the name until people recognise it."]],
          tip: ["List every place the logo will appear before deciding on its type."],
          k: ["Main types: wordmark, lettermark, pictorial, abstract, combination, emblem.", "Combination marks are the most flexible for new brands.", "Choose by name length, icon needs and industry context."],
          q: [
            ["A logo consisting only of the brand name in custom type is a…", ["Lettermark", "Wordmark", "Emblem", "Abstract mark"], 1, "Wordmarks are the name set as the logo."],
            ["Which type is often best for a new business that needs an app icon and name recognition?", ["Lettermark only", "Combination mark", "Detailed emblem", "Mascot only"], 1, "Name and symbol together, usable separately."],
            ["IBM's logo, made of initials, is an example of a…", ["Lettermark", "Pictorial mark", "Emblem", "Combination mark"], 0, "Initials form a lettermark (monogram)."],
          ],
        },
        {
          t: "The Design Brief and Research",
          f: "Write a logo brief and research the brand, audience and competitors",
          s: "Gather the information that makes logo decisions strategic rather than guesswork.",
          o: ["Write a logo design brief", "Research competitors and the market", "Define brand attributes and a mood board"],
          x: `Most failed logo projects fail at the start: the designer did not understand the problem. A **brief** and **research** fix that.

**The logo brief** — agree it with the client in writing:
- **About the organisation:** what it does, its story and values.
- **Audience:** who the customers are (age, location, needs).
- **Brand attributes:** three to five words describing the desired personality — for example *trustworthy, modern, warm*. Also ask what the brand is **not** (not "corporate", not "childish").
- **Competitors:** who they are and how the client wants to differ.
- **Applications:** where the logo will be used — app icon, signage, uniforms, packaging, social media.
- **Practical constraints:** name and any tagline, required colours, budget, timeline, file formats.

**Research:**
1. **Competitor audit** — collect competitors' logos on one page. Look for patterns in colour, type and symbols. If every competitor uses blue and a shield, a different direction could stand out (or you may deliberately follow convention to signal trust).
2. **Audience and context** — what do customers expect? Where will they see the logo?
3. **Meanings and associations** — check that colours, symbols and names carry the right meanings for the audience and culture, and that the name and initials do not form unfortunate words.
4. **Mood board** — gather images, colours, textures and type that express the brand attributes, and confirm the direction with the client *before* designing.

Turn the research into a short **design direction**: "A friendly, modern combination mark; avoid the blue shields used by competitors; warm orange accent; rounded geometric type." Every later decision can be checked against this.`,
          c: [
            ["Design brief", "A written agreement on the organisation, audience, goals, applications and constraints."],
            ["Brand attributes", "Three to five words describing the personality the logo should express."],
            ["Competitor audit", "Collecting and analysing competitors' logos to find patterns and opportunities."],
          ],
          e: {
            t: "A competitor audit for a fitness studio",
            s: "A new yoga and fitness studio wants to feel calm and welcoming, not aggressive.",
            st: ["Collect 12 local fitness logos: most use black and red, heavy italic type and dumbbells", "Brand attributes agreed: calm, welcoming, balanced; not aggressive", "Direction: soft natural colours, light rounded type and a simple balanced symbol instead of gym equipment"],
            so: "The audit shows how to stand apart from aggressive gym branding, and the agreed direction gives clear criteria for judging concepts.",
          },
          a: ["Freelance logo projects", "Rebranding an existing business"],
          m: [["Starting to design without a written brief", "Agree the brief and attributes in writing first."], ["Copying competitors' styles", "Use the audit to find a distinctive position."]],
          tip: ["Ask the client which logos they admire and dislike — and why."],
          k: ["A written brief defines audience, attributes, applications and constraints.", "Competitor audits reveal conventions and opportunities.", "A mood board and design direction set criteria before designing."],
          q: [
            ["What are 'brand attributes' in a logo brief?", ["The file formats", "Words describing the desired personality", "The price of the project", "The competitors' names"], 1, "They define how the brand should feel."],
            ["What is the main purpose of a competitor audit?", ["To copy the best logo", "To see conventions and find ways to stand out", "To reduce the budget", "To choose file formats"], 1, "It reveals patterns and positioning opportunities."],
            ["When should the mood-board direction be confirmed with the client?", ["After final delivery", "Before designing concepts", "Never", "Only if the client complains"], 1, "Agreeing direction early prevents wasted work."],
          ],
        },
      ],
    },
    {
      t: "Designing the Logo",
      s: "Generating ideas through sketching, using shape and negative space, and choosing colour and type.",
      ls: [
        {
          t: "Sketching and Ideation",
          f: "Generate many logo ideas through mind maps and thumbnail sketches",
          s: "Generate a wide range of ideas quickly before committing to any one direction.",
          o: ["Create a word list and mind map from the brief", "Produce many quick thumbnail sketches", "Select the strongest concepts for development"],
          x: `The first idea is rarely the best — it is usually the most **obvious**, which means competitors have probably had it too. Good designers generate **many** ideas before choosing.

**1. Word lists and mind maps.** Write the brand name in the centre of a page and branch out with associated words: services, values, benefits, emotions, local references, shapes. For a bakery: *bread, wheat, oven, warmth, morning, family, rise, round, hands, tradition*. Combining two unrelated words often sparks the most original ideas ("rise" + "sun" → a loaf shaped like a rising sun).

**2. Thumbnail sketches.** With pencil and paper, draw **small, fast** sketches — 2–3 cm each, 30 seconds to a minute. Aim for **30–50 thumbnails** in a session. Small size forces simplicity and stops you polishing details too early. Explore:
- Different logo types (wordmark, symbol, combination)
- Literal and abstract interpretations
- Letterforms of the initials, and how they might combine with a symbol

**3. Quantity before quality.** Do not judge while sketching; judging stops the flow of ideas. Silly ideas often lead to good ones.

**4. Select.** Afterwards, review all the sketches against the brief and brand attributes. Circle the **three to five** most promising, distinctive and simple ideas. Combine or refine them with slightly larger, more careful sketches.

Only then move to the computer. Software is excellent for refining, but it encourages early perfection and limits exploration; paper is faster for thinking.`,
          c: [
            ["Mind map", "A diagram branching associated words and ideas from a central topic."],
            ["Thumbnail sketch", "A very small, quick drawing used to explore many ideas rapidly."],
            ["Ideation", "The process of generating a wide range of ideas before selecting any."],
          ],
          e: {
            t: "Thirty thumbnails for a bakery",
            s: "Generate ideas for 'Sunrise Bakery'.",
            st: ["Mind map: sun, morning, rise, wheat, oven, warmth, round, loaf, smile", "Sketch 30 thumbnails in 20 minutes: loaf + rising sun, wheat rays, an S formed from dough, a smiling bun…", "Circle the 4 strongest against the brief: warm, simple, distinctive"],
            so: "The 'loaf rising like the sun' idea stands out: it is simple, warm and specific to the bakery's name, and it came from combining two words on the mind map.",
          },
          a: ["Any logo or icon project", "Brainstorming visual ideas in teams"],
          m: [["Going straight to the computer", "Sketch many small ideas on paper first."], ["Stopping at the first good idea", "Keep sketching to 30+ ideas before choosing."]],
          tip: ["Set a timer for 20 minutes and do not stop drawing until it rings."],
          k: ["Mind maps generate associations; combining words sparks originality.", "Sketch 30–50 tiny thumbnails quickly, without judging.", "Select 3–5 concepts against the brief before using software."],
          q: [
            ["Why sketch many thumbnails before choosing an idea?", ["To fill a sketchbook", "Early ideas are often obvious; quantity leads to better ideas", "Clients pay per sketch", "Software requires it"], 1, "Exploring widely finds less obvious, stronger solutions."],
            ["Why should thumbnails be small?", ["To save paper", "Small size forces simplicity and speed", "They look neater", "They are easier to scan"], 1, "Tiny sketches prevent premature detail."],
            ["What should you do while generating ideas?", ["Judge each idea immediately", "Defer judgement and keep going", "Only draw the client's idea", "Use only colour"], 1, "Judging too early stops idea generation."],
          ],
        },
        {
          t: "Shape, Simplicity and Negative Space",
          f: "Use geometric construction, simplification and negative space in logo marks",
          s: "Refine concepts into strong, simple marks using shape psychology, geometry and negative space.",
          o: ["Use shape associations deliberately", "Simplify a mark while keeping its idea", "Use negative space to add a second meaning"],
          x: `Once you have chosen concepts, refining the **shape** is where a logo becomes strong.

**Shape psychology** — basic shapes carry associations:
- **Circles** — community, unity, warmth, completeness.
- **Squares and rectangles** — stability, reliability, structure.
- **Triangles** — direction, energy, progress (pointing up) or tension.
- **Organic curves** — natural, friendly, human.
- **Sharp angles** — dynamic, technical, bold.

**Simplify ruthlessly.** Remove every detail that does not support the idea. Ask: *could it still be recognised if this part were removed?* Reduce the number of shapes, colours and line weights. Strong marks often consist of only two or three shapes.

**Geometric construction.** Many professional logos are built on circles, grids and consistent angles. Constructing curves from circles of related sizes and keeping stroke widths consistent makes marks feel balanced and deliberate, even if the viewer never notices the underlying geometry.

**Negative space** — the empty space inside and around a mark — can carry a **second meaning**. Famous examples: the arrow hidden between the E and x of FedEx, or the two profiles forming a vase. Negative space makes a logo memorable and rewards a second look, but the idea must still be clear at small sizes.

**Optical adjustments.** Geometrically correct shapes can *look* wrong: circles look smaller than squares of the same height, so they extend slightly beyond the guides (*overshoot*); horizontal strokes look thicker than vertical ones of the same weight. Trust your eye and adjust.

Check refined marks at **16 px, in black only** and **reversed out** of a dark background at every stage.`,
          c: [
            ["Shape psychology", "The common associations of shapes, such as circles with unity and triangles with direction."],
            ["Negative space", "Empty space within or around a mark that can form a second image."],
            ["Optical overshoot", "Extending round shapes slightly beyond guides so they look the same size as straight-edged shapes."],
          ],
          e: {
            t: "Simplifying a mountain logo",
            s: "A trekking company's sketch shows three mountains, trees, a river, a sun and a tent.",
            st: ["Identify the core idea: adventure in the mountains", "Reduce to one bold mountain triangle, with the river as a curve of negative space through it", "Check it at 16 px and in one colour; adjust the curve so it stays visible"],
            so: "A single triangular mountain with a negative-space river reads instantly at small sizes and is far more memorable than the original scene.",
          },
          a: ["Symbols and app icons", "Simplifying existing logos in a rebrand"],
          m: [["Adding detail to make a logo 'richer'", "Remove elements until only the idea remains."], ["Negative-space ideas that vanish at small sizes", "Exaggerate the negative shape and test it small."]],
          tip: ["Fill your mark in solid black — if the silhouette alone is recognisable, the shape is strong."],
          k: ["Shapes carry associations; use them deliberately.", "Simplify to the fewest shapes that keep the idea.", "Negative space can add a memorable second meaning."],
          q: [
            ["Which shape is most associated with stability and reliability?", ["Circle", "Square", "Triangle", "Spiral"], 1, "Squares and rectangles suggest structure and stability."],
            ["What is negative space in a logo?", ["Unused budget", "Empty space that can form a second image", "Dark colours", "The background colour only"], 1, "The space around and within shapes can carry meaning."],
            ["Why do circles often extend slightly beyond alignment guides?", ["Printing errors", "Optically they look smaller than squares of the same size", "To save space", "They are drawn freehand"], 1, "Overshoot corrects an optical illusion."],
          ],
        },
        {
          t: "Colour and Typography in Logos",
          f: "Choose logo colours and typefaces, and customise lettering",
          s: "Select colours and type that express the brand and work in every application.",
          o: ["Choose a logo colour palette for meaning and versatility", "Select and customise typefaces for a wordmark", "Balance the symbol and wordmark in a combination mark"],
          x: `**Design in black and white first.** A logo must work without colour, so decide the shape first and add colour last. Colour then becomes a powerful layer of meaning and recognition.

**Choosing colour:**
- Use **one or two** main colours; most iconic logos use one.
- Consider **associations** in context and culture: blue — trust and calm (banks, tech); green — nature, growth, health; red — energy, passion, urgency; orange — friendly, creative; purple — premium or imaginative; black — luxury and authority.
- **Differentiate** from competitors (the competitor audit helps).
- Specify colours for every medium: **HEX/RGB** for screens, **CMYK** for print and a **Pantone** spot colour for exact brand matching.
- Check **contrast**: the logo must stay readable on light and dark backgrounds — plan a reversed (white) version.

**Typography for wordmarks:**
- Choose a typeface whose personality matches the brand attributes (refined serif, friendly rounded sans, strong geometric…).
- Then **customise** it so the wordmark is unique: adjust kerning carefully (logos need precise optical spacing), modify a letter (a cut, a ligature joining two letters, a distinctive terminal), or draw custom lettering.
- Avoid very thin weights and tight details that disappear at small sizes, and check the font's licence allows use in a logo.

**Combination marks:** balance the symbol and the wordmark visually — neither should overpower the other. Align them carefully (centre or baseline alignment), match line weights where possible, and give them consistent spacing. Design a **horizontal** and a **stacked** version for wide and square spaces.

Finally, test colour versions on real backgrounds — a photo, a dark app header, a kraft-paper bag — not just on white.`,
          c: [
            ["Black-and-white first", "Designing the logo's form without colour so it works in all applications."],
            ["Custom wordmark", "A brand name set in type and modified (kerning, ligatures, letter changes) to be unique."],
            ["Lockup", "A fixed arrangement of symbol and wordmark, such as horizontal or stacked."],
          ],
          e: {
            t: "Colour and type for 'Sunrise Bakery'",
            s: "The loaf-sun symbol is finished in black; now add colour and a wordmark.",
            st: ["Choose a warm golden orange (energy, warmth, morning) and a deep brown (bread, trust) as the palette", "Set 'Sunrise' in a friendly rounded sans, then join the 'r' and 'i' with a subtle ligature and kern every pair by eye", "Create horizontal and stacked lockups, plus white versions for dark backgrounds"],
            so: "The bakery has a warm, consistent identity with colour specified for print and screen, a unique wordmark and lockups for every space.",
          },
          a: ["Brand identities for new businesses", "Refreshing a dated wordmark"],
          m: [["Choosing colour before the shape works", "Finalise the logo in black and white first."], ["Using a font unchanged and unkerned", "Customise and carefully kern the wordmark."]],
          tip: ["Check that your logo still works if a printer can only use one colour."],
          k: ["Design in black and white, then add one or two meaningful colours.", "Specify HEX/RGB, CMYK and Pantone; plan reversed versions.", "Customise and kern wordmarks; balance symbol and type in lockups."],
          q: [
            ["Why design a logo in black and white first?", ["Colour is expensive", "The form must work without colour in many applications", "Clients prefer grey", "Software requires it"], 1, "A logo must work in single colour and reverse."],
            ["Which colour specification is used for exact brand-colour matching in print?", ["HEX", "RGB", "Pantone", "HSL"], 2, "Pantone spot colours give consistent print matching."],
            ["What is a lockup?", ["A password for files", "A fixed arrangement of symbol and wordmark", "A type of font licence", "A colour mode"], 1, "Lockups define how logo parts are combined."],
          ],
        },
      ],
    },
    {
      t: "Finishing and Delivering",
      s: "Building clean vector artwork, testing the logo in real conditions, and presenting and delivering it professionally.",
      ls: [
        {
          t: "Building Clean Vector Artwork",
          f: "Construct logos as clean vectors with precise paths and geometry",
          s: "Turn the chosen concept into precise, scalable vector artwork.",
          o: ["Explain why logos must be vectors", "Build clean paths with minimal anchor points", "Outline text and organise the final artwork"],
          x: `A logo must be a **vector** graphic so it can be scaled to any size without losing quality — from a pen to the side of a building. Build it in a vector tool such as Adobe Illustrator, Affinity Designer, Inkscape (free) or Figma.

**From sketch to vector:**
1. **Scan or photograph** the best sketch and place it as a locked template layer at low opacity.
2. **Rebuild — don't trace automatically.** Auto-trace creates messy paths with hundreds of points. Instead, construct the mark from **basic shapes** (circles, rectangles, polygons) combined with the **Shape Builder / Pathfinder** tools, or draw with the **Pen tool**.
3. **Use as few anchor points as possible.** Place points at the extremes of curves (top, bottom, left, right) with smooth handles that are horizontal or vertical where possible. Fewer points give smoother curves and cleaner files.
4. **Keep geometry consistent:** repeated corner radii, consistent stroke widths and aligned elements make the mark feel precise. Use grids and guides.

**Finishing the artwork:**
- **Convert strokes to fills** (*Outline Stroke*) so line weights scale proportionally.
- **Convert text to outlines** in final logo files so the logo displays correctly on computers without the font (keep an editable version for yourself).
- **Merge overlapping shapes** into clean compound paths — no hidden shapes, stray points or overlapping duplicates.
- **Check alignment and optical balance** at large size, zooming in to catch tiny bumps or gaps.

Name layers and artboards clearly (primary, stacked, icon, mono). Clean construction is invisible when it is done well — but messy artwork causes problems for every printer, sign maker and developer who uses the logo later.`,
          c: [
            ["Anchor point", "A point on a vector path; fewer, well-placed points make smoother curves."],
            ["Outline stroke", "Converting a stroked line into a filled shape so it scales correctly."],
            ["Text to outlines", "Converting type into vector shapes so the logo no longer depends on the font."],
          ],
          e: {
            t: "Rebuilding a sketched lettermark",
            s: "A hand-drawn 'KF' monogram needs to become clean vector artwork.",
            st: ["Place the scan as a locked template at 30% opacity", "Rebuild the K from rectangles at consistent angles and the F from rectangles sharing the same stroke width; join them with Shape Builder", "Round all corners with one shared radius, then remove stray points and check at 1000% zoom"],
            so: "The monogram is made of a few clean shapes with consistent widths and radii, and it scales perfectly from an app icon to a shop sign.",
          },
          a: ["Final logo production", "Icon and symbol design"],
          m: [["Using auto-trace for final logos", "Rebuild with shapes and the Pen tool."], ["Leaving live text in delivered logo files", "Convert text to outlines in final versions."]],
          tip: ["Turn on Outline/Wireframe view to spot stray points and overlapping shapes."],
          k: ["Logos must be vectors.", "Rebuild from shapes with minimal, well-placed anchor points.", "Outline strokes and text, merge shapes, and check details closely."],
          q: [
            ["Why must a logo be created as a vector?", ["Vectors are colourful", "Vectors scale to any size without losing quality", "Vectors are smaller on paper", "Printers only accept vectors for photos"], 1, "Vector paths stay sharp at any size."],
            ["Why avoid automatic image tracing for final logos?", ["It is too slow", "It produces messy paths with many unnecessary points", "It removes colour", "It is not allowed"], 1, "Clean construction needs deliberate shapes and few points."],
            ["Why convert text to outlines in final logo files?", ["To make it bold", "So the logo displays correctly without the font installed", "To reduce colours", "To add effects"], 1, "Outlined text no longer depends on font files."],
          ],
        },
        {
          t: "Testing Logos in the Real World",
          f: "Test scalability, monochrome, reversal and real applications",
          s: "Stress-test the logo at every size, colour mode and application before finalising.",
          o: ["Test a logo at small and large sizes", "Test one-colour and reversed versions", "Create mock-ups of real applications"],
          x: `A logo that looks perfect on a white artboard can fail in real use. **Testing** before delivery finds problems while they are still cheap to fix.

**1. Size tests.**
- Shrink it to **16–32 px** (favicon, app icon, social avatar). Do thin lines disappear? Do letters fill in? Does the negative space close up?
- Many brands create a **simplified small-size version** — fewer details, thicker strokes — for tiny uses.
- Also view it very large: flaws in curves become obvious.

**2. Colour tests.**
- **Black only** (fax, newspapers, engraving) and **white only** (reversed out of photos and dark headers).
- **Greyscale** to check contrast between colours.
- On **busy photographic backgrounds** and on brand-coloured backgrounds.

**3. Shape and format tests.**
- Inside **circles and squares** (social profile crops, app icon masks).
- In **horizontal** spaces (website header) and **square** spaces — confirm your lockups cover both.

**4. Application mock-ups.** Place the logo on realistic mock-ups: shopfront signage, a T-shirt, a mobile app, a business card, packaging, a vehicle, a social post. Mock-ups also help clients imagine the logo in their world.

**5. Fresh eyes.** Show it to people unfamiliar with the project for a few seconds and ask what they remember and what it suggests. Check for unintended shapes or readings, and that it is clearly different from competitors (and from existing trademarks — a quick reverse-image search helps catch accidental similarity).

Record each problem found and the fix. Testing often leads to small but important refinements: thicker strokes, wider gaps, simpler icons.`,
          c: [
            ["Small-size test", "Viewing a logo at 16–32 px to check that details and negative space survive."],
            ["Reversed logo", "A white (or light) version used on dark or photographic backgrounds."],
            ["Mock-up", "A realistic image of the logo applied to products, signs or screens."],
          ],
          e: {
            t: "Testing a combination mark",
            s: "A bookshop logo has a thin-line book symbol and a delicate serif wordmark.",
            st: ["At 32 px the thin lines vanish and the wordmark is unreadable", "In white on a dark photo the delicate serifs break up", "Fix: thicken the strokes, create a simplified icon-only version for small sizes, and use a sturdier weight for the wordmark"],
            so: "After refinements the logo works as an app icon, on shop signage and reversed on photos — problems found in testing, not after printing 500 bags.",
          },
          a: ["Quality-checking logos before delivery", "Planning responsive logo systems"],
          m: [["Only viewing the logo large on white", "Test small, one-colour, reversed and on photos."], ["Skipping mock-ups", "Show the logo in realistic applications."]],
          tip: ["Make a single 'test sheet' artboard showing every size, colour and background together."],
          k: ["Test sizes, colours, backgrounds and crop shapes.", "Create simplified versions for tiny uses.", "Use mock-ups and fresh eyes before finalising."],
          q: [
            ["At what size should a logo's smallest-use test be done?", ["About 16–32 px", "1,000 px", "Only print size", "It isn't necessary"], 0, "Favicons and avatars are tiny, so test at 16–32 px."],
            ["Why create a reversed (white) logo version?", ["For decoration", "For use on dark and photographic backgrounds", "To save ink only", "Because white is trendy"], 1, "Logos must remain visible on dark backgrounds."],
            ["What is a mock-up used for?", ["Mocking competitors", "Showing the logo in realistic applications", "Building vector paths", "Choosing a font licence"], 1, "Mock-ups reveal how the logo works in context."],
          ],
        },
        {
          t: "Presenting and Delivering Logos",
          f: "Present concepts persuasively and deliver a complete logo package",
          s: "Present concepts with reasoning and deliver organised files and a simple usage guide.",
          o: ["Present logo concepts linked to the brief", "Handle client feedback constructively", "Deliver a complete, organised logo package"],
          x: `**Presenting concepts.** Show **two or three** strong, distinct concepts — not twenty. For each:
1. Restate the **brief and brand attributes** at the start, so the client judges against goals, not personal taste.
2. Explain the **idea** behind each concept ("the loaf rising like the sun represents fresh bread every morning").
3. Show it **in context**: on mock-ups, at small size, in one colour.
4. Present in black and white or in context first — clients often react strongly to colour, which is easy to change.

**Handling feedback.** Ask *why* behind reactions: "What makes it feel too formal?" Translate feedback into design changes and keep linking back to the brief. Agree in advance how many revision rounds are included.

**The final logo package** — organised in clear folders:
- **Versions:** primary (horizontal), stacked, icon/symbol only, wordmark only.
- **Colour variants:** full colour, black, white (reversed).
- **Formats:**
  - **Vector:** AI or EPS, SVG and PDF — for print, signage and scaling.
  - **Raster:** PNG with transparent background (several sizes) and JPG — for web, documents and social media.
- **Colour modes:** RGB versions for screen, CMYK versions for print.
- **Clear file names:** \`sunrise-logo-horizontal-fullcolour-rgb.svg\`.

**A one-page usage guide:** colour codes (HEX, RGB, CMYK, Pantone), typefaces, **clear space** (minimum empty area around the logo, often the height of a key letter), **minimum size**, and examples of incorrect use (stretching, recolouring, adding effects, placing on clashing backgrounds).

Finish with a short handover note explaining which file to use where. A professional delivery makes the logo easy for everyone who uses it later — and makes you look professional too.`,
          c: [
            ["Logo package", "The complete set of logo versions, colour variants and file formats delivered to the client."],
            ["Clear space", "The minimum empty area required around a logo."],
            ["Usage guide", "A short document of rules for using the logo correctly."],
          ],
          e: {
            t: "Assembling the delivery for 'Sunrise Bakery'",
            s: "The client has approved the final logo.",
            st: ["Export horizontal, stacked and icon versions in full colour, black and white", "Save each as AI/EPS, SVG, PDF and transparent PNG (RGB) plus CMYK PDFs for print, with clear names", "Write a one-page guide: colours, fonts, clear space (the height of the 'S'), minimum size 24 px, and four don'ts"],
            so: "The client receives a tidy folder and guide, so their printer, sign maker and web developer can each find the right file immediately.",
          },
          a: ["Freelance and agency logo projects", "Building a professional portfolio"],
          m: [["Presenting too many concepts", "Show 2–3 strong, distinct options with reasoning."], ["Delivering a single JPG", "Deliver vectors, transparent PNGs, colour variants and a usage guide."]],
          tip: ["Include a 'which file do I use?' table in the handover note."],
          k: ["Present 2–3 concepts linked to the brief, shown in context.", "Turn feedback into design reasons and agree revision limits.", "Deliver all versions, colours and formats plus a usage guide."],
          q: [
            ["How many concepts should usually be presented?", ["One", "Two or three strong, distinct options", "Twenty", "As many as possible"], 1, "A few well-reasoned concepts keep the decision focused."],
            ["Which format is essential for scaling a logo onto signage?", ["JPG", "Vector (AI/EPS/SVG/PDF)", "GIF", "BMP"], 1, "Vectors scale without quality loss."],
            ["What does 'clear space' define?", ["The colour of the background", "The minimum empty area around the logo", "The file size", "The number of colours"], 1, "Clear space protects the logo from crowding."],
          ],
        },
      ],
    },
  ],
};
