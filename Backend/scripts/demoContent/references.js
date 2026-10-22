// ==============================
// Course reading lists: books, research papers, documentation, standards
// and guides (no videos). Every URL was checked on 2026-10-22; papers are
// linked through their DOI (verified in the DOI registry).
//
// access: "free" = readable online at no cost; "library" = publisher page,
// usually readable through a college library subscription.
// ==============================

const R = (type, title, authors, year, source, url, note, access = "free") => ({ type, title, authors, year, source, url, note, access });

const WEB_ACCESSIBILITY = R("standard", "Web Content Accessibility Guidelines (WCAG) 2.2", "W3C", 2023, "World Wide Web Consortium", "https://www.w3.org/TR/WCAG22/", "The international standard for accessible web content.");

const byCategory = {
  "Web Development": [
    R("book", "Eloquent JavaScript (4th edition)", "Marijn Haverbeke", 2024, "No Starch Press (free online edition)", "https://eloquentjavascript.net/", "A thorough, free book on JavaScript and programming fundamentals."),
    R("documentation", "Learn web development", "Mozilla", null, "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Learn_web_development", "Structured guides to HTML, CSS and JavaScript from the MDN reference."),
    R("guide", "Learn HTML, CSS, accessibility and performance", "Google Chrome team", null, "web.dev", "https://web.dev/learn", "Free courses on modern front-end topics."),
    R("standard", "HTML Living Standard", "WHATWG", null, "WHATWG", "https://html.spec.whatwg.org/", "The official, continuously updated HTML specification."),
    R("standard", "RFC 9110: HTTP Semantics", "R. Fielding, M. Nottingham, J. Reschke", 2022, "IETF", "https://www.rfc-editor.org/rfc/rfc9110", "The definitive description of HTTP methods, status codes and headers."),
    R("paper", "Architectural Styles and the Design of Network-based Software Architectures", "Roy T. Fielding", 2000, "PhD dissertation, University of California, Irvine", "https://ics.uci.edu/~fielding/pubs/dissertation/top.htm", "The dissertation that defined REST, the style behind most web APIs."),
    R("paper", "Information Management: A Proposal", "Tim Berners-Lee", 1989, "CERN", "https://www.w3.org/History/1989/proposal.html", "The original proposal that led to the World Wide Web."),
    R("book", "Pro Git (2nd edition)", "Scott Chacon, Ben Straub", 2014, "Apress (free online edition)", "https://git-scm.com/book/en/v2", "The complete, free guide to Git."),
    WEB_ACCESSIBILITY,
  ],
  "Business Finance": [
    R("book", "Principles of Finance", "Julie Dahlquist, Rainford Knight et al.", 2022, "OpenStax", "https://openstax.org/details/books/principles-finance", "Free, peer-reviewed textbook on time value of money, valuation, risk and markets."),
    R("book", "Principles of Accounting, Volume 1: Financial Accounting", "Mitchell Franklin, Patty Graybeal, Dixon Cooper", 2019, "OpenStax", "https://openstax.org/details/books/principles-financial-accounting", "Free textbook on financial statements and accounting principles."),
    R("paper", "Portfolio Selection", "Harry Markowitz", 1952, "The Journal of Finance 7(1)", "https://doi.org/10.1111/j.1540-6261.1952.tb01525.x", "The founding paper of modern portfolio theory and diversification.", "library"),
    R("paper", "Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk", "William F. Sharpe", 1964, "The Journal of Finance 19(3)", "https://doi.org/10.1111/j.1540-6261.1964.tb02865.x", "Introduces the Capital Asset Pricing Model (CAPM).", "library"),
    R("paper", "Efficient Capital Markets: A Review of Theory and Empirical Work", "Eugene F. Fama", 1970, "The Journal of Finance 25(2)", "https://doi.org/10.2307/2325486", "The classic statement of the efficient market hypothesis.", "library"),
    R("paper", "Prospect Theory: An Analysis of Decision under Risk", "Daniel Kahneman, Amos Tversky", 1979, "Econometrica 47(2)", "https://doi.org/10.2307/1914185", "The basis of behavioural finance and loss aversion.", "library"),
    R("guide", "Investor education portal", "Securities and Exchange Board of India", null, "SEBI", "https://investor.sebi.gov.in/", "Official investor-awareness material from India's market regulator."),
    R("guide", "Financial Education", "Reserve Bank of India", null, "RBI", "https://www.rbi.org.in/FinancialEducation/", "RBI's financial literacy resources on banking, saving and credit."),
  ],
  "Musical Instruments": [
    R("book", "Music Theory for the 21st-Century Classroom", "Robert Hutchinson", 2017, "University of Puget Sound (free online)", "https://musictheory.pugetsound.edu/mt21c/", "Free textbook covering notation, scales, chords and harmony."),
    R("book", "Open Music Theory (Version 2)", "Mark Gotham, Kyle Gullings, Chelsey Hamm et al.", 2021, "VIVA Open Publishing", "https://viva.pressbooks.pub/openmusictheory/", "Open textbook from fundamentals to form and harmony."),
    R("guide", "Music theory lessons", "Ricci Adams", null, "musictheory.net", "https://www.musictheory.net/lessons", "Short interactive lessons on reading music, rhythm, scales and chords."),
    R("paper", "The role of deliberate practice in the acquisition of expert performance", "K. Anders Ericsson, Ralf Th. Krampe, Clemens Tesch-Römer", 1993, "Psychological Review 100(3)", "https://doi.org/10.1037/0033-295X.100.3.363", "The research behind focused, deliberate practice — including studies of musicians.", "library"),
    R("documentation", "IMSLP / Petrucci Music Library", "IMSLP community", null, "IMSLP", "https://imslp.org/", "A large free library of public-domain sheet music to practise reading."),
  ],
  "Graphic Design": [
    R("book", "Practical Typography", "Matthew Butterick", null, "Free online book", "https://practicaltypography.com/", "Clear, practical rules for setting type well."),
    R("book", "The Elements of Typographic Style Applied to the Web", "Richard Rutter", null, "Free online book", "http://webtypography.net/", "Bringhurst's classic typography principles applied to screens."),
    R("guide", "Google Fonts Knowledge", "Google Fonts", null, "Google", "https://fonts.google.com/knowledge", "Guides on choosing, pairing and using typefaces."),
    R("guide", "Color system (Material Design 3)", "Google", null, "Material Design", "https://m3.material.io/styles/color/overview", "How a complete, accessible colour system is built."),
    R("guide", "Visual Hierarchy in UX: Definition", "Nielsen Norman Group", null, "NN/g", "https://www.nngroup.com/articles/visual-hierarchy-ux-definition/", "Research-based explanation of hierarchy and how people scan layouts."),
    R("paper", "A century of Gestalt psychology in visual perception: I. Perceptual grouping and figure–ground organization", "Johan Wagemans, James H. Elder, Michael Kubovy et al.", 2012, "Psychological Bulletin 138(6)", "https://doi.org/10.1037/a0029333", "The perception research behind proximity, similarity and grouping in design.", "library"),
    R("standard", "Understanding contrast (minimum) — WCAG 2.2", "W3C", 2023, "World Wide Web Consortium", "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html", "Why text needs a 4.5:1 contrast ratio and how to check it."),
  ],
};

