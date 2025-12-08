# 🚀 Multitenant SaaS Commerce Platform — **Updated Final Documentation**

_(with Shared UI Packages, Lazy Loading, and Full Monorepo Architecture)_

This document is the **single source of truth** for the project’s entire architecture and implementation plan. Use this in every future chat.

* * *

# 🧱 1. High-Level System Overview

You are building a **multi‑tenant, template‑driven, Puck‑powered commerce platform**, composed of:

* **CMS App (PayloadCMS)** – tenant onboarding, seeding, templates, admin
    
* **Storefront App (Next.js 15)** – renders tenant websites dynamically
    
* **Worker App** – cache warmup, template compilation, CDN purge
    
* **Shared Packages** – UI, snapshots, utils
    
* **Infrastructure** – GitHub Actions, Docker, CDN config
    

All applications live inside a **pnpm monorepo**.

* * *

# 📦 2. Updated Monorepo Structure (Final)

```
/
├── apps/
│   ├── cms/                  # PayloadCMS (Onboarding + Admin)
│   ├── storefront/           # Next.js 15 Storefront Runtime
│   └── worker/               # Background Worker

├── packages/
│   ├── ui-components/        # Shared UI w/ lazy + eager maps
│   ├── template-snapshots/   # Static template JSON files
│   └── shared-utils/         # Shared helpers (optional)

├── infra/
│   ├── github-actions/
│   ├── docker/
│   └── cdn/

├── pnpm-workspace.yaml
└── package.json
```

This structure eliminates duplication, improves performance, and ensures CMS + Storefront remain in sync.

* * *

# 🎨 3. Shared UI Components (NEW Architecture)

All storefront UI components moved to:

```
packages/ui-components/src/
```

Includes:

* Hero
    
* Section
    
* Callout
    
* ProductGrid
    
* Footer
    
* Page
    

Each component is used by:

* **Storefront SSR renderer**
    
* **PayloadCMS Puck Editor preview**
    

## 🧩 Lazy Component Map

Used **only by Storefront SSR**:

```ts
export const lazyComponentMap = {
  Hero: () => import("./Hero"),
  Section: () => import("./Section"),
  ProductGrid: () => import("./ProductGrid"),
  Callout: () => import("./Callout"),
  Footer: () => import("./Footer"),
  Page: () => import("./Page"),
};
```

Benefits:

* Loads only the components needed for each page
    
* Smaller bundle / faster SSR
    
* Perfect for serverless / edge runtime
    

## ⚡ Eager Component Map

Used **only by CMS Puck Editor**:

```ts
export const eagerComponentMap = {
  Hero,
  Section,
  ProductGrid,
  Callout,
  Footer,
  Page,
};
```

Benefits:

* Instant preview
    
* Zero flicker in Payload Admin UI
    

* * *

# 🗂 4. Template Snapshots (Static)

All static templates moved to:

```
packages/template-snapshots/
```

Example file:

```
modern.json
minimal.json
fashion.json
electronics.json
```

These represent the **canonical, versioned master templates**.

All flows rely on these:

* CMS onboarding
    
* Worker warmup
    
* Storefront merge
    
* Snapshot compiler
    
* Page regeneration
    

* * *

# 🧬 5. Template Snapshot Lifecycle (UPDATED for Shared Snapshot Package)

```
graph TD
A[packages/template-snapshots/*.json <br> Static Snapshots] 
  --> B[Normalize Snapshot<br>strip heavy fields]
B --> C[Compile Snapshot<br>save to compiled/ + cache]
C --> D[Worker Warmup<br>push compiled to Redis/KV]
D --> E[Payload Onboarding<br>transform → seed collections]
E --> F[Storefront Runtime<br>loadTenantPage → resolve snapshot]
F --> G[SSR Puck Renderer<br>lazy component loading]
```

This is the core backbone of the platform.

* * *

# 🛠 6. CMS App (Payload)

The CMS handles:

* Tenant creation
    
* Template selection
    
* Snapshot → Payload transformation
    
* Page + Product + Settings seeding
    
* Puck integration
    
* Admin controls
    
* Template snapshot endpoint
    
* Multi-tenant secure access control
    

### Key CMS Files:

```
cms/src/
  collections/Tenants.ts
  collections/Pages.ts
  collections/Products.ts
  collections/Templates.ts
  utils/loadCompiledSnapshot.ts
  utils/transformCompiledToPayload.ts
  utils/seedTenantFromTemplate.ts
  endpoints/onboarding/createTenant.ts
  endpoints/templates/snapshot.ts
  app/(onboarding)/page.tsx
  app/(onboarding)/success/page.tsx
```

* * *

# 🌐 7. Storefront App (Next.js 15)

The storefront:

* Dynamically detects tenant
    
* Loads tenant pages from Payload
    
* Loads compiled templates from Redis + fallback
    
* Merges overrides
    
* Lazy-loads components
    
* Renders pages using Puck SSR renderer
    
* Uses multi-layer cache (ISR + Redis + memory)
    

### Key Storefront Files:

```
storefront/src/
  app/[...slug]/page.tsx
  lib/tenant/loadTenantPage.ts
  lib/puck/PuckRenderer.server.tsx
  lib/puck/safeDeserialize.ts
  lib/puck/mergeEngine.ts
  lib/templates/load-template-snapshot.ts
  lib/cache.ts
```

* * *

# ⚙️ 8. Worker App (Cache + CDN)

Worker handles:

* Pre‑warm template cache
    
* Pre‑compute compiled snapshots
    
* Product caching
    
* CDN purge
    
* Revalidation triggers
    

### Key Worker Files:

```
worker/
  tasks/template-snapshot-cache.ts
  tasks/product-cache.ts
  tasks/cdn-purge.ts
  clients/redis.ts
  clients/payload.ts
  clients/cdn.ts
  utils/logger.ts
  index.ts
```

* * *

# ⚡ 9. PNPM Workspace Setup

`pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

Root `package.json`:

```json
{
  "name": "monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel"
  }
}
```

* * *

# 🧪 10. Testing

### Unit Tests (Vitest)

* Snapshot loader
    
* Transformer
    
* Tenant page loader
    
* Merge engine
    

### Integration Tests (MSW)

* Full tenant page resolution
    
* Mocked Payload
    
* Mocked Redis
    
* Worker warmup
    

* * *

# 🎯 11. Updated Summary (Copy into New Chat)
```
This project is a monorepo containing cms, storefront, worker, and shared packages:
- Shared UI components stored in /packages/ui-components with lazy + eager component maps.
- Static template snapshots stored in /packages/template-snapshots.
- CMS handles onboarding, snapshot loading, transformation, and seeding.
- Storefront uses lazy-loaded components, Puck SSR rendering, snapshot merging, and multilayer cache.
- Worker pre-warms template caches, compiles snapshots, and handles CDN/product tasks.
- pnpm workspace manages all subapplications and packages.

This is the full system architecture. Continue development from here.
```