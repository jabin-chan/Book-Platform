# Brewed Pages - Book Discovery & Reading Platform

A full-stack web app to discover books, organise a personal reading shelf, and discuss books through reviews and threaded comments.

## Features
- Sign up / log in (JWT, passwords hashed with bcryptjs)
- Explore books from our community library and Google Books
- Personal shelf: Want to Read, Currently Reading, Finished
- Reviews, 5-star ratings, nested comments and replies
- Profile page and password change

## Tech stack
React, Tailwind CSS, Node.js + Express, PostgreSQL, Google Books API

## Design patterns
| Pattern | Category | File |
|---|---|---|
| Adapter | Structural | `backend/services/googleBookAdapter.js` |
| Factory | Creational | `backend/services/bookFactory.js` |
| Strategy | Behavioral | `backend/services/bookSearch.js` |

## Getting started
1. Create a PostgreSQL database and run the SQL schema.
2. In `backend/`, create `.env` with `<DATABASE settings>`, `JWT_SECRET` and `GOOGLE_BOOKS_KEY`.
3. `cd backend && npm install && npm run dev`
4. `cd frontend && npm install && npm start` (use `<your frontend start command>`)

## Running tests
Automated Tests use Jest. The database and Google Books API are mocked.

## Git workflow
- Branches: `feature/...`, `fix/...`, `docs/...`, `ci/...`
- Commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`
- Every change goes through a pull request; CI runs the tests.

## Known limitations
No admin dashboard, no recommendations, no spoiler protection, not deployed.