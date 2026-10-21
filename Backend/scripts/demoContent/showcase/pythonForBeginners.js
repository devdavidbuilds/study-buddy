module.exports = {
  match: "Python for Beginners: Python Programming Language | Tutorial",
  pt: "coding",
  d: "A hands-on introduction to Python for complete beginners. You will install Python, write and run your first programs, work with variables, strings and numbers, make decisions with conditions, repeat work with loops, organise code into functions, store data in lists and dictionaries, read files, handle errors and finish with a small project.",
  sk: ["Python", "Variables and data types", "Conditions and loops", "Functions", "Lists and dictionaries", "File handling", "Debugging"],
  out: [
    "Write, run and debug Python programs",
    "Use variables, strings, numbers and type conversion correctly",
    "Control program flow with conditions and loops",
    "Organise code into reusable functions",
    "Store and process data with lists, dictionaries and files",
  ],
  mods: [
    {
      t: "Getting Started with Python",
      s: "Running Python, the core data types, and getting input from and output to the user.",
      ls: [
        {
          t: "Running Your First Python Program",
          f: "Install Python, use the interactive shell and run a script file",
          s: "Set up Python, try commands in the interactive shell, and write and run your first script.",
          o: ["Install Python and check the version", "Use the interactive shell (REPL)", "Write and run a .py script with print()"],
          x: `Python is a general-purpose programming language known for its **readable syntax**. It is used for web back ends, data analysis, automation, machine learning and teaching programming.

**Installing.** Download Python 3 from python.org (on Windows tick *"Add Python to PATH"*). Check it works by opening a terminal and typing \`python --version\` — you should see something like \`Python 3.12.1\`.

**The interactive shell (REPL).** Type \`python\` to get the \`>>>\` prompt. Each line runs immediately, which is perfect for experiments:
\`>>> 2 + 3\` prints \`5\`, and \`>>> print("Hello")\` prints \`Hello\`. Type \`exit()\` to leave.

**Scripts.** Real programs live in files ending in \`.py\`. Create \`hello.py\` in a code editor (VS Code, Thonny or IDLE), write:

\`print("Hello, Study Buddy!")\`

and run it from the terminal with \`python hello.py\`. Python executes the file **top to bottom, one line at a time**.

Python is strict about a few things: text must be inside quotes, brackets must match, and — unusually — **indentation is part of the syntax**, as you will see with conditions and loops. When something is wrong, Python stops and prints an *error message* (a "traceback"). Read it from the bottom up: the last line names the error type and the line number shows where to look.

Comments start with \`#\` and are ignored by Python; use them to explain *why* code does something.`,
          c: [
            ["REPL", "Python's interactive shell (Read–Evaluate–Print Loop) that runs each line immediately."],
            ["Script", "A .py file containing a Python program that runs from top to bottom."],
            ["Traceback", "Python's error report; the last line names the error and the lines above show where it happened."],
          ],
          e: {
            t: "A first script with a comment and calculation",
            s: "Write a script that greets the user and prints how many minutes are in a week.",
            st: ["Create week.py and add a comment explaining the program", "print a greeting string", "print the result of 7 * 24 * 60"],
            so: "Running python week.py prints the greeting and 10080.",
            code: "# Prints a greeting and the number of minutes in a week\nprint(\"Hello, Study Buddy!\")\nprint(7 * 24 * 60)  # 10080",
            lang: "python",
          },
          a: ["Automating small repetitive tasks", "Quick calculations and experiments in the REPL"],
          m: [["Forgetting quotes around text", "Text (strings) must be inside quotes: print(\"Hi\")."], ["Running a script from the wrong folder", "cd into the folder containing the file, or give its full path."]],
          tip: ["Keep a REPL open next to your editor to test small ideas instantly."],
          k: ["Python runs scripts top to bottom.", "Use the REPL to experiment and .py files for programs.", "Read tracebacks from the bottom line up."],
          q: [
            ["Which command runs a script called app.py?", ["run app.py", "python app.py", "print app.py", "py.app"], 1, "python followed by the file name runs the script."],
            ["What does the # symbol start in Python?", ["A string", "A comment", "A loop", "A function"], 1, "Everything after # on a line is a comment."],
            ["Where should you start reading a traceback?", ["The first line", "The last line, which names the error", "The middle", "It doesn't matter"], 1, "The final line gives the error type and message."],
          ],
        },
        {
          t: "Variables and Data Types",
          f: "Store values in variables and use int, float, str and bool types",
          s: "Create variables, use Python's basic data types and convert between them.",
          o: ["Create and update variables", "Use int, float, str and bool", "Convert between types with int(), float() and str()"],
          x: `A **variable** is a name that refers to a value. You create one with \`=\` (assignment):

\`\`\`
name = "Asha"
age = 19
height = 1.62
is_student = True
\`\`\`

Python works out the **type** from the value:
- \`int\` — whole numbers: \`19\`, \`-4\`
- \`float\` — decimals: \`1.62\`, \`3.0\`
- \`str\` — text, in single or double quotes: \`"Asha"\`
- \`bool\` — \`True\` or \`False\`

Check a type with \`type(age)\` → \`<class 'int'>\`.

**Arithmetic:** \`+ - * /\` as usual, \`//\` for whole-number division (\`7 // 2\` is \`3\`), \`%\` for the remainder (\`7 % 2\` is \`1\`) and \`**\` for powers (\`2 ** 3\` is \`8\`). Note that \`/\` always gives a float: \`6 / 2\` is \`3.0\`.

Variables can be **reassigned**: \`age = age + 1\` (or the shortcut \`age += 1\`).

Types matter: \`"5" + 5\` is an error, because Python will not guess whether you meant text or a number. **Convert** explicitly:
- \`int("5")\` → \`5\`
- \`float("2.5")\` → \`2.5\`
- \`str(19)\` → \`"19"\`

Naming rules: names may contain letters, digits and underscores, cannot start with a digit, and are case-sensitive (\`Age\` and \`age\` are different). By convention Python uses **snake_case**: \`total_marks\`, not \`TotalMarks\`. Choose names that describe the value.`,
          c: [
            ["Variable", "A name that refers to a value, created with the = assignment operator."],
            ["Data type", "The kind of value, such as int, float, str or bool, which decides what operations work on it."],
            ["Type conversion", "Changing a value to another type with functions such as int(), float() and str()."],
          ],
          e: {
            t: "Calculating an average mark",
            s: "Three marks are stored as text (as they would be when read from a form): \"72\", \"85\", \"90\".",
            st: ["Convert each string to an int", "Add them and divide by 3", "Round the result to 2 decimal places and print it"],
            so: "The average is 82.33.",
            code: "m1, m2, m3 = \"72\", \"85\", \"90\"\ntotal = int(m1) + int(m2) + int(m3)\naverage = total / 3\nprint(round(average, 2))  # 82.33",
            lang: "python",
          },
          a: ["Storing user details and settings", "Doing calculations in scripts"],
          m: [["Adding a string and a number", "Convert first: int(\"5\") + 5."], ["Expecting / to give an int", "Use // for whole-number division."]],
          tip: ["Use type(value) whenever you are unsure what you are working with."],
          k: ["Variables name values; = assigns.", "Core types: int, float, str, bool.", "Convert types explicitly with int(), float(), str()."],
          q: [
            ["What is the result of 7 // 2?", ["3.5", "3", "4", "1"], 1, "// is floor (whole-number) division."],
            ["What is the type of 3.0?", ["int", "float", "str", "bool"], 1, "A number with a decimal point is a float."],
            ["What happens with \"5\" + 5?", ["10", "\"55\"", "A TypeError", "5"], 2, "Python does not mix str and int automatically."],
          ],
        },
        {
          t: "Strings, Input and Output",
          f: "Read user input, format output with f-strings and use string methods",
          s: "Get input from the user, build clear output with f-strings, and manipulate text with string methods.",
          o: ["Read input with input()", "Format output with f-strings", "Use common string methods and indexing"],
          x: `Programs become useful when they interact. \`input()\` shows a prompt and returns what the user types — **always as a string**:

\`\`\`
name = input("What is your name? ")
age = int(input("How old are you? "))
\`\`\`

**f-strings** are the clearest way to build output. Put \`f\` before the quotes and expressions inside \`{}\`:

\`print(f"Hi {name}, next year you will be {age + 1}.")\`

Format numbers too: \`f"{3.14159:.2f}"\` gives \`3.14\`.

**Strings are sequences** of characters, so you can index and slice them (counting starts at **0**):
- \`word = "Python"\`, \`word[0]\` → \`"P"\`, \`word[-1]\` → \`"n"\`
- \`word[0:3]\` → \`"Pyt"\` (start included, end excluded)
- \`len(word)\` → \`6\`

Useful **string methods** (they return new strings — strings themselves never change):
- \`.lower()\`, \`.upper()\`, \`.title()\`
- \`.strip()\` removes spaces at both ends — essential for cleaning input
- \`.replace("a", "b")\`
- \`.split(",")\` turns \`"a,b,c"\` into a list \`["a", "b", "c"]\`
- \`"py" in "python"\` → \`True\`

Always clean and convert input before using it: \`input().strip()\` removes accidental spaces, and \`int(...)\` turns digits into a number you can calculate with.`,
          c: [
            ["input()", "A function that shows a prompt and returns the user's typed text as a string."],
            ["f-string", "A string prefixed with f where {expressions} are evaluated and inserted."],
            ["Indexing and slicing", "Getting characters by position (s[0]) or ranges (s[1:4]) from a string."],
          ],
          e: {
            t: "A tidy greeting program",
            s: "Ask for a full name (possibly with extra spaces and odd capitals) and print initials and a greeting.",
            st: ["Read the name with input() and clean it with .strip().title()", "Split it into words and take the first letter of each", "Print a formatted greeting with an f-string"],
            so: "For '  asha kumar ' the program prints 'Hello, Asha Kumar (AK)!'",
            code: "name = input(\"Full name: \").strip().title()\ninitials = \"\".join(part[0] for part in name.split())\nprint(f\"Hello, {name} ({initials})!\")",
            lang: "python",
          },
          a: ["Command-line tools and quizzes", "Cleaning and formatting text data"],
          m: [["Doing maths on input() directly", "Convert with int() or float() first."], ["Expecting .upper() to change the original string", "Strings are immutable; assign the result: s = s.upper()."]],
          tip: ["Use .strip() on every piece of user input."],
          k: ["input() always returns a string.", "f-strings make output clear and formatted.", "Strings index from 0 and have many useful methods."],
          q: [
            ["What type does input() return?", ["int", "str", "float", "It depends on what is typed"], 1, "input() always returns a string."],
            ["If word = \"Python\", what is word[1:4]?", ["\"Pyt\"", "\"yth\"", "\"ytho\"", "\"tho\""], 1, "Indices 1, 2 and 3: y, t, h."],
            ["Which method removes spaces from both ends of a string?", [".split()", ".strip()", ".lower()", ".replace()"], 1, ".strip() trims leading and trailing whitespace."],
          ],
        },
      ],
    },
    {
      t: "Controlling the Flow",
      s: "Making decisions with conditions, repeating work with loops, and packaging logic into functions.",
      ls: [
        {
          t: "Making Decisions with if, elif and else",
          f: "Use comparisons, boolean logic and if/elif/else blocks",
          s: "Write programs that choose what to do using comparisons, logical operators and indented blocks.",
          o: ["Use comparison operators", "Combine conditions with and, or, not", "Write if/elif/else blocks with correct indentation"],
          x: `Programs need to make decisions. A **condition** is an expression that is either \`True\` or \`False\`, usually built with comparison operators:

\`==\` equal, \`!=\` not equal, \`<\`, \`>\`, \`<=\`, \`>=\`

(Note: \`=\` assigns, \`==\` compares — mixing them up is a classic beginner bug.)

An \`if\` statement runs a block only when its condition is true:

\`\`\`
mark = 72
if mark >= 90:
    grade = "A"
elif mark >= 75:
    grade = "B"
elif mark >= 50:
    grade = "C"
else:
    grade = "Fail"
\`\`\`

Python checks the conditions **top to bottom** and runs the **first** one that is true, so order matters: check the highest band first.

**Indentation is syntax.** The lines belonging to each branch are indented (4 spaces by convention) after a line ending in a colon \`:\`. Inconsistent indentation causes an \`IndentationError\`.

**Logical operators** combine conditions:
- \`and\` — both must be true: \`if age >= 18 and has_id:\`
- \`or\` — at least one: \`if day == "Sat" or day == "Sun":\`
- \`not\` — reverses: \`if not is_logged_in:\`

Python also allows chained comparisons such as \`if 0 <= mark <= 100:\` — a neat way to check a range.`,
          c: [
            ["Condition", "An expression that evaluates to True or False."],
            ["elif", "'Else if' — an extra condition checked only when the previous ones were false."],
            ["Indentation", "Leading spaces that define which lines belong to a block in Python."],
          ],
          e: {
            t: "Validating and grading a mark",
            s: "Read a mark and print an error if it is outside 0–100, otherwise print the grade.",
            st: ["Convert the input to an int", "Check the range first with a chained comparison", "Use if/elif/else for the grade bands from highest to lowest"],
            so: "Input 82 prints 'Grade: B'; input 120 prints 'Mark must be between 0 and 100'.",
            code: "mark = int(input(\"Mark: \"))\nif not 0 <= mark <= 100:\n    print(\"Mark must be between 0 and 100\")\nelif mark >= 90:\n    print(\"Grade: A\")\nelif mark >= 75:\n    print(\"Grade: B\")\nelif mark >= 50:\n    print(\"Grade: C\")\nelse:\n    print(\"Grade: Fail\")",
            lang: "python",
          },
          a: ["Input validation", "Grading, pricing and eligibility rules"],
          m: [["Using = instead of == in a condition", "Use == to compare; = only assigns."], ["Ordering elif bands from lowest to highest", "Check the most restrictive condition first."]],
          tip: ["Test each branch at least once, including boundary values like 50 and 75."],
          k: ["Conditions are True/False expressions built with comparisons.", "if/elif/else runs the first matching branch.", "Indentation defines blocks."],
          q: [
            ["Which operator tests equality?", ["=", "==", "!=", "=>"], 1, "== compares; = assigns."],
            ["With mark = 80, which branch runs: if mark >= 50 … elif mark >= 75 …?", ["The elif", "The if (mark >= 50)", "Both", "Neither"], 1, "The first true condition wins, so check the highest band first."],
            ["What does 'not True' evaluate to?", ["True", "False", "None", "An error"], 1, "not reverses a boolean."],
          ],
        },
        {
          t: "Repeating Work with Loops",
          f: "Use for loops with range, while loops, break and continue",
          s: "Repeat actions with for and while loops and control them with break and continue.",
          o: ["Use for loops over sequences and range()", "Use while loops with a stopping condition", "Control loops with break and continue"],
          x: `Loops repeat code so you do not have to copy it.

**for loops** visit each item of a sequence:

\`\`\`
for subject in ["Maths", "Physics", "English"]:
    print(subject)
\`\`\`

\`range()\` produces numbers to loop over:
- \`range(5)\` → 0, 1, 2, 3, 4 (stops *before* 5)
- \`range(1, 6)\` → 1 to 5
- \`range(0, 10, 2)\` → 0, 2, 4, 6, 8

A common pattern is the **accumulator**: start a total at 0 and add to it in the loop.

**while loops** repeat *as long as* a condition is true — useful when you do not know in advance how many times:

\`\`\`
password = ""
while password != "secret":
    password = input("Password: ")
\`\`\`

Something inside a while loop must eventually make the condition false, or you get an **infinite loop** (stop it with Ctrl + C).

**Loop control:**
- \`break\` exits the loop immediately
- \`continue\` skips to the next iteration

Loops can be **nested** (a loop inside a loop), for example to print a multiplication table — but keep nesting shallow for readability. Prefer \`for\` when you are looping over a known collection; use \`while\` for "keep going until…" situations.`,
          c: [
            ["for loop", "Repeats a block once for each item in a sequence."],
            ["range()", "Generates a sequence of integers; the stop value is excluded."],
            ["Infinite loop", "A loop whose condition never becomes false, so it never ends."],
          ],
          e: {
            t: "Summing marks until the user types 'done'",
            s: "Keep reading marks, then print the count and average.",
            st: ["Start total = 0 and count = 0", "Loop with while True; break when the input is 'done'", "Add each mark to total and increase count, then print the average if count > 0"],
            so: "Entering 70, 80, 90 and done prints '3 marks, average 80.0'.",
            code: "total, count = 0, 0\nwhile True:\n    entry = input(\"Mark (or done): \").strip()\n    if entry == \"done\":\n        break\n    total += int(entry)\n    count += 1\nif count:\n    print(f\"{count} marks, average {total / count}\")",
            lang: "python",
          },
          a: ["Processing every row in a file or list", "Retrying until valid input is given"],
          m: [["Expecting range(5) to include 5", "range stops before the end value."], ["Forgetting to update the while condition", "Make sure something in the loop changes the condition."]],
          tip: ["Print the loop variable while debugging to see each iteration."],
          k: ["for loops go through sequences; range() makes number sequences.", "while loops run until a condition becomes false.", "break exits a loop; continue skips one iteration."],
          q: [
            ["Which numbers does range(2, 6) produce?", ["2, 3, 4, 5, 6", "2, 3, 4, 5", "3, 4, 5, 6", "2, 4, 6"], 1, "The stop value 6 is excluded."],
            ["What does break do inside a loop?", ["Skips one iteration", "Exits the loop immediately", "Restarts the loop", "Pauses the program"], 1, "break leaves the loop entirely."],
            ["When is a while loop the better choice?", ["When looping over a list", "When you repeat until a condition changes and don't know how many times", "Never", "Only for numbers"], 1, "while suits 'keep going until…' situations."],
          ],
        },
        {
          t: "Writing Functions",
          f: "Define functions with parameters, return values and docstrings",
          s: "Package logic into functions with parameters and return values, and understand scope.",
          o: ["Define and call functions", "Use parameters, default values and return", "Explain local scope"],
          x: `A **function** is a named block of reusable code. You have already used built-in ones like \`print()\`, \`len()\` and \`int()\`. Defining your own keeps programs organised and avoids repetition.

\`\`\`
def average(numbers):
    """Return the mean of a list of numbers."""
    return sum(numbers) / len(numbers)

result = average([70, 80, 90])   # 80.0
\`\`\`

- \`def\` starts the definition, followed by the name and **parameters** in brackets.
- The indented body runs only when the function is **called**.
- \`return\` sends a value back to the caller and ends the function. A function without \`return\` returns \`None\`.
- The triple-quoted **docstring** documents what the function does.

**Default parameter values** make arguments optional:
\`def greet(name, greeting="Hello"):\` — \`greet("Asha")\` uses "Hello"; \`greet("Asha", "Hi")\` overrides it. You can also pass **keyword arguments**: \`greet(greeting="Hey", name="Ravi")\`.

**Scope:** variables created inside a function are *local* — they exist only while it runs and cannot be seen outside. Pass data in through parameters and get results out through \`return\`, rather than relying on global variables.

**print vs return:** printing only shows a value on screen; returning gives it back so other code can use it. Functions that return values are easier to test and reuse.

Good functions do **one thing**, have a descriptive verb-based name (\`calculate_grade\`, \`is_valid_email\`) and are short enough to read at a glance.`,
          c: [
            ["Parameter", "A named input listed in a function definition."],
            ["return", "Sends a value back to the caller and ends the function."],
            ["Local scope", "Variables created inside a function exist only inside that function."],
          ],
          e: {
            t: "Refactoring grading into a function",
            s: "Turn the grading logic from the conditions lesson into a reusable function and test it.",
            st: ["Define grade(mark) with a docstring", "Return a letter instead of printing it", "Call it in a loop over several marks and print each result"],
            so: "grade(95) returns 'A', grade(80) 'B', grade(60) 'C', grade(30) 'Fail' — and the same function can now be reused anywhere.",
            code: "def grade(mark):\n    \"\"\"Return the letter grade for a mark from 0 to 100.\"\"\"\n    if mark >= 90:\n        return \"A\"\n    if mark >= 75:\n        return \"B\"\n    if mark >= 50:\n        return \"C\"\n    return \"Fail\"\n\nfor m in [95, 80, 60, 30]:\n    print(m, grade(m))",
            lang: "python",
          },
          a: ["Reusing calculations across a program", "Breaking big problems into small, testable steps"],
          m: [["Printing instead of returning", "Return values so other code can use them."], ["Relying on global variables", "Pass inputs as parameters and return outputs."]],
          tip: ["If you copy and paste code a third time, turn it into a function."],
          k: ["def defines a function; calling it runs the body.", "Parameters bring data in; return sends results out.", "Variables inside a function are local."],
          q: [
            ["What does a function return if it has no return statement?", ["0", "None", "An empty string", "An error"], 1, "Functions without return give back None."],
            ["Given def greet(name, greeting=\"Hello\"), what does greet(\"Ravi\") use as greeting?", ["Nothing", "\"Hello\"", "\"Ravi\"", "An error"], 1, "The default value is used when the argument is omitted."],
            ["Can code outside a function use a variable created inside it?", ["Yes, always", "No — it is local to the function", "Only if it is a number", "Only after printing it"], 1, "Local variables disappear when the function ends."],
          ],
        },
      ],
    },
    {
      t: "Working with Data",
      s: "Collections for storing many values, reading and writing files safely, and putting it all together in a project.",
      ls: [
        {
          t: "Lists and Dictionaries",
          f: "Store and process collections with lists, dictionaries and comprehensions",
          s: "Use lists for ordered collections and dictionaries for key–value data, and process them with loops.",
          o: ["Create, index and modify lists", "Store and look up data in dictionaries", "Write a simple list comprehension"],
          x: `Most programs work with **collections** of data.

**Lists** are ordered and changeable:

\`\`\`
marks = [72, 85, 90]
marks.append(64)        # add to the end
marks[0] = 75           # change an item
marks.remove(85)        # remove by value
print(len(marks), max(marks), sum(marks))
\`\`\`

Lists are indexed from 0 like strings, support slicing (\`marks[1:3]\`), and can be sorted with \`marks.sort()\` or \`sorted(marks)\`.

**Dictionaries** store **key → value** pairs, ideal when you look things up by name:

\`\`\`
student = {"name": "Asha", "dept": "CSE", "year": 2}
print(student["name"])          # Asha
student["year"] = 3             # update
print(student.get("email", "-")) # safe lookup with a default
\`\`\`

Loop over a dictionary with \`for key, value in student.items():\`.

You can **combine** them: a list of dictionaries is a natural way to represent a table of records:
\`students = [{"name": "Asha", "mark": 82}, {"name": "Ravi", "mark": 67}]\`

**List comprehensions** build a new list in one readable line:
\`passed = [s["name"] for s in students if s["mark"] >= 50]\`

Choose the structure by how you use the data: a **list** when order matters and you go through items in sequence; a **dictionary** when you need fast lookup by a key such as a roll number. (Tuples and sets exist too: tuples are fixed lists, sets hold unique values.)`,
          c: [
            ["List", "An ordered, changeable collection indexed from 0."],
            ["Dictionary", "A collection of key–value pairs for fast lookup by key."],
            ["List comprehension", "A compact expression that builds a new list from an existing one, optionally filtering items."],
          ],
          e: {
            t: "Class report from a list of records",
            s: "Given four students with marks, list who passed and find the top scorer.",
            st: ["Store each student as a dictionary inside a list", "Use a list comprehension to collect names with mark ≥ 50", "Use max() with a key to find the top student"],
            so: "Passed: ['Asha', 'Ravi', 'Meena']; top scorer: Meena (91).",
            code: "students = [\n    {\"name\": \"Asha\", \"mark\": 82},\n    {\"name\": \"Ravi\", \"mark\": 67},\n    {\"name\": \"John\", \"mark\": 41},\n    {\"name\": \"Meena\", \"mark\": 91},\n]\npassed = [s[\"name\"] for s in students if s[\"mark\"] >= 50]\ntop = max(students, key=lambda s: s[\"mark\"])\nprint(passed, top[\"name\"], top[\"mark\"])",
            lang: "python",
          },
          a: ["Storing records such as students, products or orders", "Counting and grouping data"],
          m: [["Looking up a missing dictionary key with []", "Use .get(key, default) when a key might not exist."], ["Changing a list while looping over it", "Build a new list (e.g. with a comprehension) instead."]],
          tip: ["Print collections often while learning — seeing the data makes bugs obvious."],
          k: ["Lists are ordered collections; dictionaries map keys to values.", "A list of dictionaries represents a table of records.", "Comprehensions build filtered lists concisely."],
          q: [
            ["Which method adds an item to the end of a list?", [".add()", ".append()", ".insert_end()", ".push()"], 1, "list.append(x) adds x at the end."],
            ["How do you safely read a dictionary key that may be missing?", ["d[key]", "d.get(key, default)", "d.key", "d.find(key)"], 1, ".get returns a default instead of raising KeyError."],
            ["What does [n * 2 for n in [1, 2, 3]] produce?", ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "6"], 1, "Each element is doubled."],
          ],
        },
        {
          t: "Files and Error Handling",
          f: "Read and write files with 'with' and handle exceptions with try/except",
          s: "Save and load data with files, and make programs robust with try/except.",
          o: ["Read and write text files with with open()", "Handle exceptions with try/except", "Choose specific exception types"],
          x: `Variables disappear when a program ends; **files** keep data between runs.

The safe way to open a file is with a \`with\` block, which closes it automatically even if an error occurs:

\`\`\`
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("First note\\n")

with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
\`\`\`

Modes: \`"r"\` read (the default), \`"w"\` write (**replaces** the file), \`"a"\` append. For tables, the built-in \`csv\` module reads and writes comma-separated files, and \`json\` saves lists and dictionaries.

**Errors at run time** are called **exceptions**: a missing file (\`FileNotFoundError\`), text that is not a number (\`ValueError\`), dividing by zero (\`ZeroDivisionError\`). Unhandled, they crash the program. Handle the ones you expect with \`try/except\`:

\`\`\`
try:
    age = int(input("Age: "))
except ValueError:
    print("Please enter a whole number.")
else:
    print(f"Next year you will be {age + 1}")
\`\`\`

Catch **specific** exceptions, not a bare \`except:\` — catching everything hides real bugs. The optional \`else\` runs when no error happened, and \`finally\` always runs (useful for clean-up).

Together, files and exception handling turn a script into a program you can trust with real data.`,
          c: [
            ["with open()", "Opens a file and guarantees it is closed when the block ends."],
            ["Exception", "An error raised while a program runs, such as ValueError or FileNotFoundError."],
            ["try/except", "A block that runs code and handles specific exceptions instead of crashing."],
          ],
          e: {
            t: "Loading saved marks safely",
            s: "Read marks from marks.txt (one per line), skipping bad lines, and handle a missing file.",
            st: ["Wrap opening the file in try/except FileNotFoundError", "Inside the loop, convert each line with int() in its own try/except ValueError", "Print the valid marks and how many lines were skipped"],
            so: "A file containing 70, abc, 85 prints [70, 85] and 'skipped 1 line'; a missing file prints a friendly message instead of crashing.",
            code: "marks, skipped = [], 0\ntry:\n    with open(\"marks.txt\", encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                marks.append(int(line))\n            except ValueError:\n                skipped += 1\n    print(marks, f\"skipped {skipped} line(s)\")\nexcept FileNotFoundError:\n    print(\"marks.txt not found - nothing to load yet.\")",
            lang: "python",
          },
          a: ["Saving app data between runs", "Processing data files safely"],
          m: [["Opening with 'w' when you meant to add", "'w' erases the file; use 'a' to append."], ["Using a bare except:", "Catch the specific exception you expect."]],
          tip: ["Always pass encoding=\"utf-8\" when opening text files."],
          k: ["Use with open() so files always close.", "Modes: r read, w overwrite, a append.", "Handle expected errors with specific except clauses."],
          q: [
            ["Which mode adds to the end of an existing file?", ["\"r\"", "\"w\"", "\"a\"", "\"x\""], 2, "\"a\" appends; \"w\" overwrites."],
            ["What does int(\"abc\") raise?", ["TypeError", "ValueError", "FileNotFoundError", "Nothing"], 1, "The text is not a valid integer, so ValueError is raised."],
            ["Why prefer with open(...) over open() alone?", ["It is faster", "It closes the file automatically, even after errors", "It encrypts the file", "It reads only numbers"], 1, "The context manager guarantees the file is closed."],
          ],
        },
        {
          t: "Project: A Student Marks Manager",
          f: "Combine functions, collections, files and error handling in a small program",
          s: "Build a menu-driven program that adds students, stores marks in a file and prints a report.",
          o: ["Plan a program by breaking it into functions", "Combine collections, files and error handling", "Test and improve a working program"],
          x: `This project combines everything in the course into one useful program: a **marks manager** that adds students, saves them to a file and prints a report.

**1. Plan before coding.** Break the problem into small functions:
- \`load_students(path)\` → list of dictionaries (empty if the file does not exist)
- \`save_students(path, students)\`
- \`add_student(students)\` — asks for a name and a validated mark
- \`report(students)\` — prints each student, grade, class average and top scorer

**2. Choose the data structure.** A list of dictionaries like \`{"name": "Asha", "mark": 82}\` fits naturally, and the \`json\` module saves and loads it in one line each: \`json.dump(students, f)\` and \`json.load(f)\`.

**3. Build a menu loop.** A \`while True\` loop shows options (1 Add, 2 Report, 3 Save and quit), reads a choice, calls the right function and \`break\`s on quit.

**4. Validate everything.** Re-ask until the mark is a number between 0 and 100 — reuse the \`try/except\` and range check from earlier lessons.

**5. Test as you go.** Write one function, run it, then write the next. Try awkward inputs: empty names, letters instead of numbers, quitting with no students. Each bug you find and fix is real programming experience.

**Extensions** once it works: search by name, delete a student, sort the report by mark, or export a CSV for a spreadsheet. You now have the core tools of Python — the next steps are modules and libraries (\`pandas\` for data, \`flask\` for web apps, \`turtle\` for graphics) that build on exactly these foundations.`,
          c: [
            ["Decomposition", "Breaking a problem into small functions that each do one job."],
            ["JSON file", "A text file storing lists and dictionaries, saved with json.dump and loaded with json.load."],
            ["Menu loop", "A while loop that shows options and runs the chosen action until the user quits."],
          ],
          e: {
            t: "The validated-mark helper",
            s: "Write the helper the project uses to read a mark between 0 and 100, re-asking until the input is valid.",
            st: ["Loop with while True", "Try converting the input with int(); on ValueError print a message and continue", "Return the mark only if 0 <= mark <= 100, otherwise ask again"],
            so: "Typing 'eighty', then 120, then 80 shows two helpful messages and returns 80.",
            code: "def ask_mark(prompt=\"Mark (0-100): \"):\n    while True:\n        try:\n            mark = int(input(prompt))\n        except ValueError:\n            print(\"Please type a whole number.\")\n            continue\n        if 0 <= mark <= 100:\n            return mark\n        print(\"The mark must be between 0 and 100.\")",
            lang: "python",
          },
          a: ["Small tools for classes, clubs or shops", "A portfolio project to show your skills"],
          m: [["Writing the whole program before running anything", "Build and test one function at a time."], ["Saving only when the program ends normally", "Save after each change, or handle errors so data is not lost."]],
          tip: ["Keep each function under about 20 lines; if it grows, split it."],
          k: ["Plan programs as small functions with clear jobs.", "Lists of dictionaries + json give simple persistent storage.", "Validate input and test edge cases as you build."],
          q: [
            ["Which module saves a list of dictionaries to a file most simply?", ["math", "json", "random", "time"], 1, "json.dump writes lists and dictionaries as text."],
            ["What is the best way to build a larger program?", ["Write everything, then run it once", "Build and test one small function at a time", "Avoid functions", "Copy code from each lesson unchanged"], 1, "Incremental building makes bugs easy to find."],
            ["In a menu loop, what usually ends the program?", ["continue", "break when the user chooses quit", "return 0", "Closing the editor"], 1, "break exits the while loop when the user quits."],
          ],
        },
      ],
    },
  ],
};
