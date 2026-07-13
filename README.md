# Dodo Airlines (DAL) Terminal

Welcome to the Dodo Airlines (DAL) Terminal, a web application inspired by Animal Crossing: New Horizons! This tool serves as a real-time flight board and radio chatter system for ACNH players to share Dodo Codes, request island visits, and communicate.

## 🌟 Features

- **Flight Board**: File flight plans to share your Dodo Code with other players. Provide details about your island (e.g., Turnip prices, Celeste visits, Meteor showers).
- **Standby Requests**: Looking to travel? Submit a standby request to let hosts know you're looking for an open gate.
- **Terminal Radio Chatter**: Chat with other passengers in real-time.
- **AI-Powered NPCs**: The terminal radio is monitored by our favorite DAL staff, Orville and Wilbur! Powered by the Gemini AI API, they will dynamically respond to your messages in character when mentioned. Orville can even generate enthusiastic loudspeaker announcements for your flights and write creative travel reviews for your island!
- **Real-Time State**: The board automatically updates and cleans up stale flights to keep the terminal fresh.

## 🚀 Architecture Overview & Rules of Engagement

This repository is built as a **SvelteKit Enterprise Boilerplate** that strictly enforces **Atomic Design Boundaries**. We impose rules to keep complexity bounded, allowing AI agents and human engineers to work without stepping on each other's toes.

### 1. Strict Collision Boundaries (The Fog of War)

Components can **only** see exactly one tier down. The fog of war covers everything else.

- **Atoms (`atoms`)**: Base-level units (Buttons, Inputs). The ONLY components allowed to touch raw HTML or native elements. No data fetching.
- **Molecules (`molecules`)**: Group Atoms together (Form Fields, Search Bars). Cannot import other Molecules or Organisms.
- **Organisms (`organisms`)**: Group Molecules and Atoms to form distinct functional regions (Headers, Footers, complex Widgets).
- **Templates (`templates`)**: Pure visual blueprints. Stateless layout wrappers that arrange Organisms into a page layout structure.
- **Views (`views`)**: The State Injection Layer. **No styled HTML allowed here.** Views ingest raw data/state (from SvelteKit server loads or stores) and inject them into Templates.
  - _Rule_: ZERO API calls or fetch requests inside styled Atoms or Molecules.

### 2. File Size Caps

- **Hard Limit**: A strict 300-500 line hard limit on all component files to keep context windows clean for AI agents.
- **Enforcement**: If you exceed this, refactor and break it down.

### Tech Stack

- **Framework**: SvelteKit 5 (using Runes), TypeScript, Node.js
- **CSS**: Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Package Manager**: pnpm
- **Testing**: Vitest (Unit) and Playwright (E2E)

## 🛠️ Local Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Ensure you set your GEMINI_API_KEY in the .env file!
   ```
3. **Start the development server:**
   ```bash
   pnpm dev
   ```

## 🐳 Docker Deployment

Multi-stage Dockerfile optimized for SvelteKit Node adapter.

```bash
docker-compose up -d --build
```
