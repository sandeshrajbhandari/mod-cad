# Modular Furniture Prototype

A minimal web-based modular furniture prototyping tool built with React, TypeScript, Vite, and React Three Fiber. It is designed to be practical, fast to demo, and easy to deploy.

## What it does

- Configures three furniture families: cabinet, shelf, and desk
- Updates a live 3D view as dimensions and options change
- Generates a deterministic parts list from the same config model
- Encodes the current design into a shareable URL
- Runs as a frontend-only app suitable for Vercel deployment

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm run test
npm run lint
npm run build
npm run preview
```

## Project structure

- `src/App.tsx`: app shell and state wiring
- `src/lib/furniture.ts`: config schema, clamping rules, model generation, parts generation
- `src/lib/urlState.ts`: share-link serialization and parsing
- `src/components/ConfiguratorPanel.tsx`: controls and presets
- `src/components/FurnitureViewport.tsx`: 3D viewport
- `src/components/PartsPanel.tsx`: structured parts output

## Deployment on Vercel

1. Push the project to a Git provider supported by Vercel.
2. Create a new Vercel project and import the repository.
3. Use these settings if Vercel does not auto-detect them:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

The app is frontend-only, so no environment variables are required for the current MVP.

## Notes

- The 3D viewer is lazy-loaded to keep the initial app shell lighter.
- URL state is compressed so shared links stay reasonably compact.
- The generated geometry is intentionally simple and box-based to keep the product believable without becoming a full CAD system.
