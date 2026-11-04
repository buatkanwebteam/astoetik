# Graph Report - my-app  (2026-11-04)

## Corpus Check
- Corpus is ~48,973 words - fits in a single context window. You may not need a graph.

## Summary
- 640 nodes · 1682 edges · 21 communities (20 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Dashboard Insights & Export
- Catalog UI (Filter/Header)
- Content Plans API
- AI Routes & Zod
- Package & Tooling Config
- Dashboard Layout & Next Config
- Homepage & Shared Libs
- Unit Manager & Drawer
- DB Store Interface
- Content Planner UI
- Unit Page & Tracking
- DB Types
- tsconfig
- Products Data & Page
- Dummy Analytics Data
- Supabase Adapter
- Local JSON Store
- Seed Script
- Root Layout & Fonts
- FAQ Data

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 54 edges
2. `lucide-react` - 36 edges
3. `next` - 31 edges
4. `DashboardPage()` - 31 edges
5. `requireApiSession()` - 31 edges
6. `Db` - 29 edges
7. `react` - 26 edges
8. `ProductDatabase()` - 25 edges
9. `formatRupiah()` - 21 edges
10. `Product` - 20 edges

## Surprising Connections (you probably didn't know these)
- `SeedRow` --references--> `ProductCategory`  [EXTRACTED]
  src/data/products.ts → src/types/index.ts
- `POST()` --calls--> `advisorSnapshot()`  [EXTRACTED]
  src/app/api/ai/advisor/route.ts → src/lib/analytics.ts
- `POST()` --calls--> `requireApiSession()`  [EXTRACTED]
  src/app/api/ai/advisor/route.ts → src/lib/auth/session.ts
- `POST()` --calls--> `loadWindow()`  [EXTRACTED]
  src/app/api/ai/advisor/route.ts → src/lib/dashboard-data.ts
- `POST()` --calls--> `requireApiSession()`  [EXTRACTED]
  src/app/api/ai/content-ideas/route.ts → src/lib/auth/session.ts

## Import Cycles
- None detected.

## Communities (21 total, 1 thin omitted)

### Community 0 - "Dashboard Insights & Export"
Cohesion: 0.06
Nodes (76): Dataset, DATASETS, GET(), STATUS_LABEL, wib(), InsightsPage(), metadata, DashboardPage() (+68 more)

### Community 1 - "Catalog UI (Filter/Header)"
Cohesion: 0.08
Nodes (49): ActiveFilterChips(), FilterChip, CatalogToolbar(), CatalogView, SortDropdown(), CategoryNav(), CheckRow(), FilterSidebar() (+41 more)

### Community 2 - "Content Plans API"
Cohesion: 0.08
Nodes (43): GET(), DELETE(), PATCH(), GET(), POST(), base, planInputSchema, planPatchSchema (+35 more)

### Community 3 - "AI Routes & Zod"
Cohesion: 0.07
Nodes (47): zod@^4.6.7, zod, POST(), bodySchema, POST(), POST(), bodySchema, mockStream() (+39 more)

### Community 4 - "Package & Tooling Config"
Cohesion: 0.05
Nodes (49): eslintConfig, dependencies, framer-motion@^14.9.0, @google/genai@^2.31.0, jszip@^3.10.2, lucide-react@^1.63.0, next@16.4.3, qrcode@^1.5.4 (+41 more)

### Community 5 - "Dashboard Layout & Next Config"
Cohesion: 0.08
Nodes (39): nextConfig, next, server-only, metadata, DashboardLayout(), metadata, login(), LoginState (+31 more)

### Community 6 - "Homepage & Shared Libs"
Cohesion: 0.13
Nodes (32): framer-motion, lucide-react, react, ProductNotFound(), Home(), revalidate, Estimator(), EstProduct (+24 more)

### Community 7 - "Unit Manager & Drawer"
Cohesion: 0.15
Nodes (21): ProductUnitsPage(), Drawer(), Editor, Field(), QC_TONE, shortDate(), UnitForm(), UnitManager() (+13 more)

### Community 8 - "DB Store Interface"
Cohesion: 0.11
Nodes (7): Store, Db, ChatMessage, InsightReport, Product, ProductUnit, TrackEvent

### Community 9 - "Content Planner UI"
Cohesion: 0.13
Nodes (16): ContentPage(), ContentPlanner(), Draft, FORMATS, monthGrid(), noopSubscribe(), pad(), PlanDialog() (+8 more)

### Community 10 - "Unit Page & Tracking"
Cohesion: 0.19
Nodes (15): generateMetadata(), load(), UnitPage(), viewport, BuyButtons(), PageTracker(), Msg, ProductChat() (+7 more)

### Community 11 - "DB Types"
Cohesion: 0.15
Nodes (11): NewChatMessage, NewEvent, ChatRole, ContentPlan, ContentPlanInput, EventType, FaqSource, InsightTopic (+3 more)

### Community 12 - "tsconfig"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "Products Data & Page"
Cohesion: 0.15
Nodes (15): metadata, ProductsPage(), CATEGORY_LABEL, PRODUCTS, rows, searchLinks(), SeedRow, SpecTuple (+7 more)

### Community 14 - "Dummy Analytics Data"
Cohesion: 0.17
Nodes (16): DUMMY_DAYS, FORMAT_FACTOR, generateSocialMetrics(), generateSocialPosts(), isoDate(), mulberry32(), PLATFORM_REACH, PLATFORM_SEED (+8 more)

### Community 15 - "Supabase Adapter"
Cohesion: 0.16
Nodes (4): num(), Row, toProduct(), toUnit()

### Community 16 - "Local JSON Store"
Cohesion: 0.25
Nodes (7): DATA_FILE, emptyStore(), load(), mtimeOf(), persist(), seedContentPlans(), writeChain

### Community 17 - "Seed Script"
Cohesion: 0.22
Nodes (5): j(), now, out, q(), target

### Community 18 - "Root Layout & Fonts"
Cohesion: 0.25
Nodes (5): fraunces, inter, metadata, spaceGrotesk, viewport

### Community 19 - "FAQ Data"
Cohesion: 0.47
Nodes (5): generatedFaqs(), MANUAL_FAQS, PRODUCT_FAQS, QA, specValue()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Dashboard Layout & Next Config` to `Dashboard Insights & Export`, `Catalog UI (Filter/Header)`, `Content Plans API`, `Package & Tooling Config`, `Homepage & Shared Libs`, `Unit Manager & Drawer`, `Unit Page & Tracking`, `Products Data & Page`, `Root Layout & Fonts`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Should `Dashboard Insights & Export` be split into smaller, more focused modules?**
  _Cohesion score 0.059006211180124224 - nodes in this community are weakly interconnected._
- **Why does `getDb()` connect `Content Plans API` to `Dashboard Insights & Export`, `AI Routes & Zod`, `Dashboard Layout & Next Config`, `Homepage & Shared Libs`, `Unit Manager & Drawer`, `Content Planner UI`, `Unit Page & Tracking`, `Products Data & Page`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `Catalog UI (Filter/Header)` be split into smaller, more focused modules?**
  _Cohesion score 0.07629288274449565 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Homepage & Shared Libs` to `Dashboard Insights & Export`, `Catalog UI (Filter/Header)`, `Content Plans API`, `Package & Tooling Config`, `Dashboard Layout & Next Config`, `Unit Manager & Drawer`, `Content Planner UI`, `Unit Page & Tracking`, `Products Data & Page`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `Content Plans API` be split into smaller, more focused modules?**
  _Cohesion score 0.07909604519774012 - nodes in this community are weakly interconnected._
- **Should `AI Routes & Zod` be split into smaller, more focused modules?**
  _Cohesion score 0.07247223845704266 - nodes in this community are weakly interconnected._