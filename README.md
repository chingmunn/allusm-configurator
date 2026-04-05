# Modular Wardrobe Builder MVP

This project is a production-quality MVP for configuring a modular wardrobe / shelving system. It is a constraint-based builder rather than a freeform CAD tool: users assemble valid structures from preset bay widths, preset compartment heights, fixed finishes, and a constrained library of inserts.

The app includes:
- A simplified 3D builder viewport using React Three Fiber
- Structured editing panels for bays, compartments, inserts, and finishes
- A deterministic validation layer for practical business rules
- JSON import/export
- BOM and cut-list-style summary data

## Stack

- React 18
- TypeScript
- Vite
- three.js
- React Three Fiber
- Zustand
- Vitest for lightweight pure-function tests

## How To Run

1. Install dependencies:

```bash
npm install
```

If PowerShell blocks the `npm` shim on your machine, use:

```bash
npm.cmd install
```

2. Start the dev server:

```bash
npm run dev
```

3. Run a production build:

```bash
npm run build
```

4. Run the test suite:

```bash
npm test
```

## GitHub Pages

This repo is configured to publish the static Vite build to GitHub Pages from the `main` branch using the workflow at `.github/workflows/deploy-pages.yml`.

To enable it:

1. Push the repo to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main` or run the workflow manually from the `Actions` tab.

The Vite base path is already configured for this repository:

```text
/allusm-configurator/
```

So the published site will work correctly at:

```text
https://chingmunn.github.io/allusm-configurator/
```

## Project Structure

```text
src/
  app/              App shell and top-level composition
  builder/
    geometry/       Layout and BOM derivation
    model/          Core types, defaults, finishes, serialization
    rules/          Constraint validation
    scene/          React Three Fiber scene and mesh views
    store/          Zustand store and derived selectors
    ui/             Sidebar and summary panels
    utils/          Small shared utilities
  styles/           Global and app-level CSS
```

## Assumptions And Constraints

- Bay widths use discrete presets: `300 | 400 | 500 | 600`
- Compartment heights use discrete presets: `300 | 400 | 500 | 600`
- Depth is fixed at `500 mm`
- Each compartment has exactly one primary insert type in the MVP
- Side panels are modeled as exposed outer-side cladding only
- BOM values are logically derived rough summaries, not manufacturing-grade output
- Rendering uses simplified geometry and simple materials instead of photoreal PBR

## Recommended Next Improvements

- Add duplicate and reorder actions for bays
- Add URL serialization for sharable configurations
- Expand validation for more detailed product-specific rules
- Improve BOM accuracy around joinery, hardware, and panel dimensions
- Add screenshot export and richer viewport overlays
