# Knowledge Platform

A markdown-driven learning platform for structured study of mathematics, physics, and computer science. The system is built around a Logseq-based knowledge graph and generates a static educational website with optional backend services for user progress tracking and AI-assisted solution validation (future stages).

## Core idea

Markdown is the single source of truth.

All content (topics, problems, essays, references) is written in plain Markdown and organized as a graph. The platform transforms this graph into a structured learning experience with deterministic rendering.

The system is designed to support deep understanding through:

- topic overviews
- recursive topic decomposition
- problem-based learning
- solution reflection
- structured summaries

## Content model

Two primary entities:

Topic:

- dependencies (links to other topics)
- overview
- problems (or references)
- summary

Problem:

- topic link
- statement
- hints
- sketch
- model solution
- summary

Relationships are defined explicitly via Logseq-style links. There is no implicit hierarchy beyond what is authored in Markdown.

## System architecture

See [docs/ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical architecture and design decisions.

## Stages of development

Stage 1:

- static markdown-driven site
- no backend

Stage 2:

- backend for user management and progress tracking

Stage 3:

- AI validation integration for problem submissions

Stage 4:

- adaptive learning paths and personalized graph traversal

## Design principles

See [docs/DESIGN.md](DESIGN.md) for detailed product design and user experience considerations.

## Purpose

To create a structured, scalable system for deep mathematical and scientific learning, combining rigorous problem-solving with a graph-based knowledge representation.
