# C-27: Message Data Model & Encryption
Priority: P0
Depends on: C-17, C-24
Estimated complexity: high

## What to build
Encrypted group messaging with end-to-end encryption. Message model with sender, receiver, timestamp, encrypted_blob. Group public key for encryption. Implement encryption/decryption, key management, and message storage.

## Files to create/modify
- lib/messages/encryptMessage.ts
- lib/messages/decryptMessage.ts
- lib/groups/generateGroupKey.ts
- lib/messages/storeMessage.ts
- app/api/groups/[id]/messages/route.ts
- database migration (messages table with encryption)

## Inputs
- Message text
- Group ID (for public key)
- Sender ID, channel ID

## Outputs
- messages table: group_id, channel_id, author_id, timestamp, encrypted_blob, template_key
- Message only readable by group members
- Audit log of message access

## UI Components
- MessageEncryption (transparent to user)
- EncryptionIndicator (lock icon for encrypted)

## Acceptance criteria
- Messages encrypted with AES-256 or similar
- Group public key stored and managed
- Only group members can decrypt
- Encryption/decryption transparent to UI
- Performance: encrypt/decrypt < 100ms
- Keys rotated monthly or on member leave
- No plaintext storage

## Run this AFTER
C-17, C-24 complete

## Can run IN PARALLEL with
None - required by C-28

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/messages with group+channel creates encrypted record
3. GET /api/groups/[id]/channels/[cid]/messages returns decrypted messages
4. Exported `Message`, `EncryptedPayload` types importable
