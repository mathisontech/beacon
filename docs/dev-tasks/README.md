# Community Module Dev Tasks

34 individual task specifications for the Community module development.

## Task Files

All task files follow the naming convention: `C-XX-[function-name].md`

Each file contains:
- Priority level (P0, P1, P2)
- Dependencies (which tasks must complete first)
- Estimated complexity (low, medium, high)
- Clear "What to build" description
- File paths to create/modify (relative to `/beacon/apps/beacon-dev/src/`)
- Input/output specifications
- Required UI components
- Acceptance criteria
- Sequential run requirements

## Usage

1. Copy one task file at a time into a Claude Code window
2. Build independently (most can run in parallel)
3. Check "Run this AFTER" and "Can run IN PARALLEL with" for scheduling
4. Update the dev monitor page status as tasks complete

## Categories

- **Profile & Account** (C-01 to C-10): User registration, profile data, verification
- **Contacts** (C-11 to C-16): Emergency contacts, discovery, invites
- **Groups** (C-17 to C-26): Group CRUD, discovery, membership, settings
- **Chat & Messaging** (C-27 to C-34): Encrypted messaging, templates, status

## Critical Path

Primary dependency chain: C-01 → C-02 → C-17 → C-21 → C-22 → C-24 → C-27 → C-28

This path should be prioritized for the fastest parallel-capable development.
