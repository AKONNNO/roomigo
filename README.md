# Roomigo

Web-based student hostel finder and accommodation management system for KNUST (BIT 293 capstone).
Stack: React 18, Vite, React Router, plain CSS. Hostel data is sample data pending verification.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Structure
```
src/
  main.jsx            entry, HashRouter + AppProvider
  App.jsx             routes + role-protected routes
  context/            AppContext: user, hostels, enquiries (localStorage for now)
  data/hostels.js     sample hostels + amenity list
  components/         Navbar, HostelCard
  pages/              Home, Listings, HostelDetail, Login, Dashboard, Admin
  styles/index.css    design tokens (colours) + layout
```

## Team workflow (Git)
- `main`: always working, deployed. Never commit straight to it.
- Branch per task: `feature/<short-name>` (e.g. `feature/gallery`, `fix/filter-bug`).
- Open a Pull Request; at least one teammate reviews (QA Engineer checks first).
- Small commits with clear messages: `Add price filter to Listings`.
- Pull `main` before starting new work.

## Suggested ownership (matches the proposal roles)
- Project Manager: GitHub Project board, weekly updates, docs, PR merges
- Front-End Developer: pages and components in `src/`
- UI/UX Designer: wireframes, `styles/index.css` tokens, layout feedback
- QA Engineer: testing on mobile/tablet/desktop, bug log (GitHub Issues)
- Team Members: pick issues from the board

## Next milestones
1. Design Document (due 29 Nov 2026): wireframes, colours, typography
2. Real authentication and a shared backend (replace localStorage in AppContext)
3. Real hostel photos and verified data
4. Testing, peer review, bug log
5. Final presentation (13 Jan 2027)
