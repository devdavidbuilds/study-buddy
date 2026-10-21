module.exports = {
  match: "Guitar Chords and Basic Strumming",
  pt: "technique-drill",
  d: "Go from holding a guitar for the first time to strumming real songs. You will tune your guitar, read chord diagrams, learn the essential open chords (Em, Am, C, G, D and more), change between them smoothly, master down-up strumming and common patterns in 4/4, and play complete songs with a practice routine that fixes buzzing and sore fingers.",
  sk: ["Guitar", "Open chords", "Chord diagrams", "Chord changes", "Strumming patterns", "Rhythm", "Song playing"],
  out: [
    "Hold, tune and play the guitar with relaxed technique",
    "Read chord diagrams and play the main open chords cleanly",
    "Change chords smoothly and in time",
    "Strum steady down-up patterns in 4/4",
    "Play complete songs using common chord progressions",
  ],
  mods: [
    {
      t: "First Steps on the Guitar",
      s: "Getting to know the guitar, tuning it, reading chord diagrams and playing your first two chords.",
      ls: [
        {
          t: "Holding and Tuning the Guitar",
          f: "Learn the parts of the guitar, a relaxed playing position and standard tuning",
          s: "Name the parts of the guitar, find a comfortable playing position and tune to E A D G B E.",
          o: ["Name the main parts of the guitar", "Hold the guitar and pick in a relaxed position", "Tune to standard tuning with a tuner"],
          x: `**Parts of the guitar.** The *headstock* holds the **tuning pegs**; the long *neck* has metal **frets** dividing the *fretboard*; the *body* contains the soundhole (acoustic) or pickups (electric). Strings run from the pegs over the *nut*, along the neck and over the *saddle* to the bridge.

**The strings** are numbered 6 to 1 from the **thickest** (lowest) to the **thinnest** (highest). In **standard tuning** they are:

**6 E – 5 A – 4 D – 3 G – 2 B – 1 E**

A memory aid: **E**ddie **A**te **D**ynamite, **G**ood **B**ye **E**ddie.

**Holding the guitar** (seated): rest the guitar's waist on your right leg (for right-handed players), body upright against you, neck angled slightly upwards. Your strumming forearm rests on the top edge of the body. Keep your shoulders relaxed.

**The fretting hand:** thumb behind the neck roughly opposite your middle finger, fingers curved like a claw so you press with the **fingertips**, wrist relaxed. Press **just behind the fret** (not on top of it, not in the middle of the space) — this needs much less pressure and gives a cleaner note.

**Tuning:** clip a tuner on the headstock (or use an app), pluck one string, and turn its peg until the display shows the right letter and the needle is centred. If the note is *flat*, tighten; if *sharp*, loosen. Tune **up** to the note — if you overshoot, go below and come back up; this helps the string hold its tuning. Tune every time you pick up the guitar.

Fingertips will feel sore for the first one to two weeks. Short daily sessions of 15–20 minutes build calluses without strain.`,
          c: [
            ["Standard tuning", "E A D G B E from the thickest (6th) string to the thinnest (1st)."],
            ["Fret", "A metal strip on the neck; pressing just behind it shortens the string to raise the pitch."],
            ["String numbers", "Strings are numbered 6 (thickest, low E) to 1 (thinnest, high E)."],
          ],
          e: {
            t: "Tuning from scratch",
            s: "Your new guitar is badly out of tune.",
            st: ["Clip on a tuner and pluck the 6th string; turn the peg until the tuner reads E and the needle centres", "Repeat for A, D, G, B and the high E", "Re-check all six strings once more, because tightening some strings slightly changes the others"],
            so: "After two passes all six strings read E A D G B E and stay in tune for your practice session.",
          },
          a: ["Starting every practice session correctly", "Playing along with recordings and other musicians"],
          m: [["Pressing in the middle of the fret space or on top of the fret", "Press just behind the fret with the fingertip."], ["Gripping the neck with the whole hand", "Keep the thumb behind the neck and fingers curved."]],
          tip: ["Practise 15–20 minutes daily in the first weeks — long sessions with sore fingers cause tension."],
          k: ["Standard tuning is E A D G B E (6th to 1st string).", "Fret with curved fingertips just behind the fret.", "Tune before every session with a tuner."],
          q: [
            ["What is the note of the 5th string in standard tuning?", ["E", "A", "D", "G"], 1, "From thickest: E (6), A (5), D (4), G (3), B (2), E (1)."],
            ["Where should you press a string to fret a note?", ["On top of the metal fret", "In the middle of the space", "Just behind the fret", "On the nut"], 2, "Just behind the fret gives a clean note with the least pressure."],
            ["Which string is called the 1st string?", ["The thickest low E", "The thinnest high E", "The G string", "The A string"], 1, "Strings are numbered from the thinnest (1) to the thickest (6)."],
          ],
        },
        {
          t: "Reading Chord Diagrams",
          f: "Read chord boxes: strings, frets, finger numbers, open and muted strings",
          s: "Understand chord diagrams so you can learn any chord from a book or website.",
          o: ["Read strings and frets in a chord diagram", "Interpret finger numbers, O and X symbols", "Learn a new chord from a diagram"],
          x: `Almost every chord you will learn is shown as a **chord diagram** (chord box) — a picture of the fretboard as if the guitar were standing upright facing you.

- The **vertical lines** are the six strings: **low E on the left**, high E on the right.
- The **horizontal lines** are the frets; the thick line at the top is the **nut**.
- **Dots** show where to place fingers, often with a **finger number** inside:
  **1 = index, 2 = middle, 3 = ring, 4 = little finger** (the thumb is usually not numbered).
- **O** above a string means play it **open** (unfretted).
- **X** above a string means **do not play** it (or mute it).
- If the chord is higher up the neck, a number such as "5fr" beside the diagram shows the starting fret.

For example, the **E minor** diagram shows dots on the **2nd fret of the 5th (A) string** (finger 2) and the **2nd fret of the 4th (D) string** (finger 3), with O over every other string: all six strings are strummed.

The **D major** diagram has **X over strings 6 and 5**, O over the 4th (open D), and fingers on string 3 (2nd fret), string 2 (3rd fret) and string 1 (2nd fret). So you strum only the top **four** strings.

How to learn a chord from a diagram:
1. Place the fingers one at a time, starting with the lowest string.
2. Strum, then **pick each string individually** to check it rings clearly.
3. Fix any muted or buzzing string by arching that finger more or moving it closer to the fret.
4. Lift the hand off and place all fingers *together* — repeat until you can do it without looking.`,
          c: [
            ["Chord diagram", "A grid showing strings (vertical) and frets (horizontal) with finger positions for a chord."],
            ["O and X", "Symbols above the diagram: O = play the string open, X = do not play it."],
            ["Finger numbers", "1 index, 2 middle, 3 ring, 4 little finger."],
          ],
          e: {
            t: "Decoding the A minor diagram",
            s: "The Am diagram shows: X on string 6, O on string 5, finger 2 on string 4 fret 2, finger 3 on string 3 fret 2, finger 1 on string 2 fret 1, O on string 1.",
            st: ["Do not play the low E; the A string rings open", "Place finger 1 on the B string, 1st fret; fingers 2 and 3 on the D and G strings, 2nd fret", "Strum from the A string down and pick each string to check it rings"],
            so: "You are playing A minor — a five-string chord with the notes A, C and E.",
          },
          a: ["Learning chords from songbooks and websites", "Understanding chord charts quickly"],
          m: [["Reading the diagram mirror-image", "The low E string is on the left of the diagram."], ["Strumming strings marked X", "Start the strum on the lowest string that is not marked X."]],
          tip: ["Say the finger numbers out loud as you place each finger."],
          k: ["Vertical lines are strings (low E left); horizontal lines are frets.", "Numbers are fingers; O is open, X is not played.", "Check each string individually after forming a chord."],
          q: [
            ["In a chord diagram, which string is on the far left?", ["High E", "Low E (6th string)", "G string", "B string"], 1, "The diagram shows the low E on the left."],
            ["What does an X above a string mean?", ["Play it open", "Do not play it", "Play it twice", "Use finger 10"], 1, "X means the string is not played or is muted."],
            ["Which finger is number 3?", ["Index", "Middle", "Ring", "Little"], 2, "1 index, 2 middle, 3 ring, 4 little."],
          ],
        },
        {
          t: "Your First Chords: E minor and A minor",
          f: "Play E minor and A minor cleanly and switch between them",
          s: "Play your first two chords cleanly and make your first chord change.",
          o: ["Play E minor and A minor with every string ringing", "Switch between Em and Am", "Strum steady downstrokes on each beat"],
          x: `**E minor (Em)** is the easiest full chord on the guitar and uses all six strings:
- Finger 2 on the **5th string (A), 2nd fret**
- Finger 3 on the **4th string (D), 2nd fret**
- Strum all six strings.

**A minor (Am)** uses five strings:
- Finger 1 on the **2nd string (B), 1st fret**
- Finger 2 on the **4th string (D), 2nd fret**
- Finger 3 on the **3rd string (G), 2nd fret**
- Strum from the 5th string (A) down; avoid the low E.

**Making them ring:** pick each string one at a time. A dead or buzzing string usually means a finger is (a) touching the string below it — arch the finger more, (b) too far from the fret — move it closer, or (c) not pressing quite enough.

**The Em → Am change.** Notice that the *shape* of fingers 2 and 3 in Em moves **down one string** (from strings 5 and 4 to strings 4 and 3) for Am, and finger 1 is added on the B string. Move fingers 2 and 3 together as a unit — this is called a *shape shift* — then add finger 1.

**First strumming:** strum one **downstroke** per beat, counting "1, 2, 3, 4", four strums of Em then four of Am. Use a relaxed wrist motion rather than the whole arm, and keep the strumming hand moving in time even if the change is late. Start slowly with a metronome at 60 BPM.

These two chords alone are enough to play simple pieces, and both appear in thousands of songs.`,
          c: [
            ["E minor (Em)", "Fingers 2 and 3 on the 2nd fret of the A and D strings; all six strings strummed."],
            ["A minor (Am)", "Fingers on B string fret 1, D and G strings fret 2; strummed from the A string."],
            ["Shape shift", "Moving a group of fingers together to a new position during a chord change."],
          ],
          e: {
            t: "A one-minute change drill",
            s: "Improve the Em → Am change with a timed drill.",
            st: ["Set a timer for 60 seconds", "Form Em, strum once, change to Am, strum once — repeat as fast as you can while every chord stays clean", "Count the clean changes and write the number down; repeat daily"],
            so: "A typical beginner starts at 10–15 clean changes a minute and reaches 30–40 within one to two weeks of daily drills — fast enough to keep time in songs.",
          },
          a: ["Accompanying simple songs", "Building finger strength and accuracy"],
          m: [["Strumming all six strings on Am", "Start the strum on the 5th (A) string."], ["Lifting fingers far from the strings during changes", "Keep fingers hovering close to the fretboard."]],
          tip: ["Look for the finger shape that stays the same between two chords and move it as one unit."],
          k: ["Em uses all six strings; Am starts on the A string.", "Pick each string to check the chord rings cleanly.", "Practise changes with one-minute drills and keep the strum steady."],
          q: [
            ["How many strings are strummed in a standard E minor chord?", ["4", "5", "6", "3"], 2, "Em uses all six strings."],
            ["On which string does finger 1 sit in A minor?", ["6th string", "2nd string (B), 1st fret", "1st string", "5th string"], 1, "Finger 1 is on the B string at the 1st fret."],
            ["What usually causes a muted string in a chord?", ["The guitar is too new", "Another finger is touching it or a finger is far from the fret", "Strumming too slowly", "Using a tuner"], 1, "Arch fingers and press close to the fret."],
          ],
        },
      ],
    },
    {
      t: "Open Chords and Strumming",
      s: "The essential open chords C, G and D, efficient chord changes, and steady down-up strumming.",
      ls: [
        {
          t: "The Essential Open Chords: C, G and D",
          f: "Play C major, G major and D major cleanly",
          s: "Add C, G and D major to your chord vocabulary — together with Em and Am, they cover thousands of songs.",
          o: ["Play C, G and D major cleanly", "Know which strings to strum for each", "Recognise the major and minor chord sound"],
          x: `With **C, G and D** added to Em and Am, you will have the five chords that power a huge number of popular songs.

**C major (C)** — strum from the 5th string:
- Finger 3: 5th string (A), 3rd fret
- Finger 2: 4th string (D), 2nd fret
- Finger 1: 2nd string (B), 1st fret
- G and high E strings open. Arch your fingers so the open G and E ring.

**G major (G)** — strum all six strings:
- Finger 2: 6th string (low E), 3rd fret
- Finger 1: 5th string (A), 2nd fret
- Finger 3: 1st string (high E), 3rd fret
- (Many players use 3–2–4 fingering instead, which makes changing to C easier — try both.)

**D major (D)** — strum only the top **four** strings:
- Finger 1: 3rd string (G), 2nd fret
- Finger 3: 2nd string (B), 3rd fret
- Finger 2: 1st string (high E), 2nd fret
- The D string rings open; avoid the low E and A strings.

**Major vs minor:** strum C, then Am. Major chords sound bright and settled; minor chords sound darker. Hearing this difference helps you learn songs by ear.

Practise each new chord with the routine from the diagrams lesson: place fingers lowest string first, strum, pick each string, fix problems, and repeat until you can form it without looking. C is usually the hardest of the three because of the stretch — keep the wrist low and relaxed and let the fingers curve over the strings.`,
          c: [
            ["C major", "Fingers 3–2–1 on A3, D2 and B1; strum from the A string."],
            ["G major", "Fingers on low E3, A2 and high E3; strum all six strings."],
            ["D major", "Fingers on G2, B3 and high E2; strum only the top four strings."],
          ],
          e: {
            t: "A five-chord check-up",
            s: "Test whether all five chords (Em, Am, C, G, D) are clean.",
            st: ["Form each chord and strum once with the correct starting string", "Pick each string slowly and note any buzz or muted string", "Spend the rest of the session fixing only the weakest chord"],
            so: "You finish with a list such as 'C – open G string muted by finger 2', and a focused fix (arch finger 2), which improves faster than practising every chord equally.",
          },
          a: ["Playing hundreds of pop, folk and rock songs", "Accompanying group singing"],
          m: [["Strumming the low strings on D", "Start the strum on the open D (4th) string."], ["Flat fingers muting open strings on C", "Arch fingers so the open G and high E can ring."]],
          tip: ["Practise the hardest chord first in every session, while your hand is fresh."],
          k: ["C strums from the A string, G uses all six, D only the top four.", "Em, Am, C, G and D cover thousands of songs.", "Fix one problem chord at a time."],
          q: [
            ["How many strings are strummed for a D major open chord?", ["6", "5", "4", "3"], 2, "D uses the top four strings, starting on the open D string."],
            ["On which string and fret is finger 3 in an open C chord?", ["6th string, 3rd fret", "5th string (A), 3rd fret", "1st string, 3rd fret", "2nd string, 1st fret"], 1, "Finger 3 is on the A string at the 3rd fret."],
            ["Which chord is played on all six strings?", ["C", "D", "G", "Am"], 2, "G major uses all six strings."],
          ],
        },
        {
          t: "Smooth Chord Changes",
          f: "Use anchor fingers, pivots and preparation to change chords in time",
          s: "Learn the techniques that make chord changes fast and keep the rhythm going.",
          o: ["Use anchor and pivot fingers", "Practise changes with the 'last-beat' technique", "Keep the strumming hand moving through changes"],
          x: `The main thing separating beginners from players who sound good is not knowing more chords — it is **changing between chords in time**.

**1. Find anchor fingers.** Some fingers stay on the same string and fret between two chords. From **C to Am**, fingers 1 and 2 stay exactly where they are; only finger 3 moves (from the A string to the G string). Keep anchors pressed down and move only what must move.

**2. Use pivot or guide fingers.** When a finger moves along the *same string*, slide it lightly rather than lifting it: going from **G (3–2–4 fingering) to Em**, the shape relaxes onto the 2nd fret with minimal movement.

**3. Move fingers as a shape.** Think of the whole chord arriving together, not finger by finger. Practise "air changes": lift the hand a centimetre and land the next shape all at once.

**4. The last-beat (empty strum) trick.** On the **last beat** before a change, let go of the old chord and strum the open strings while your fretting hand moves. The open-string strum is barely noticeable in a song, and it buys you time so the next chord lands on beat 1.

**5. Keep the strumming hand moving.** Your strumming hand is the timekeeper. Even if the new chord is not ready, keep strumming in rhythm — stopping to fix a chord is far more noticeable to a listener than one imperfect strum.

Practise the most common pairs separately with one-minute drills: **G–C, C–D, D–G, Em–C, Am–G**, writing down your score each day.`,
          c: [
            ["Anchor finger", "A finger that stays in the same place between two chords."],
            ["Last-beat change", "Releasing the chord on the final beat (strumming open strings) to land the next chord on time."],
            ["Timekeeping hand", "The strumming hand, which keeps moving in rhythm even during chord changes."],
          ],
          e: {
            t: "C to Am with anchors",
            s: "Change from C to Am in time at 70 BPM, four strums each.",
            st: ["Notice fingers 1 (B string, 1st fret) and 2 (D string, 2nd fret) are the same in both chords", "Keep them down and move only finger 3 from the A string (3rd fret) to the G string (2nd fret)", "Strum four beats of C and four of Am, changing on the 'and' after beat 4"],
            so: "Because only one finger moves, the change becomes almost instant — usually the first change beginners can play perfectly in time.",
          },
          a: ["Playing songs without pausing between chords", "Playing with a metronome or other musicians"],
          m: [["Lifting every finger off between chords", "Keep anchor fingers down and move shapes together."], ["Stopping the strum to fix a chord", "Keep strumming in time; fix the shape during practice drills."]],
          tip: ["Before practising a song, list the chord pairs it uses and drill each pair for one minute."],
          k: ["Anchor and pivot fingers make changes shorter.", "Use the last beat to move to the next chord.", "Never stop the strumming hand."],
          q: [
            ["Between C and Am, how many fingers need to move?", ["All three", "Two", "One (finger 3)", "None"], 2, "Fingers 1 and 2 stay; only finger 3 moves."],
            ["What is the purpose of the last-beat technique?", ["To play louder", "To give the fretting hand time so the next chord lands on beat 1", "To tune the guitar", "To mute the strings"], 1, "Releasing early lets the new chord arrive on time."],
            ["If a chord isn't ready in time, what should the strumming hand do?", ["Stop", "Keep strumming in rhythm", "Play faster", "Mute everything for a bar"], 1, "Steady rhythm matters more than one imperfect strum."],
          ],
        },
        {
          t: "Down-Up Strumming in 4/4",
          f: "Strum steady eighth-note down-up motion and accent the beat",
          s: "Develop a constant down-up strumming motion and count eighth notes in 4/4 time.",
          o: ["Count eighth notes in 4/4 ('1 and 2 and…')", "Keep a constant down-up strumming motion", "Hold a pick and strum with a relaxed wrist"],
          x: `Good strumming comes from one simple principle: **the strumming hand never stops moving**.

**Counting.** Most songs are in **4/4 time**: four beats per bar. Splitting each beat in two gives **eighth notes**, counted:

**1 & 2 & 3 & 4 &**

The rule: **downstrokes on the numbers, upstrokes on the "&"s.** Your hand moves down on every beat and up between beats — like a pendulum — whether or not it actually hits the strings.

**Holding the pick:** grip it between the pad of your thumb and the side of your index finger, with only a few millimetres showing. Hold it firmly enough not to drop it but loosely enough to flex. A medium or thin pick (0.5–0.7 mm) is easiest for strumming.

**The motion:** rotate from the wrist and forearm, as if shaking water off your hand — not from the shoulder. Downstrokes hit mainly the lower (thicker) strings; upstrokes catch mainly the higher (thinner) strings, which gives a natural, light sound.

**Step-by-step practice (one chord, metronome at 60–70 BPM):**
1. Downstrokes only on 1, 2, 3, 4.
2. All eighth notes: D U D U D U D U.
3. Add an **accent**: strum slightly harder on beats 2 and 4 (the "backbeat"), which immediately sounds more musical.

**Missing strums.** To create patterns, the hand keeps its down-up motion but sometimes **misses the strings** on purpose — the next lesson builds patterns this way. Because the motion is constant, your timing stays steady even in complex rhythms.`,
          c: [
            ["Eighth-note strumming", "Down on each beat and up on each '&', eight strums per 4/4 bar."],
            ["Constant motion", "The strumming hand keeps moving down and up in time even when it misses the strings."],
            ["Backbeat accent", "Emphasising beats 2 and 4, a key feel in pop and rock."],
          ],
          e: {
            t: "From quarter to eighth notes",
            s: "Strum a G chord for two bars of each level at 65 BPM.",
            st: ["Bars 1–2: down strums only, counting '1 2 3 4'", "Bars 3–4: D U D U D U D U, counting '1 & 2 & 3 & 4 &'", "Bars 5–6: the same eighth notes with a slightly harder strum on 2 and 4"],
            so: "The rhythm progresses from steady beats to a flowing, accented strum while the hand motion stays even throughout.",
          },
          a: ["Accompanying songs with a steady groove", "Playing in a band or with recordings"],
          m: [["Strumming from the shoulder", "Use a relaxed wrist and forearm rotation."], ["Stopping the hand between strums", "Keep the pendulum moving, even on missed strums."]],
          tip: ["Mute the strings with your fretting hand and practise the strumming rhythm alone — it isolates the timing."],
          k: ["Count 1 & 2 & 3 & 4 &: down on numbers, up on &s.", "The strumming hand moves constantly like a pendulum.", "Accent beats 2 and 4 for a musical feel."],
          q: [
            ["In eighth-note strumming, upstrokes fall on…", ["The numbers", "The '&'s", "Only beat 1", "Only beat 4"], 1, "Down on 1, 2, 3, 4; up on each &."],
            ["How many strums are in a bar of 4/4 eighth notes?", ["4", "6", "8", "16"], 2, "Four beats × two = eight strums."],
            ["Where should the strumming motion mainly come from?", ["The shoulder", "The wrist and forearm", "The fingers only", "The elbow locked"], 1, "A relaxed wrist/forearm rotation gives control without tension."],
          ],
        },
      ],
    },
    {
      t: "Playing Songs",
      s: "Strumming patterns, playing complete songs from chord progressions, and a practice routine that keeps you improving.",
      ls: [
        {
          t: "Strumming Patterns",
          f: "Play common strumming patterns by missing strokes within constant motion",
          s: "Create musical strumming patterns from the constant down-up motion, including the classic 'D DU UDU'.",
          o: ["Build patterns by missing strums", "Play the 'D DU UDU' pattern", "Match a pattern to a song's feel"],
          x: `A **strumming pattern** is simply the down-up eighth-note motion with some strums **missed on purpose**. Because your hand never stops, the timing stays right.

Write the eight positions of a 4/4 bar:

\`1  &  2  &  3  &  4  &\`
\`D  U  D  U  D  U  D  U\`

**Pattern 1 — "steady eighths":** hit everything: D U D U D U D U.

**Pattern 2 — the folk/pop classic "D DU UDU":**

\`1     2  &     &  4  &\`
\`D     D  U     U  D  U\`

You **miss the up on beat 1's &** and **miss the down on beat 3**. Say it out loud: "Down, down-up, *(miss)* up-down-up." This pattern fits a vast number of pop and acoustic songs.

**Pattern 3 — "rock eighths":** all downstrokes, D D D D D D D D, accenting 2 and 4 — energetic and driving.

**Pattern 4 — "ballad":** D (miss) D U for a slow 4/4 or a gentle feel.

**How to learn a pattern:**
1. Mute the strings and say the pattern while strumming the motion.
2. Play it on one chord until it feels automatic (at least 2–3 minutes without errors).
3. Add a chord change every bar, using the last-beat trick from the previous module.

**Choosing a pattern:** listen to the song and copy its *feel*, not necessarily every strum. Simplifying to downstrokes on each beat is always acceptable while you learn — rhythm and steadiness matter more than complexity.`,
          c: [
            ["Strumming pattern", "A repeating sequence of strums and missed strums within the constant down-up motion."],
            ["D DU UDU", "A common pop/folk pattern: down, down-up, (miss), up-down-up."],
            ["Missed strum", "Moving the hand past the strings without touching them, to keep time."],
          ],
          e: {
            t: "Learning D DU UDU on two chords",
            s: "Play the pattern on G for one bar and C for one bar, repeatedly, at 70 BPM.",
            st: ["Mute the strings and say 'down, down-up, up-down-up' while moving the hand constantly", "Play it on G only for two minutes", "Alternate G and C each bar, changing on the final up-strum"],
            so: "After a few sessions the pattern runs automatically and the chord changes fit inside it without breaking the rhythm.",
          },
          a: ["Playing pop, folk and acoustic rock songs", "Accompanying singing at events"],
          m: [["Stopping the hand at missed strums", "Keep moving; just miss the strings."], ["Trying complex patterns before the motion is steady", "Master steady eighths first."]],
          tip: ["Say the pattern out loud while playing — your mouth helps your hand keep time."],
          k: ["Patterns = constant down-up motion with deliberate misses.", "D DU UDU fits a huge number of songs.", "Learn on one chord first, then add changes."],
          q: [
            ["In 'D DU UDU', which strum is missed on beat 3?", ["The upstroke", "The downstroke", "Both", "Neither"], 1, "Beat 3's downstroke is missed; the & after it is played up."],
            ["How are strumming patterns created?", ["By stopping the hand", "By missing some strums while the hand keeps moving", "By changing tuning", "By using only upstrokes"], 1, "Constant motion keeps the timing while misses create the rhythm."],
            ["What is always an acceptable simplification while learning a song?", ["Skipping chords", "Downstrokes on each beat", "Playing faster", "Not counting"], 1, "Steady downstrokes keep time while you learn."],
          ],
        },
        {
          t: "Playing Complete Songs",
          f: "Play songs from chord charts using common progressions",
          s: "Read chord charts and play complete songs using the I–V–vi–IV and I–IV–V progressions.",
          o: ["Read a chord chart with bars and lyrics", "Play the G–D–Em–C and G–C–D progressions", "Use a capo to change key"],
          x: `You now have everything needed to play complete songs: five open chords, smooth changes and strumming patterns.

**Chord charts** show chords above the lyrics or in bars:

\`| G  | D  | Em | C  |\`

Each box is one bar (four beats). A chord written above a word changes on that syllable.

**The two progressions to learn first** (both in the key of G, using only your chords):
- **G – D – Em – C** (I–V–vi–IV): the famous "pop progression" heard in countless hits.
- **G – C – D – G** (I–IV–V–I): the backbone of folk, country and rock.
And a minor-sounding variation: **Em – C – G – D** (the same chords, starting on Em).

**Song structure:** most songs repeat sections — *verse*, *chorus*, sometimes a *bridge*. Learn the chorus first (it usually repeats most), then the verse. Many songs use one progression for the whole song.

**The capo** is a clamp across the strings at a fret, raising every chord by one half step per fret. With a capo on fret 2, your G shape sounds as A. This lets you play songs in the original key — or a key that suits your voice — using the easy open shapes you already know.

**Playing along:** start with the song at a slower speed (most video players allow 0.75×), play only downstrokes on each beat, and keep going through mistakes. Once you can play through without stopping, add the strumming pattern and play at full speed.

Singing and playing together is a separate skill: strum steady downstrokes and hum the melody first, then add the words.`,
          c: [
            ["Chord chart", "Chords written in bars or above lyrics showing what to play and when to change."],
            ["I–V–vi–IV", "The 'pop progression'; G–D–Em–C in the key of G."],
            ["Capo", "A clamp that raises the pitch of all strings, letting open shapes play in other keys."],
          ],
          e: {
            t: "Your first full progression piece",
            s: "Play G – D – Em – C four times as a verse, then G – C – D – G twice as a chorus, at 75 BPM.",
            st: ["Play one bar (four downstrokes) per chord through the verse", "Switch to the chorus progression without stopping", "Repeat with the D DU UDU pattern once the changes are reliable"],
            so: "You have played a complete verse–chorus structure — the same structure and chords used by a large number of real songs.",
          },
          a: ["Playing popular songs for friends", "Joining jam sessions and college events"],
          m: [["Practising only the first line of a song", "Learn the chorus and play the whole structure through."], ["Changing the strumming pattern while learning chords", "Use simple downstrokes until the changes are secure."]],
          tip: ["Search for a song name plus 'chords' and choose versions that use G, C, D, Em and Am."],
          k: ["Chord charts show bars and change points.", "G–D–Em–C and G–C–D–G unlock many songs.", "A capo changes key while keeping easy shapes."],
          q: [
            ["With a capo on the 2nd fret, a G chord shape sounds as…", ["G", "A", "F", "B"], 1, "Each fret raises the pitch by a half step: G → G♯ → A."],
            ["Which progression is I–IV–V–I in G?", ["G – D – Em – C", "G – C – D – G", "Em – C – G – D", "G – Am – Em – D"], 1, "In G: I = G, IV = C, V = D."],
            ["What should you learn first in a new song?", ["The guitar solo", "The most repeated section, usually the chorus", "The ending only", "The intro only"], 1, "The chorus repeats most and often uses the main progression."],
          ],
        },
        {
          t: "Practice Routine and Troubleshooting",
          f: "Plan daily practice and fix buzzing, sore fingers and timing problems",
          s: "Use a balanced daily routine and fix the most common beginner problems.",
          o: ["Plan a 20-minute daily practice routine", "Diagnose and fix buzzing and muted strings", "Track progress and avoid strain"],
          x: `Steady progress on guitar comes from **short, focused daily practice**. A balanced 20-minute routine:

1. **Tune and warm up** (2 min) — tune all strings; gentle finger stretches.
2. **Chord changes** (5 min) — one-minute drills on your two weakest chord pairs; write down your scores.
3. **Strumming** (5 min) — a pattern on one chord with a metronome, then with changes.
4. **Song** (6 min) — play a song from start to finish without stopping.
5. **Fun** (2 min) — play whatever you enjoy.

**Troubleshooting common problems:**

- **Buzzing strings:** the finger is too far from the fret (move it closer), not pressing enough, or the side of another finger is touching the string. Rarely, the guitar's set-up (string height) is the cause — a music shop can adjust it cheaply.
- **Muted strings in chords:** arch the fingers so you press with the tips; check that the palm is not touching the high strings.
- **Sore fingertips:** normal for the first weeks. Practise in short sessions, stop if pain is sharp, and the calluses will form. Lighter-gauge strings help.
- **Hand or wrist pain:** stop. Check posture, keep the wrist straighter, relax the thumb and grip less hard. Pain is a warning, not something to push through.
- **Rushing or dragging:** practise with a metronome at a slower tempo, and record yourself — timing problems are much easier to hear on a recording.
- **Plateaus:** change something — a new song, a new chord (try F or B7), a new pattern — or learn simple fingerpicking.

Keep a short practice log: date, what you practised, chord-change scores and tempo. Seeing progress over weeks is the best motivation to keep playing.`,
          c: [
            ["Practice log", "A record of what you practised, scores and tempos, used to track progress."],
            ["Fret buzz", "A buzzing sound when a string vibrates against a fret, usually from finger placement or pressure."],
            ["Calluses", "Hardened fingertip skin that forms with regular practice and stops soreness."],
          ],
          e: {
            t: "Fixing a buzzing G chord",
            s: "Your G chord buzzes on the 5th string.",
            st: ["Pick the 5th string alone to confirm where the buzz is", "Check finger 1 (A string, 2nd fret): move it right up behind the fret and press with the tip", "Check no other finger is touching the string, then strum again"],
            so: "Moving the finger closer to the fret and arching it removes the buzz without pressing harder — the most common fix for buzzing chords.",
          },
          a: ["Making steady progress with limited time", "Solving problems without a teacher"],
          m: [["Practising for hours once a week", "Practise 15–20 minutes every day instead."], ["Pushing through hand pain", "Stop, rest and correct your posture and grip."]],
          tip: ["Record yourself playing a song once a week and keep the recordings — the improvement is motivating."],
          k: ["A short daily routine covers changes, strumming and songs.", "Most buzzing comes from finger placement, not pressure.", "Track progress, and stop if you feel pain."],
          q: [
            ["What is the most common fix for a buzzing string?", ["Press much harder", "Move the finger closer to the fret and press with the tip", "Strum faster", "Retune the guitar"], 1, "Correct placement removes most buzz with little pressure."],
            ["What should you do if your wrist hurts while playing?", ["Push through it", "Stop and correct posture and grip", "Play faster", "Use a heavier pick"], 1, "Pain is a warning sign of strain."],
            ["Which practice schedule is usually more effective?", ["Three hours on Sunday", "Twenty minutes every day", "Only when you feel inspired", "One hour once a month"], 1, "Short daily sessions build skill and calluses steadily."],
          ],
        },
      ],
    },
  ],
};