// Extra, course-specific reading for the showcase courses (shown first).
const byCourse = {
  "Python for Beginners: Python Programming Language | Tutorial": [
    R("documentation", "The Python Tutorial", "Python Software Foundation", null, "docs.python.org", "https://docs.python.org/3/tutorial/", "The official introduction to the language."),
    R("book", "Think Python (2nd edition)", "Allen B. Downey", 2015, "Green Tea Press (free online)", "https://greenteapress.com/wp/think-python-2e/", "A gentle, free book on thinking like a programmer in Python."),
    R("book", "Automate the Boring Stuff with Python", "Al Sweigart", null, "No Starch Press (free online edition)", "https://automatetheboringstuff.com/", "Practical Python for everyday tasks — great for project ideas."),
    R("standard", "PEP 8 – Style Guide for Python Code", "Guido van Rossum, Barry Warsaw, Alyssa Coghlan", 2001, "Python Enhancement Proposals", "https://peps.python.org/pep-0008/", "The official style guide for readable Python."),
    R("standard", "PEP 20 – The Zen of Python", "Tim Peters", 2004, "Python Enhancement Proposals", "https://peps.python.org/pep-0020/", "The guiding principles of Python's design."),
  ],
  "HTML for Beginners": [
    R("documentation", "HTML: HyperText Markup Language", "Mozilla", null, "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/HTML", "Reference for every HTML element and attribute."),
    R("guide", "Web Accessibility Tutorials", "W3C Web Accessibility Initiative", null, "W3C WAI", "https://www.w3.org/WAI/tutorials/", "Step-by-step guidance on accessible page structure, images, tables and forms."),
    R("standard", "Using ARIA", "W3C", null, "World Wide Web Consortium", "https://www.w3.org/TR/using-aria/", "When (and when not) to use ARIA — including the first rule of ARIA."),
  ],
  "Basics of Business Statistics (College Level)": [
    R("book", "Introductory Statistics", "Barbara Illowsky, Susan Dean", 2013, "OpenStax", "https://openstax.org/details/books/introductory-statistics", "Free textbook matching every topic in this course."),
    R("book", "OpenIntro Statistics (4th edition)", "David Diez, Mine Çetinkaya-Rundel, Christopher Barr", 2019, "OpenIntro", "https://www.openintro.org/book/os/", "Free, widely used college statistics textbook."),
    R("documentation", "NIST/SEMATECH e-Handbook of Statistical Methods", "NIST", null, "National Institute of Standards and Technology", "https://www.itl.nist.gov/div898/handbook/", "A free reference on statistical methods used in industry."),
    R("paper", "The ASA Statement on p-Values: Context, Process, and Purpose", "Ronald L. Wasserstein, Nicole A. Lazar", 2016, "The American Statistician 70(2)", "https://doi.org/10.1080/00031305.2016.1154108", "How to interpret (and not misinterpret) p-values.", "free"),
  ],
  "Stock Trading: Ultimate Guide to swing trading stocks": [
    R("paper", "Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency", "Narasimhan Jegadeesh, Sheridan Titman", 1993, "The Journal of Finance 48(1)", "https://doi.org/10.1111/j.1540-6261.1993.tb04702.x", "The landmark study of price momentum.", "library"),
    R("paper", "Simple Technical Trading Rules and the Stochastic Properties of Stock Returns", "William Brock, Josef Lakonishok, Blake LeBaron", 1992, "The Journal of Finance 47(5)", "https://doi.org/10.1111/j.1540-6261.1992.tb04681.x", "Tests moving-average and range-breakout rules on a century of data.", "library"),
    R("paper", "Foundations of Technical Analysis: Computational Algorithms, Statistical Inference, and Empirical Implementation", "Andrew W. Lo, Harry Mamaysky, Jiang Wang", 2000, "The Journal of Finance 55(4)", "https://doi.org/10.1111/0022-1082.00265", "A rigorous, statistical look at chart patterns.", "library"),
    R("paper", "Trading Is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors", "Brad M. Barber, Terrance Odean", 2000, "The Journal of Finance 55(2)", "https://doi.org/10.1111/0022-1082.00226", "Evidence that frequent trading hurts returns — read before you trade.", "library"),
  ],
  "Typography Fundamentals - Feel confident with type!": [
    R("book", "Practical Typography", "Matthew Butterick", null, "Free online book", "https://practicaltypography.com/", "Clear, practical rules for setting type well."),
  ],
};

// Course-specific items first, then the category list without duplicates.
const referencesFor = (courseName, category) => {
  const key = String(courseName || "").replace(/\s+/g, " ").trim();
  const own = Object.entries(byCourse).find(([name]) => name.replace(/\s+/g, " ").trim() === key)?.[1] || [];
  const seen = new Set(own.map((r) => r.url));
  return [...own, ...(byCategory[category] || []).filter((r) => !seen.has(r.url))];
};

module.exports = { byCategory, byCourse, referencesFor };
