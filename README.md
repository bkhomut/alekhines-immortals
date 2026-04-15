# Alekhine's Immortals

An interactive web app showcasing the 50 greatest chess games of **Alexander Alekhine**, World Chess Champion 1927–1946.

## Features

- **Interactive chess board** — step through every move using buttons or arrow keys
- **50 curated games** with historical context and annotations
- **Sort** by: Greatest Hits ranking · Year · Opening · Theme  
- **Filter** by: Theme · Opening · Result · Decade
- **Full-text search** across titles, players, events, openings, and descriptions
- Classic dark wood aesthetic

## Deployment

### GitHub + Netlify (free hosting)

1. **Create a GitHub repo**
   ```
   git init
   git add .
   git commit -m "Initial commit — Alekhine's Immortals"
   git remote add origin https://github.com/YOUR_USERNAME/alekhines-immortals.git
   git push -u origin main
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click **Add new site → Import an existing project**
   - Connect your GitHub account and select this repo
   - Build settings: leave blank (static site, no build step)
   - Click **Deploy site**
   - Your site will be live at a URL like `https://random-name.netlify.app`

3. **Custom domain** (optional)
   - In Netlify: Site settings → Domain management → Add custom domain

### Local development

Just open `index.html` in a browser. No build step required.

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no framework, no build tools)
- [chess.js](https://github.com/jhlywa/chess.js) — game logic and PGN parsing
- [chessboard.js](https://chessboardjs.com) — interactive board display
- Google Fonts: Cinzel, Playfair Display, EB Garamond

## Adding Games

Edit `js/games.js` and add a new object to the `ALEKHINE_GAMES` array following the existing structure. PGN format is standard — copy from any chess database.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` or `↓` | Next move |
| `←` or `↑` | Previous move |
| `Home` | Go to start |
| `End` | Go to end |
