module.exports = {
  match: "Piano Lessons for Beginners: Play the Piano AND Read Music!",
  pt: "technique-drill",
  d: "Learn to play the piano and read music at the same time. You will find every note on the keyboard, sit and use your fingers correctly, read the treble and bass clefs, count rhythms and time signatures, play in five-finger positions, learn the C major scale and the primary chords, and finish by playing pieces hands together.",
  sk: ["Piano", "Reading music", "Treble and bass clef", "Rhythm", "Scales", "Chords", "Hands-together playing"],
  out: [
    "Find and name every note on the keyboard",
    "Read notes in the treble and bass clefs",
    "Count note values and play in common time signatures",
    "Play the C major scale and primary chords with correct fingering",
    "Play simple pieces with both hands together",
  ],
  mods: [
    {
      t: "Getting to Know the Keyboard",
      s: "The layout of the keys, healthy posture and finger numbers, and the treble clef.",
      ls: [
        {
          t: "Keyboard Geography",
          f: "Find every note using the pattern of black keys",
          s: "Use the groups of two and three black keys to find and name every white and black key.",
          o: ["Find C, F and other notes from the black-key groups", "Locate middle C", "Name black keys as sharps and flats"],
          x: `A piano keyboard looks overwhelming — 88 keys on a full piano — but it is just **one pattern of 12 keys repeated** about seven times.

**Black keys** come in alternating groups of **two** and **three**. They are your map:
- **C** is the white key just to the **left of every group of two** black keys.
- **D** sits between the two black keys; **E** is just to the right of the group of two.
- **F** is just to the **left of every group of three** black keys; then **G**, **A** and **B** follow to the right.

So the white keys are named **C D E F G A B**, then C again — the musical alphabet repeated. From one C to the next is an **octave**.

**Middle C** is the C nearest the centre of the keyboard (usually near the piano's brand name). It is the reference point for reading music: notes in the treble clef go up from around middle C, and notes in the bass clef go down from it.

**Black keys** are named from their white neighbours:
- The black key to the right of C is **C♯** (C sharp) — a *half step* higher.
- The same key is also **D♭** (D flat) — a half step below D.

Notice there is **no black key between E and F or between B and C**; those white keys are already a half step apart.

Practise this away from the piano too: picture the groups of black keys and name the white keys around them. Within a week, you should be able to find any note instantly.`,
          c: [
            ["Black-key groups", "Alternating groups of two and three black keys that act as a map of the keyboard."],
            ["Middle C", "The C nearest the centre of the keyboard, the main reference note for reading music."],
            ["Sharp and flat", "A sharp is a half step above a note; a flat is a half step below."],
          ],
          e: {
            t: "Find all the Fs",
            s: "Find every F on the keyboard and play them from lowest to highest.",
            st: ["Look for a group of three black keys", "F is the white key immediately to its left", "Repeat for every group of three, moving up the keyboard one octave at a time"],
            so: "You find seven or eight Fs (depending on the keyboard size), each one octave apart and sounding like higher versions of the same note.",
          },
          a: ["Finding notes quickly when reading music", "Learning songs by ear"],
          m: [["Counting white keys from the left end", "Use the black-key groups as landmarks."], ["Thinking every white key has a black key to its right", "E–F and B–C have no black key between them."]],
          tip: ["Spend one minute each day naming random keys as fast as you can."],
          k: ["The keyboard repeats a 12-note pattern.", "C is left of the two black keys; F is left of the three.", "Black keys are named as sharps or flats of their neighbours."],
          q: [
            ["Which white key sits just to the left of a group of two black keys?", ["F", "C", "D", "A"], 1, "C is immediately left of each pair of black keys."],
            ["Which white key is just to the left of a group of three black keys?", ["F", "G", "B", "E"], 0, "F starts each group of three."],
            ["Which pair of white keys has no black key between them?", ["C–D", "F–G", "E–F", "G–A"], 2, "E–F (and B–C) are only a half step apart."],
          ],
        },
        {
          t: "Posture, Hand Position and Finger Numbers",
          f: "Sit correctly, shape the hand and learn finger numbers",
          s: "Set up the bench, posture and curved hand shape, and learn the finger numbers used in all piano music.",
          o: ["Set bench height and distance correctly", "Use a curved, relaxed hand shape", "Use finger numbers 1–5 for both hands"],
          x: `Good posture makes playing easier, faster and free from strain.

**Bench:** sit on the front half of the bench, centred roughly at middle C. Adjust height so your **forearms are level with the keys** (or slightly sloping down) and your elbows hang just in front of your body. Your feet rest flat on the floor (the right foot near the pedals for later).

**Back and shoulders:** sit tall but relaxed, leaning very slightly forward. Shoulders stay down — tension in the shoulders travels straight into the hands.

**Hand shape:** imagine holding a small ball or resting your hand on your knee — fingers gently **curved**, knuckles slightly raised, wrist level (not dropped below the keys and not pushed up). Play on the **fingertips** (the thumb plays on its outer side). Flat, straight fingers are weaker and slower.

**Finger numbers** — the same for both hands:
- **1 = thumb**
- **2 = index**
- **3 = middle**
- **4 = ring**
- **5 = little finger**

Piano music often prints these numbers above or below notes to show the best fingering. Following them from the beginning prevents awkward stretches later.

**Playing a key:** let the weight of your arm sink into the key through a curved finger, rather than "hitting" it. Release the key fully before playing it again. Start every practice session by playing slowly and listening for an even tone between fingers — the 4th and 5th fingers are naturally weaker and need extra attention.`,
          c: [
            ["Finger numbers", "1 thumb, 2 index, 3 middle, 4 ring, 5 little finger — the same on both hands."],
            ["Curved hand position", "Gently rounded fingers with a level wrist, playing on the fingertips."],
            ["Arm weight", "Using the relaxed weight of the arm to press keys instead of forcing with the fingers."],
          ],
          e: {
            t: "A finger-independence drill",
            s: "Play C–D–E–F–G with the right hand, one finger per key.",
            st: ["Place RH finger 1 on middle C, 2 on D, 3 on E, 4 on F, 5 on G", "Play up and down slowly (1-2-3-4-5-4-3-2-1), keeping the hand curved", "Repeat with the left hand: finger 5 on the C below middle C, up to finger 1 on G"],
            so: "Each finger plays one key with an even tone, the hand stays curved, and you begin to control the weaker 4th and 5th fingers.",
          },
          a: ["Playing faster and more evenly", "Avoiding wrist and shoulder strain"],
          m: [["Collapsed, flat fingers", "Keep a rounded hand, as if holding a small ball."], ["Wrists dropping below the keyboard", "Keep the wrist level with the hand and forearm."]],
          tip: ["Check your shoulders every few minutes and let them drop."],
          k: ["Forearms level with the keys; sit tall and relaxed.", "Curved fingers, level wrists, fingertip contact.", "Finger numbers: 1 thumb to 5 little finger on both hands."],
          q: [
            ["What is finger number 1 on piano?", ["Index finger", "Thumb", "Little finger", "Middle finger"], 1, "The thumb is finger 1 on both hands."],
            ["How should your fingers be shaped when playing?", ["Flat and straight", "Gently curved, playing on the fingertips", "Clenched tightly", "Pointed upwards"], 1, "Curved fingers are stronger and more agile."],
            ["Where should your forearms be relative to the keys?", ["Well above", "Roughly level", "Far below", "It doesn't matter"], 1, "Level forearms keep wrists relaxed."],
          ],
        },
        {
          t: "Reading the Treble Clef",
          f: "Read treble-clef notes using landmark notes and intervals",
          s: "Read right-hand notes in the treble clef using memory aids and landmark notes.",
          o: ["Name the lines and spaces of the treble clef", "Read notes from landmarks such as middle C and treble G", "Read steps and skips on the staff"],
          x: `Piano music is written on a **grand staff**: two staffs joined by a brace. The upper staff uses the **treble clef** (𝄞), usually for the right hand.

The **staff** has five lines and four spaces. Each line and space is a note; going up the staff means going up the keyboard.

**Memory aids for the treble clef:**
- Lines (bottom to top): **E G B D F** — *Every Good Boy Deserves Fruit*
- Spaces (bottom to top): **F A C E** — spells *FACE*

**Landmark notes** make reading faster than counting every line:
- **Middle C** sits on its own short line (a *ledger line*) just **below** the treble staff.
- **Treble G** is on the **second line** — the treble clef symbol curls around this line, which is why it is also called the *G clef*.
- **Top-line F** and **high C** (the third space) are also useful landmarks.

**Steps and skips:** you can often read music by *direction and distance* rather than naming every note:
- A **step** moves from a line to the next space (or space to line) — the next key on the piano.
- A **skip** moves from line to line or space to space — skipping one key.
Recognising steps and skips lets your hand move by pattern, much like reading words rather than single letters.

Practise with flashcards or a note-reading app for five minutes a day, and always say note names aloud when learning a new piece.`,
          c: [
            ["Grand staff", "The treble and bass staffs joined together for piano music."],
            ["Treble clef (G clef)", "A clef that curls around the second line, marking it as G above middle C."],
            ["Ledger line", "A short line above or below the staff for notes outside it, such as middle C."],
          ],
          e: {
            t: "Reading a short melody",
            s: "A melody's notes are: ledger line below the staff, then the first space below the bottom line, then the bottom line, then the bottom space.",
            st: ["The ledger line below the staff is middle C", "The space just below the bottom line is D; the bottom line is E", "The bottom space is F"],
            so: "The melody is C – D – E – F: four steps up from middle C, played with right-hand fingers 1–2–3–4.",
          },
          a: ["Learning pieces from sheet music", "Taking graded piano exams"],
          m: [["Writing letter names above every note", "Use landmarks and intervals so you learn to read fluently."], ["Counting up from the bottom line for every note", "Learn landmark notes and read by steps and skips."]],
          tip: ["Learn one landmark note per day until you can find it instantly on the staff and the keyboard."],
          k: ["Treble lines E-G-B-D-F; spaces F-A-C-E.", "Middle C sits on a ledger line below the treble staff; G is on the 2nd line.", "Read by landmarks, steps and skips."],
          q: [
            ["What note is on the bottom line of the treble staff?", ["F", "E", "C", "G"], 1, "Every Good Boy Deserves Fruit — E is the bottom line."],
            ["Why is the treble clef also called the G clef?", ["It is shaped like the letter G only", "It curls around the line that represents G", "It is used only for G notes", "It is green"], 1, "The clef marks the second line as G."],
            ["Moving from a line to the very next space is a…", ["Skip", "Step", "Octave", "Chord"], 1, "A step moves to the adjacent note."],
          ],
        },
      ],
    },
    {
      t: "Rhythm and Both Clefs",
      s: "Reading the bass clef, counting note values and time signatures, and playing in five-finger positions.",
      ls: [
        {
          t: "Reading the Bass Clef",
          f: "Read left-hand notes in the bass clef with memory aids and landmarks",
          s: "Read the lower staff of the grand staff, used mainly by the left hand.",
          o: ["Name the lines and spaces of the bass clef", "Use bass F and middle C as landmarks", "Read notes on the grand staff"],
          x: `The lower staff of the grand staff uses the **bass clef** (𝄢), usually for the **left hand**.

**Memory aids for the bass clef:**
- Lines (bottom to top): **G B D F A** — *Good Boys Do Fine Always*
- Spaces (bottom to top): **A C E G** — *All Cows Eat Grass*

**Landmark notes:**
- The bass clef's two dots sit either side of the **fourth line**, which is **F** below middle C — hence the name *F clef*.
- **Middle C** sits on a ledger line just **above** the bass staff — the same middle C as the ledger line below the treble staff. It is the "bridge" between the two staffs.
- **Bass C** (the second space) is an octave below middle C and a very common starting point for the left hand.

Notice the bass clef is *shifted* compared with the treble clef: the bottom line is E in treble but G in bass. Learn the bass clef as its own system rather than translating from treble — translation slows you down.

**Reading both staffs:** in piano music, notes that are vertically aligned on the grand staff are played **at the same time**. Read from left to right, both staffs together, like a single line of text with two layers.

At first, practise each hand separately: right hand from the treble staff, left hand from the bass staff. Many beginner pieces keep the left hand simple (long notes or repeated patterns) so you can focus on reading.`,
          c: [
            ["Bass clef (F clef)", "A clef whose dots surround the fourth line, marking it as F below middle C."],
            ["Good Boys Do Fine Always", "Memory aid for bass-clef lines: G B D F A."],
            ["All Cows Eat Grass", "Memory aid for bass-clef spaces: A C E G."],
          ],
          e: {
            t: "Reading a left-hand pattern",
            s: "Left-hand notes are: second space, third line, top space, third line (bass clef).",
            st: ["Second space = C (A-C-E-G)", "Third line = D (G-B-D-F-A); top space = G", "So the pattern is C – D – G – D"],
            so: "The left hand plays C – D – G – D, which uses fingers 5, 4, 1 and 4 in a C five-finger position.",
          },
          a: ["Playing accompaniments and bass lines", "Reading full piano scores"],
          m: [["Reading bass clef as if it were treble", "Learn bass-clef names separately: bottom line is G, not E."], ["Ignoring vertically aligned notes", "Notes stacked on the grand staff are played together."]],
          tip: ["Use middle C as the bridge: find it on both staffs and on the keyboard."],
          k: ["Bass lines G-B-D-F-A; spaces A-C-E-G.", "The F clef marks F on the fourth line; middle C is just above the bass staff.", "Aligned notes on the grand staff sound together."],
          q: [
            ["What note is on the bottom line of the bass staff?", ["E", "G", "A", "F"], 1, "Good Boys Do Fine Always — G is the bottom line."],
            ["The spaces of the bass staff from bottom to top are…", ["F A C E", "A C E G", "G B D F", "E G B D"], 1, "All Cows Eat Grass."],
            ["Where is middle C relative to the bass staff?", ["On the bottom line", "On a ledger line just above it", "In the second space", "It never appears"], 1, "Middle C sits on a ledger line above the bass staff."],
          ],
        },
        {
          t: "Note Values and Time Signatures",
          f: "Count whole, half, quarter, eighth and dotted notes in 4/4 and 3/4",
          s: "Count rhythms accurately and understand time signatures and bar lines.",
          o: ["Identify note and rest values", "Count dotted notes", "Read 4/4 and 3/4 time signatures"],
          x: `Notes on the staff show **which key** to play; their **shape** shows **how long**.

**Note values in 4/4 time:**
- **Whole note** (open oval, no stem) — 4 beats
- **Half note** (open oval with stem) — 2 beats
- **Quarter note** (filled oval with stem) — 1 beat
- **Eighth note** (filled with a flag, or beamed in pairs) — ½ beat; count "1 &"

Each has a matching **rest** — a silence of the same length — which must be counted just as carefully.

**Dotted notes:** a dot after a note adds **half its value**. A dotted half note = 2 + 1 = **3 beats**. A dotted quarter = 1 + ½ = 1½ beats.

**Time signatures** appear at the start of the music:
- The **top number** = beats per bar.
- The **bottom number** = which note gets one beat (4 = quarter note).
- **4/4** (also written **C**, "common time"): four quarter-note beats per bar — most popular music.
- **3/4**: three beats per bar — waltzes, many folk songs. A dotted half note fills a whole bar.
- **2/4**: two beats per bar — marches.

**Bar lines** divide the music into bars (measures); a **double bar line** marks the end. The beats in every bar must add up to the time signature.

**Counting tips:** count out loud ("1 2 3 4"), tap your foot on each beat, and clap difficult rhythms before playing them. Use a metronome at a slow tempo; steady rhythm is more important than speed.`,
          c: [
            ["Note value", "The duration of a note, shown by its shape (whole, half, quarter, eighth)."],
            ["Dotted note", "A note lengthened by half its value; a dotted half note lasts three beats."],
            ["Time signature", "Top number = beats per bar; bottom number = the note that gets one beat."],
          ],
          e: {
            t: "Checking a 3/4 bar",
            s: "A bar in 3/4 contains: a quarter note, a quarter rest and two eighth notes. Is it complete?",
            st: ["Quarter note = 1 beat; quarter rest = 1 beat", "Two eighth notes = ½ + ½ = 1 beat", "Total = 1 + 1 + 1 = 3 beats"],
            so: "Yes — the bar contains exactly three beats. Count it as '1 (2) 3 &', playing on 1, 3 and the '&'.",
          },
          a: ["Playing pieces with accurate rhythm", "Playing with other musicians or a backing track"],
          m: [["Rushing through rests", "Count rests out loud exactly like notes."], ["Forgetting that a dot adds half the value", "Dotted half = 3 beats, dotted quarter = 1½ beats."]],
          tip: ["Clap and count the rhythm of each new piece before playing any notes."],
          k: ["Whole 4, half 2, quarter 1, eighth ½ beat.", "A dot adds half the note's value.", "Time signature: beats per bar over the beat unit."],
          q: [
            ["How many beats does a dotted half note last in 4/4?", ["2", "2.5", "3", "4"], 2, "2 + half of 2 = 3 beats."],
            ["In 3/4 time, how many quarter-note beats are in each bar?", ["2", "3", "4", "6"], 1, "The top number shows three beats per bar."],
            ["Which note lasts four beats in 4/4?", ["Half note", "Quarter note", "Whole note", "Eighth note"], 2, "A whole note fills a whole 4/4 bar."],
          ],
        },
        {
          t: "Five-Finger Positions",
          f: "Play melodies in C and G five-finger positions with each hand",
          s: "Place each finger over one key and play melodies in the C and G positions without looking down.",
          o: ["Play in the C five-finger position with both hands", "Move to the G position", "Play a melody while reading, without looking at the hands"],
          x: `A **five-finger position** places each finger over one key, so you can play five neighbouring notes without moving the hand. It is the fastest way to start reading and playing real melodies.

**C position:**
- **Right hand:** finger 1 on **middle C**, then 2 on D, 3 on E, 4 on F, 5 on G.
- **Left hand:** finger 5 on the **C below middle C** (bass C), then 4 on D, 3 on E, 2 on F, 1 on G.

Notice the left hand is a mirror image: its thumb is nearest the middle of the keyboard.

**G position:**
- **Right hand:** 1 on G (above middle C) through 5 on D.
- **Left hand:** 5 on the G below bass C through 1 on D.

**Playing without looking.** In a five-finger position, each note on the staff matches one finger. Read the note, think the finger, play — and keep your eyes on the music. Looking down after every note breaks the reading flow; feel the black keys to check your position instead.

**Practising a melody:**
1. Find the position from the first note and the fingering marked in the music.
2. Clap and count the rhythm.
3. Play hands separately, slowly, saying note names or finger numbers.
4. Repeat until it flows, then gradually increase the tempo.

Simple melodies such as *Ode to Joy* fit entirely in the C position (E E F G | G F E D | C C D E | E. D D…), which makes it a perfect first piece.`,
          c: [
            ["Five-finger position", "Each of the five fingers resting over one of five neighbouring keys."],
            ["C position", "RH thumb on middle C; LH little finger on the C below."],
            ["Mirror fingering", "The left hand's finger numbers run in the opposite direction to the right hand's."],
          ],
          e: {
            t: "Ode to Joy in C position",
            s: "Play the first line of Ode to Joy with the right hand: E E F G | G F E D | C C D E | E D D.",
            st: ["Place RH in C position: 1-C, 2-D, 3-E, 4-F, 5-G", "Translate the notes into fingers: 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3 2 2", "Play slowly at 60 BPM with quarter notes, holding the final D for two beats"],
            so: "You play the opening of a famous melody using only finger numbers, without moving your hand.",
          },
          a: ["Playing first melodies quickly", "Building sight-reading skills"],
          m: [["Looking down after every note", "Keep eyes on the music; feel the black keys for position."], ["Using the same finger numbers in the left hand as the right", "Remember the left hand is mirrored: 5 is on the lowest note."]],
          tip: ["Before playing, say 'right hand thumb on middle C' (or the relevant position) out loud."],
          k: ["Five-finger positions map notes directly to fingers.", "C position: RH 1 on middle C; LH 5 on the C below.", "Read the music, not your hands."],
          q: [
            ["In the right-hand C position, which finger plays E?", ["1", "2", "3", "5"], 2, "C-1, D-2, E-3, F-4, G-5."],
            ["In the left-hand C position, which finger is on the lowest C?", ["1 (thumb)", "3", "5 (little finger)", "2"], 2, "The left hand is mirrored: finger 5 on C."],
            ["Why play without looking at your hands?", ["It looks better", "Looking down breaks reading flow and slows learning", "Pianos require it", "It improves tuning"], 1, "Keeping eyes on the music builds fluent reading."],
          ],
        },
      ],
    },
    {
      t: "Scales, Chords and Pieces",
      s: "The C major scale with thumb-under fingering, the primary chords I, IV and V, and playing hands together.",
      ls: [
        {
          t: "The C Major Scale",
          f: "Play the C major scale with correct thumb-under and finger-over fingering",
          s: "Play a one-octave C major scale smoothly using standard fingering in each hand.",
          o: ["State the whole- and half-step pattern of the major scale", "Play C major hands separately with correct fingering", "Use thumb-under and finger-over technique smoothly"],
          x: `The **C major scale** — C D E F G A B C — uses only white keys and is the first scale every pianist learns. Its notes follow the major-scale pattern of **whole (W) and half (H) steps**:

**W – W – H – W – W – W – H**

(E–F and B–C are the half steps — the places with no black key between.)

A scale has eight notes but a hand has five fingers, so the hand must **cross** smoothly.

**Right hand (ascending):** **1 2 3 1 2 3 4 5**
- Play C-D-E with fingers 1-2-3.
- Pass the **thumb under** finger 3 to play F.
- Continue G-A-B-C with 2-3-4-5.
- Descending, reverse it: 5 4 3 2 1, then **finger 3 crosses over** the thumb to E, then 2 1.

**Left hand (ascending):** **5 4 3 2 1 3 2 1**
- Play C-D-E-F-G with 5-4-3-2-1.
- **Finger 3 crosses over** the thumb to A.
- Finish B-C with 2-1.
- Descending: 1 2 3, thumb passes under to F, then 1 2 3 4 5.

**Making it smooth:** the crossing should be invisible to the listener. Start moving the thumb under *early*, while finger 3 is still playing, and keep the wrist level — do not twist the elbow outwards.

Practise **hands separately**, slowly with a metronome (one note per beat at 60 BPM), aiming for an even volume on every note. Then try both hands together — this is harder because the hands cross at different moments, so go even slower.`,
          c: [
            ["Major scale pattern", "W-W-H-W-W-W-H, the steps between the notes of every major scale."],
            ["Thumb-under", "Passing the thumb beneath the hand to continue a scale upwards (RH) smoothly."],
            ["Finger-over", "Crossing finger 3 (or 4) over the thumb to continue a scale."],
          ],
          e: {
            t: "Right-hand C major, step by step",
            s: "Play the RH C major scale up and down with correct fingering at 60 BPM.",
            st: ["Up: C1 D2 E3 — thumb under — F1 G2 A3 B4 C5", "Down: C5 B4 A3 G2 F1 — finger 3 over — E3 D2 C1", "Repeat five times, listening for an even tone at the thumb crossing"],
            so: "The scale sounds like one smooth line with no bump at F or E — the sign that the thumb crossing is working.",
          },
          a: ["Finger dexterity and evenness for all pieces", "Understanding keys and melodies"],
          m: [["Pausing before the thumb crossing", "Start moving the thumb under early, while finger 3 plays."], ["Twisting the elbow out at the crossing", "Keep the wrist level and let the thumb move."]],
          tip: ["Practise only the crossing (E-F-E-F with 3-1-3-1) as a mini-exercise."],
          k: ["Major scale = W-W-H-W-W-W-H; C major uses only white keys.", "RH fingering 1-2-3-1-2-3-4-5; LH 5-4-3-2-1-3-2-1.", "Make crossings smooth and even."],
          q: [
            ["What is the right-hand fingering for an ascending C major scale?", ["1 2 3 4 5 1 2 3", "1 2 3 1 2 3 4 5", "5 4 3 2 1 3 2 1", "1 2 1 2 1 2 3 4"], 1, "The thumb passes under after E (finger 3)."],
            ["Where are the half steps in the C major scale?", ["C–D and F–G", "E–F and B–C", "D–E and A–B", "G–A and C–D"], 1, "E–F and B–C have no black key between them."],
            ["In the left hand ascending, which finger crosses over the thumb?", ["2", "3", "4", "5"], 1, "LH: 5-4-3-2-1, then 3 crosses over to A."],
          ],
        },
        {
          t: "Primary Chords: I, IV and V",
          f: "Build and play the C, F and G chords and simple left-hand accompaniments",
          s: "Build triads, play the primary chords of C major and use them to accompany melodies.",
          o: ["Build a major triad from root, third and fifth", "Play the I, IV and V chords in C major", "Play a simple left-hand chord accompaniment"],
          x: `A **chord** is several notes played together. The basic piano chord is a **triad**: a **root**, the note a **third** above (skip one white key) and the note a **fifth** above (skip another).

In C major:
- **C major (I)** = C – E – G
- **F major (IV)** = F – A – C
- **G major (V)** = G – B – D

These three are the **primary chords** — built on the 1st, 4th and 5th notes of the scale. Together they contain every note of the C major scale, so they can harmonise most simple melodies in C.

**Playing triads:** with either hand, use fingers **1–3–5** (right hand: thumb on the root; left hand: little finger on the root). The shape looks like a snowman — three notes on three lines or three spaces of the staff.

**Smooth changes with inversions.** Jumping from C to F to G in root position moves the hand a lot. Rearranging the notes (*inversions*) keeps the hand nearly still:
- C: **C – E – G** (fingers 5-3-1 in the left hand)
- F: **C – F – A** (fingers 5-2-1)
- G: **B – D – G** (fingers 5-3-1)
Each change moves only one or two fingers by a step.

**Accompanying a melody:** the right hand plays the melody; the left hand plays one chord per bar. Choose the chord that contains the melody's main notes: a bar using C and E fits the C chord; a bar using D and B fits G. Start with **block chords** (all notes together on beat 1), then try **broken chords** (one note at a time) for a flowing sound.`,
          c: [
            ["Triad", "A three-note chord: root, third and fifth."],
            ["Primary chords", "The chords on the 1st, 4th and 5th scale degrees (I, IV, V); in C: C, F and G."],
            ["Inversion", "A chord with its notes rearranged so a note other than the root is lowest."],
          ],
          e: {
            t: "Accompanying Ode to Joy",
            s: "Add left-hand chords to the first line: E E F G | G F E D | C C D E | E D D.",
            st: ["Bar 1 (E E F G) mostly uses C-chord notes → C chord", "Bar 2 (G F E D) leans towards G → G chord (B–D–G); bar 3 (C C D E) → C chord", "Bar 4 (E D D) ends on D → G chord, then return to C at the next phrase"],
            so: "The left hand plays C | G | C | G under the melody, using the close inversions so it barely moves.",
          },
          a: ["Accompanying singing and simple songs", "Playing from lead sheets with chord symbols"],
          m: [["Jumping between root-position chords", "Use inversions so the hand moves only a step."], ["Playing chords louder than the melody", "Keep the left hand softer so the tune is clear."]],
          tip: ["Play I–IV–I–V–I every day in C as a warm-up."],
          k: ["Triad = root + third + fifth (fingers 1-3-5).", "Primary chords in C: C (I), F (IV), G (V).", "Inversions make changes smooth; keep the accompaniment softer."],
          q: [
            ["Which notes make a G major triad?", ["G – A – B", "G – B – D", "G – C – E", "G – B♭ – D"], 1, "Root G, third B, fifth D."],
            ["What are the primary chords in C major?", ["C, D, E", "C, F, G", "C, Am, Em", "C, E, G"], 1, "I, IV and V in C are C, F and G."],
            ["Why use chord inversions in accompaniment?", ["They sound more dissonant", "They keep hand movement small and changes smooth", "They are easier to read", "They replace the melody"], 1, "Close inversions move only one or two fingers."],
          ],
        },
        {
          t: "Playing Hands Together",
          f: "Combine both hands with slow, sectional practice to play complete pieces",
          s: "Coordinate both hands using slow, sectional practice and play your first complete pieces.",
          o: ["Use a step-by-step method for hands-together practice", "Keep steady time with both hands", "Perform a short piece from start to finish"],
          x: `Playing **hands together** is where piano becomes truly rewarding — and where most beginners need patience. The secret is a systematic method.

**1. Learn each hand separately first.** Each hand should play its part fluently, with correct fingering and rhythm, before you combine them.

**2. Go slower than you think.** Set the metronome at about **half** the hands-separate speed. Your brain is now tracking two lines at once.

**3. Work in small sections.** Combine just **one bar** (or even one beat) at a time. Notice which notes are played *together* (vertically aligned on the grand staff) and which hand moves alone in between.

**4. Count out loud.** Saying "1 & 2 & 3 & 4 &" keeps both hands anchored to the same beat — especially when one hand holds a long note while the other moves.

**5. Join sections.** Once bars 1 and 2 are fluent separately, play them together as a pair, then add bar 3, and so on (*chaining*).

**6. Increase speed gradually** — a few BPM at a time, only after several correct repetitions.

**Common hands-together patterns** in beginner pieces:
- Melody in the right hand, **block chords** on beat 1 in the left.
- Melody with **broken chords** (C–G–E–G) in the left.
- Both hands in five-finger positions playing in parallel or contrary motion.

**Performing a piece:** once you can play it reliably, practise *performance runs* — from the beginning to the end without stopping, keeping time through any slip. Record yourself and listen back for evenness, balance (melody louder than accompaniment) and steady rhythm. Finishing pieces and playing them for others — family, friends, a class — is the best measure of progress.`,
          c: [
            ["Hands-separate practice", "Learning each hand's part alone before combining them."],
            ["Chaining", "Joining small learned sections one by one into longer passages."],
            ["Performance run", "Playing a piece from start to finish without stopping, keeping time through mistakes."],
          ],
          e: {
            t: "Combining hands in four bars",
            s: "A four-bar piece has a right-hand melody in C position and left-hand block chords C | G | C | G.",
            st: ["Play each hand separately at 80 BPM until fluent", "Set the metronome to 40 BPM and combine bar 1 only, counting aloud", "Add bars one at a time (1–2, 1–3, 1–4), then raise the tempo in 8 BPM steps"],
            so: "Within a few sessions both hands play the four bars together steadily at the original 80 BPM.",
          },
          a: ["Playing complete pieces and songs", "Preparing for recitals or exams"],
          m: [["Combining hands at full speed straight away", "Halve the tempo and work bar by bar."], ["Stopping at every mistake in a run-through", "Use separate practice for fixing and performance runs for continuity."]],
          tip: ["Mark the beats where both hands play together with a pencil line on the music."],
          k: ["Learn hands separately, then combine slowly in small sections.", "Count aloud and chain sections together.", "Practise full performance runs and record yourself."],
          q: [
            ["What tempo should you use when first combining hands?", ["Faster than hands separate", "About half the hands-separate tempo", "The final performance tempo", "Any tempo"], 1, "Coordinating two lines needs a much slower start."],
            ["What is chaining?", ["Playing with a chain on the piano", "Joining small learned sections one by one", "Repeating the whole piece only", "Using the sustain pedal"], 1, "Chaining builds long passages from mastered fragments."],
            ["During a performance run, what should you do after a small mistake?", ["Start again", "Keep going in time", "Stop and fix it", "Skip to the end"], 1, "Performance runs train continuity."],
          ],
        },
      ],
    },
  ],
};
