# Canon EOS R8 — 3D Showcase Website

A competition-entry 3D product showcase for the Canon EOS R8 Mirrorless Camera.
Glitch / raw anti-design aesthetic with neon red + acid green, built entirely with React Three Fiber.

---

## Requirements

- **Node.js** v18 or later — https://nodejs.org
- **npm** (comes with Node) or **pnpm** (`npm i -g pnpm`)

---

## Run locally

```bash
# 1. Unzip this folder, then open a terminal inside it
cd canon-eos-r8-site

# 2. Install dependencies (~1 min first time)
npm install
# or: pnpm install

# 3. Start the dev server
npm run dev
# or: pnpm dev
```

Then open **http://localhost:5173** in your browser.

> ⚠️ The 3D canvas requires a real browser with GPU / WebGL support.
> It will not render in headless or server-side environments.

---

## Build for production

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Main landing — 3D camera model, glitch FX, scroll sections |
| `/rose` | Silver Gallery — 3D rose + 8 floating photos |

---

## Controls (Silver Gallery `/rose`)

| Input | Action |
|---|---|
| Drag | Rotate the scene |
| Scroll | Zoom in / out |
| Click rose | Silver particle burst |
| Hover photo | Glow + scale up |
| Click photo | Open fullscreen lightbox |
| ESC | Close lightbox |

---

## Tech stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite 7 |
| 3D engine | React Three Fiber + Three.js |
| 3D helpers | @react-three/drei |
| Post-FX | @react-three/postprocessing (Bloom, Glitch, CA, Vignette) |
| Animations | GSAP + ScrollTrigger |
| Styling | Tailwind CSS v4 |
| Routing | Wouter |
