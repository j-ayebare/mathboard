# MathBoard

MathBoard is an educational math games app built with React + Vite, with optional Electron packaging for offline desktop use.

Built with Deepseek and Claude Sonnet, plus standard web tools for React, Vite, and Electron.

The live static web version is available at: https://mathboard-3tuk.onrender.com/

## Games included

| Game | Skills |
|------|--------|
| Tic Tac Toe | Strategy, logic |
| Color Rings | Spatial reasoning, planning |
| Twenty-One | Mental arithmetic, probability |
| Countdown | Arithmetic operations, problem solving |
| Rubix 2×2 | Spatial reasoning, sequencing |
| Fact Race | Addition, subtraction, multiplication, division speed |

Plus a **Drawing Board** and a global **Scoreboard** with scores persisted in `localStorage`.

---

## Quick start (web / browser)

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Production build

```bash
npm run build
npm run preview
```

The `dist/` folder contains a fully static site that can be deployed to Render, Netlify, Vercel, or any static host.

## Electron (desktop / Chromebook)

### Run Electron locally

```bash
npm install
npm run electron
```

### Build distributable

```bash
npm run build
npm run electron:build
```

The packaged desktop application output is written to `release/`.

- **Windows**: NSIS installer format
- **Linux**: AppImage and `.deb`

### Chromebook notes

If you want to run the Linux build on ChromeOS, enable the Linux (Debian) container and install the `.deb` file:

```bash
sudo dpkg -i mathboard_*.deb
# or run the AppImage directly
chmod +x mathboard_*.AppImage && ./mathboard_*.AppImage
```

---

## Deploying to Render (static site)

1. Push this repo to GitHub.
2. Create a new **Static Site** on Render.
3. Set the build command to:

```bash
npm run build
```

4. Set the publish directory to:

```text
dist
```

5. Your site can be served at a Render subdomain like the current deployment:

```text
https://mathboard-3tuk.onrender.com/
```

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
