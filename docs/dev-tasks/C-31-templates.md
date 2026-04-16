# C-31: Pre-Composed Templates
Priority: P1
Depends on: C-27
Estimated complexity: medium

## What to build
Pre-written message templates for common emergencies. Template selector in message composer. Uses 2-byte codes for mesh efficiency (e.g. "FIR" = "Fire alarm in my area, evacuating now"). Admin can create group templates.

## Files to create/modify
- lib/messages/loadTemplates.ts
- app/api/groups/[id]/templates/route.ts
- database migration (message_templates table)
- Update C-28 message UI to support templates

## Inputs
- Hazard type (fire, flood, earthquake, etc)
- Template key (system or custom)

## Outputs
- message_templates table: hazard_type, key, text, compressed_code
- Message sent with template_key and optional custom text
- 2-byte codes for mesh transmission

## UI Components
- TemplateSelector (dropdown or grid)
- TemplateText (show full message before send)
- CustomizeButton (edit template text before send)
- CreateTemplateButton (admin only)

## Acceptance criteria
- 20+ system templates for common scenarios
- Compressed codes < 100 bytes per template
- Groups can add custom templates
- Templates searchable by hazard type
- Can customize before send
- Compression saves 80%+ vs plaintext
- Works in mesh mode (see C-32)

## Run this AFTER
C-27 complete

## Can run IN PARALLEL with
C-28, C-29, C-30, C-34

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. TemplateSelector renders pre-composed options
3. Selecting template populates message field
4. Templates stored with compressed codes
