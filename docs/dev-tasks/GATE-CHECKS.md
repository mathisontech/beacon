# Gate Checks - Integration Verification Between Waves

Run these BETWEEN waves. Do not start the next wave until the gate passes.
Each gate validates that the contract between completed tasks holds.

---

## GATE 1: Foundation (after Wave 1 - C-01)

Run after C-01 is marked complete.

```bash
# 1. Build check
npm run build 2>&1 | tail -5
# Expected: "Compiled successfully" or exit 0

# 2. Schema check
npx prisma db push --dry-run
# Expected: no errors, users table exists

# 3. Auth endpoints
curl -s -o /dev/null -w "%{http_code}" -X POST localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"gate1@test.com","password":"TestPass123!"}'
# Expected: 201

curl -s -o /dev/null -w "%{http_code}" -X POST localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"gate1@test.com","password":"TestPass123!"}'
# Expected: 409 (duplicate)

# 4. Type exports
node -e "const { User, AuthSession } = require('./src/lib/auth'); console.log('types ok')"
# Expected: "types ok" (no throw)
```

**If any fail:** Do NOT proceed to Wave 2. Fix C-01 first.

---

## GATE 2: Profile + Groups Core (after Wave 2 - C-02, C-03, C-11, C-17, C-30)

Run after all Wave 2 tasks complete.

```bash
# 1. Build check
npm run build

# 2. Full flow test
node -e "
  // Pseudo-test: create user, update profile, create group, set status
  const res1 = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({email:'gate2@test.com',password:'Pass123!'}) });
  const user = await res1.json();
  const res2 = await fetch('/api/users/' + user.id + '/profile', { method: 'PUT', body: JSON.stringify({name:'Gate Test'}) });
  const res3 = await fetch('/api/groups', { method: 'POST', body: JSON.stringify({type:'neighborhood',name:'Gate Test Group',geometry:{}}) });
  const group = await res3.json();
  const res4 = await fetch('/api/users/' + user.id + '/status', { method: 'POST', body: JSON.stringify({status:'safe'}) });
  console.log('Statuses:', res1.status, res2.status, res3.status, res4.status);
  // Expected: 201, 200, 201, 200
"

# 3. Type imports
node -e "
  require('./src/lib/users');    // UserProfile
  require('./src/lib/auth');     // User, AuthSession
  require('./src/lib/groups');   // Group, GroupType
  console.log('all types ok');
"

# 4. Foreign key integrity
npx prisma db execute --stdin <<< "
  SELECT COUNT(*) FROM group_members gm
  LEFT JOIN users u ON gm.user_id = u.id
  WHERE u.id IS NULL;
"
# Expected: 0 orphans

# 5. Emergency contacts
node -e "
  const res = await fetch('/api/users/1/emergency-contacts');
  const data = await res.json();
  console.log('contacts:', Array.isArray(data));
  // Expected: true
"
```

**If any fail:** Fix before Wave 3. Check which task broke the contract.

---

## GATE 3: Membership + Roles (after Wave 3 critical - C-21, C-22)

```bash
# 1. Build check
npm run build

# 2. Membership flow
node -e "
  // Create group, invite user, accept, verify role
  // invite → pending → approve → member
  const join = await fetch('/api/groups/1/join', { method: 'POST' });
  console.log('join status:', join.status); // 201
  const approve = await fetch('/api/groups/1/members/2/approve', { method: 'PUT' });
  console.log('approve status:', approve.status); // 200
"

# 3. Role hierarchy
node -e "
  const { checkPermission } = require('./src/lib/groups/permissions');
  // founder can remove member
  console.log(checkPermission('founder', 'remove_member')); // true
  // member cannot remove member
  console.log(checkPermission('member', 'remove_member')); // false
  // admin cannot transfer founder
  console.log(checkPermission('admin', 'transfer_founder')); // false
  // mod cannot set policies
  console.log(checkPermission('moderator', 'set_policies')); // false
"

# 4. Permission gate
node -e "
  // Non-admin tries to update settings — should be rejected
  const res = await fetch('/api/groups/1/settings', {
    method: 'PUT',
    headers: { 'X-User-Role': 'member' },
    body: JSON.stringify({ privacy: 'open' })
  });
  console.log('blocked:', res.status); // 403
"
```

