module.exports = {
  match: "HTML for Beginners",
  pt: "coding",
  d: "Learn HTML from the ground up and build real web pages. You will write a complete HTML document, structure text with headings, paragraphs and lists, add links and images, use semantic elements, build tables and forms, make pages accessible and search-friendly, and finally connect a stylesheet and publish your page online.",
  sk: ["HTML5", "Semantic markup", "Links and images", "Tables", "Forms", "Accessibility", "Publishing a website"],
  out: [
    "Write valid, well-structured HTML5 documents",
    "Use semantic elements to describe page content",
    "Add links, images, tables and forms correctly",
    "Make pages accessible and search-engine friendly",
    "Link CSS and publish a page on the web",
  ],
  mods: [
    {
      t: "HTML Essentials",
      s: "The structure of an HTML document and the elements for text, links and images.",
      ls: [
        {
          t: "Anatomy of an HTML Document",
          f: "Write the HTML5 skeleton and understand elements, tags and attributes",
          s: "Write a complete HTML5 document and understand how elements, tags and attributes fit together.",
          o: ["Write the HTML5 document skeleton", "Distinguish elements, tags and attributes", "Open and inspect a page in the browser"],
          x: `HTML (HyperText Markup Language) is the language that describes the **content and structure** of every web page. Browsers read it and display the result.

HTML is built from **elements**. Most have an opening tag, content and a closing tag:

\`<p>This is a paragraph.</p>\`

Some are **empty elements** with no content or closing tag, such as \`<br>\` (line break) and \`<img>\`.

**Attributes** add information inside the opening tag, as \`name="value"\`: \`<a href="https://example.com">\`.

Every HTML5 page uses the same skeleton:

\`\`\`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
</html>
\`\`\`

- \`<!DOCTYPE html>\` tells the browser this is modern HTML5.
- \`<html lang="en">\` wraps everything and declares the language (important for screen readers and translation).
- \`<head>\` holds **information about** the page: character set, viewport for mobile, title shown in the browser tab.
- \`<body>\` holds everything the visitor sees.

Elements **nest** inside each other like boxes, and must be closed in reverse order: \`<p><strong>Bold</strong></p>\`, never \`<p><strong>Bold</p></strong>\`. Indenting nested elements makes this structure easy to see.

Save the file as \`index.html\`, double-click it to open it in a browser, and right-click → *Inspect* to see how the browser understood your HTML.`,
          c: [
            ["Element", "Content wrapped in an opening and closing tag, such as <p>…</p>."],
            ["Attribute", "Extra information in an opening tag, written as name=\"value\"."],
            ["<head> vs <body>", "Page information (title, metadata) versus the visible content."],
          ],
          e: {
            t: "Your first page",
            s: "Create a page titled 'About Me' with a main heading and one paragraph.",
            st: ["Create index.html and type the HTML5 skeleton", "Set <title>About Me</title> in the head", "In the body add <h1>About Me</h1> and a <p> describing yourself, then open the file in a browser"],
            so: "The browser tab shows 'About Me' and the page displays a large heading above your paragraph.",
            code: "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <title>About Me</title>\n  </head>\n  <body>\n    <h1>About Me</h1>\n    <p>I am a first-year student learning web development.</p>\n  </body>\n</html>",
            lang: "html",
          },
          a: ["Every website and web app", "Email templates and documentation pages"],
          m: [["Closing nested tags in the wrong order", "Close the most recently opened element first."], ["Putting visible content in <head>", "Only metadata goes in <head>; content goes in <body>."]],
          tip: ["Indent nested elements by two spaces so the structure is visible."],
          k: ["HTML describes structure using nested elements.", "Attributes add information to elements.", "Every page has doctype, html, head and body."],
          q: [
            ["Which element contains the page title shown in the browser tab?", ["<h1>", "<title>", "<header>", "<meta>"], 1, "<title> goes in <head> and names the tab."],
            ["What does <!DOCTYPE html> do?", ["Adds a heading", "Tells the browser the page is HTML5", "Links CSS", "Creates a comment"], 1, "It declares the document type as modern HTML."],
            ["Which nesting is correct?", ["<p><em>Hi</p></em>", "<p><em>Hi</em></p>", "<em><p>Hi</em></p>", "<p>Hi<em></p>"], 1, "Inner elements must close before outer ones."],
          ],
        },
        {
          t: "Headings, Paragraphs and Lists",
          f: "Structure text with headings, paragraphs, emphasis and lists",
          s: "Organise text into a clear outline with headings, paragraphs, emphasis and lists.",
          o: ["Use h1–h6 to build a logical outline", "Mark up paragraphs and emphasis", "Create ordered, unordered and description lists"],
          x: `Text is most of the web, and HTML gives it structure.

**Headings** \`<h1>\` to \`<h6>\` create an outline, from most to least important. Use **one \`<h1>\`** per page for the main topic, then \`<h2>\` for sections, \`<h3>\` for sub-sections — without skipping levels. Choose a heading by its *level in the outline*, never by its size; CSS controls size. Screen-reader users often navigate a page by jumping between headings.

**Paragraphs** use \`<p>\`. Browsers collapse extra spaces and line breaks in your code, so you cannot format text by pressing Enter — each paragraph needs its own element.

**Emphasis and importance:**
- \`<strong>\` — strong importance (displayed bold)
- \`<em>\` — stress emphasis (displayed italic)
These carry meaning; use CSS when you only want a visual style.

**Lists:**
- Unordered (bullets): \`<ul>\` containing \`<li>\` items — when order does not matter.
- Ordered (numbers): \`<ol>\` with \`<li>\` — steps, rankings.
- Description lists: \`<dl>\` with \`<dt>\` (term) and \`<dd>\` (description) — glossaries, FAQs.

Lists can be nested by placing a new \`<ul>\` or \`<ol>\` *inside* an \`<li>\`.

Other useful text elements: \`<blockquote>\` for quotations, \`<code>\` for code, \`<br>\` for a line break inside an address or poem (not for spacing paragraphs), and \`<hr>\` for a thematic break.`,
          c: [
            ["Heading hierarchy", "Using h1–h6 in order so headings form a logical outline of the page."],
            ["<strong> and <em>", "Elements marking importance and emphasis, not just bold and italic styling."],
            ["Ordered vs unordered list", "<ol> for sequences where order matters; <ul> for items where it does not."],
          ],
          e: {
            t: "A recipe page",
            s: "Mark up a recipe with a title, an ingredients section and a method section.",
            st: ["Use one <h1> for the recipe name and <h2> for 'Ingredients' and 'Method'", "List ingredients in a <ul>", "List the method steps in an <ol>, with <strong> for a safety warning"],
            so: "The page outline reads Recipe → Ingredients → Method, ingredients appear as bullets and steps are numbered automatically.",
            code: "<h1>Masala Chai</h1>\n<h2>Ingredients</h2>\n<ul>\n  <li>1 cup water</li>\n  <li>1 cup milk</li>\n  <li>2 tsp tea leaves</li>\n</ul>\n<h2>Method</h2>\n<ol>\n  <li>Boil the water with spices.</li>\n  <li>Add tea leaves and milk. <strong>Watch it closely: it boils over fast.</strong></li>\n  <li>Strain and serve.</li>\n</ol>",
            lang: "html",
          },
          a: ["Articles, documentation and blog posts", "Instructions, FAQs and glossaries"],
          m: [["Choosing headings by size", "Pick the level from the outline; style size with CSS."], ["Using <br><br> to separate paragraphs", "Use separate <p> elements."]],
          tip: ["Check your heading outline with a browser extension such as 'HeadingsMap'."],
          k: ["Headings form an outline: one h1, then h2, h3 without skipping.", "Use <p> for paragraphs and <strong>/<em> for meaning.", "ul for unordered items, ol for steps, dl for terms."],
          q: [
            ["How many <h1> elements should a typical page have?", ["None", "One", "One per paragraph", "Six"], 1, "One h1 names the page's main topic."],
            ["Which list suits step-by-step instructions?", ["<ul>", "<ol>", "<dl>", "<menu>"], 1, "Ordered lists number the steps."],
            ["What does <strong> indicate?", ["Bold styling only", "Strong importance of its content", "A heading", "A link"], 1, "It carries meaning, which browsers usually show as bold."],
          ],
        },
        {
          t: "Links and Images",
          f: "Create absolute, relative and in-page links and add accessible images",
          s: "Connect pages with links and add images with the right attributes, sizes and alt text.",
          o: ["Create absolute and relative links", "Link to a section of a page", "Add images with alt, width and height"],
          x: `**Links** are what make the web a web. The anchor element needs an \`href\`:

\`<a href="https://developer.mozilla.org">MDN Web Docs</a>\`

Types of URL:
- **Absolute** — a full address to another site: \`https://example.com/page\`.
- **Relative** — a path from the current file: \`about.html\`, \`images/logo.png\`, \`../index.html\` (one folder up). Use relative links within your own site.
- **Fragment** — jump to an element with an id on the same page: \`<a href="#contact">Contact</a>\` links to \`<section id="contact">\`.
- **Email and phone** — \`mailto:hello@example.com\`, \`tel:+919876543210\`.

Write **descriptive link text**: "Read the admission guidelines" tells users (and screen readers listing links) where they are going; "click here" does not. Add \`target="_blank"\` only when opening a new tab is genuinely helpful.

**Images** use the empty \`<img>\` element:

\`<img src="images/campus.jpg" alt="Students walking across the main campus lawn" width="800" height="450">\`

- \`src\` — the image file path.
- \`alt\` — a text alternative, read aloud by screen readers and shown if the image fails. Describe the *purpose* of the image; for purely decorative images use \`alt=""\`.
- \`width\` and \`height\` — let the browser reserve space so the page does not jump while loading.

Use \`<figure>\` with \`<figcaption>\` for images that need a visible caption. Keep file names lowercase without spaces (\`campus-map.png\`), and compress large photos before using them.`,
          c: [
            ["Relative URL", "A path relative to the current file, such as images/logo.png."],
            ["Fragment link", "A link to an element's id on a page, written href=\"#id\"."],
            ["Alt text", "A text alternative for an image that describes its content or purpose."],
          ],
          e: {
            t: "A small linked site",
            s: "Two pages, index.html and contact.html, in the same folder, with a logo in an images folder.",
            st: ["In index.html add <a href=\"contact.html\">Contact us</a>", "In contact.html add <a href=\"index.html\">Back to home</a>", "Add the logo on both pages with src=\"images/logo.png\" and meaningful alt text"],
            so: "Users can move between the two pages, and the logo loads on both because the relative paths match the folder structure.",
            code: "<!-- index.html -->\n<img src=\"images/logo.png\" alt=\"Study Buddy logo\" width=\"120\" height=\"40\">\n<nav>\n  <a href=\"contact.html\">Contact us</a>\n  <a href=\"#courses\">Our courses</a>\n</nav>\n<section id=\"courses\">\n  <h2>Our courses</h2>\n</section>",
            lang: "html",
          },
          a: ["Navigation menus and site structure", "Image galleries and product pages"],
          m: [["Link text like 'click here'", "Describe the destination in the link text."], ["Missing or meaningless alt text such as 'image1'", "Describe what the image shows or does."]],
          tip: ["Keep all images in an images/ folder and use lowercase file names."],
          k: ["Links use href; prefer relative URLs inside your site.", "Fragment links jump to elements with an id.", "Images need src, meaningful alt, and width/height."],
          q: [
            ["Which href links to the element with id=\"faq\" on the same page?", ["faq", "#faq", ".faq", "/faq"], 1, "A # followed by the id is a fragment link."],
            ["Which is the best link text?", ["Click here", "Link", "Download the 2025 syllabus (PDF)", "Here"], 2, "Descriptive text explains the destination."],
            ["What alt value should a purely decorative image have?", ["The file name", "alt=\"\"", "alt=\"image\"", "No alt attribute at all"], 1, "An empty alt tells screen readers to skip it."],
          ],
        },
      ],
    },
    {
      t: "Structuring Content",
      s: "Semantic page layout, tables for data, and forms for collecting input.",
      ls: [
        {
          t: "Semantic HTML5 Layout",
          f: "Structure pages with header, nav, main, section, article, aside and footer",
          s: "Use HTML5 semantic elements to describe the regions of a page.",
          o: ["Use semantic layout elements", "Choose between section, article and div", "Explain why semantics help accessibility and SEO"],
          x: `Before HTML5, pages were built from dozens of anonymous \`<div>\` elements. **Semantic elements** describe what each region *is*:

- \`<header>\` — introductory content: logo, site title, often the main navigation.
- \`<nav>\` — a block of major navigation links.
- \`<main>\` — the main content of the page; **only one** per page.
- \`<section>\` — a thematic group of content, normally with its own heading.
- \`<article>\` — self-contained content that makes sense on its own: a blog post, news story, product card, comment.
- \`<aside>\` — related but secondary content: sidebars, call-out boxes.
- \`<footer>\` — closing information: copyright, contact, related links.

A typical page:

\`\`\`
<body>
  <header> … <nav> … </nav></header>
  <main>
    <article>
      <h1>Post title</h1>
      <section><h2>Part 1</h2> … </section>
    </article>
    <aside> … </aside>
  </main>
  <footer> … </footer>
</body>
\`\`\`

**Why it matters:**
- Screen readers announce these regions as *landmarks*, letting users jump straight to the navigation or main content.
- Search engines better understand which content is central.
- Your code is easier to read and to style.

\`<div>\` (block) and \`<span>\` (inline) are still useful, but only as **generic containers** for styling when no semantic element fits. A good test: *would this content make sense in an RSS feed or shared on its own?* If yes, it is probably an \`<article>\`.`,
          c: [
            ["Semantic element", "An element whose name describes its meaning, such as <nav> or <article>."],
            ["Landmark", "A page region (header, nav, main, footer) that assistive technologies let users jump to."],
            ["<article> vs <section>", "Self-contained content vs a thematic group within a page."],
          ],
          e: {
            t: "Converting a div layout",
            s: "A page uses <div class=\"top\">, <div class=\"menu\">, <div class=\"content\">, <div class=\"side\"> and <div class=\"bottom\">.",
            st: ["Replace .top with <header> and .menu with <nav> inside it", "Replace .content with <main>, wrapping each blog post in <article>", "Replace .side with <aside> and .bottom with <footer>"],
            so: "The page looks the same (the CSS classes can stay) but now exposes landmarks that screen readers and search engines understand.",
          },
          a: ["Blogs, news sites and portfolios", "Accessible web applications"],
          m: [["Using more than one <main>", "Use exactly one <main> per page."], ["Using <section> as a generic wrapper", "Use <div> when the group has no theme or heading."]],
          tip: ["Give every <section> a heading — if you can't think of one, it is probably a <div>."],
          k: ["Semantic elements describe page regions.", "One <main>; articles are self-contained; sections are thematic groups.", "Landmarks improve accessibility and SEO."],
          q: [
            ["Which element should wrap a self-contained blog post?", ["<section>", "<article>", "<aside>", "<div>"], 1, "Articles make sense on their own."],
            ["How many <main> elements should a page have?", ["Zero", "One", "One per section", "As many as needed"], 1, "There is a single main content region."],
            ["Which element suits a sidebar of related links?", ["<aside>", "<footer>", "<header>", "<main>"], 0, "<aside> holds secondary, related content."],
          ],
        },
        {
          t: "Tables for Data",
          f: "Build accessible data tables with headers, captions and grouped rows",
          s: "Present tabular data with table, tr, th and td, and make tables accessible.",
          o: ["Build a table with rows, headers and cells", "Add a caption and header scope", "Group rows with thead, tbody and tfoot"],
          x: `Tables are for **tabular data** — information with rows and columns, such as timetables, results or price lists. (In the early web they were misused for page layout; today layout is done with CSS.)

Basic structure:
- \`<table>\` wraps the table.
- \`<tr>\` is a table row.
- \`<th>\` is a header cell; \`<td>\` is a data cell.

Make tables understandable and accessible:
- \`<caption>\` — a title describing the table, right after \`<table>\`.
- \`scope="col"\` or \`scope="row"\` on \`<th>\` — tells screen readers which cells each header describes.
- \`<thead>\`, \`<tbody>\`, \`<tfoot>\` — group header rows, body rows and summary rows.

\`\`\`
<table>
  <caption>Semester 1 results</caption>
  <thead>
    <tr><th scope="col">Subject</th><th scope="col">Mark</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Maths</th><td>82</td></tr>
    <tr><th scope="row">Physics</th><td>76</td></tr>
  </tbody>
  <tfoot>
    <tr><th scope="row">Average</th><td>79</td></tr>
  </tfoot>
</table>
\`\`\`

Cells can span several columns or rows with \`colspan="2"\` or \`rowspan="2"\`, but keep tables simple — complex merged cells are hard to read, especially on phones.

On small screens wide tables overflow; wrapping the table in a container styled with \`overflow-x: auto\` lets users scroll it horizontally.`,
          c: [
            ["<th> vs <td>", "Header cells versus ordinary data cells."],
            ["scope attribute", "Indicates whether a header applies to a column or a row."],
            ["<caption>", "The title of a table, read first by screen readers."],
          ],
          e: {
            t: "A weekly timetable",
            s: "Build a timetable with days as columns and periods as rows.",
            st: ["Add a <caption> 'Weekly timetable'", "Make the first row <th scope=\"col\"> headers for Period, Mon, Tue, Wed", "Make each row start with <th scope=\"row\"> for the period, followed by <td> subjects"],
            so: "A screen reader can announce 'Tuesday, Period 2: Physics' because every cell is linked to its row and column headers.",
          },
          a: ["Timetables, results and price lists", "Reports and comparison charts"],
          m: [["Using tables for page layout", "Use CSS Flexbox or Grid for layout."], ["Bold <td> cells instead of <th>", "Use <th> with scope for headers."]],
          tip: ["If data has both a meaningful row and column, it belongs in a table; otherwise use a list."],
          k: ["Tables are for tabular data only.", "Use th with scope, and a caption.", "Group rows with thead, tbody and tfoot."],
          q: [
            ["Which element defines a header cell?", ["<td>", "<th>", "<tr>", "<thead>"], 1, "<th> marks header cells."],
            ["What does scope=\"col\" tell assistive technology?", ["The cell spans columns", "The header describes the cells in its column", "The column is hidden", "The table is sortable"], 1, "scope links headers to the cells they describe."],
            ["Should tables be used for page layout?", ["Yes, always", "No — use CSS for layout", "Only for footers", "Only on mobile"], 1, "Tables are semantically for data."],
          ],
        },
        {
          t: "Forms and Inputs",
          f: "Build forms with labelled inputs, input types, validation and a submit button",
          s: "Collect information with accessible forms, the right input types and built-in validation.",
          o: ["Build a form with labelled fields", "Choose suitable input types", "Use built-in validation attributes"],
          x: `Forms let users send information: sign-ups, searches, feedback, orders.

\`\`\`
<form action="/register" method="post">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <label for="year">Year of study</label>
  <select id="year" name="year">
    <option value="1">First year</option>
    <option value="2">Second year</option>
  </select>

  <button type="submit">Register</button>
</form>
\`\`\`

- \`action\` is where the data is sent; \`method\` is usually \`post\` for data that changes something and \`get\` for searches.
- **\`name\`** is the key the server receives — without it the field is not sent.
- Every input needs a **\`<label>\`**, connected by \`for\` matching the input's \`id\`. Clicking the label focuses the field, and screen readers read it aloud. Placeholder text is *not* a substitute for a label.

**Input types** give the right keyboard on phones and free validation: \`text\`, \`email\`, \`password\`, \`number\`, \`tel\`, \`date\`, \`checkbox\`, \`radio\`, \`file\`. Use \`<textarea>\` for long text and \`<select>\` for a list of options. Group related radio buttons or checkboxes in a \`<fieldset>\` with a \`<legend>\`.

**Built-in validation:** \`required\`, \`minlength\`/\`maxlength\`, \`min\`/\`max\`, and \`pattern\` (a regular expression). The browser blocks submission and shows a message until the rules are met.

Browser validation improves the experience, but the **server must validate again** — anyone can bypass the form and send data directly.`,
          c: [
            ["name attribute", "The key under which a field's value is sent to the server."],
            ["<label for>", "Connects a visible label to an input's id for usability and accessibility."],
            ["Built-in validation", "Attributes such as required, min and pattern that the browser checks before submitting."],
          ],
          e: {
            t: "A feedback form",
            s: "Collect a name, an email, a rating from 1–5 and a comment.",
            st: ["Add labelled text and email inputs, both required", "Add a number input with min=\"1\" max=\"5\" for the rating", "Add a labelled <textarea> and a submit button"],
            so: "The browser refuses to submit until the name and a valid email are entered and the rating is between 1 and 5; each field announces its label to screen readers.",
            code: "<form action=\"/feedback\" method=\"post\">\n  <label for=\"name\">Name</label>\n  <input id=\"name\" name=\"name\" required>\n  <label for=\"email\">Email</label>\n  <input id=\"email\" name=\"email\" type=\"email\" required>\n  <label for=\"rating\">Rating (1-5)</label>\n  <input id=\"rating\" name=\"rating\" type=\"number\" min=\"1\" max=\"5\">\n  <label for=\"comment\">Comment</label>\n  <textarea id=\"comment\" name=\"comment\" rows=\"4\"></textarea>\n  <button type=\"submit\">Send feedback</button>\n</form>",
            lang: "html",
          },
          a: ["Registration, login and contact pages", "Surveys, searches and checkout"],
          m: [["Using placeholder text instead of labels", "Always add a <label> connected with for/id."], ["Forgetting the name attribute", "Without name, the field's value is never submitted."]],
          tip: ["Use type=\"email\" and type=\"tel\" — phones show the right keyboard automatically."],
          k: ["Forms send named fields to the action URL.", "Every input needs a connected <label>.", "Use input types and validation attributes, but validate on the server too."],
          q: [
            ["Which attribute decides the key a field is sent under?", ["id", "name", "for", "value"], 1, "The server receives name=value pairs."],
            ["How is a <label> connected to an input?", ["By placing it after the input", "Its for attribute matches the input's id", "With a class", "Automatically by order"], 1, "for=\"x\" links to id=\"x\"."],
            ["Why validate on the server even with HTML validation?", ["Browsers are slow", "Requests can bypass the form entirely", "HTML validation doesn't work", "It is required for CSS"], 1, "Client-side checks can be skipped by anyone."],
          ],
        },
      ],
    },
    {
      t: "Quality and Publishing",
      s: "Accessibility, metadata for search engines, and connecting CSS and publishing a page.",
      ls: [
        {
          t: "Accessible HTML",
          f: "Make pages usable with screen readers and keyboards",
          s: "Apply the most important accessibility practices so everyone can use your pages.",
          o: ["Explain why accessibility matters", "Make pages keyboard-accessible", "Use ARIA only when native HTML is not enough"],
          x: `**Accessibility** (a11y) means people can use your site whatever their abilities — including people who are blind and use screen readers, people who cannot use a mouse, and people with low vision or colour blindness. It is also a legal requirement in many places, and it improves usability for everyone.

The good news: **correct HTML is most of the work.**

1. **Use the right element.** A \`<button>\` is focusable, works with Enter and Space, and is announced as a button. A \`<div>\` with a click handler is none of these.
2. **Structure** with headings and landmarks (\`header\`, \`nav\`, \`main\`, \`footer\`) so users can navigate quickly.
3. **Text alternatives**: meaningful \`alt\` text on images; captions or transcripts for video and audio.
4. **Labels** on every form field, and clear error messages.
5. **Keyboard access**: everything must work with Tab, Shift+Tab, Enter and Space. Never remove the focus outline without replacing it with a visible style.
6. **Language**: \`<html lang="en">\` lets screen readers use the correct pronunciation.
7. **Contrast**: text must stand out from its background (at least 4.5:1 for normal text).

**ARIA** attributes (\`aria-label\`, \`aria-expanded\`, \`role\`) add information for assistive technology, but the first rule of ARIA is: *if a native HTML element does the job, use it instead.* Incorrect ARIA can make a page worse.

Test by unplugging your mouse and using the page with the keyboard only, and try a free screen reader (NVDA on Windows, VoiceOver on Mac/iPhone).`,
          c: [
            ["Accessibility (a11y)", "Designing and building so that people with disabilities can use a site."],
            ["Keyboard accessibility", "Every function can be reached and operated with the keyboard alone."],
            ["ARIA", "Attributes that add accessibility information when native HTML elements cannot."],
          ],
          e: {
            t: "Fixing a fake button",
            s: "A page uses <div class=\"btn\" onclick=\"save()\">Save</div>; keyboard users cannot activate it.",
            st: ["Replace the div with <button type=\"button\" class=\"btn\">Save</button>", "Keep the same CSS class so it looks identical", "Tab to it and press Enter and Space to confirm it works"],
            so: "The control becomes focusable, works with the keyboard and is announced as 'Save, button' by screen readers — with no ARIA needed.",
          },
          a: ["Public-sector and education websites", "Any site that wants to reach every user"],
          m: [["Clickable divs and spans", "Use <button> for actions and <a> for navigation."], ["Removing focus outlines", "Keep or restyle the visible focus indicator."]],
          tip: ["Run the Lighthouse accessibility audit in Chrome DevTools on every page you build."],
          k: ["Accessible HTML starts with the correct native elements.", "Everything must work by keyboard with visible focus.", "Use ARIA only when HTML cannot express what you need."],
          q: [
            ["Which element should be used for a clickable action?", ["<div>", "<span>", "<button>", "<p>"], 2, "Buttons are focusable and keyboard-operable by default."],
            ["What is the first rule of ARIA?", ["Use ARIA on every element", "Prefer native HTML elements when they do the job", "ARIA replaces alt text", "ARIA is only for colours"], 1, "Native elements already carry the right semantics."],
            ["Which attribute helps screen readers pronounce the page correctly?", ["charset", "lang", "title", "dir"], 1, "lang declares the page language."],
          ],
        },
        {
          t: "Metadata and Search Engines",
          f: "Add titles, descriptions, social previews and favicons",
          s: "Use head metadata so pages show up well in search results and social media shares.",
          o: ["Write effective titles and meta descriptions", "Add Open Graph tags for link previews", "Add a favicon"],
          x: `The \`<head>\` of a page is invisible on screen, but it decides how the page appears in **search results**, **browser tabs** and **social media previews**.

**Essential metadata:**
- \`<meta charset="utf-8">\` — correct display of all characters.
- \`<meta name="viewport" content="width=device-width, initial-scale=1">\` — proper scaling on phones.
- \`<title>\` — the clickable headline in search results and the tab name. Make it unique per page and descriptive, roughly 50–60 characters: *"HTML Forms Tutorial – Study Buddy"*.
- \`<meta name="description" content="…">\` — the summary often shown under the title in search results; about 150–160 characters that tell users why to click.

**Social previews (Open Graph)** control the card shown when your link is shared:
\`\`\`
<meta property="og:title" content="HTML Forms Tutorial">
<meta property="og:description" content="Build accessible forms step by step.">
<meta property="og:image" content="https://example.com/preview.png">
\`\`\`

**Favicon** — the small icon in the tab and bookmarks:
\`<link rel="icon" href="/favicon.png" type="image/png">\`

**Search engine optimisation (SEO)** is mostly about good content and good HTML: a clear heading hierarchy, descriptive link text, alt text on images, fast loading and mobile-friendly pages. There is no magic tag — the old \`keywords\` meta tag is ignored by major search engines.`,
          c: [
            ["Meta description", "A short page summary in <head> that search engines often display in results."],
            ["Open Graph tags", "Meta tags that control the title, description and image of social media link previews."],
            ["Favicon", "The small icon shown in browser tabs and bookmarks."],
          ],
          e: {
            t: "Improving a search result",
            s: "A page's title is 'index' and it has no description, so search results show random page text.",
            st: ["Write a specific title: 'Free HTML Course for Beginners – Study Buddy'", "Add a 150-character meta description explaining what visitors will learn", "Add og:title, og:description and og:image for shares"],
            so: "Search results and shared links now show a clear headline, a helpful summary and a preview image, which increases the chance that people click.",
          },
          a: ["Blogs, portfolios and business sites", "Pages shared on WhatsApp, LinkedIn or X"],
          m: [["The same title on every page", "Give every page a unique, descriptive title."], ["Stuffing keywords", "Write naturally for people; search engines reward helpful content."]],
          tip: ["Paste your URL into a social preview checker to see how shares will look."],
          k: ["Titles and descriptions shape search results.", "Open Graph tags control social previews.", "Good structure and content matter more than any single tag."],
          q: [
            ["Where is the meta description placed?", ["In <body>", "In <head>", "In <footer>", "In a CSS file"], 1, "All meta tags belong in <head>."],
            ["What do Open Graph tags control?", ["Page colours", "How links appear when shared on social media", "Form validation", "Database queries"], 1, "og: tags define link-preview cards."],
            ["Which tag sets the page's viewport for mobile devices?", ["<meta name=\"viewport\" …>", "<meta charset>", "<link rel=\"icon\">", "<title>"], 0, "The viewport meta tag makes pages scale correctly on phones."],
          ],
        },
        {
          t: "Adding CSS and Publishing Your Page",
          f: "Link a stylesheet, validate the HTML and publish the site online",
          s: "Connect a stylesheet, check your code, and publish your page for free on the web.",
          o: ["Link an external CSS file", "Validate HTML and fix errors", "Publish a site with a free host"],
          x: `HTML provides structure; **CSS** provides presentation. Keep them separate by linking an external stylesheet in the \`<head>\`:

\`<link rel="stylesheet" href="styles.css">\`

A first \`styles.css\` might set a readable font and centred content:

\`\`\`
body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 70ch; margin: 0 auto; padding: 1rem; }
h1 { color: #b0306a; }
\`\`\`

Classes connect HTML elements to styles: \`<p class="note">\` is styled with \`.note { … }\`. Because the HTML is semantic, you can restyle the whole site by editing one CSS file.

**Validate before publishing.** Paste your code into the W3C validator (validator.w3.org). It finds unclosed tags, misspelt attributes and invalid nesting that browsers silently "fix" in unpredictable ways. Also check every link and image, and run a Lighthouse audit.

**Publishing.** A static HTML/CSS site can be hosted free:
- **GitHub Pages** — push the files to a GitHub repository and enable Pages in the settings.
- **Netlify** or **Vercel** — drag the folder onto the site, or connect the repository for automatic deploys.

Your homepage must be named \`index.html\`; servers serve it automatically when someone visits the folder or domain. Keep file and folder names lowercase with no spaces, because many web servers are case-sensitive (\`Logo.png\` and \`logo.png\` are different files).

Congratulations — with structure, semantics, accessibility, metadata and a live URL, you have built a real website. Next steps are deeper CSS (Flexbox, Grid, responsive design) and JavaScript for interactivity.`,
          c: [
            ["External stylesheet", "A .css file linked with <link rel=\"stylesheet\"> that styles every page using it."],
            ["HTML validation", "Checking markup against the HTML standard to find errors."],
            ["Static hosting", "Serving HTML, CSS and image files directly, e.g. with GitHub Pages or Netlify."],
          ],
          e: {
            t: "Publishing on GitHub Pages",
            s: "Your two-page site (index.html, contact.html, styles.css, images/) works locally.",
            st: ["Create a public GitHub repository and upload the files, keeping index.html at the top level", "In Settings → Pages, choose the main branch as the source", "Open the provided URL and test every link and image"],
            so: "After a minute the site is live at https://<username>.github.io/<repository>/ and anyone can visit it.",
          },
          a: ["Personal portfolios and project pages", "Event and club websites"],
          m: [["Mixed-case file names that work on Windows but break online", "Use lowercase names and match them exactly in links."], ["Inline styles on every element", "Put styles in one external stylesheet."]],
          tip: ["Publish early, even an unfinished page, so you learn the deployment process."],
          k: ["Link CSS externally; keep structure and style separate.", "Validate HTML and test links before publishing.", "Static sites can be hosted free on GitHub Pages, Netlify or Vercel."],
          q: [
            ["How do you link an external stylesheet?", ["<style src=\"styles.css\">", "<link rel=\"stylesheet\" href=\"styles.css\">", "<css>styles.css</css>", "<script href=\"styles.css\">"], 1, "The link element with rel=\"stylesheet\" loads CSS."],
            ["What must the homepage file usually be called?", ["home.html", "main.html", "index.html", "start.html"], 2, "Servers serve index.html by default."],
            ["Why use lowercase file names?", ["They load faster", "Many web servers are case-sensitive", "HTML requires it", "They are smaller"], 1, "Logo.png and logo.png can be different files on a server."],
          ],
        },
      ],
    },
  ],
};
