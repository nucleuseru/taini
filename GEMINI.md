# GEMINI.md - Project Instructions

## Project Overview
**taini** is a full-stack monorepo designed for an AI-powered media generation platform. It enables users to create and manage complex creative projects involving AI-generated images, videos, and audio (TTS/STT), organized into storyboards, scenes, and shots.

## Tech Stack
- **Monorepo:** [Turborepo](https://turbo.build/repo) + [pnpm](https://pnpm.io/)
- **Frontend:** [Next.js 16+](https://nextjs.org/) (App Router), [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Nuqs](https://nuqs.47ng.com/)
- **Backend:** [Convex](https://convex.dev/) (Real-time database & serverless functions)
- **Authentication:** [Better-Auth](https://www.better-auth.com/) (integrated with Convex)
- **AI Integrations:**
  - **Image:** Flux.1 / Flux.2
  - **Video:** LTX-Video 2.3
  - **Audio:** Qwen2-TTS / Qwen3-TTS
  - **Transcription:** OpenAI Whisper

## Directory Structure
- `apps/web`: Next.js web application.
- `packages/convex`: Convex backend schema, functions, and AI agent logic.
- `packages/flux-2`: Deployment scripts and handlers for Flux-2 image generation.
- `packages/ltx-2.3`: Deployment scripts and handlers for LTX-Video 2.3.
- `packages/qwen3-tts`: Deployment scripts and handlers for Qwen3-TTS.
- `packages/whisper`: Deployment scripts and handlers for Whisper transcription.
- `packages/eslint-config`: Shared ESLint configurations.
- `packages/tsconfig`: Shared TypeScript configurations.

## Development Workflow

### Key Commands
- `pnpm dev`: Starts the development environment for all apps and packages.
- `pnpm build`: Builds all packages and apps.
- `pnpm lint`: Runs ESLint across the entire monorepo.
- `pnpm check-types`: Runs TypeScript type checking.
- `pnpm format`: Formats the codebase using Prettier.
- `pnpm clean`: Removes `node_modules` and build artifacts.

### Workspace Specifics
- **Web App:** Run `pnpm --filter web-app dev` to start only the frontend.
- **Convex Backend:** Use `npx convex dev` within `packages/convex` (or via root scripts if configured) to sync functions and schema.

## Development Conventions & Guidelines

### Visual Style: "The Cinematic Alchemist"
Adhere to the following design principles from `DESIGN.md`:
- **Theme:** Dark theme ("Deep Onyx" #131313) with "Liquid Gold" (#efcb61) accents.
- **No-Line Rule:** Avoid 1px solid borders. Define boundaries using background color shifts (Tonal Layering).
- **Typography:** **Manrope** for headlines (editorial feel), **Inter** for body text (legibility).
- **Depth:** Use tonal layering and `backdrop-filter: blur(20px)` for glassmorphism effects.
- **Corners:** Sharp professional look with `sm` (0.125rem) or `md` (0.375rem) border-radius.

### Critical Guidelines
- **Next.js:** ALWAYS read the relevant documentation in `node_modules/next/dist/docs/` before implementing new Next.js features, as training data may be outdated for newer versions (v16+).
- **Convex:** ALWAYS refer to `packages/convex/src/_generated/ai/guidelines.md` for project-specific Convex patterns and rules. This file overrides general Convex knowledge.
- **Better-Auth:** Authentication is managed via Better-Auth with a Convex adapter. See `packages/convex/src/betterAuth/` for implementation details.

## Data Model (Convex Schema)
The platform uses a hierarchical data model:
- `project`: Root container for all creative assets.
- `storyboard`: Scripts and high-level project configuration.
- `scene`: Logical sections of a storyboard.
- `shot`: Individual units of a scene, containing images and video clips.
- `image` / `video` / `audio` / `voice`: AI-generated or uploaded media assets.
- `character` / `item` / `environment`: Project entities for consistent generation.

Refer to `packages/convex/src/schema.ts` for full field definitions.
