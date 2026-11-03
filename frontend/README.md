# CEMS front end (React + Tailwind, mock data)

    npm install
    npm run dev

Open the URL Vite prints. Use the burgundy sidebar to switch between the five roles. State is shared across roles
and held in memory (a refresh resets it).

## Suggested walkthrough
1. Student: register for CodeSprint, then try Robotics Workshop (same time slot) to see clash detection and swap.
   Cancel the swap, join the Robotics waitlist (#4) and use "Demo: release a seat" in My Tickets to advance the queue.
2. Organizer: Create Event wizard (venue day view blocks booked slots), then Budget Proposals and Roster (check-in, CSV).
3. Faculty Coordinator: approve or reject the new proposal (rejection needs a reason), then publish a poster.
4. System Admin: change a user's role, approve or decline the venue request.
5. Sponsor: pick a tier and event, upload to the media kit, check ROI.

## Layout
- src/store.jsx      shared state and all actions (swap for API calls later)
- src/data/mock.js   events, venues, users, tiers, sponsorships
- src/components/ui.jsx   icons and UI kit
- src/views/*.jsx    one file per role
- tailwind.config.js palette: #bedeff, #ff2a7f, #ffa500, #930031, #fff
