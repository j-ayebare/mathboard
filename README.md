# MathBoard

An educational math games app for touch-screen Chromebooks (and desktops), built with React + Vite. Runs as a local web app or can be packaged with Electron for offline use.

## Games included

| Game | Skills |
|------|--------|
| Tic Tac Toe | Strategy, logic |
| Color Rings | Spatial reasoning, planning |
| Twenty-One | Mental arithmetic, probability |
| Countdown | Arithmetic operations, problem solving |
| Rubix 2×2 | Spatial reasoning, sequencing |
| Fact Race | Addition, subtraction, multiplication, division speed |

Plus a **Drawing Board** and per-game **Scoreboards** stored in localStorage.

---

## Quick start (web / browser)

```bash
npm install
npm run dev
```

Open http://localhost:5173 in any browser.

## Production build

```bash
npm run build
npm run preview
```

The `dist/` folder is a fully static site — deployable to Render, Netlify, Vercel, or any static host.

## Electron (desktop / Chromebook)

### Development mode
```bash
npm install
npm run electron-dev
```

### Build distributable
```bash
npm run build-electron
```

Output in `dist-electron/`:
- **Linux**: `.AppImage` and `.deb` (works on Chromebook via Linux container)
- **Windows**: `.exe` installer
- **macOS**: `.dmg`

### Chromebook notes
Enable the Linux (Debian) container in ChromeOS settings, then:
```bash
sudo dpkg -i mathboard_*.deb
# or run the AppImage directly
chmod +x mathboard_*.AppImage && ./mathboard_*.AppImage
```

---

## Deploying to Render (static site)

1. Push this repo to GitHub
2. Create a new **Static Site** on Render
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## Project structure

```
mathboard/
├── electron/
│   └── main.js          # Electron main process
├── src/
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Root + navigation
│   ├── index.css        # Global styles + CSS variables
│   ├── Hub.jsx/css      # Home page
│   ├── UI.jsx/css       # Shared components (buttons, banners, scoreboard)
│   ├── TicTacToe.*      # Game: Tic Tac Toe
│   ├── RingSort.*       # Game: Color Rings
│   ├── TwentyOne.*      # Game: Twenty-One
│   ├── Countdown.*      # Game: Countdown
│   ├── Rubix.*          # Game: Rubix 2×2
│   ├── FactRace.*       # Game: Fact Race
│   ├── DrawingSpace.*   # Drawing board
│   └── AllScores.jsx    # Global scoreboard
├── index.html
├── vite.config.js
└── package.json
```

## Roadmap / next features

- [ ] Full 3×3 Rubix cube
- [ ] Multiplayer Fact Race (two players, two name inputs)
- [ ] Timer modes for Countdown
- [ ] Sound effects
- [ ] Student profiles / persistent named scores
- [ ] Teacher dashboard
