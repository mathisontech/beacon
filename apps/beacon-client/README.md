# beacon-client

The user-facing Beacon app. Built off the live test account.

## Run

```
npm install         # from monorepo root
npm run dev:client  # serves on http://localhost:3100
```

## Structure

- `src/shell/` — chrome: top bar, tab bar, start button, notifications bell, icons
- `src/tabs/` — one file per tab (map, feed, help, community) + shared placeholder
- `src/app/` — Next.js app router entry

Every file owns one job. Rename-friendly.
