# 53. Cybersecurity & Compliance

## Overview
Multi-layered security: TLS 1.3 in-transit, AES-256-GCM at-rest, zero trust architecture, CMMC Level 2 compliance path, SOC 2 Type II, FedRAMP readiness. Incident response 60-min SLA. Annual penetration testing; continuous vulnerability scanning.

## Ownership
- **Module Lead:** Security Engineer
- **Reports to:** CTO + Legal
- **Team Size:** 3 (1 security architect, 1 DevSecOps, 1 compliance)

## Parent/Submodules
- Parent: 30_cybersecurity
- Submodules: Encryption, Access Control, Incident Response, Compliance, Penetration Testing

## Goals
- CMMC Level 2 certification within 18 months
- FedRAMP JAB authorization within 24 months
- SOC 2 Type II audit passing
- Zero critical CVE vulnerabilities in production
- 60-minute incident response SLA

---

## Functions (Security Operations)

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| encrypt_at_rest_aes256 | AES-256-GCM encryption | Plaintext data + user key | Ciphertext + IV | <10ms | AWS KMS |
| encrypt_in_transit_tls13 | TLS 1.3 connection | Plaintext over HTTP | Encrypted over HTTPS | <100ms | OpenSSL 1.1.1+ |
| generate_session_token | JWT creation for auth | User credentials | JWT token (RS256) | <50ms | JWT library |
| validate_session_token | Verify JWT signature | JWT token | User identity + claims | <10ms | JWT library |
| rotate_encryption_keys | Quarterly key rotation | Current keys | New keys, old archived | <5min | AWS KMS |
| mfa_generate_otp | One-time password creation | User ID | 6-digit OTP | <50ms | OTP library |
| mfa_validate_otp | Verify TOTP/SMS code | User ID + OTP | Valid/invalid flag | <100ms | OTP library |
| rbac_check_permission | Role-based access control | User role + resource + action | Allowed/denied flag | <5ms | Permission matrix DB |
| rbac_assign_role | Grant user role | User ID + role | Role assignment stored | <100ms | User DB |
| certificate_pinning_check | Validate cert for govt endpoints | Server certificate + pinned key | Valid/invalid flag | <50ms | Pinned certs list |
| detect_suspicious_activity | Anomaly detection for fraud | User behavior stream | Suspicious flag + score | <1s | ML model |
| block_ip_address | Rate limit or block IP | IP address + reason | IP added to blocklist | <10ms | Redis blocklist |
| log_access_event | Audit trail logging | User ID + action + timestamp | Log entry created | <100ms | Audit DB |
| scan_vulnerability_database | Scan for CVEs | Dependency list | CVE list + severity | 30min | NVD database |
| patch_vulnerability | Apply security patch | CVE ID + patch version | Patched dependency | <5min | Patch repo |
| perform_penetration_test | Security assessment | Test scope + targets | Vulnerability report | 2 weeks | Penetration tester |
| remediate_vulnerability | Fix identified issue | Vulnerability + fix | Remediation completed | <30 days | Development team |
| run_siem_monitoring | Security event aggregation | Log streams | Security dashboard | <5s | SIEM platform |
| alert_security_incident | Escalate to incident commander | Anomaly or violation | Alert sent + ticket created | <5min | PagerDuty |
| initiate_incident_response | Incident response workflow | Incident classification | Incident commander notified | <15min | Incident playbook |
| contain_incident | Isolate affected systems | Incident details | Systems isolated | <60min | Network isolation |
| investigate_root_cause | Root cause analysis | Incident logs | RCA report | <24hrs | Log analysis |
| notify_stakeholders | Communicate incident | Incident summary | Notifications sent | <4hrs | Email, SMS, In-app |
| update_compliance_status | Track compliance metrics | Assessment results | Compliance dashboard updated | <1hr | Compliance DB |
| generate_audit_report | Evidence collection | Audit scope | Report generated | 1 day | Audit logs |
| mock_phishing_campaign | Social engineering test | Employee list | Campaign results | <1 week | Email service |
| enforce_data_minimization | PII data governance | Data collection event | PII flagged + logged | <10ms | Policy engine |
| anonymize_location_data | Remove user ID from location | User location + event context | De-identified coordinates | <1s | Data pipeline |
| encrypt_audit_logs | Immutable log storage | Audit log entry | S3 Object Lock encrypted | <100ms | S3 + KMS |

---

## Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| encryption_keys | Key management metadata | key_id, algorithm, rotation_date, active_flag | 3 years |
| session_tokens | Active JWT tokens | token_id, user_id, expires_at, issued_at | 24 hours |
| audit_logs | Immutable access logs | log_id, user_id, action, resource, timestamp, ip_address | 7 years |
| rbac_assignments | User role mappings | user_id, role_id, assigned_at, revoked_at | Historical |
| security_incidents | Incident tracking | incident_id, classification, detected_at, resolved_at, summary | 3 years |
| vulnerability_scan_results | CVE scan results | scan_id, scan_date, cve_id, affected_component, remediation_status | 2 years |
| penetration_test_reports | PT findings archive | report_id, test_date, findings_count, remediation_deadline | 3 years |
| password_hash_history | Prevent password reuse | user_id, hash, set_date | 1 year |
| failed_login_attempts | Brute force detection | user_id, ip_address, attempt_time, blocked_flag | 30 days |
| certificate_pins | Pinned cert public keys | endpoint_id, public_key_sha256, pinned_at, expires_at | 5 years |
| compliance_assessments | Audit findings | assessment_id, standard, date, findings_count, status | 3 years |

