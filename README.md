# Samolni — Adaptive Mental Math Trainer (Beta)

### [samolni.com](https://samolni.com)

Samolni is a web app for training mental arithmetic with adaptive difficulty. Each training session stays at the right level so you improve consistently without overtraining.

## Features

- **Four domains** — Addition, Subtraction, Multiplication, Division
- **Adaptive levels** — automatic promotion and demotion based on recent performance
- **Pattern-based questions** — parameterised patterns (digit count, carry/borrow requirements, etc.) generate varied exercises at each level
- **Timed attempts** — every question has a per-pattern cutoff; outcomes are `CORRECT`, `WRONG`, `TIMEOUT`, or `SKIPPED`
- **Guest mode** — start practicing immediately without an account; progress transfers on sign-up
- **Dashboard** — per-domain progress overview

## Tech stack

| Layer | Technology |
|---|---|
| Hosting | Proxmox · Docker · Caddy reverse proxy (alongside [kohlertej.hu](https://kohlertej.hu)) |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| ORM | Prisma 7 |
| Database | PostgreSQL 18 |
| Auth | better-auth (email/password, anonymous, username plugins) |



## Project structure

```
src/
  app/              # Next.js App Router pages and API routes
  components/       # Shared UI components
  features/
    training/       # Question generation, level selection, progression rules
  lib/              # Auth, Prisma client, session helpers
prisma/
  schema.prisma     # Database schema
docs/               # Architecture and algorithm write-ups (LaTeX)
```

