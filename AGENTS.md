## Project overview

This repository is a markdown-driven knowledge platform. It consists of a static frontend (Astro), a backend API (.NET 10), and a build pipeline that converts a Logseq markdown graph into a structured website.

The system is designed to be extended over time (user accounts, progress tracking, AI validation, dynamic content), but must remain simple and static in its core architecture.

---

### Core principles

1. Maintainability first

Code must be written to minimize future rework cost. Prefer solutions that reduce coupling, avoid hidden complexity, and make future changes predictable. Optimization for elegance or cleverness should be found to be subordinate to, and not at odds with, long-term maintainability and clarity.

1. Clarity over density

Code should be self-documenting. Naming, structure, and decomposition should make intent obvious without requiring external explanation. Comments are allowed only when they add essential context that cannot be expressed in code (e.g. domain constraints, non-obvious design decisions, external system limitations).

1. Specification-first design

Before implementing features, define clear contracts, interfaces, and data models. Prefer designing boundaries first (inputs, outputs, responsibilities) before implementation details. Changes should flow through interfaces, not ad-hoc coupling.

1. Pragmatic dependency management

Do not reinvent functionality that is already well-solved, widely adopted, and stable (e.g. authentication libraries, markdown parsing, build tooling). However, avoid unnecessary or overly complex dependencies for simple tasks. Prefer small, well-maintained, widely used libraries over large frameworks unless justified.

1. Static system design

The system must remain static in Stage 1:

- Markdown is the single source of truth
- Builds must be reproducible
- No runtime content generation in the frontend
- No implicit behavior not defined in source files

---

### Architecture constraints

Frontend (Astro):

- Responsible only for rendering static content
- No business logic
- No user-specific state in early stages

Backend (.NET 10):

- Responsible for user management and state persistence only
- Must not define or control content structure
- Must remain decoupled from markdown pipeline

Content system:

- Logseq markdown is the canonical source of truth
- Content is parsed into a graph at build time
- Output is static pages and navigation structures

---

### Code style expectations

- Clear consistent naming: PascalCase for functions and classes, camelCase for variables, ALL_CAPS for constants
- Small, composable modules
- Explicit data flow
- Avoid hidden side effects
- Prefer functional boundaries where appropriate
- Keep modules loosely coupled and easy to replace

---

### Evolution model

The system is expected to evolve in stages:

Stage 1:

- static markdown-driven site
- no backend dependency

Stage 2:

- backend adds user accounts and progress tracking

Stage 3:

- AI-based validation and feedback

Stage 4:

- adaptive learning and personalization

All implementations must respect current stage constraints and avoid introducing future-stage complexity prematurely.

---

### Non-goals (Stage 1)

- No AI integration
- No adaptive content selection
- No dynamic user-specific rendering
- No complex backend logic
- No coupling between content and user systems

---

### Summary principle

Prefer systems that are easy to reason about, easy to modify, and resilient to change. Complexity must be justified by clear necessity, not assumed future use cases.
