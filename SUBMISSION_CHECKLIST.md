# Submission Checklist

Use this before sending the final assignment form.

## Local

- [ ] `npm install` completes.
- [ ] `.env` contains `NUXT_PUBLIC_SUPABASE_URL`.
- [ ] `.env` contains `NUXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] `npm run build` completes.
- [ ] `npm run dev` starts the app.

## Supabase

- [ ] `supabase/schema.sql` has been run in the Supabase SQL Editor.
- [ ] Email/password auth is enabled.
- [ ] Local URL is added to Auth redirect URLs.
- [ ] Deployed URL is added to Auth redirect URLs.
- [ ] `profiles` has no email column.
- [ ] `games` has RLS enabled.

## Product Flow

- [ ] Register a new account.
- [ ] Log in.
- [ ] Edit profile nickname and city.
- [ ] Play Classic.
- [ ] Switch Classic difficulty to Easy and confirm the board restarts with 144 tiles.
- [ ] Switch Classic difficulty to Medium and confirm it works as the default.
- [ ] Switch Classic difficulty to Hard and confirm the board has at least one legal move.
- [ ] Save Classic result.
- [ ] View Classic result on leaderboards.
- [ ] Play Daily Challenge.
- [ ] Save Daily result.
- [ ] Confirm Daily result on Daily leaderboard.
- [ ] Confirm Almaty leaderboard works when profile city is Almaty.
- [ ] View profile stats after saved games.
- [ ] Use AI Coach Analyze board.
- [ ] Use AI Coach Show suggested pair.
- [ ] Open Pro page.
- [ ] Click Upgrade to Pro and see mocked Stripe message.

## Responsive QA

- [ ] Test mobile width around 390px.
- [ ] Test tablet width around 768px.
- [ ] Test desktop width around 1280px.
- [ ] Board is playable with touch/click.
- [ ] Tables scroll horizontally without breaking layout.
- [ ] Header navigation remains usable.

## Final Submission

- [ ] Live project URL is ready.
- [ ] GitHub repository URL is ready.
- [ ] README explains product value and Great level alignment.
- [ ] Known limitations are documented.