---

## Message Bus (NATS)

| Channel | Publisher | Subscriber | Frequency | Payload |
|---------|-----------|------------|-----------|---------|
| security.incident.detected | SIEM/monitoring | Incident Commander, Slack | On event | {incident_id, severity, details} |
| security.vulnerability.found | Vulnerability Scanner | Dev Team, Slack | Daily | {cve_id, component, severity} |
| security.access.denied | Authorization engine | Audit log, Monitoring | On event | {user_id, resource, denied_reason} |
| security.key.rotated | Key Manager | Audit log, Monitoring | Quarterly | {key_id, old_key, new_key, timestamp} |
| security.patch.deployed | Deployment pipeline | Audit log, Dashboard | On deploy | {cve_id, version, deployment_time} |
| compliance.audit.scheduled | Compliance team | Calendar, Slack | Quarterly | {audit_type, scheduled_date, scope} |
| security.mfa.triggered | Auth service | Audit log, User | Per login | {user_id, mfa_method, success_flag} |

---

## Cache (Redis)

| Key Pattern | Purpose | TTL | Size | Update Freq |
|-------------|---------|-----|------|------------|
| session:{token_id} | Active session cache | 15min | 500B | Per login |
| blocklist:ip | Rate-limited IP addresses | 1hr | 1MB | Per violation |
| blocklist:user | Locked user accounts | 30min | 100KB | Per breach attempt |
| mfa:otp:{user_id} | TOTP secret + state | 2min | 100B | Per login |
| rbac:permissions:{user_id} | User permissions cache | 1hr | 10KB | Per role change |
| security:incident_open | Open incident count | 1min | 100B | Per incident |
| vuln:scan_results | Latest CVE scan | 24hr | 5MB | Daily |

---

## External Integrations

| System | Purpose | Protocol | Auth | SLA |
|--------|---------|----------|------|-----|
| AWS KMS | Key management | AWS SDK | IAM role | <100ms |
| OpenSSL 1.1.1+ | TLS crypto | C library | System | N/A |
| Qualys / Tenable | Vulnerability scanning | REST API | API key | <24hrs |
| PagerDuty | Incident alerting | REST API + Slack | API key | <1min |
| Google Authenticator | TOTP auth | Time-based OTP | Device | <1s |
| AWS WAF | Web application firewall | AWS SDK | IAM role | <100ms |
| Datadog / Splunk | SIEM monitoring | Agent + API | API key | <5s |
| Duo Security | MFA service | REST API | API key | <500ms |

---

## API Contracts

### User Login with MFA
```
POST /api/v1/auth/login
Body: {
  email: "user@example.com",
  password_hash: "scrypt:hash",
  mfa_totp: "123456"
}
Response: {
  session_token: "eyJhbGc...",
  expires_in_seconds: 86400,
  user_id: "user123",
  roles: ["public_user"]
}
```

### Check Permission
```
GET /api/v1/auth/permission?resource=event_123&action=read
Response: {
  allowed: true,
  user_role: "ems_director",
  resource_type: "event"
}
```

### Report Security Incident (Internal)
```
POST /api/v1/security/incident
Body: {
  classification: "unauthorized_access",
  affected_users: 50,
  description: "API key leaked in GitHub",
  evidence_link: "https://github.com/repo/commit/..."
}
Response: {
  incident_id: "sec-2026-001",
  status: "created",
  incident_commander_notified: true
}
```

### Get Compliance Status (Admin)
```
GET /api/v1/admin/compliance/status
Response: {
  cmmc_level_2: {
    status: "in_progress",
    practices_implemented: 85,
    practices_total: 110,
    target_completion: "2027-03-01"
  },
  fedramp: {
    status: "planning",
    path: "jab",
    estimated_start: "2026-09-01"
  },
  soc2_type2: {
    status: "in_audit",
    audit_start: "2026-01-01",
    audit_end: "2026-07-01"
  }
}
```

---

## Encryption Standards

| Context | Algorithm | Key Size | Standard | Status |
|---------|-----------|----------|----------|--------|
| Transit (TLS) | TLS_AES_256_GCM_SHA384 | 256-bit | TLS 1.3 | Mandatory |
| Transit (Mesh) | ECDH P-256 + AES-256-GCM | 256-bit | Zero Trust | Mandatory |
| At-Rest (Database) | AES-256-GCM | 256-bit | FIPS 140-2 | Mandatory |
| At-Rest (S3/Audit) | AES-256-GCM | 256-bit | AWS KMS | Mandatory |
| Session (JWT) | RS256 | 2048-bit RSA | OpenID Connect | Mandatory |
| Message Signing (Mesh) | ECDSA P-384 | 384-bit | FIPS 186-4 | Mandatory |
| Perfect Forward Secrecy | Ephemeral ECDH | Per-message | RFC 5116 | Mandatory |

