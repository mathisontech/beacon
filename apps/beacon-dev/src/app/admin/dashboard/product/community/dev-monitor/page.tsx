'use client';

import { useState } from 'react';

type Status = 'not started' | 'in progress' | 'complete' | 'blocked';
type CheckStatus = 'pending' | 'pass' | 'fail';

interface DevTask {
  id: string;
  name: string;
  status: Status;
  dependsOn: string[];
  window: string;
  priority: string;
  category: string;
  checks: string[];
  checkResults: CheckStatus[];
}

interface GateCheck {
  id: string;
  name: string;
  wave: number;
  requiredTasks: string[];
  tests: string[];
  status: 'locked' | 'ready' | 'pass' | 'fail';
}

const CATEGORIES = ['Profile & Account', 'Contacts', 'Groups', 'Chat & Messaging'];

const makeTasks = (): DevTask[] => [
  { id: 'C-01', name: 'Registration & Auth Flow', status: 'not started', dependsOn: [], window: 'C-01', priority: 'P0', category: 'Profile & Account',
    checks: ['npm run build succeeds', 'POST /api/auth/register → 201', 'Duplicate email → 409', 'Reset password → 200', 'User, AuthSession types export'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-02', name: 'Basic Info Form', status: 'not started', dependsOn: ['C-01'], window: 'C-02', priority: 'P0', category: 'Profile & Account',
    checks: ['Build succeeds', 'BasicInfoForm renders', 'PUT profile → 200', 'DB row exists', 'UserProfile type exports'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-03', name: 'Phone Number Verification', status: 'not started', dependsOn: ['C-01'], window: 'C-03', priority: 'P0', category: 'Profile & Account',
    checks: ['Build succeeds', 'POST verify-phone sends code', 'Confirm-phone → 200', 'E.164 format in DB', 'verifyPhone() exports'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-04', name: 'Household Manager', status: 'not started', dependsOn: ['C-02'], window: 'C-04', priority: 'P1', category: 'Profile & Account',
    checks: ['Build succeeds', 'HouseholdForm renders', 'PUT household saves', 'GET household returns'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-05', name: 'Vehicle Manager + Spec Lookup', status: 'not started', dependsOn: ['C-02'], window: 'C-05', priority: 'P1', category: 'Profile & Account',
    checks: ['Build succeeds', 'VehicleManager renders', 'POST creates vehicle', 'Make/model lookup works', 'GET vehicles returns array'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-06', name: 'Equipment & Skills Form', status: 'not started', dependsOn: ['C-02'], window: 'C-06', priority: 'P1', category: 'Profile & Account',
    checks: ['Build succeeds', 'POST equipment saves', 'GET returns list', 'Skills array stored'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-07', name: 'Sensor Settings Panel', status: 'not started', dependsOn: ['C-02'], window: 'C-07', priority: 'P2', category: 'Profile & Account',
    checks: ['Build succeeds', 'Panel renders toggles', 'PUT sensors updates', 'Independent per-sensor'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-08', name: 'Privacy & Location Settings', status: 'not started', dependsOn: ['C-02'], window: 'C-08', priority: 'P0', category: 'Profile & Account',
    checks: ['Build succeeds', 'Panel renders 4 modes', 'PUT persists settings', 'LocationMode type exports'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-09', name: 'ID Verification Flow', status: 'not started', dependsOn: ['C-02', 'C-03'], window: 'C-09', priority: 'P1', category: 'Profile & Account',
    checks: ['Build succeeds', 'POST upload accepts images', 'Verification record created', 'Address match returns bool'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-10', name: 'Action History Timeline', status: 'not started', dependsOn: ['C-01'], window: 'C-10', priority: 'P2', category: 'Profile & Account',
    checks: ['Build succeeds', 'Timeline renders mock', 'GET history paginated', 'Sorted desc'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-11', name: 'Emergency Contact Manager', status: 'not started', dependsOn: ['C-01'], window: 'C-11', priority: 'P0', category: 'Contacts',
    checks: ['Build succeeds', 'ContactList renders', 'POST creates contact', 'GET sorted by priority', 'EmergencyContact type exports'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-12', name: 'Contact Ordering & Priorities', status: 'not started', dependsOn: ['C-11'], window: 'C-12', priority: 'P0', category: 'Contacts',
    checks: ['Build succeeds', 'Drag reorder updates DB', 'No priority gaps'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-13', name: 'Phone Contact Import', status: 'not started', dependsOn: ['C-03'], window: 'C-13', priority: 'P1', category: 'Contacts',
    checks: ['Build succeeds', 'Importer parses contacts', 'Matches existing users by phone'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-14', name: 'Find Beacon Users', status: 'not started', dependsOn: ['C-03'], window: 'C-14', priority: 'P1', category: 'Contacts',
    checks: ['Build succeeds', 'Search by phone returns users', 'Empty result = empty array'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-15', name: 'Trusted Neighbor System', status: 'not started', dependsOn: ['C-02', 'C-09'], window: 'C-15', priority: 'P1', category: 'Contacts',
    checks: ['Build succeeds', 'POST request creates pending', 'PUT accept changes status', 'Only ID-verified allowed'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-16', name: 'Contact Invite Flow', status: 'not started', dependsOn: ['C-11'], window: 'C-16', priority: 'P1', category: 'Contacts',
    checks: ['Build succeeds', 'POST generates 12-char code', 'Expired invite → 410'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-17', name: 'Group Data Model & CRUD', status: 'not started', dependsOn: ['C-01'], window: 'C-17', priority: 'P0', category: 'Groups',
    checks: ['Build succeeds', 'POST creates group + id', 'GET returns with geometry', 'DELETE soft-deletes', 'Group/GroupType types export', 'Creator gets founder role'],
    checkResults: ['pending','pending','pending','pending','pending','pending'] },
  { id: 'C-18', name: 'Group Discovery & Suggestions', status: 'not started', dependsOn: ['C-17', 'C-02'], window: 'C-18', priority: 'P0', category: 'Groups',
    checks: ['Build succeeds', 'GET discover returns ranked', 'Sorted by 1/dist * 1/area', 'Neighborhood > city'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-19', name: 'Group Creation Flow', status: 'not started', dependsOn: ['C-17'], window: 'C-19', priority: 'P0', category: 'Groups',
    checks: ['Build succeeds', 'GroupCreator renders', 'Valid GeoJSON accepted', 'Invalid GeoJSON rejected'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-20', name: 'Invite Code System', status: 'not started', dependsOn: ['C-17'], window: 'C-20', priority: 'P0', category: 'Groups',
    checks: ['Build succeeds', 'POST generates 12-char code', '30-day expiry enforced', 'Single-use enforced'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-21', name: 'Membership State Machine', status: 'not started', dependsOn: ['C-17'], window: 'C-21', priority: 'P0', category: 'Groups',
    checks: ['Build succeeds', 'States: invited→pending→member', 'POST join creates pending', 'PUT approve → member', 'MembershipState type exports'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-22', name: 'Role & Permission Engine', status: 'not started', dependsOn: ['C-21'], window: 'C-22', priority: 'P0', category: 'Groups',
    checks: ['Build succeeds', 'Hierarchy: founder>admin>mod>member>follower', 'Admin cant remove founder', 'Mod cant change policies', 'checkPermission() exported'],
    checkResults: ['pending','pending','pending','pending','pending'] },
  { id: 'C-23', name: 'Group Settings & Policies', status: 'not started', dependsOn: ['C-22'], window: 'C-23', priority: 'P1', category: 'Groups',
    checks: ['Build succeeds', 'PUT settings updates', 'Admin+ required (perm check)'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-24', name: 'Group Channels Manager', status: 'not started', dependsOn: ['C-22'], window: 'C-24', priority: 'P1', category: 'Groups',
    checks: ['Build succeeds', 'POST creates channel', 'GET returns channel list', 'Channel type exports'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-25', name: 'Group Analytics Dashboard', status: 'not started', dependsOn: ['C-17'], window: 'C-25', priority: 'P2', category: 'Groups',
    checks: ['Build succeeds', 'GET analytics returns counts'],
    checkResults: ['pending','pending'] },
  { id: 'C-26', name: 'Evacuation Convoy Auto-Groups', status: 'not started', dependsOn: ['C-17', 'C-21'], window: 'C-26', priority: 'P2', category: 'Groups',
    checks: ['Build succeeds', 'Auto-creation from trigger', 'Time-limited status set'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-27', name: 'Message Data Model & Encryption', status: 'not started', dependsOn: ['C-17', 'C-24'], window: 'C-27', priority: 'P0', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'POST creates encrypted record', 'GET returns decrypted msgs', 'Message/EncryptedPayload types export'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-28', name: 'Group Message Thread UI', status: 'not started', dependsOn: ['C-27'], window: 'C-28', priority: 'P0', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'Thread renders messages', 'New msg appears after POST', 'Auto scroll-to-bottom'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-29', name: 'Direct Messaging', status: 'not started', dependsOn: ['C-27'], window: 'C-29', priority: 'P1', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'POST creates DM', 'GET thread returns messages'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-30', name: 'Status Update System', status: 'not started', dependsOn: ['C-01'], window: 'C-30', priority: 'P0', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'POST sets status', 'All 5 statuses accepted', 'UserStatus type exports'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-31', name: 'Pre-Composed Templates', status: 'not started', dependsOn: ['C-27'], window: 'C-31', priority: 'P1', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'Selector renders options', 'Selection populates msg', 'Compressed codes stored'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-32', name: 'Mesh Message Queue', status: 'not started', dependsOn: ['C-27'], window: 'C-32', priority: 'P2', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'Msgs queued when offline', 'Queue drains when online', 'Persists across remounts'],
    checkResults: ['pending','pending','pending','pending'] },
  { id: 'C-33', name: 'Channel Management UI', status: 'not started', dependsOn: ['C-24'], window: 'C-33', priority: 'P1', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'Create/rename/archive from UI', 'Perm check on create'],
    checkResults: ['pending','pending','pending'] },
  { id: 'C-34', name: 'Status History Feed', status: 'not started', dependsOn: ['C-30'], window: 'C-34', priority: 'P1', category: 'Chat & Messaging',
    checks: ['Build succeeds', 'GET history returns timeline', 'Sorted desc'],
    checkResults: ['pending','pending','pending'] },
];

const GATES: GateCheck[] = [
  {
    id: 'G-1', name: 'GATE 1: Foundation', wave: 1,
    requiredTasks: ['C-01'],
    tests: [
      'npm run build — zero errors',
      'Users table exists with correct schema',
      'Auth endpoints respond (register, login, reset)',
      'User + AuthSession types importable from lib/auth',
    ],
    status: 'ready',
  },
  {
    id: 'G-2', name: 'GATE 2: Profile + Groups Core', wave: 2,
    requiredTasks: ['C-02', 'C-03', 'C-11', 'C-17', 'C-30'],
    tests: [
      'npm run build — zero errors',
      'Can create user → update profile → create group → set status (full flow)',
      'All P0 types importable: UserProfile, EmergencyContact, Group, GroupType, UserStatus',
      'Foreign keys valid: group_members.user_id → users.id',
      'Emergency contacts CRUD works end-to-end',
    ],
    status: 'locked',
  },
  {
    id: 'G-3', name: 'GATE 3: Membership + Roles', wave: 3,
    requiredTasks: ['C-21', 'C-22'],
    tests: [
      'npm run build — zero errors',
      'Full membership flow: invite → pending → approve → member',
      'Role hierarchy enforced: founder > admin > mod > member > follower',
      'checkPermission() correctly gates all 10 actions from permissions matrix',
      'Non-admin cannot change group settings',
    ],
    status: 'locked',
  },
  {
    id: 'G-4', name: 'GATE 4: Channels + Messaging', wave: 4,
    requiredTasks: ['C-24', 'C-27'],
    tests: [
      'npm run build — zero errors',
      'Create group → create channel → post message → retrieve message (full flow)',
      'Messages encrypted at rest, decrypted on read',
      'Channel + Message types importable',
      'Permission check: only members can post to group channels',
    ],
    status: 'locked',
  },
  {
    id: 'G-5', name: 'GATE 5: Integration', wave: 5,
    requiredTasks: ['C-28', 'C-12', 'C-08'],
    tests: [
      'npm run build — zero errors',
      'Full user journey: register → profile → join group → send message → view thread',
      'Contact priorities persist through reorder',
      'Location settings affect group location visibility',
      'No console errors during full UI walkthrough',
    ],
    status: 'locked',
  },
];

const STATUS_COLORS: Record<Status, string> = {
  'not started': '#9CA3AF',
  'in progress': '#3B82F6',
  'complete': '#10B981',
  'blocked': '#EF4444',
};

const CHECK_COLORS: Record<CheckStatus, string> = {
  pending: '#D1D5DB',
  pass: '#10B981',
  fail: '#EF4444',
};

const GATE_COLORS: Record<string, string> = {
  locked: '#9CA3AF',
  ready: '#F59E0B',
  pass: '#10B981',
  fail: '#EF4444',
};

const CRITICAL_PATH = ['C-01', 'C-02', 'C-17', 'C-21', 'C-22', 'C-24', 'C-27', 'C-28'];

const S = {
  page: { padding: '32px', backgroundColor: '#f8f9fa', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' } as React.CSSProperties,
  wrap: { maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  h1: { color: '#1f3348', fontSize: '20px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: 0, marginBottom: '8px' },
  h2: { color: '#1f3348', fontSize: '14px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, margin: '0 0 12px 0' },
  bar: { width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '24px' } as React.CSSProperties,
  barFill: (pct: number) => ({ width: `${pct}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '4px', transition: 'width 0.3s' }) as React.CSSProperties,
  stats: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' } as React.CSSProperties,
  stat: { backgroundColor: 'white', padding: '14px', borderRadius: '6px', border: '1px solid #e5e7eb' } as React.CSSProperties,
  statLabel: { color: '#6B7280', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: '2px' },
  statVal: (c: string) => ({ color: c, fontSize: '28px', fontWeight: 700 }),
  card: { backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' } as React.CSSProperties,
  th: { padding: '10px 12px', textAlign: 'left' as const, color: '#6B7280', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const },
  td: { padding: '8px 12px', fontSize: '12px', color: '#1f3348', borderTop: '1px solid #f3f4f6' } as React.CSSProperties,
  dot: (c: string) => ({ width: 8, height: 8, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }) as React.CSSProperties,
  checkDot: (c: string) => ({ width: 6, height: 6, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }) as React.CSSProperties,
  gateBadge: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 4, border: `2px solid ${c}`, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: c }) as React.CSSProperties,
};

export default function DevMonitor() {
  const [tasks] = useState<DevTask[]>(makeTasks);
  const [gates] = useState<GateCheck[]>(GATES);
  const [viewMode, setViewMode] = useState<'table' | 'gates'>('table');

  const stats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === 'not started').length,
    inProgress: tasks.filter(t => t.status === 'in progress').length,
    complete: tasks.filter(t => t.status === 'complete').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };
  const checksTotal = tasks.reduce((s, t) => s + t.checks.length, 0);
  const checksPassing = tasks.reduce((s, t) => s + t.checkResults.filter(r => r === 'pass').length, 0);
  const progress = stats.total > 0 ? (stats.complete / stats.total) * 100 : 0;

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* HEADER */}
        <h1 style={S.h1}>Community Module - Dev Monitor</h1>
        <div style={S.bar}><div style={S.barFill(progress)} /></div>

        {/* STATS */}
        <div style={S.stats}>
          <div style={S.stat}>
            <div style={S.statLabel}>Functions</div>
            <div style={S.statVal('#1f3348')}>{stats.total}</div>
          </div>
          <div style={S.stat}>
            <div style={S.statLabel}>Not Started</div>
            <div style={S.statVal('#9CA3AF')}>{stats.notStarted}</div>
          </div>
          <div style={S.stat}>
            <div style={S.statLabel}>In Progress</div>
            <div style={S.statVal('#3B82F6')}>{stats.inProgress}</div>
          </div>
          <div style={S.stat}>
            <div style={S.statLabel}>Complete</div>
            <div style={S.statVal('#10B981')}>{stats.complete}</div>
          </div>
          <div style={S.stat}>
            <div style={S.statLabel}>Checks Passing</div>
            <div style={S.statVal(checksPassing === checksTotal && checksTotal > 0 ? '#10B981' : '#F59E0B')}>{checksPassing}/{checksTotal}</div>
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setViewMode('table')} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #d1d5db', background: viewMode === 'table' ? '#1f3348' : 'white', color: viewMode === 'table' ? 'white' : '#1f3348', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
            Task Table
          </button>
          <button onClick={() => setViewMode('gates')} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #d1d5db', background: viewMode === 'gates' ? '#1f3348' : 'white', color: viewMode === 'gates' ? 'white' : '#1f3348', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
            Gate Checks
          </button>
        </div>

        {viewMode === 'table' && (
          <>
            {/* TASK TABLE BY CATEGORY */}
            {CATEGORIES.map(cat => {
              const catTasks = tasks.filter(t => t.category === cat);
              return (
                <div key={cat} style={S.card}>
                  <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#1f3348' }}>{cat}</span>
                    <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 8 }}>
                      {catTasks.filter(t => t.status === 'complete').length}/{catTasks.length}
                    </span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ ...S.th, width: 60 }}>ID</th>
                        <th style={S.th}>Function</th>
                        <th style={{ ...S.th, width: 100 }}>Status</th>
                        <th style={{ ...S.th, width: 100 }}>Depends</th>
                        <th style={{ ...S.th, width: 50 }}>Pri</th>
                        <th style={S.th}>Checks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catTasks.map(task => (
                        <tr key={task.id} style={{ backgroundColor: CRITICAL_PATH.includes(task.id) ? '#fefce8' : 'transparent' }}>
                          <td style={{ ...S.td, fontWeight: 700, fontFamily: 'monospace' }}>{task.id}</td>
                          <td style={S.td}>{task.name}</td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={S.dot(STATUS_COLORS[task.status])} />
                              <span style={{ fontSize: 10, color: '#6B7280' }}>{task.status}</span>
                            </div>
                          </td>
                          <td style={{ ...S.td, fontSize: 10, color: '#6B7280', fontFamily: 'monospace' }}>
                            {task.dependsOn.length > 0 ? task.dependsOn.join(', ') : '-'}
                          </td>
                          <td style={{ ...S.td, fontWeight: 700, fontSize: 11 }}>{task.priority}</td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                              {task.checkResults.map((r, i) => (
                                <div key={i} style={S.checkDot(CHECK_COLORS[r])} title={task.checks[i]} />
                              ))}
                              <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 4 }}>
                                {task.checkResults.filter(r => r === 'pass').length}/{task.checks.length}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </>
        )}

        {viewMode === 'gates' && (
          <>
            {/* GATE CHECKS VIEW */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {gates.map((gate, gi) => (
                <div key={gate.id} style={{ ...S.card, padding: 0 }}>
                  <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', backgroundColor: gate.status === 'pass' ? '#f0fdf4' : gate.status === 'fail' ? '#fef2f2' : '#f9fafb' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', color: '#1f3348' }}>{gate.name}</span>
                      <span style={{ fontSize: 10, color: '#6B7280', marginLeft: 8 }}>Wave {gate.wave}</span>
                    </div>
                    <div style={S.gateBadge(GATE_COLORS[gate.status])}>
                      {gate.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#6B7280', marginBottom: 6 }}>
                      Required Tasks
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                      {gate.requiredTasks.map(id => {
                        const t = tasks.find(t => t.id === id);
                        return (
                          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 3, backgroundColor: '#f3f4f6', fontSize: 11, fontWeight: 600, fontFamily: 'monospace' }}>
                            <div style={S.dot(STATUS_COLORS[t?.status || 'not started'])} />
                            {id}
                          </span>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#6B7280', marginBottom: 6 }}>
                      Integration Tests
                    </div>
                    {gate.tests.map((test, ti) => (
                      <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', fontSize: 12, color: '#374151' }}>
                        <div style={{ ...S.checkDot(CHECK_COLORS.pending), marginTop: 4 }} />
                        {test}
                      </div>
                    ))}
                  </div>

                  {gi < gates.length - 1 && (
                    <div style={{ textAlign: 'center', padding: '0 0 2px 0' }}>
                      <span style={{ color: '#D1D5DB', fontSize: 18 }}>|</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CRITICAL PATH */}
        <div style={{ ...S.card, padding: '16px', marginTop: 24 }}>
          <h2 style={S.h2}>Critical Path</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {CRITICAL_PATH.map((id, idx) => {
              const t = tasks.find(t => t.id === id);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, backgroundColor: t?.status === 'complete' ? '#d1fae5' : '#f3f4f6', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#1f3348' }}>
                    <div style={S.dot(STATUS_COLORS[t?.status || 'not started'])} />
                    {id}
                  </span>
                  {idx < CRITICAL_PATH.length - 1 && <span style={{ color: '#9CA3AF' }}>→</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* WAVE PARALLELISM GUIDE */}
        <div style={{ ...S.card, padding: '16px' }}>
          <h2 style={S.h2}>Parallel Execution Guide</h2>
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8 }}>
            <div><strong style={{ color: '#1f3348', fontFamily: 'monospace' }}>WAVE 1:</strong> C-01 only → run GATE 1</div>
            <div><strong style={{ color: '#1f3348', fontFamily: 'monospace' }}>WAVE 2:</strong> C-02, C-03, C-10, C-11, C-17, C-30 (6 parallel) → run GATE 2</div>
            <div><strong style={{ color: '#1f3348', fontFamily: 'monospace' }}>WAVE 3:</strong> C-04, C-05, C-06, C-08, C-12, C-16, C-18, C-19, C-20, C-21 (10 parallel) → run GATE 3</div>
            <div><strong style={{ color: '#1f3348', fontFamily: 'monospace' }}>WAVE 4:</strong> C-22, C-13, C-14, C-09, C-34 (5 parallel) → run GATE 4</div>
            <div><strong style={{ color: '#1f3348', fontFamily: 'monospace' }}>WAVE 5:</strong> C-23, C-24, C-25, C-15, C-26 (5 parallel) → run GATE 5</div>
            <div><strong style={{ color: '#1f3348', fontFamily: 'monospace' }}>WAVE 6:</strong> C-27, C-28, C-29, C-31, C-32, C-33 (6 parallel)</div>
          </div>
        </div>

      </div>
    </div>
  );
}
