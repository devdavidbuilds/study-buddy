// Web Development curriculum — used for every Web Development course that
// has no course-specific content. {course} = course name, {topic} = main
// technology detected from the title (e.g. "JavaScript"), else "web development".
module.exports = {
  pt: "coding",
  d: "{course} builds a solid, progressive foundation in {topic}: how the web works, structuring pages with HTML, styling with CSS, adding behaviour with JavaScript, talking to servers and APIs, and finally versioning, testing and deploying your work. Each lesson ends with a short check, each module with a quiz.",
  sk: ["{topic}", "HTML", "CSS", "JavaScript", "HTTP and APIs", "Git", "Deployment"],
  out: [
    "Explain how browsers, servers and HTTP work together",
    "Build structured, accessible pages with HTML and CSS",
    "Add interactivity with JavaScript and the DOM",
    "Fetch data from an API and handle errors",
    "Version, test and deploy a small web project",
  ],
  mods: [
    {
      t: "How the Web Works",
      s: "The request–response model, and the two languages every page is built from: HTML for structure and CSS for presentation.",
      ls: [
        {
          t: "Clients, Servers and HTTP",
          f: "Understand what happens between typing a URL and seeing a page",
          s: "Follow a web request from the browser to the server and back, and learn the parts of an HTTP exchange.",
          o: ["Describe the client–server model", "Name the parts of an HTTP request and response", "Interpret common status codes"],
          x: `Welcome to **{course}**. Before you write any code, it helps to know what actually happens on the web.

Every web page is the result of a **request** and a **response**. Your browser (the *client*) asks a computer on the internet (the *server*) for a resource, and the server answers.

1. **DNS lookup** – the domain name (for example \`example.com\`) is translated into an IP address.
2. **Connection** – the browser opens a connection to that address, usually encrypted with TLS (that is the "S" in HTTPS).
3. **HTTP request** – the browser sends a *method* (\`GET\` to read, \`POST\` to send data), a *path* (\`/courses\`), *headers* (extra information such as accepted languages) and sometimes a *body*.
4. **HTTP response** – the server replies with a *status code*, headers and a body: HTML, CSS, JavaScript, images or JSON data.
5. **Rendering** – the browser reads the HTML, requests every linked file, and paints the page.

Status codes tell you what happened: **2xx** success (\`200 OK\`), **3xx** redirection, **4xx** a problem with the request (\`404 Not Found\`, \`401 Unauthorized\`) and **5xx** a problem on the server (\`500\`).

Almost everything you will build later — pages, forms, APIs — is a variation of this single cycle, so keep it in mind as the map for the whole course.`,
          c: [
            ["HTTP", "The protocol browsers and servers use to exchange requests and responses."],
            ["Status code", "A three-digit number in every response that summarises the result, e.g. 200 or 404."],
            ["DNS", "The system that translates a domain name into the IP address of a server."],
          ],
          e: {
            t: "Reading a request in DevTools",
            s: "You open a news site and want to see which requests the page makes.",
            st: ["Open DevTools (F12) and select the Network tab", "Reload the page and click the first request (the HTML document)", "Read its method, status code and the Content-Type response header"],
            so: "The first request is a GET for the page's HTML, answered with 200 OK and Content-Type text/html; the rows below it are the CSS, JavaScript and image files the HTML asked for.",
          },
          a: ["Debugging why a page or image fails to load", "Understanding what an API call returns"],
          m: [["Thinking a 404 is a server crash", "4xx codes mean the request was wrong (e.g. a bad URL); 5xx codes mean the server failed."], ["Ignoring HTTPS", "Always serve sites over HTTPS so data in transit is encrypted."]],
          tip: ["Keep the Network tab open while you develop: it shows every request and its status."],
          k: ["A page is the result of an HTTP request and response.", "Methods say what you want (GET, POST); status codes say what happened.", "The browser fetches every linked file separately before rendering."],
          q: [
            ["Which status code means the requested resource was not found?", ["200", "301", "404", "500"], 2, "4xx codes are client errors; 404 means the server has no resource at that path."],
            ["What does DNS do?", ["Encrypts the connection", "Translates a domain name into an IP address", "Renders HTML", "Stores cookies"], 1, "DNS maps human-friendly names to the numeric addresses of servers."],
            ["Which HTTP method is normally used to send form data to a server?", ["GET", "POST", "HEAD", "OPTIONS"], 1, "POST carries data in the request body; GET is for reading."],
          ],
        },
        {
          t: "Structuring Pages with HTML",
          f: "Use semantic HTML elements to give a page meaningful structure",
          s: "Write a well-formed HTML document with semantic elements, links and images.",
          o: ["Write the skeleton of an HTML document", "Choose semantic elements for headings, sections and lists", "Add links and images with the right attributes"],
          x: `HTML (HyperText Markup Language) describes **what content is**, not how it looks. It is made of *elements* written as tags: \`<p>Hello</p>\` is a paragraph.

Every document starts with the same skeleton: \`<!DOCTYPE html>\`, then \`<html>\` containing a \`<head>\` (title, character set, links to CSS) and a \`<body>\` (everything the user sees).

**Semantic elements** say what a part of the page *means*:
- \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<footer>\` for page regions
- \`<h1>\`–\`<h6>\` for a heading hierarchy (one \`<h1>\` per page, no skipped levels)
- \`<ul>\`/\`<ol>\` with \`<li>\` for lists, \`<button>\` for actions

Attributes add information to an element. A link needs \`href\`: \`<a href="/about">About us</a>\`. An image needs \`src\` and **\`alt\`** text: \`<img src="logo.png" alt="Study Buddy logo">\`. Alt text is read aloud by screen readers and shown when the image fails to load.

Semantic HTML is not just tidy: it makes pages accessible, helps search engines understand them, and gives CSS and JavaScript clear hooks. A \`<div>\` has no meaning, so use it only when no semantic element fits.`,
          c: [
            ["Element", "A piece of content wrapped in tags, such as <p>…</p>."],
            ["Semantic HTML", "Choosing elements by meaning (nav, article, button) rather than appearance."],
            ["Attribute", "Extra information on an element, written as name=\"value\", e.g. href or alt."],
          ],
          e: {
            t: "A minimal semantic page",
            s: "Create a page with a title, a navigation bar and one article.",
            st: ["Write the doctype, html, head (with <title>) and body", "Inside body add <header> with an <h1> and a <nav> list of links", "Add <main> containing an <article> with an <h2> and a paragraph"],
            so: "A valid page whose outline reads: header → navigation → main → article. Screen readers can jump between these regions directly.",
            code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><title>My Notes</title></head>\n<body>\n  <header>\n    <h1>My Notes</h1>\n    <nav><ul><li><a href=\"/\">Home</a></li><li><a href=\"/about\">About</a></li></ul></nav>\n  </header>\n  <main>\n    <article><h2>Day 1</h2><p>Today I learned HTML.</p></article>\n  </main>\n</body>\n</html>",
            lang: "html",
          },
          a: ["Making sites usable with screen readers", "Improving how pages appear in search results"],
          m: [["Using <div> for everything", "Prefer header, nav, main, section, article and button where they fit."], ["Missing alt text", "Give every meaningful image a short description; use alt=\"\" for purely decorative ones."]],
          tip: ["Validate your HTML at validator.w3.org to catch unclosed tags."],
          k: ["HTML describes meaning and structure, not appearance.", "Use semantic elements and a logical heading order.", "Links need href; images need src and alt."],
          q: [
            ["Which attribute provides a text alternative for an image?", ["title", "src", "alt", "href"], 2, "alt is read by screen readers and shown if the image cannot load."],
            ["Which element should wrap the page's main navigation links?", ["<nav>", "<div>", "<span>", "<menu>"], 0, "<nav> marks a block of navigation links semantically."],
            ["Where does the <title> element belong?", ["In <body>", "In <head>", "In <footer>", "In <main>"], 1, "The title is metadata, so it goes inside <head>."],
          ],
        },
        {
          t: "Styling and Layout with CSS",
          f: "Apply CSS selectors, the box model and Flexbox to style a responsive page",
          s: "Style pages with selectors and the box model, and lay them out responsively with Flexbox and media queries.",
          o: ["Write CSS rules with selectors and declarations", "Explain the box model", "Build a responsive layout with Flexbox and a media query"],
          x: `CSS (Cascading Style Sheets) controls **how** HTML looks. A rule has a *selector* and *declarations*: \`h1 { color: navy; font-size: 2rem; }\`.

Common selectors: element (\`p\`), class (\`.card\`), id (\`#main\`), and combinations (\`nav a\`). When several rules apply, the more **specific** selector wins, and later rules beat earlier ones of equal specificity — that is the "cascade".

Every element is a box made of **content → padding → border → margin**. Setting \`box-sizing: border-box\` makes \`width\` include padding and border, which makes layouts far easier to reason about.

For layout, **Flexbox** arranges items in a row or column: \`display: flex; gap: 1rem; justify-content: space-between; align-items: center;\`. For two-dimensional grids, CSS Grid does the same for rows and columns.

**Responsive design** makes one page work on every screen. Use relative units (\`rem\`, \`%\`), add \`<meta name="viewport" content="width=device-width, initial-scale=1">\`, and change the layout with **media queries**:

\`@media (max-width: 600px) { .row { flex-direction: column; } }\`

Keep styles in an external \`.css\` file linked from the \`<head>\`, so one stylesheet can style every page of the site.`,
          c: [
            ["Selector", "The part of a CSS rule that chooses which elements the rule applies to."],
            ["Box model", "Content, padding, border and margin that make up the size of every element."],
            ["Media query", "A CSS condition (e.g. max-width: 600px) that applies rules only on matching screens."],
          ],
          e: {
            t: "Cards that stack on phones",
            s: "Three course cards should sit side by side on a laptop and stack on a phone.",
            st: ["Wrap the cards in a .row container with display: flex and gap", "Give each .card flex: 1 and padding", "Add a media query that switches .row to flex-direction: column below 600px"],
            so: "On wide screens the cards share the row equally; under 600px they stack vertically with the same spacing.",
            code: ".row { display: flex; gap: 1rem; }\n.card { flex: 1; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }\n@media (max-width: 600px) {\n  .row { flex-direction: column; }\n}",
            lang: "css",
          },
          a: ["Building layouts that work on phones and desktops", "Keeping a consistent visual style across a site"],
          m: [["Fixed pixel widths everywhere", "Use flexible units and Flexbox/Grid so content adapts to the screen."], ["Fighting specificity with !important", "Use clear class selectors instead; !important makes styles hard to override later."]],
          tip: ["Add * { box-sizing: border-box; } at the top of every stylesheet."],
          k: ["CSS rules = selector + declarations; specificity decides conflicts.", "Every element follows the box model.", "Flexbox and media queries make layouts responsive."],
          q: [
            ["Which layer of the box model sits between the content and the border?", ["Margin", "Padding", "Outline", "Gap"], 1, "Order from inside out: content, padding, border, margin."],
            ["Which CSS selector targets elements with class=\"card\"?", ["#card", "card", ".card", "*card"], 2, "A dot selects by class; # selects by id."],
            ["What is a media query used for?", ["Loading videos", "Applying styles only on screens that match a condition", "Querying a database", "Importing fonts"], 1, "Media queries change styles for particular screen sizes or features."],
          ],
        },
      ],
    },
    {
      t: "Making Pages Interactive",
      s: "JavaScript fundamentals, changing the page through the DOM, and loading data from APIs.",
      ls: [
        {
          t: "JavaScript Fundamentals",
          f: "Use variables, data types, conditions, loops and functions in JavaScript",
          s: "Learn the core building blocks of JavaScript: values, variables, conditions, loops and functions.",
          o: ["Declare variables with let and const", "Use conditions and loops", "Write and call functions that return values"],
          x: `JavaScript is the programming language of the browser. It lets a page **react** — to clicks, typing, and data arriving from a server.

**Variables** store values. Use \`const\` for values that will not be reassigned and \`let\` for ones that will; avoid the old \`var\`. The main **types** are numbers, strings (\`"text"\`), booleans (\`true\`/\`false\`), arrays (\`[1, 2, 3]\`) and objects (\`{ name: "Asha", score: 90 }\`).

**Conditions** choose what to do:
\`if (score >= 50) { result = "pass"; } else { result = "retry"; }\`
Use \`===\` (strict equality) rather than \`==\`, which converts types in surprising ways (\`"5" == 5\` is true).

**Loops** repeat work. \`for (const item of list) { … }\` visits each element; array methods such as \`map\`, \`filter\` and \`reduce\` express common loops more clearly.

**Functions** package reusable logic:
\`const average = (nums) => nums.reduce((a, b) => a + b, 0) / nums.length;\`
A function takes *parameters*, does work, and *returns* a value. Small functions with clear names are the single best habit for readable code.

You can try every snippet in the browser console (F12 → Console) — experiment there before putting code in a page.`,
          c: [
            ["const / let", "Keywords that declare variables; const cannot be reassigned, let can."],
            ["Strict equality (===)", "Compares value and type without conversion."],
            ["Function", "A named, reusable block of code that takes parameters and can return a value."],
          ],
          e: {
            t: "Grading a list of scores",
            s: "Given scores [72, 45, 88], produce the average and the list of passing scores (≥ 50).",
            st: ["Store the scores in a const array", "Use reduce to sum them and divide by the length", "Use filter to keep scores of at least 50"],
            so: "Average ≈ 68.33; passing scores = [72, 88].",
            code: "const scores = [72, 45, 88];\nconst average = scores.reduce((a, b) => a + b, 0) / scores.length;\nconst passing = scores.filter((s) => s >= 50);\nconsole.log(average.toFixed(2), passing); // 68.33 [72, 88]",
            lang: "javascript",
          },
          a: ["Validating form input before it is sent", "Calculating totals in a shopping cart"],
          m: [["Using == instead of ===", "Use === so values of different types are never treated as equal."], ["Reassigning a const", "Use let for values that change; const for everything else."]],
          tip: ["Name functions after what they return or do: getAverage, isValidEmail."],
          k: ["Use const by default and let when a value must change.", "Conditions use ===; loops and array methods repeat work.", "Functions turn logic into reusable, testable pieces."],
          q: [
            ["What is the value of \"5\" === 5 in JavaScript?", ["true", "false", "undefined", "An error"], 1, "Strict equality compares types too: a string is never === a number."],
            ["Which keyword declares a variable that cannot be reassigned?", ["var", "let", "const", "static"], 2, "const bindings cannot be reassigned."],
            ["Which array method keeps only the elements that pass a test?", ["map", "filter", "reduce", "push"], 1, "filter returns a new array of the elements for which the callback returns true."],
          ],
        },
        {
          t: "The DOM and Events",
          f: "Select, change and create page elements and respond to user events",
          s: "Use the Document Object Model to change a page and respond to clicks and form input.",
          o: ["Select elements with querySelector", "Change text, classes and attributes", "Handle events with addEventListener"],
          x: `When the browser reads HTML it builds the **DOM** (Document Object Model): a tree of objects, one for each element. JavaScript changes the page by changing this tree — the HTML file itself never changes.

**Selecting** elements:
- \`document.querySelector(".card")\` returns the first match of any CSS selector
- \`document.querySelectorAll("li")\` returns all matches

**Changing** elements:
- \`el.textContent = "Saved!"\` sets text safely (prefer it over \`innerHTML\` for user data, which can inject code)
- \`el.classList.add("active")\` / \`remove\` / \`toggle\` — style changes belong in CSS classes
- \`el.setAttribute("aria-expanded", "true")\`

**Creating** elements: \`const li = document.createElement("li"); li.textContent = task; list.append(li);\`

**Events** connect code to user actions:
\`button.addEventListener("click", () => { … });\`
Common events are \`click\`, \`input\`, \`submit\` and \`keydown\`. In a form \`submit\` handler, call \`event.preventDefault()\` to stop the page reloading so your code can handle the data.

Load your script with \`<script src="app.js" defer></script>\` so it runs after the HTML has been parsed and every element exists.`,
          c: [
            ["DOM", "The browser's tree of objects representing the page, which JavaScript can read and change."],
            ["Event listener", "A function registered to run when an event (click, input, submit) happens on an element."],
            ["preventDefault", "A method on an event that stops the browser's default action, such as reloading on form submit."],
          ],
          e: {
            t: "A tiny to-do list",
            s: "Typing a task and pressing Add should append it to a list without reloading the page.",
            st: ["Select the form, the input and the list", "Listen for the form's submit event and call preventDefault", "Create an <li>, set its textContent to the input value, append it and clear the input"],
            so: "Each submitted task appears instantly as a new list item, and the page never reloads.",
            code: "const form = document.querySelector('#todo-form');\nconst input = document.querySelector('#todo-text');\nconst list = document.querySelector('#todo-list');\nform.addEventListener('submit', (event) => {\n  event.preventDefault();\n  const li = document.createElement('li');\n  li.textContent = input.value;\n  list.append(li);\n  input.value = '';\n});",
            lang: "javascript",
          },
          a: ["Showing validation messages as users type", "Opening menus, tabs and modals"],
          m: [["Running scripts before the HTML exists", "Use defer or place the script at the end of the body."], ["Inserting user text with innerHTML", "Use textContent so the text cannot inject HTML or scripts."]],
          tip: ["Toggle CSS classes from JavaScript instead of setting many inline styles."],
          k: ["The DOM is a live tree you can query and change.", "Use textContent and classList for safe, clean updates.", "addEventListener connects user actions to your code."],
          q: [
            ["Which method returns the first element matching a CSS selector?", ["getElementsByClassName", "querySelector", "querySelectorAll", "createElement"], 1, "querySelector returns the first match; querySelectorAll returns all of them."],
            ["Why call event.preventDefault() in a submit handler?", ["To delete the form", "To stop the browser reloading the page", "To validate the email", "To send the form twice"], 1, "The default submit action navigates/reloads; preventDefault lets your code handle it."],
            ["Which property safely sets plain text inside an element?", ["innerHTML", "outerHTML", "textContent", "value"], 2, "textContent never parses the value as HTML."],
          ],
        },
        {
          t: "Working with APIs and JSON",
          f: "Fetch JSON data from an API asynchronously and handle errors",
          s: "Request data from APIs with fetch, use async/await, and handle loading and error states.",
          o: ["Explain what an API and JSON are", "Fetch data with fetch and async/await", "Handle network and HTTP errors"],
          x: `An **API** (Application Programming Interface) lets your page ask a server for data instead of a whole page. Most web APIs speak **JSON** — text that looks like JavaScript objects: \`{"title": "HTML Basics", "lessons": 12}\`.

Network requests take time, so JavaScript handles them **asynchronously**: your code keeps running and handles the result when it arrives. The modern way is \`fetch\` with \`async\`/\`await\`:

\`\`\`
async function loadCourses() {
  const response = await fetch("/api/courses");
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  const data = await response.json();
  return data;
}
\`\`\`

Two things often surprise beginners:
1. \`fetch\` only rejects on **network** failure. A \`404\` or \`500\` still resolves, so always check \`response.ok\` (or \`response.status\`).
2. \`response.json()\` is itself asynchronous, so it needs \`await\` too.

Wrap calls in \`try/catch\` and give the user three clear states: **loading** ("Fetching courses…"), **success** (the data), and **error** ("Could not load courses — try again"). Sending data works the same way with \`method: "POST"\`, a JSON \`body\` and a \`Content-Type: application/json\` header.

Never put secret keys in front-end code: anything in the browser can be read by anyone.`,
          c: [
            ["API", "A defined way for programs to request data or actions from a server."],
            ["JSON", "A text format for structured data, built from objects, arrays, strings, numbers and booleans."],
            ["async/await", "Syntax for writing asynchronous code that waits for a result without blocking the page."],
          ],
          e: {
            t: "Loading a list with loading and error states",
            s: "Show 'Loading…', then a list of course titles, or a friendly error.",
            st: ["Show a loading message", "await fetch, check response.ok, then await response.json()", "Render the titles in try; show the error message in catch"],
            so: "Users always see one of three states, and a failed request no longer leaves a blank page.",
            code: "async function showCourses(list) {\n  list.textContent = 'Loading…';\n  try {\n    const res = await fetch('/api/courses');\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const { data } = await res.json();\n    list.textContent = data.map((c) => c.courseName).join(', ');\n  } catch (err) {\n    list.textContent = 'Could not load courses. Please try again.';\n  }\n}",
            lang: "javascript",
          },
          a: ["Showing live weather, prices or scores", "Saving form data without a page reload"],
          m: [["Assuming fetch throws on 404", "Check response.ok; fetch only rejects on network errors."], ["Forgetting await on response.json()", "json() returns a promise, so await it."]],
          tip: ["Open the Network tab to see exactly what an API returned."],
          k: ["APIs return data, usually as JSON.", "Use fetch with async/await, and check response.ok.", "Always design loading, success and error states."],
          q: [
            ["Does fetch reject its promise when the server returns 404?", ["Yes, always", "No — it resolves; you must check response.ok", "Only for POST requests", "Only in Chrome"], 1, "fetch rejects only on network failure; HTTP errors resolve normally."],
            ["What does response.json() return?", ["A string", "A promise that resolves to the parsed data", "An HTML document", "The status code"], 1, "Parsing the body is asynchronous, so it returns a promise."],
            ["Where should secret API keys be kept?", ["In front-end JavaScript", "In HTML comments", "On the server, never in the browser", "In localStorage"], 2, "Anything shipped to the browser can be read by users."],
          ],
        },
      ],
    },
    {
      t: "Building and Shipping",
      s: "What the server side does, tracking changes with Git, and testing and deploying a finished site.",
      ls: [
        {
          t: "Server-Side Basics",
          f: "Understand routes, server logic and databases behind a web application",
          s: "See how a back end receives requests, applies rules, stores data and returns responses.",
          o: ["Explain front end vs back end", "Describe routes and handlers", "Explain why validation and data storage live on the server"],
          x: `The **front end** runs in the browser; the **back end** runs on a server you control. The back end is where data is stored, rules are enforced and secrets are kept.

A back end is organised into **routes**: a method plus a path mapped to a *handler* function. In Node.js with Express, for example:

\`app.get("/api/courses/:id", async (req, res) => { … res.json(course); });\`

A typical handler:
1. **Reads input** — path parameters, query strings, the JSON body, the logged-in user.
2. **Validates** it — never trust the browser; anyone can send any request.
3. **Talks to a database** — SQL databases (PostgreSQL, MySQL) store tables; document databases (MongoDB) store JSON-like documents.
4. **Returns a response** — data plus the right status code (\`201\` created, \`400\` bad input, \`401\` not logged in, \`404\` not found).

**Authentication** proves who a user is (for example a password check that issues a token); **authorisation** decides what they may do. Passwords are stored only as salted hashes (bcrypt), never as plain text.

Back ends are written in many languages — JavaScript (Node), Python (Django, Flask), PHP, Java, C# — but every one of them follows this same request → validate → data → response pattern.`,
          c: [
            ["Route", "A method and path (e.g. GET /api/courses) mapped to the code that handles it."],
            ["Server-side validation", "Checking every input on the server, because the browser can be bypassed."],
            ["Authentication vs authorisation", "Who you are vs what you are allowed to do."],
          ],
          e: {
            t: "Designing a 'create note' endpoint",
            s: "Students should be able to save a note with a title of 1–100 characters.",
            st: ["Choose POST /api/notes and require a logged-in user", "Validate the title length and return 400 if invalid", "Save the note with the user's id and return 201 with the saved note"],
            so: "POST /api/notes → 401 if not logged in, 400 if the title is empty or too long, otherwise 201 with the stored note — and the user id comes from the token, never from the request body.",
          },
          a: ["Login systems and user accounts", "Storing orders, posts or course progress"],
          m: [["Validating only in the browser", "Repeat every check on the server; client checks are just for convenience."], ["Storing plain-text passwords", "Store salted hashes with bcrypt or a similar algorithm."]],
          tip: ["Return clear JSON error messages with the correct status code — it makes debugging the front end much easier."],
          k: ["The back end stores data, enforces rules and keeps secrets.", "Routes map requests to handlers: read → validate → data → respond.", "Authentication identifies users; authorisation limits what they can do."],
          q: [
            ["Why must input be validated on the server?", ["The browser is slow", "Requests can be sent without your front end, so browser checks can be bypassed", "Databases require it", "It makes pages load faster"], 1, "Anyone can craft a request directly, skipping client-side checks."],
            ["Which status code fits 'created successfully'?", ["200", "201", "204", "302"], 1, "201 Created is the standard response for a newly created resource."],
            ["How should passwords be stored?", ["Plain text", "Base64 encoded", "As salted hashes (e.g. bcrypt)", "In cookies"], 2, "Hashing with a salt means even a database leak does not reveal the passwords."],
          ],
        },
        {
          t: "Version Control with Git",
          f: "Track changes with commits, branches and remote repositories",
          s: "Use Git to save snapshots of your work, experiment safely on branches and collaborate through GitHub.",
          o: ["Explain what a commit records", "Use the basic add–commit–push workflow", "Work on a branch and merge it"],
          x: `**Git** records the history of a project as a series of **commits** — snapshots of your files with a message explaining *why* they changed. With that history you can see what changed, undo mistakes and work with others without overwriting each other.

The everyday workflow:
1. \`git status\` — see what changed
2. \`git add file.html\` — stage the changes you want in the next snapshot
3. \`git commit -m "Add contact form"\` — save the snapshot
4. \`git push\` — upload commits to a remote repository such as GitHub

**Branches** let you work on a feature without disturbing the main code: \`git switch -c contact-form\`, commit there, then merge it back (often through a *pull request*, where teammates review the change first).

Good habits:
- Commit small, related changes with messages that explain intent ("Fix login redirect loop", not "update").
- Pull before you start work so you build on the latest version.
- Never commit secrets: list files like \`.env\` and \`node_modules/\` in \`.gitignore\`.

When two branches change the same lines, Git reports a **merge conflict**; you resolve it by choosing or combining the lines, then committing the result.`,
          c: [
            ["Commit", "A saved snapshot of the project with a message describing the change."],
            ["Branch", "An independent line of development that can later be merged."],
            [".gitignore", "A file listing paths Git must not track, such as secrets and dependencies."],
          ],
          e: {
            t: "Adding a feature on a branch",
            s: "You want to add a contact page without breaking the main site.",
            st: ["git switch -c contact-page", "Create contact.html, then git add contact.html and git commit -m \"Add contact page\"", "git push -u origin contact-page and open a pull request to merge into main"],
            so: "main stays unchanged until the reviewed pull request is merged, and the history shows exactly when and why the page was added.",
            code: "git switch -c contact-page\ngit add contact.html\ngit commit -m \"Add contact page\"\ngit push -u origin contact-page",
            lang: "bash",
          },
          a: ["Undoing a change that broke the site", "Collaborating on a team project"],
          m: [["One giant commit at the end of the day", "Commit small, focused changes so each one is easy to review or revert."], ["Committing .env or passwords", "Add them to .gitignore before the first commit."]],
          tip: ["Run git status before every commit to check exactly what will be saved."],
          k: ["Commits are snapshots with messages that explain why.", "add → commit → push is the everyday cycle.", "Branches and pull requests keep main stable."],
          q: [
            ["Which command saves staged changes as a snapshot?", ["git add", "git commit", "git push", "git clone"], 1, "git commit records the staged changes in the history."],
            ["What is .gitignore for?", ["Deleting files", "Listing files Git should not track", "Ignoring merge conflicts", "Hiding commits"], 1, "Paths in .gitignore are never added, which keeps secrets and dependencies out."],
            ["Why work on a branch?", ["Branches run faster", "To develop a change without disturbing the main code until it is ready", "Git requires one branch per file", "To avoid writing commit messages"], 1, "Branches isolate work so main stays stable until you merge."],
          ],
        },
        {
          t: "Testing, Performance and Deployment",
          f: "Test, optimise and deploy a web project to a public URL",
          s: "Check that a site works, loads fast and is accessible, then deploy it to a hosting platform.",
          o: ["Test a site across devices and browsers", "Apply basic performance and accessibility checks", "Deploy a site and configure environment variables"],
          x: `A project is finished when **real users** can use it. Before deploying, run through three checks.

**1. It works.** Test the main user journeys (sign up, search, submit a form) on a phone and a desktop and in at least two browsers. Automated tests help: *unit tests* check small functions, *end-to-end tests* click through the app like a user.

**2. It is fast.** Large images are the most common problem — resize and compress them and use modern formats (WebP). Load scripts with \`defer\`, and remove unused code. Tools such as **Lighthouse** in Chrome DevTools score performance, accessibility and SEO and tell you what to fix.

**3. It is accessible.** Every image has alt text, colour contrast is high enough, every form field has a \`<label>\`, and the whole site can be used with the keyboard alone (Tab, Enter, Esc).

**Deploying** means putting the site on a server with a public URL. Static sites (HTML/CSS/JS) can go on services like GitHub Pages, Netlify or Vercel; apps with a back end run on platforms such as Render or a cloud VM. Most connect to your Git repository and redeploy on every push. Configuration and secrets (database URLs, API keys) are set as **environment variables** on the host — never committed to the repository.

After deploying, open the live URL, repeat your main checks, and watch the logs for errors.`,
          c: [
            ["Lighthouse", "A browser tool that audits a page's performance, accessibility, best practices and SEO."],
            ["Environment variable", "A configuration value (such as a database URL) set on the host instead of in the code."],
            ["Continuous deployment", "Automatically redeploying the site whenever new commits are pushed."],
          ],
          e: {
            t: "A pre-launch checklist run",
            s: "Your portfolio site is ready; Lighthouse scores performance 58 and accessibility 81.",
            st: ["Read the Lighthouse report: it flags 2 MB hero images and missing alt text", "Compress the images to WebP and add descriptive alt text", "Re-run Lighthouse, then push to deploy and test the live URL on a phone"],
            so: "After compressing images and fixing alt text the scores rise substantially (often into the 90s), and the deployed site is verified on real devices.",
          },
          a: ["Launching a portfolio or college project", "Shipping updates safely to a live product"],
          m: [["Testing only on your own laptop", "Test on a phone and another browser before release."], ["Hard-coding secrets for production", "Configure them as environment variables on the hosting platform."]],
          tip: ["Deploy early and often — small deployments are easier to debug than one big launch."],
          k: ["Test the main journeys on several devices and browsers.", "Optimise images and audit with Lighthouse.", "Deploy from Git and keep secrets in environment variables."],
          q: [
            ["What is the most common cause of slow page loads?", ["Too many CSS classes", "Large, uncompressed images", "Using HTML5", "Short file names"], 1, "Oversized images dominate page weight on most sites."],
            ["Where should a production database password be configured?", ["In the JavaScript bundle", "In a committed config file", "As an environment variable on the host", "In an HTML comment"], 2, "Environment variables keep secrets out of the code and repository."],
            ["Which tool audits performance and accessibility in Chrome?", ["Lighthouse", "Git", "npm", "DNS"], 0, "Lighthouse is built into Chrome DevTools."],
          ],
        },
      ],
    },
  ],
};
