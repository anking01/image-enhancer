# LensAI — AI Image Enhancer

A production-ready, full-stack AI image enhancement web application built with React + Vite + TailwindCSS, powered by Google Gemini 2.0 Flash.

## Features

- **AI Enhancement** — Gemini analyzes your photo and computes optimal brightness, contrast, saturation, sharpness, and hue settings
- **Before/After Slider** — Draggable comparison divider to see the exact difference
- **6 Smart Presets** — Portrait, Landscape, Low Light, Vivid, B&W, Cinematic
- **Manual Sliders** — Fine-tune all adjustments in real time
- **History** — Last 5 images saved in localStorage
- **Multi-format Export** — PNG, JPEG, WEBP with quality control
- **100% Private** — Images never leave your browser

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the generated key (starts with `AIzaSy...`)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Add your API key

Click the **"Add API Key"** button in the navbar, paste your Gemini API key, and click **Save Key**. The key is stored only in your browser's `localStorage`.

## Build for production

```bash
npm run build
npm run preview
```

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI & build tool |
| TailwindCSS v3 | Styling |
| React Router v6 | Multi-page routing |
| Framer Motion | Animations |
| Google Gemini API | AI vision analysis |
| Canvas API | Image processing + export |
| localStorage | Settings + history persistence |

## Project Structure

```
src/
  components/
    Navbar.jsx          — Sticky navbar with API key modal trigger
    Footer.jsx          — Site footer
    ApiKeyModal.jsx     — Gemini API key input modal
    ToastProvider.jsx   — Toast notification system
    CompareSlider.jsx   — Before/after drag comparison slider
    EnhancementControls.jsx — Right sidebar with all controls
    AnalysisPanel.jsx   — AI analysis results display
    HistorySidebar.jsx  — Left sidebar with upload + history
    PresetCard.jsx      — Individual preset button component
  pages/
    Landing.jsx         — Home page with hero, features, testimonials
    AppPage.jsx         — Main enhancement workspace
    Features.jsx        — Feature overview grid
    About.jsx           — About page with tech stack and AI explanation
  hooks/
    useGemini.js        — Gemini API call + error handling
    useImageFilters.js  — Filter state management
    useHistory.js       — localStorage history
    useToast.js         — Toast context consumer
  utils/
    imageUtils.js       — base64, canvas download, resize helpers
    filterUtils.js      — CSS filter string builder, presets, defaults
  App.jsx               — Router setup + layout
  main.jsx              — Entry point
  index.css             — Global styles + Tailwind directives
```
