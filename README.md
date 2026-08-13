# MASOM

Website for **MASOM — Midwest Association of Shia Organized Muslims** (masom.com), rebuilt on Next.js.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui (radix base) · Lucide · Motion · Supabase · Zod · React Hook Form

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Open <http://localhost:3000>

### Environment variables

| Variable                        | Scope       | Purpose                                                  |
| ------------------------------- | ----------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | client      | Canonical site origin used for metadata, sitemap, robots |
| `NEXT_PUBLIC_SUPABASE_URL`      | client      | Supabase project URL                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client      | Supabase anon key                                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | server only | Admin/service access — never expose to the browser       |

Supabase env is validated lazily, so the app builds and runs before Supabase is configured.

## Scripts

| Script              | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Dev server (Turbopack)     |
| `npm run build`     | Production build           |
| `npm start`         | Serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | `tsc --noEmit`             |
| `npm run format`    | Prettier write             |

## Project structure

```text
src/
  app/
    (website)/        public website routes
    layout.tsx        root layout (fonts, metadata, JSON-LD, skip link)
    globals.css       design tokens + global styling
    sitemap.ts        robots.ts
  components/
    ui/               shadcn/ui primitives
    seo/              JSON-LD helper
  config/
    env.ts            validated environment access
    site.ts           organisation, contact and social data
    navigation.ts     main + footer navigation
  lib/
    seo/              metadata and structured-data builders
    supabase/         client.ts (browser) · server.ts (SSR) · admin.ts (service role)
    utils.ts          cn()
  types/
```

Feature modules (`src/features/prayer-calendar`, `banners`, `programs`, `news-ticker`) and the admin area (`src/app/admin`) are added in the phases that implement them.

## Design tokens

Brand values are taken from the existing masom.com site and live in `src/app/globals.css`:

- Brand teal `#5cb8b2` (link tint `#60b9b7`, surface `#f4fffe`)
- Sand `#b7b09c`, CTA blue `#307fe2`, link blue `#3366ff`
- Ink scale `#38383c` · `#2e2e35` · `#27272b` · `#0e0d12`
- Success `#008a12`, danger `#d60000`, border `#e2e2e2`
- Font: PT Sans (400/700) · radius `0.625rem` (10px)

Use the semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`) rather than raw hex values. Layout containers: `container-page` (1400px) and `container-content` (1200px).

## Reference material

`refernece/` holds the exported homepage HTML and screenshot of the current WordPress site. It is the source of truth for content, navigation and visual identity, and is not part of the build.
