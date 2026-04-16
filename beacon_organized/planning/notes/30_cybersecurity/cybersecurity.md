# Cybersecurity Architecture

## CMMC Level 2 Compliance

CMMC Level 2 requires implementation of 110 practices from NIST SP 800-171 across 14 domains. Beacon must achieve certification before federal contracts qualify. Key mandatory practices include:

- Access Control: Role-based access control (RBAC) with principle of least privilege
- Identification & Authentication: Multi-factor authentication (MFA) for all users, password complexity (15+ characters)
- System & Communications Protection: TLS 1.3 for all transit, AES-256-GCM for encryption at rest
- System Development: Secure development lifecycle with code reviews, static analysis (SonarQube, Snyk)
- Incident Response: Documented procedures, 60-minute response time for critical incidents

Assessment must occur every 3 years through authorized C3PA assessors. Cost: $12K-25K per assessment cycle.

## FedRAMP Authorization Path

**JAB (Joint Authorization Board)**
- Faster timeline (12-18 months)
- ATO valid across all federal agencies
- Requires demonstrated security maturity
- Cost: $150K-300K consulting + internal effort

**Agency-Specific Sponsorship**
- FEMA sponsor streamlines compliance
- Direct relationship with federal review team
- Cost: $80K-150K, faster initial approval
- Valid only with sponsoring agency

Requires: System Security Plan (SSP), Security Assessment Report (SAR) by authorized assessor, Plan of Action & Milestones (POA&M) for gaps, continuous monitoring 3 years post-authorization.

## Encryption & Network Security

**At Rest**
- PostgreSQL: AES-256-GCM for all user data and event history
- Application layer encryption for PII with per-user key derivation
- Key management via AWS KMS with customer-managed keys, quarterly rotation

**In Transit**
- TLS 1.3 for all external APIs (minimum)
- Certificate pinning for government agency connections
- Cipher suites: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256
- HSTS enforcement (Strict-Transport-Security header)

**End-to-End for Mesh**
- Asymmetric encryption (ECDH P-256) for initial pairing
- AES-256-GCM session encryption post-pairing
- Perfect forward secrecy: ephemeral keys per message session
- HMAC-SHA256 message signing to prevent tampering

## Zero Trust Architecture

- **Identity**: Every request requires cryptographic proof (JWT with RS256 signature)
- **Network Segmentation**: VPC with public API layer, private database tier, isolated mesh relay network
- **Device Posture**: OS version, security patch level, screen lock status verification
- **Continuous Authentication**: Session tokens expire 15 minutes, refresh tokens 24 hours
- **Attribute-Based Access**: Grant based on device, location, time-of-day, role

Mobile apps run sandboxed; mesh nodes isolated on separate subnet with network-layer access control.

## Mesh Network Security

**Message Signing**: Each packet signed by originating node (ECDSA P-384). Relay nodes verify before forwarding. Invalid signatures cause packet drop.

**Replay Prevention**: 256-bit nonce plus timestamp in every packet. Receiver maintains sliding window of accepted nonces. Packets older than 5 minutes discarded.

**Certificate Pinning**: Government gateway endpoints pin public key (SHA-256 HPKP). Mobile app embeds government CA certificate chain. Validation chains to root CA managed by FEMA.

**Node Onboarding**: Pre-shared key exchange in controlled environment. Hardware token backup (physical pairing code). Node identity stored with GPS coordinates at pairing.

## Penetration Testing & Audits

**Schedule**
- Quarterly automated vulnerability scanning (Qualys, Tenable)
- Semi-annual internal penetration testing (high-risk zones)
- Annual external penetration testing by third-party firm
- Post-deployment testing for each major release

**Scope**: Mobile app attack surface, API endpoint fuzzing, mesh network routing attacks, social engineering of support staff.

**Remediation Timeline**: Critical (7 days), High (30 days), Medium (90 days).

## SOC 2 Type II Certification

SOC 2 Type II audit validates security controls over 6+ month period. Required by enterprise customers and government agencies.

- Trust Service Criteria: CC6.1 (asset management), CC7.1-7.2 (encryption), CC7.3 (network security)
- Big 4 auditor engagement: $25K-50K annually
- Monthly control testing and evidence gathering
- Customer audit rights extended indefinitely

## Incident Response

**Team**: On-call incident commander (24/7 rotation), security engineer, platform engineer, external legal counsel.

**Timeline**
- T+0 min: Detection and triage
- T+15 min: Executive notification, customer communication draft
- T+60 min: Root cause hypothesis, containment action
- T+4 hours: Incident report to affected customers
- T+24 hours: Post-incident review completed

**Evidence**: Mesh network logs streamed to immutable S3 (object lock). Database audit logs retained 7 years. VPC Flow Logs captured during operational periods.

**Notification**: FEMA within 24 hours if PII exposed. Customers within 4 hours if availability impact. Public notification if 1000+ users affected (coordinated with legal).
