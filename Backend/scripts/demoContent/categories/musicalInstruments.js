// Musical Instruments curriculum — used for every Musical Instruments course
// that has no course-specific content. {course} = course name, {topic} =
// instrument detected from the title (e.g. "guitar"), else "instrument".
module.exports = {
  pt: "technique-drill",
  d: "{course} takes you step by step from setting up your {topic} to playing real music: posture and tuning, rhythm and counting, notes and scales, chords and progressions, reading music, effective practice and expressive performance. Each lesson includes a guided drill and a short check; each module ends with a quiz.",
  sk: ["{topic}", "Rhythm and timing", "Scales and keys", "Chords", "Reading music", "Practice technique", "Performance"],
  out: [
    "Set up, hold and tune your instrument with good posture",
    "Keep steady time and count common rhythms",
    "Name notes, build major scales and recognise keys",
    "Play and change between basic chords in common progressions",
    "Practise efficiently and perform a short piece with expression",
  ],
  mods: [
    {
      t: "Getting Started",
      s: "A healthy playing position, a tuned instrument, a steady pulse, and the names of the notes you will play.",
      ls: [
        {
          t: "Posture, Setup and Tuning",
          f: "Set up your instrument, sit or stand correctly and tune accurately",
          s: "Build the physical habits that make playing comfortable, and learn to tune before every session.",
          o: ["Adopt a relaxed, balanced playing posture", "Tune your instrument with a tuner", "Warm up to avoid strain"],
          x: `Welcome to **{course}**. Good playing starts before the first note: with how you hold your {topic} and whether it is in tune.

**Posture.** Sit (or stand) tall but relaxed, shoulders down, feet flat. Bring the instrument to your body rather than hunching towards it. Tension is the enemy — tight shoulders, wrists or jaw make playing harder, slower and can cause injury over time. Check yourself every few minutes: if something feels strained, stop, shake out and reset.

**Hands.** Keep wrists as straight as possible and fingers curved, using only the pressure you need. Many beginners press far harder than necessary; lighter technique is faster and more accurate.

**Tuning.** Music sounds "wrong" on an out-of-tune instrument even when every note is correct. Use a clip-on or app tuner: play a note, read whether it is *flat* (too low) or *sharp* (too high), and adjust until the needle is centred. Most tuners use the standard reference **A = 440 Hz**. Tune at the start of every session and whenever the temperature changes.

**Warm-up.** Spend three to five minutes on gentle stretches and slow, easy playing before anything demanding — like an athlete warming up.

These habits feel slow at first, but they are what let you practise for longer, improve faster and avoid pain.`,
          c: [
            ["Flat and sharp", "A note that is lower (flat) or higher (sharp) than the target pitch."],
            ["A = 440 Hz", "The standard reference pitch most tuners use."],
            ["Relaxed technique", "Using the minimum tension and pressure needed to play cleanly."],
          ],
          e: {
            t: "A pre-practice routine",
            s: "You have 30 minutes to practise and want to start well.",
            st: ["Spend 2 minutes on shoulder, wrist and finger stretches", "Tune every string/note with a tuner until each reads centred", "Play slowly and lightly for 3 minutes, checking posture in a mirror"],
            so: "After about seven minutes you are tuned, warmed up and relaxed, so the remaining practice is more accurate and comfortable.",
          },
          a: ["Practising for longer without strain", "Playing in tune with other musicians or recordings"],
          m: [["Skipping tuning because 'it sounded fine yesterday'", "Instruments drift; tune every session."], ["Pressing or gripping too hard", "Find the lightest pressure that still gives a clean note."]],
          tip: ["Film yourself for 30 seconds — posture problems are obvious on video."],
          k: ["Relaxed, balanced posture prevents strain and speeds progress.", "Tune before every session; flat is low, sharp is high.", "Warm up gently before demanding practice."],
          q: [
            ["A tuner shows your note is slightly too high. The note is…", ["Flat", "Sharp", "Natural", "Muted"], 1, "Sharp means higher than the target pitch."],
            ["What is the most common standard reference pitch?", ["A = 400 Hz", "A = 440 Hz", "C = 440 Hz", "A = 512 Hz"], 1, "Most modern tuning uses A = 440 Hz."],
            ["Why avoid excess tension while playing?", ["It makes the instrument louder", "It slows you down and can cause strain or injury", "It improves tuning", "It is required for chords"], 1, "Relaxed technique is faster, more accurate and safer."],
          ],
        },
        {
          t: "Rhythm, Pulse and Counting",
          f: "Keep a steady beat and count whole, half, quarter and eighth notes",
          s: "Develop a steady sense of time with a metronome and learn to count the most common note values.",
          o: ["Keep a steady pulse with a metronome", "Count whole, half, quarter and eighth notes in 4/4", "Read a simple time signature"],
          x: `Rhythm is the backbone of music: a wrong note in time sounds better than a right note out of time.

The **pulse** (beat) is the steady heartbeat you tap your foot to. Its speed is the **tempo**, measured in beats per minute (BPM). A **metronome** clicks a steady beat so you can train your timing — start slow (60–70 BPM) and only speed up when a passage is clean.

Beats are grouped into **bars** (measures). The **time signature** shows how: in **4/4**, the most common, there are four beats per bar and the quarter note gets one beat. 3/4 (waltz time) has three.

Note values in 4/4:
- **Whole note** = 4 beats — count "1-2-3-4"
- **Half note** = 2 beats — "1-2"
- **Quarter note** = 1 beat — "1"
- **Eighth notes** = half a beat each — "1-and-2-and-3-and-4-and"

**Rests** are silences of the same lengths, and they must be counted just as carefully as notes.

Counting out loud while you play may feel awkward, but it is the fastest way to internalise rhythm. Clapping a rhythm before playing it on your {topic} separates the timing problem from the finger problem.`,
          c: [
            ["Tempo (BPM)", "The speed of the beat, in beats per minute."],
            ["Time signature", "The two numbers at the start of music showing beats per bar and which note gets one beat."],
            ["Eighth note", "A note lasting half a beat in 4/4; two fit in one beat, counted '1-and'."],
          ],
          e: {
            t: "Counting a bar",
            s: "A 4/4 bar contains: a half note, then two eighth notes, then a quarter note.",
            st: ["Half note = beats 1–2: count '1-2'", "Two eighths = beat 3: count '3-and'", "Quarter note = beat 4: count '4' — total 2 + ½ + ½ + 1 = 4 beats"],
            so: "Count '1 - 2 - 3-and - 4' while clapping on 1, 3, 'and' and 4; the bar adds up to exactly four beats.",
          },
          a: ["Playing along with recordings or a band", "Learning songs from sheet music or tabs"],
          m: [["Speeding up during easy parts and slowing in hard parts", "Practise with a metronome at a tempo where the hardest part is clean."], ["Ignoring rests", "Count rests out loud just like notes."]],
          tip: ["Set the metronome 10 BPM below your comfortable speed when learning anything new."],
          k: ["Steady time matters more than speed.", "In 4/4: whole = 4, half = 2, quarter = 1, eighth = ½ beat.", "Count out loud and use a metronome."],
          q: [
            ["How many beats does a half note get in 4/4?", ["1", "2", "3", "4"], 1, "A half note lasts two beats."],
            ["In a 3/4 time signature, how many beats are in each bar?", ["2", "3", "4", "6"], 1, "The top number gives beats per bar."],
            ["How are four eighth notes counted across two beats?", ["1-2-3-4", "1-and-2-and", "1-e-and-a", "1-2"], 1, "Each beat splits into '1-and', '2-and'."],
          ],
        },
        {
          t: "Notes and the Musical Alphabet",
          f: "Name notes, understand octaves, sharps and flats, and find them on your instrument",
          s: "Learn the musical alphabet, how sharps and flats fit between notes, and how octaves repeat.",
          o: ["Recite the musical alphabet", "Explain whole steps, half steps, sharps and flats", "Find the same note in different octaves"],
          x: `Western music uses just seven letter names: **A B C D E F G**, then it repeats. The repeated note is an **octave** higher — same letter, double the frequency, and it sounds like a higher version of the same note.

Between most letter names there is an extra note, making **12 different notes** in total (the *chromatic* scale):

\`C  C♯/D♭  D  D♯/E♭  E  F  F♯/G♭  G  G♯/A♭  A  A♯/B♭  B  (C)\`

- A **sharp (♯)** raises a note by one half step; a **flat (♭)** lowers it by one half step. C♯ and D♭ are the same pitch with two names (*enharmonic* notes).
- A **half step** (semitone) is the smallest distance between notes; a **whole step** (tone) is two half steps.
- **E–F and B–C have no note between them** — they are only a half step apart. This explains the pattern of black keys on a piano (missing between E–F and B–C) and why some frets are "special" on a guitar.

Learn where these notes are on your {topic}. Start with one reference note (for example middle C, or the open strings), find every note up to the next octave, and say the names aloud as you play them. Knowing note names is what lets you understand scales, chords and written music in the next module.`,
          c: [
            ["Octave", "The distance to the next note with the same letter name, at double the frequency."],
            ["Half step / whole step", "The smallest distance between two notes; a whole step equals two half steps."],
            ["Enharmonic notes", "Two names for the same pitch, such as C♯ and D♭."],
          ],
          e: {
            t: "Counting half steps",
            s: "How many half steps are there from C up to G?",
            st: ["List the chromatic notes: C, C♯, D, D♯, E, F, F♯, G", "Count the moves: C→C♯ (1), →D (2), →D♯ (3), →E (4), →F (5), →F♯ (6), →G (7)", "Remember E→F is only one half step"],
            so: "C to G is 7 half steps — the interval called a perfect fifth, which you will meet again in chords.",
          },
          a: ["Understanding chord and scale names", "Communicating with other musicians"],
          m: [["Assuming every pair of letters has a sharp between them", "Remember E–F and B–C are only a half step apart."], ["Learning shapes without note names", "Say note names while practising so they stick."]],
          tip: ["Pick one 'note of the day' and find it everywhere on your instrument."],
          k: ["Seven letter names, twelve notes, repeating in octaves.", "Sharps raise and flats lower by a half step.", "E–F and B–C are half steps with nothing between."],
          q: [
            ["Which pair of notes has no sharp or flat between them?", ["C–D", "E–F", "F–G", "A–B"], 1, "E–F (and B–C) are only a half step apart."],
            ["C♯ and D♭ are…", ["Different pitches", "The same pitch with two names", "An octave apart", "Not real notes"], 1, "They are enharmonic equivalents."],
            ["How many different notes are there before the pattern repeats?", ["7", "8", "12", "24"], 2, "The chromatic scale has 12 notes per octave."],
          ],
        },
      ],
    },
    {
      t: "Building Musical Vocabulary",
      s: "The major scale and keys, how chords are built from them, and how to read the notation used for your instrument.",
      ls: [
        {
          t: "The Major Scale and Keys",
          f: "Build major scales from the whole- and half-step pattern and understand keys",
          s: "Use the major-scale formula to build any major scale and see how it defines a key.",
          o: ["State the major-scale step pattern", "Build a major scale from any starting note", "Explain what a key signature tells you"],
          x: `A **scale** is a set of notes arranged in order that sounds like it belongs together. The most important one in Western music is the **major scale** — the familiar "do-re-mi-fa-so-la-ti-do".

Every major scale follows the same pattern of whole (W) and half (H) steps:

**W – W – H – W – W – W – H**

Starting on C gives **C D E F G A B C** — all natural notes, the white keys on a piano. Start on G and the pattern forces one sharp: **G A B C D E F♯ G** (because E to F would be only a half step, the F must be raised).

The first note of the scale is the **tonic** — "home". Music built mainly from one scale is said to be *in that key*: a song in G major uses the G major scale and feels resolved when it returns to G.

A **key signature** (sharps or flats written at the start of each line of music) tells you which notes are altered throughout, so they do not have to be marked every time. G major has one sharp (F♯); F major has one flat (B♭).

Practising scales is not just an exercise: it trains your fingers in the patterns that melodies use, builds evenness and speed, and teaches your ear what each key sounds like. Play them slowly, evenly and in time with a metronome on your {topic}.`,
          c: [
            ["Major scale formula", "The step pattern W-W-H-W-W-W-H that builds every major scale."],
            ["Tonic", "The first note of a scale; the 'home' note of a key."],
            ["Key signature", "Sharps or flats at the start of the staff showing which notes are altered throughout."],
          ],
          e: {
            t: "Building D major",
            s: "Use the formula to find the notes of the D major scale.",
            st: ["Start on D; W → E, W → F♯ (F would be only a half step)", "H → G, W → A, W → B", "W → C♯, H → D"],
            so: "D major = D E F♯ G A B C♯ D — two sharps (F♯ and C♯), which is exactly the D major key signature.",
          },
          a: ["Improvising and writing melodies", "Understanding which notes fit a song"],
          m: [["Playing scales fast and uneven", "Play slowly with a metronome; evenness first, speed later."], ["Memorising scales as shapes only", "Say the note names to connect shapes with theory."]],
          tip: ["Learn C, G, D and F major first — they cover a huge number of beginner songs."],
          k: ["Major scale = W-W-H-W-W-W-H from the tonic.", "A key is the scale a piece is built on; the tonic feels like home.", "Key signatures list the sharps or flats for the whole piece."],
          q: [
            ["What is the step pattern of the major scale?", ["W-H-W-W-H-W-W", "W-W-H-W-W-W-H", "H-W-W-W-H-W-W", "W-W-W-H-W-W-H"], 1, "Whole, whole, half, whole, whole, whole, half."],
            ["Which note is sharpened in G major?", ["C", "F", "B", "E"], 1, "G major has one sharp: F♯."],
            ["What is the tonic of a scale?", ["Its highest note", "Its first, 'home' note", "Any sharp note", "The fifth note"], 1, "The tonic names the key and feels resolved."],
          ],
        },
        {
          t: "Chords and Triads",
          f: "Build major and minor triads and understand chord names",
          s: "Learn how three-note chords are built from a scale and what makes a chord major or minor.",
          o: ["Build a major triad from root, third and fifth", "Explain the difference between major and minor chords", "Name the chords of a major key"],
          x: `A **chord** is three or more notes played together. The basic chord is the **triad**: a *root*, the note a **third** above it, and the note a **fifth** above it.

Count half steps from the root:
- **Major triad** = root + **4** half steps (major third) + **3** more (to the fifth). C major = **C – E – G**. Sounds bright and stable.
- **Minor triad** = root + **3** half steps (minor third) + **4** more. A minor = **A – C – E**. Sounds darker, sadder.

The only difference is the middle note — the third — which is why it is called the chord's "colour" note.

Every major key contains a family of chords built on each scale degree, written with Roman numerals:

- **I, IV, V** — major chords
- **ii, iii, vi** — minor chords
- **vii°** — a diminished chord

In C major: **C, Dm, Em, F, G, Am, B°**. In G major: **G, Am, Bm, C, D, Em, F♯°**. Upper-case numerals are major chords; lower-case are minor.

Chord symbols you will see: **C** (C major), **Cm** (C minor), **C7** (C major with an added flat seventh, a bluesy sound). On your {topic}, learn chords as note groups as well as hand shapes — it makes changing keys and reading chord charts much easier.`,
          c: [
            ["Triad", "A three-note chord made of a root, a third and a fifth."],
            ["Major vs minor third", "4 half steps (major, bright) vs 3 half steps (minor, darker) above the root."],
            ["Roman numeral analysis", "Naming chords by their scale degree, e.g. I, IV, V, so progressions work in any key."],
          ],
          e: {
            t: "Building G major and E minor",
            s: "Find the notes of a G major chord and an E minor chord.",
            st: ["G major: G + 4 half steps = B, + 3 = D → G–B–D", "E minor: E + 3 half steps = G, + 4 = B → E–G–B", "Notice both share G and B"],
            so: "G = G–B–D and Em = E–G–B. Because they share two notes, changing between them sounds smooth — which is why they appear together in so many songs.",
          },
          a: ["Accompanying singing", "Understanding chord charts and song sheets"],
          m: [["Confusing C and Cm", "The 'm' means minor — the third is lowered by a half step."], ["Learning chords only as shapes", "Know the notes too, so you can find chords in other positions."]],
          tip: ["Play a major chord then its minor version and listen to how the colour changes."],
          k: ["A triad = root + third + fifth.", "Major = 4 + 3 half steps; minor = 3 + 4.", "In a major key, I, IV and V are major; ii, iii and vi are minor."],
          q: [
            ["Which notes form a C major triad?", ["C–D–E", "C–E–G", "C–E♭–G", "C–F–A"], 1, "Root C, major third E, fifth G."],
            ["What makes a chord minor rather than major?", ["A lower root", "A third that is a half step lower", "An extra fifth", "Playing it softly"], 1, "The minor third is 3 half steps above the root instead of 4."],
            ["In a major key, which chord built on the scale is minor?", ["I", "IV", "V", "vi"], 3, "vi is minor; I, IV and V are major."],
          ],
        },
        {
          t: "Reading Music and Charts",
          f: "Read notes on the staff, chord charts and tablature",
          s: "Read the staff, clefs and the simplified notations (chord charts and tabs) musicians use every day.",
          o: ["Read notes on the treble and bass clef", "Follow a chord chart", "Understand what tablature shows"],
          x: `Written music lets you learn pieces you have never heard and share ideas with other musicians. There are three common forms.

**1. Standard notation (the staff).** Five lines and four spaces; higher on the staff means higher in pitch.
- **Treble clef** (higher notes): lines **E G B D F** ("Every Good Boy Deserves Fruit"), spaces **F A C E**.
- **Bass clef** (lower notes): lines **G B D F A** ("Good Boys Do Fine Always"), spaces **A C E G** ("All Cows Eat Grass").
Note shapes show rhythm (whole, half, quarter, eighth notes from the rhythm lesson), and the time and key signatures sit at the start.

**2. Chord charts / lead sheets.** Chord symbols written above lyrics or bar lines — \`| G | Em | C | D |\` — tell an accompanist what to play; the rhythm or strumming style is often left to you. Most popular songs are learned this way.

**3. Tablature (tab)** — used for guitar, bass and ukulele. Each line is a string and each number a fret: \`0\` = open string, \`3\` = third fret. Tab shows *where* to play quickly, but usually shows rhythm poorly, so listen to the recording too.

Choose what suits your {topic} and goals, but learn at least the basics of standard notation: it is universal and it carries the most information. Read a little every day — reading speed, like playing speed, comes from regular practice.`,
          c: [
            ["Staff and clef", "Five lines and four spaces; the clef fixes which pitch each line represents."],
            ["Chord chart", "A sequence of chord symbols over bars or lyrics that tells you what to play."],
            ["Tablature", "Notation for fretted instruments showing string and fret numbers."],
          ],
          e: {
            t: "Decoding a treble-clef melody",
            s: "Four notes sit on: the bottom line, the second space, the third line and the top space of the treble staff.",
            st: ["Bottom line = E (Every)", "Second space = A (F-A-C-E); third line = B (Good Boy)", "Top space = E (F-A-C-E)"],
            so: "The melody is E – A – B – E.",
          },
          a: ["Learning songs from books and websites", "Playing with others from a shared chart"],
          m: [["Writing letter names over every note", "Use the memory aids, then read without labels to build fluency."], ["Using tab without listening to the song", "Tab often lacks rhythm; check a recording."]],
          tip: ["Spend five minutes a day sight-reading something easy."],
          k: ["Treble lines E-G-B-D-F, spaces F-A-C-E; bass lines G-B-D-F-A, spaces A-C-E-G.", "Chord charts list chords per bar; tab shows strings and frets.", "Daily reading builds fluency."],
          q: [
            ["What note is on the bottom line of the treble clef?", ["F", "E", "G", "C"], 1, "Every Good Boy Deserves Fruit: the bottom line is E."],
            ["The spaces of the treble clef spell…", ["ACEG", "FACE", "EGBDF", "GBDFA"], 1, "Treble-clef spaces from bottom to top: F A C E."],
            ["In guitar tab, what does a 0 on a line mean?", ["Rest", "Play that string open", "Fret 10", "Mute the string"], 1, "0 means the open (unfretted) string."],
          ],
        },
      ],
    },
    {
      t: "Playing Music",
      s: "How to practise so you actually improve, playing real progressions and songs, and adding expression.",
      ls: [
        {
          t: "Practising Effectively",
          f: "Structure practice sessions with goals, slow practice and a metronome",
          s: "Use deliberate practice — focused goals, slow tempos and short sessions — to improve faster.",
          o: ["Plan a focused practice session", "Use slow practice and gradual tempo increases", "Track progress in a practice log"],
          x: `Time spent with your {topic} is not the same as practice. **Deliberate practice** means working on specific weaknesses with full attention and feedback — and it is what separates players who improve steadily from those who stall.

**Structure each session** (20–45 minutes is plenty for most learners):
1. **Warm-up** (5 min): stretches, tuning, easy scales.
2. **Technique** (10 min): one specific skill — a chord change, a scale, a rhythm.
3. **Repertoire** (10–20 min): the piece or song you are learning, in small sections.
4. **Fun** (5 min): play something you enjoy, so practice stays rewarding.

**Slow is fast.** Play a difficult passage at a tempo where you can play it *perfectly* — even half speed. Repeat it correctly several times, then raise the metronome by 4–8 BPM. Practising mistakes at full speed just trains the mistakes.

**Chunking.** Break hard pieces into a bar or two, master each chunk, then join them. Start practice sessions with the section you find hardest, while you are fresh.

**Frequency beats length.** Twenty minutes every day beats two hours once a week; your brain consolidates skills between sessions, especially during sleep.

Keep a short **practice log** — what you worked on, the tempo reached, what to try next — and record yourself every week or two. Recordings reveal timing and tone problems you cannot hear while playing.`,
          c: [
            ["Deliberate practice", "Focused practice on specific weaknesses with clear goals and feedback."],
            ["Chunking", "Breaking a difficult piece into small sections, mastering each, then combining them."],
            ["Tempo ladder", "Raising the metronome in small steps only after a passage is clean."],
          ],
          e: {
            t: "Fixing a difficult bar",
            s: "Bar 9 of a piece keeps falling apart at the target tempo of 100 BPM.",
            st: ["Set the metronome to 60 BPM and play only bar 9 until it is clean five times in a row", "Raise to 68, 76, 84 … BPM, moving up only after clean repetitions", "Join bar 8 + 9 + 10 at the highest clean tempo, then play the whole section"],
            so: "Within a few sessions the bar is reliable at 100 BPM, and it no longer breaks the flow of the piece.",
          },
          a: ["Learning a piece for an exam or performance", "Making steady progress with limited time"],
          m: [["Always playing pieces from the beginning", "Isolate the difficult sections and work on them first."], ["Practising mistakes at full speed", "Slow down until it is correct, then speed up gradually."]],
          tip: ["End every session by writing one sentence: what to work on next time."],
          k: ["Deliberate, focused practice beats long, unfocused playing.", "Slow, correct repetition, then gradual tempo increases.", "Practise little and often; log and record your progress."],
          q: [
            ["What is the best tempo for learning a difficult passage?", ["As fast as possible", "Slow enough to play it perfectly", "The recording's tempo", "Any tempo, it doesn't matter"], 1, "Correct repetition at a slow tempo builds accurate habits."],
            ["Which is usually more effective?", ["Two hours once a week", "Twenty minutes every day", "Only practising before lessons", "Practising only songs you know"], 1, "Frequent short sessions let skills consolidate between sessions."],
            ["What is 'chunking'?", ["Playing loudly", "Breaking a piece into small sections to master separately", "Skipping difficult bars", "Playing with a band"], 1, "Small sections are mastered, then joined together."],
          ],
        },
        {
          t: "Chord Progressions and Songs",
          f: "Play common chord progressions and use them to learn songs",
          s: "Learn the progressions behind thousands of songs and how to play them smoothly in time.",
          o: ["Recognise I–IV–V and I–V–vi–IV progressions", "Change chords smoothly in time", "Transpose a progression to another key"],
          x: `A **chord progression** is a sequence of chords that repeats through a song. A handful of progressions power a huge share of popular music, so learning them on your {topic} unlocks many songs at once.

Using the Roman numerals from the chords lesson:
- **I – IV – V – I** — the backbone of blues, rock and folk. In G: **G – C – D – G**.
- **I – V – vi – IV** — the "pop progression" behind countless hits. In C: **C – G – Am – F**.
- **ii – V – I** — the heart of jazz. In C: **Dm – G – C**.
- **12-bar blues** — I for 4 bars, IV for 2, I for 2, V, IV, I, V (one bar each).

Because the progression is written in numerals, you can **transpose** it — move it to a different key — by building the same scale degrees from a new tonic. I–V–vi–IV in G becomes **G – D – Em – C**. That is how you adapt songs to fit your voice.

**Smooth chord changes** are the main challenge:
1. Look for *common notes* or fingers that can stay in place between chords.
2. Practise each change on its own: one chord, switch, the next — 60 seconds, counting clean changes.
3. Change *on the beat*. Keep the rhythm going even if a chord is imperfect at first; stopping to fix it destroys the flow.

Start by playing one chord per bar at a slow tempo, then add rhythm patterns once the changes are automatic.`,
          c: [
            ["Chord progression", "A sequence of chords, often repeating, that forms a song's harmony."],
            ["Transposing", "Moving music to another key while keeping the same relationships between chords."],
            ["12-bar blues", "A 12-bar progression using the I, IV and V chords."],
          ],
          e: {
            t: "Transposing the pop progression",
            s: "A song uses C – G – Am – F (I–V–vi–IV in C) but is too high for your voice; move it to A major.",
            st: ["A major scale: A B C♯ D E F♯ G♯", "I = A, V = E, vi = F♯m, IV = D", "Play A – E – F♯m – D with the same rhythm"],
            so: "In A major the progression is A – E – F♯m – D, a minor third lower, which suits a lower voice.",
          },
          a: ["Accompanying friends singing", "Learning songs quickly by ear"],
          m: [["Stopping the rhythm to fix each chord", "Keep strumming or playing on the beat; accuracy will follow."], ["Learning each song from scratch", "Recognise the progression — many songs share the same one."]],
          tip: ["Do one-minute chord-change drills and write down your score each day."],
          k: ["A few progressions (I–IV–V, I–V–vi–IV, ii–V–I) underlie many songs.", "Numerals let you transpose to any key.", "Practise changes in isolation and keep time."],
          q: [
            ["In G major, the I–IV–V chords are…", ["G – C – D", "G – A – B", "G – D – Em", "C – F – G"], 0, "G is I, C is IV, D is V in G major."],
            ["What does transposing do?", ["Changes the time signature", "Moves music to another key keeping the same chord relationships", "Removes chords", "Adds a melody"], 1, "Transposing shifts everything by the same interval."],
            ["I–V–vi–IV in C major is…", ["C – G – Am – F", "C – F – G – C", "C – Dm – G – C", "C – E – G – A"], 0, "I = C, V = G, vi = Am, IV = F."],
          ],
        },
        {
          t: "Expression and Performance",
          f: "Add dynamics and articulation, improvise simply, and perform with confidence",
          s: "Turn correct notes into music with dynamics and phrasing, try simple improvisation, and prepare to perform.",
          o: ["Use dynamics and articulation expressively", "Improvise a simple melody over a progression", "Prepare and deliver a short performance"],
          x: `Playing the right notes in time is the foundation; **expression** is what makes listeners feel something.

**Dynamics** are changes in volume, marked from *pp* (very soft) through *p*, *mp*, *mf*, *f* to *ff* (very loud). **Crescendo** means gradually louder; **diminuendo** gradually softer. Even a simple melody becomes musical when phrases rise and fall in volume.

**Articulation** is how notes start and connect: *legato* (smooth and connected), *staccato* (short and detached), and *accents* (emphasised notes). **Phrasing** shapes groups of notes like sentences, with a natural "breath" at the end of each.

**Improvisation** is easier than it sounds. Over a I–IV–V progression in G, play notes from the **G major pentatonic scale** (G A B D E) — five notes that sound good over every chord of the progression. Start with just three notes, focus on rhythm, repeat ideas you like and end phrases on the root note G.

**Performing** — for one friend, a class or a recording — is a skill too:
- Choose a piece you can play comfortably at about 80% of your maximum ability.
- Rehearse the whole piece from start to finish, *including recovering from mistakes without stopping*.
- Nerves are normal; slow breathing before you start helps, and the audience rarely notices small slips.

Performing regularly, even informally, is one of the fastest ways to improve on your {topic}, because it forces you to finish pieces and play under pressure.`,
          c: [
            ["Dynamics", "Changes in volume, from pp (very soft) to ff (very loud)."],
            ["Articulation", "How notes are played and connected, e.g. legato or staccato."],
            ["Pentatonic scale", "A five-note scale (major pentatonic: 1-2-3-5-6) that is easy to improvise with."],
          ],
          e: {
            t: "A first improvisation",
            s: "Improvise over G – C – D – G, one bar each, at 70 BPM.",
            st: ["Use only G, A and B from the G major pentatonic scale", "Play a short two-bar idea, then repeat it with one note changed", "End each phrase on G, then add D and E for more range"],
            so: "With three notes and repeated rhythmic ideas you create a melody that fits every chord; adding D and E gives the full pentatonic scale.",
          },
          a: ["Performing at college events or open mics", "Making your playing sound musical, not mechanical"],
          m: [["Playing everything at one volume", "Plan where each phrase gets louder or softer."], ["Stopping after a mistake when performing", "Keep going in time; practise recovering in rehearsal."]],
          tip: ["Record a 'performance take' once a week, without stopping, and listen back."],
          k: ["Dynamics, articulation and phrasing turn notes into music.", "The pentatonic scale makes improvisation accessible.", "Rehearse full run-throughs, and keep going after mistakes."],
          q: [
            ["What does a crescendo mean?", ["Gradually softer", "Gradually louder", "Short and detached", "Faster"], 1, "A crescendo is a gradual increase in volume."],
            ["Which notes form the G major pentatonic scale?", ["G A B C D", "G A B D E", "G B D F A", "G A C D F"], 1, "Major pentatonic uses degrees 1, 2, 3, 5 and 6: G A B D E."],
            ["What should you do after a small mistake while performing?", ["Stop and restart", "Keep going in time", "Apologise to the audience", "Play louder"], 1, "Continuing in time keeps the performance flowing; most listeners barely notice."],
          ],
        },
      ],
    },
  ],
};