---

## GATE 4: Channels + Messaging (after Wave 5 critical - C-24, C-27)

```bash
# 1. Build check
npm run build

# 2. Full messaging flow
node -e "
  // Create channel in group, post message, retrieve
  const ch = await fetch('/api/groups/1/channels', { method: 'POST', body: JSON.stringify({name:'general'}) });
  const channel = await ch.json();
  const msg = await fetch('/api/messages', { method: 'POST', body: JSON.stringify({groupId:1,channelId:channel.id,text:'hello'}) });
  console.log('msg created:', msg.status); // 201
  const msgs = await fetch('/api/groups/1/channels/' + channel.id + '/messages');
  const data = await msgs.json();
  console.log('msg count:', data.length); // >= 1
  console.log('msg text:', data[0].text); // 'hello' (decrypted)
"

# 3. Type exports
node -e "
  require('./src/lib/messages'); // Message, EncryptedPayload
  require('./src/lib/groups/channels'); // Channel
  console.log('types ok');
"

# 4. Permission check — non-member cannot post
node -e "
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'X-User-Id': '999' }, // not a member
    body: JSON.stringify({groupId:1,channelId:1,text:'spam'})
  });
  console.log('blocked:', res.status); // 403
"
```

---

## GATE 5: Full Integration (after Wave 6 - all tasks)

```bash
# 1. Build check
npm run build

# 2. End-to-end user journey
node -e "
  // register → profile → household → vehicle → join group → send message → view thread
  // This is the full happy path
  const reg = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({email:'e2e@test.com',password:'E2EPass123!'}) });
  const user = await reg.json();
  await fetch('/api/users/' + user.id + '/profile', { method: 'PUT', body: JSON.stringify({name:'E2E User'}) });
  await fetch('/api/users/' + user.id + '/household', { method: 'PUT', body: JSON.stringify({children:1,pets:1}) });
  const grp = await fetch('/api/groups', { method: 'POST', body: JSON.stringify({type:'neighborhood',name:'E2E Hood'}) });
  const group = await grp.json();
  const ch = await fetch('/api/groups/' + group.id + '/channels', { method: 'POST', body: JSON.stringify({name:'general'}) });
  const channel = await ch.json();
  await fetch('/api/messages', { method: 'POST', body: JSON.stringify({groupId:group.id,channelId:channel.id,text:'e2e works'}) });
  const msgs = await fetch('/api/groups/' + group.id + '/channels/' + channel.id + '/messages');
  const data = await msgs.json();
  console.log('E2E PASS:', data.length > 0 && data[0].text === 'e2e works');
"

# 3. Contact ordering persists
node -e "
  // Create 3 contacts, reorder, verify
  await fetch('/api/users/1/emergency-contacts', { method: 'POST', body: JSON.stringify({name:'A',priority:1}) });
  await fetch('/api/users/1/emergency-contacts', { method: 'POST', body: JSON.stringify({name:'B',priority:2}) });
  await fetch('/api/users/1/emergency-contacts', { method: 'POST', body: JSON.stringify({name:'C',priority:3}) });
  // reorder: C=1, A=2, B=3
  await fetch('/api/users/1/emergency-contacts/reorder', { method: 'PUT', body: JSON.stringify([{id:3,priority:1},{id:1,priority:2},{id:2,priority:3}]) });
  const res = await fetch('/api/users/1/emergency-contacts');
  const data = await res.json();
  console.log('Order correct:', data[0].name === 'C' && data[1].name === 'A');
"

# 4. No console errors — run dev server and check
npm run dev &
sleep 5
curl -s localhost:3000/admin/dashboard/product/community > /dev/null
echo "Page loads: $?"
kill %1
```

---

## How to Use

1. Complete all tasks in a wave
2. Run the corresponding gate check
3. ALL tests must pass before starting next wave
4. If a test fails, identify which task's contract is broken
5. Fix that task, re-run its checkpoint tests, then re-run the gate
6. Update the dev monitor status as you go
