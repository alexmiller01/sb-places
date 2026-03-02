# Places Supertop

A destination page prototype for Yahoo Search, featuring a supertop layout with image gallery, interactive HERE map, weather and flight bricks, algo search results, and a business overlay panel.

## Features

- **Supertop** — Image gallery, interactive map, weather, and flight cards
- **Expandable map** — Smooth expand/collapse with POI pins, hover cards, and business overlay
- **Algo results** — Yahoo-styled search results with favicons and quick links
- **Things to do** — Activity cards with ratings, pricing, and booking
- **Business overlay** — Slide-in panel with gallery, reviews, hours, action list
- **Image overlay** — Full gallery lightbox with thumbnails
- **Quick facts & flights** — Right rail with destination info
- **Password protection** — Encrypted access screen

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- [HERE Maps JS API v3.2](https://developer.here.com/documentation/maps/harp) (Harp engine)
- [Express.js](https://expressjs.com/) server
- UDS (Universal Design System) design tokens

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
places-supertop/
├── public/
│   ├── assets/          # SVG icons, images, pin markers
│   ├── css/             # Stylesheets (tokens, nav, supertop, cards, etc.)
│   ├── fonts/           # Yahoo Product Sans font files
│   ├── js/              # App JavaScript
│   ├── map-styles/      # HERE Maps custom style JSON
│   └── index.html       # Main page
├── server.js            # Express server + API routes
├── package.json
└── README.md
```

## Design References

- Built using UDS (Universal Design System) tokens for typography, color, spacing, and shapes
- Figma designs from Q1 2026 Local project
- HERE Maps with custom Oslo style
