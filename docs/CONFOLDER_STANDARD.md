# CONFolder Standard - Beacon Module Considerations Framework

## Purpose

Every module in Beacon's hierarchy gets a CONFolder (Considerations Folder). A CONFolder is a structured dictionary of evaluation dimensions attached to a module at any depth - from top-level module groups down to individual functions. CONFolders are stored as structured data (JSON dictionaries) for model training, and are browsable in beacon-dev by clicking "CONFolder" on any module in the left sidebar hierarchy.

## When a field is not relevant

Use `"NR"` (Not Relevant). Every CONFolder has every field. NR signals intentional evaluation, not omission.

## CONFolder Schema

```
{
  "module_id": string,           // unique path in hierarchy e.g. "community.messages.encryption"
  "module_name": string,
  "last_updated": ISO-8601,
  "updated_by": string,          // agent or human identifier
  "bookmark": {
    "status": "complete" | "in-progress" | "blocked" | "placeholder",
    "return_note": string | null, // reminder for what to finish
    "priority": 1-5
  },

  "M": {  // MODULE IDENTITY
    "M1_beacon_versions": string[],        // ["MVP", "Beta", "V1"] etc
    "M2_module_type": string,              // "function" | "function-folder" | "component" | "service" | "page" | "library" | "pipeline"
    "M3_hierarchy_path": string,           // "Product Manager > Community > Messages > Encryption > encryptMessage()"
    "M4_parent": string | null,
    "M5_children": string[],
    "M6_owner_history": [                  // every agent/human who has had control
      { "who": string, "role": string, "from": ISO-8601, "to": ISO-8601 | "current" }
    ]
  },

  "IO": {  // INPUTS & OUTPUTS
    "IO1_direct_inputs": [
      {
        "name": string,
        "source": string,
        "format": string,            // "JSON" | "binary" | "protobuf" | "string" etc
        "schema_ref": string | null, // path to schema file or inline
        "frequency": string,         // "real-time" | "on-demand" | "batch-hourly" etc
        "dependencies": string[]     // module_ids this input depends on
      }
    ],
    "IO2_direct_outputs": [
      {
        "name": string,
        "consumers": string[],       // module_ids that consume this
        "format": string,
        "schema_ref": string | null,
        "frequency": string,
        "dependencies": string[]
      }
    ],
    "IO3_transformations": [
      {
        "operation": string,         // what happens to input to produce output
        "algorithm": string | null,
        "latency_sla": string | null,
        "accuracy_target": string | null
      }
    ]
  },

  "DW": {  // DATA WEBS
    "DW1_upstream_pipeline": [       // full step-by-step before this module
      {
        "step": number,
        "module_id": string,
        "description": string,
        "data_format": string,
        "dependencies": string[]
      }
    ],
    "DW2_downstream_pipeline": [     // full step-by-step after this module
      {
        "step": number,
        "module_id": string,
        "description": string,
        "data_format": string,
        "dependencies": string[]
      }
    ]
  },

  "P": {  // PERFORMANCE
    "P1_bottleneck_analysis": string,        // what could slow down
    "P2_defensibility": string,              // why this approach vs alternatives
    "P3_confidence_level": string | "NR",    // for prediction modules
    "P4_failure_modes": string[],            // what can go wrong in practice
    "P5_backup_plan": string,
    "P6_backup_plan_test": string,           // how we test the backup plan
    "P7_testing_strategy": string,           // unit, integration, simulation, load
    "P8_benchmarks": string | "NR"           // target numbers
  },

  "CH": {  // CHANGE HISTORY
    "CH1_change_log": [
      { "date": ISO-8601, "who": string, "description": string, "version": string }
    ],
    "CH2_current_version": string
  },

  "L": {  // LEGAL
    "L1_legal_considerations": string | "NR",
    "L2_regulatory_frameworks": string[] | "NR",  // HIPAA, COPPA, CCPA, FEMA etc
    "L3_consent_requirements": string | "NR",
    "L4_liability_notes": string | "NR"
  },

  "F": {  // FINANCIAL
    "F1_cost_considerations": string | "NR",       // compute, storage, API costs
    "F2_accounting_considerations": string | "NR",  // how costs are tracked/allocated
    "F3_revenue_impact": string | "NR"
  },

  "S": {  // SECURITY
    "S1_cybersecurity": string | "NR",
    "S2_data_privacy": string | "NR",
    "S3_encryption_requirements": string | "NR",
    "S4_access_control": string | "NR",
    "S5_audit_requirements": string | "NR"
  },

  "X": {  // EXTENSIONS (anything else)
    "X1_notes": string | "NR",
    "X2_open_questions": string[] | "NR",
    "X3_related_research": string | "NR"
  }
}
```

## Rules

1. Every module at every depth gets a CONFolder. A single function gets one. A folder of functions gets one. A page gets one.
2. CONFolders are stored as `.confolder.json` files alongside the module they describe, AND indexed in a central dictionary at `/beacon/docs/confolders/index.json` for model training.
3. In beacon-dev, every module row in the left sidebar hierarchy shows a clickable "CONFolder" badge. Clicking it opens the CONFolder viewer/editor for that module.
4. The `bookmark` field tracks incomplete CONFolders. The CONFolder builder must surface all bookmarked items with `status != "complete"` in a review queue.
5. When a CONFolder builder agent processes a module, it must set `bookmark.return_note` for anything it cannot resolve and move on. The review queue sorts by priority.
6. NR is always valid. It means "evaluated and determined not relevant," not "skipped."
7. `M6_owner_history` tracks every agent and human who has ever modified this module or its CONFolder.
8. Data webs (DW1, DW2) must trace the FULL pipeline, not just immediate neighbors. If data flows through 8 modules to reach this one, all 8 steps are listed.

## CONFolder Builder Workflow

1. **Enumerate** - Walk the module hierarchy, create a skeleton CONFolder for every node
2. **Populate** - Fill fields using architecture docs, code analysis, and planning notes
3. **Bookmark** - Mark incomplete fields with return_notes and priority
4. **Review** - Surface the review queue, resolve bookmarks
5. **Validate** - Cross-check upstream/downstream webs for consistency across connected modules
6. **Export** - Write all CONFolders to the central dictionary for training

## Integration with beacon-dev

The CONFolder viewer in beacon-dev renders the JSON as a structured card. Each section (M, IO, DW, P, CH, L, F, S, X) is a collapsible panel. The bookmark status shows as a colored indicator:

- Green: complete
- Yellow: in-progress
- Red: blocked
- Gray: placeholder

The "CONFolder" label appears next to every module name in the sidebar. Clicking it navigates to `/admin/dashboard/product/[tab]/project/confolders/[module_id]`.