---

## Access Control (RBAC)

| Role | Capabilities | Data Access | Constraints |
|------|-------------|------------|-------------|
| Public User (PU) | View own location, contacts | Own data only | Limited forecast access |
| Self-Designated (SD) | Above + hazard reports | Own data + shared data | Cannot dispatch EMS |
| Dedicated Individual (DI) | Above + offline maps, mesh | Own data + authorized groups | Read-only on EMS resources |
| Emergency Team (ET) | Above + real-time routing | Team location + EMS networks | Cannot modify incidents |
| Emergency Authority (EA) | Above + hazard acknowledgment | Event scope + regional data | Can issue orders |
| Beacon Enterprise (BE) | Above + custom integration | Agency-wide + cross-agency | Full administrative access |
| Admin | System-wide access | All data | Audit logged |
| Security Engineer | Security operations | Incident logs, audit trails | Cannot access user data |

---

## Compliance Roadmap

| Standard | Timeline | Status | Effort | Cost |
|----------|----------|--------|--------|------|
| CMMC Level 2 | 18 months | Planning | 200 days | $25K assessment |
| FedRAMP JAB | 24 months | Planning | 500 days | $150K-300K consulting |
| SOC 2 Type II | 12 months | In audit | 80 days | $30K-50K auditor |
| CCPA Compliance | 6 months | Implemented | 40 days | $10K legal |
| GDPR Right-to-Deletion | Ongoing | Implemented | Maintenance | $5K/year |
| HIPAA (if handling health data) | 24 months | N/A | 300 days | $50K consulting |

---

## Incident Response SLA

| Severity | Detection | Triage | Notification | Containment | Resolution | Post-Incident |
|----------|-----------|--------|--------------|-------------|-----------|----------------|
| Critical (P1) | <2min | <15min | <30min | <60min | <24hrs | <48hrs |
| High (P2) | <5min | <30min | <2hrs | <4hrs | <7 days | <10 days |
| Medium (P3) | <30min | <1hr | <4hrs | <24hrs | <30 days | <60 days |
| Low (P4) | <2hrs | <4hrs | <1 day | >1 day | >30 days | Documentation |

---

## Penetration Testing Schedule

| Test Type | Frequency | Duration | Scope | Cost |
|-----------|-----------|----------|-------|------|
| Automated vulnerability scan | Quarterly | 4 hours | Full infrastructure | $5K/year |
| Internal penetration test | Semi-annual | 1 week | High-risk zones (API, auth, mesh) | $15K/year |
| External penetration test | Annual | 2 weeks | Full attack surface | $25K/year |
| Social engineering test | Annual | 2 weeks | Staff security awareness | $8K/year |
| Red team exercise | Every 2 years | 1 month | End-to-end incident simulation | $50K/year |

---

## Monitoring (5-Agent Team)

| Agent | Role | Frequency | Key Metrics | Escalation |
|-------|------|-----------|-------------|-----------|
| Quality | Vulnerability scan results, patch lag | Daily | CVE count, patch deployment time | Unpatched critical CVE >7 days |
| Research | Threat intelligence, security trends | Weekly | New CVEs in Beacon dependencies | Critical CVE in production |
| Business | Compliance audit progress | Weekly | CMMC practices implemented, FedRAMP readiness | Falling behind roadmap |
| Compliance | Audit log integrity, access controls | Daily | Audit log completeness, unauthorized access attempts | >10 unauthorized attempts/day |
| Lead | Incident command authority | Per incident | Incident SLA compliance, escalation decisions | Any P1 incident |

---

## Dependencies

| Module | Dependency | Type | Criticality |
|--------|-----------|------|------------|
| 36_data_storage | Encryption keys, audit logs | Hard | Critical |
| 32_operating_system | TLS certificates, app signing | Hard | Critical |
| 31_legal | Compliance requirements, privacy policy | Hard | Critical |
| All other modules | Access control, audit logging | Soft | High |

---

## Implementation Notes

- **Zero trust:** Every request requires signed JWT (RS256); device posture checked (OS version, security patches); continuous auth (15-min refresh)
- **Encryption keys:** AWS KMS customer-managed keys; quarterly rotation; per-user key derivation for sensitive PII
- **Audit trail:** All access logged to S3 Object Lock (immutable); retained 7 years; indexed for incident investigation
- **Mesh security:** ECDH P-256 initial pairing; AES-256-GCM session encryption; ECDSA P-384 message signing; nonce + timestamp prevents replay attacks
- **Incident response:** On-call rotation (24/7); 15-min exec notification; 60-min containment SLA; post-incident review within 24hrs
- **Compliance:** Annual SOC 2 audit (Type II); CMMC L2 target 18mo; FedRAMP JAB target 24mo; continuous monitoring for drift
