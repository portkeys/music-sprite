# Music Sprite

**Turn the melody in your head into sheet music with chords.**

## Try It Now

**[https://music-sprite.vercel.app](https://music-sprite.vercel.app)**

## About

Music Sprite is a tool for amateur musicians who want to compose music easily. If you can hum a melody but struggle to find the right chords, this app is for you.

### Features

- **Find your key** - Select the unique notes in your melody and discover which major keys work
- **See your chords** - View all 7 diatonic chords with their harmonic functions (Home, Bridge, Outside)
- **Play with a piano** - Click piano keys to input your melody and hear it played back
- **Get chord suggestions** - The app analyzes each phrase and suggests the best matching chords
- **Audition chords** - Click any chord to hear how it sounds with your melody
- **Progression tips** - Learn the basic formula: Home → Bridge → Outside → Home

## Open Source

This project is completely open source. Feel free to:

- Browse the code and learn from it
- Submit issues if you find bugs
- Open pull requests with improvements
- Fork it and make it your own

Contributions are welcome! Whether it's fixing a typo, improving the UI, adding new features, or supporting more scales and chord types - all PRs are appreciated.

## Running Locally

ES6 modules require a local server:

```bash
# Using Python
python -m http.server 8000
# Then open: http://localhost:8000

# Or using Node.js
npx serve
```

## File Structure

```
music_buddy/
├── index.html       # Main HTML file with styles
├── app.js           # Application logic
├── music-theory.js  # Scales, chords, and music theory utilities
├── audio.js         # Piano audio playback using Tone.js
└── README.md
```

## Technical Details

- **Pure client-side** - No backend required, runs entirely in your browser
- **ES6 Modules** - Modern JavaScript for clean code organization
- **Tone.js** - Real Salamander Grand Piano samples for authentic sound
- **Responsive** - Works on desktop and mobile

## License

MIT - Use it however you like!

---

Made for people who think about music via half intuition and half coding.
