import type { ScopeId } from "./scope-id";

// Scope labels shown in the Start Button. Checkpoint 3 replaces the static
// kids/mom/etc. with the user's actual configured locations + people.
export const SCOPE_LABELS: Record<ScopeId, string> = {
  home: "Home",
  work: "Work",
  kids: "Kids",
  mom: "Mom",
  world: "World",
};

export const SCOPE_ORDER: ScopeId[] = ["home", "work", "kids", "mom", "world"];
