# SvelteKit Enterprise Boilerplate (Atomic Design)

A comprehensive, production-ready GitHub boilerplate template for modern Svelte 5 and SvelteKit applications. Built for high-velocity engineering teams and agentic workflows, this template enforces an incredibly rigid, hyper-disciplined interpretation of Atomic Design.

## 🚀 Architecture Overview & Rules of Engagement

This repository strictly enforces **Atomic Design Boundaries**. We impose rules to keep complexity bounded, allowing AI agents and human engineers to work without stepping on each other's toes.

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
