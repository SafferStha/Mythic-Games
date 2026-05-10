# TODO - Wishlist + Game Details

## Step 1: Inspect current frontend structure
- [x] Identify existing Wishlist/Browse pages and routing

## Step 2: Implement Game Details page
- [x] Create `frontend/src/pages/GameDetails.jsx`
- [x] Create styling `frontend/src/pages/GameDetails.css`
- [x] Add route `/game/:id` in `frontend/src/App.jsx`

## Step 3: Make Wishlist functional
- [x] Update `frontend/src/pages/Wishlist.jsx` to show wishlist items
- [x] Implement add/remove logic using client-side state + `localStorage`
- [x] Create `frontend/src/pages/Wishlist.css`

## Step 4: Wire Browse to Game Details
- [x] Update `frontend/src/pages/Browse.jsx` to render a small set of demo games
- [x] Ensure each demo game links to `/game/:id`

## Step 5: Connect wishlist actions from Game Details
- [x] Add “Add to Wishlist” button on Game Details

## Step 6: Sanity check
- [ ] Run frontend dev server and verify:
  - [ ] `/wishlist` works
  - [ ] `/game/:id` works
  - [ ] localStorage persists


