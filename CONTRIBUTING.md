# Contributing Guidelines

Thank you for your interest in contributing to this project!

## Pull Request Workflow

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies** using `pnpm install`.
3. **Make your changes**.
4. **Ensure tests pass** locally:
   - Lint: `pnpm run lint`
   - Test: `pnpm run test:unit`
5. **Open a Pull Request** describing your changes.

## 🚨 STRICT ARCHITECTURAL RULES (READ BEFORE CONTRIBUTING)

This project uses an **incredibly rigid** version of Atomic Design.

**Any PR that violates these rules WILL BE REJECTED:**

1. **No API calls in Styled Components:** You must not put fetch requests or API calls inside Atoms, Molecules, Organisms, or Templates. Data fetching and state injection belong EXCLUSIVELY in the Views (`views`) and `+page.svelte`/`+page.server.ts` routes.
2. **Strict Component Tiers:**
   - **Atoms**: The only place for raw HTML.
   - **Molecules**: Only contain Atoms. Cannot contain other Molecules.
   - **Organisms**: Contain Molecules and Atoms.
   - **Templates**: Stateless wrappers. Do not contain raw HTML, only Organisms.
   - **Views**: Data injectors. Do not contain styled HTML, only pass data to Templates.
3. **Size Limits:** Files must be under 300-500 lines. If your component is larger, break it down.

## Commit Message Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
