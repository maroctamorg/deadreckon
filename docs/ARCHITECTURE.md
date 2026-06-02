## System overview

The system consists of three layers: a markdown-based content graph, a static frontend generated from that graph, and a backend service responsible for user state and future AI features. Content is deterministic and build-time only. User interaction and persistence are runtime concerns handled separately.

## Core architecture

Logseq Markdown (source of truth)
    ↓
Build pipeline (parser + graph resolver) - Typescript
    ↓
Astro static frontend (rendered site)
    ↓
Browser (content consumption layer)
    ↓ (later stages)
.NET 10 Backend API
    ↓
PostgreSQL database
    ↓
AI validation layer (future service)

### Content pipeline

Input:

+ Logseq markdown files
+ The first top-level bullet of each source page declares the page type:
  `[[home]]`, `[[topic]]`, or `[[problem]]`
+ Pages that cannot be parsed log warnings and are skipped rather than failing the
  whole content build

Processing steps:

1. Parse markdown files
2. Read the page type tag and extract home pages, topics, problems, and links
3. Build directed content graph
4. Resolve relationships (topic ↔ problem ↔ references)
5. Generate structured page data for frontend
6. Emit static site output

Key property:

+ content graph is derived at build time, not runtime

### Frontend (Astro)

Role:

+ Render static site from generated content graph
+ Provide navigation over topics, problems, and essays
+ Handle UI interactions (collapsible sections, layout behavior)
+ Render precomputed structure from build pipeline

Constraints:

+ No runtime dependency on backend in Stage 1
+ No user-specific rendering initially
+ No business logic or state management

Output:

+ static pages generated from markdown graph
+ deterministic rendering only

### Backend (.NET 10)

Responsibilities (Stage 2+):

+ user authentication (username + salted password hashing)
+ session or token management
+ user progress tracking over problems/topics
+ submission storage for problem solutions

Constraints:

+ backend does not control content structure
+ backend does not generate pages
+ backend only manages user state

### Data storage

Primary database: PostgreSQL

Entities:

+ users
+ problem submissions
+ user progress states

### AI layer (future)

Responsibilities:

+ evaluate user-submitted solutions
+ provide feedback across multiple valid solution strategies
+ assist in hint generation and conceptual explanation
+ operate on semantic understanding, not template matching
+ select and/or generate dynamic content (problem selection, topic recommendations, etc..)

Constraint:

+ AI does not define correctness alone; it provides evaluative support
