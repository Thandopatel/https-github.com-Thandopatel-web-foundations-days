# Web Foundations — Days 1–7 + Project 2

Coursework for the PLP Academy Web Foundations module.

## Folders

| Folder | What's inside |
|--------|---------------|
| `day1/` | Day 1 assignment |
| `day2/` | Day 4 assignment |
| `day3/` | Day 3: countByCategory edge case |
| `day4/` | Day 4 assignment |
| `day5/` | Day 5 assignment |
| `day6/` | Day 6 assignment: SQL schema and design notes |
| `day7/` | Day 7 assignment: SnapShare scaling plan (`photo-app-scaling.md`) |
| `project2/` | Project 2: SnapShare — a photo-sharing app |

## Project 2 — SnapShare

A photo-sharing app where users upload photos and scroll a feed of
photos from people they follow.

**Live demo:** https://thandopatel.github.io/https-github.com-Thandopatel-web-foundations-days/project2/

**Source:** [`project2/`](project2/)

**Features:**

- Sign up / log in / log out (stored in `localStorage`)
- Upload a photo (max 2 MB)
- Feed renders uploads newest-first
- Delete your own photos (other users' photos are protected)
- Data persists between sessions

**Files:**

- `project2/index.html` — page structure
- `project2/style.css`  — styling
- `project2/script.js`  — auth, upload, feed, delete logic
- `project2/README.md`  — full project description

## Day 7 — Scaling plan

See [`day7/photo-app-scaling.md`](day7/photo-app-scaling.md) for a
scaling plan for a SnapShare-style photo app at 1 million users:
assumptions, load estimates, architecture diagram, component
explanations, request flow and trade-offs.

## Related repo

The capstone project — a QuickNotes system design with an API client,
API design, data model and architecture docs — lives in a separate repo:
[`quicknotes-system-design`](https://github.com/Thandopatel/quicknotes-system-design).