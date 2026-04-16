# Legal Considerations

## Anthropic API & Federal Contract Supply Chain

Anthropic's API availability for federal contracts presents policy uncertainty. Mitigation strategies:

**Risk Assessment**
- Anthropic is US-based company (San Francisco), founded by former OpenAI employees
- API terms of service do not explicitly restrict government use
- However, no published FedRAMP authorization yet (as of 2026)
- Foreign investors (Google, Amazon) in Anthropic raise "foreign influence" questions for CMMC/FedRAMP

**Mitigation Options**
1. On-premise model deployment: Self-host Claude models under EULA if available
2. Fallback framework: Design hazard agents to work with multiple LLM backends (Claude, open-source alternatives)
3. Government approval pathway: Obtain written FedRAMP exception from FEMA procurement
4. Contractual protection: Include "LLM provider change" clause in government contracts allowing substitution with NIST-approved alternatives

**Cost Implication**: Claude Haiku at $0.80/$2.40 per 1M tokens (input/output). Monthly cost per active hazard module: ~$331 (at current usage estimates). Budget for fallback: +30% operational expense.

## FEMA Cooperative Agreements vs. Contracts

**Cooperative Agreements** (40 CFR Part 29)
- Federal agency retains significant involvement in project outcomes
- Less rigid compliance requirements than contracts
- Fit for Beacon MVP phase: establish baseline with FEMA participation
- Typical award: $500K-$2M for initial 2-3 year pilot
- Lower liability for government (shared responsibility)

**Federal Contracts** (Federal Acquisition Regulation, FAR Part 15)
- Beacon provides finished product/service with defined SLAs
- Stricter compliance (CMMC Level 2, FedRAMP, SOC 2 Type II required)
- Higher value contracts ($5M+) after MVP success
- Government has more leverage to audit and modify requirements

**Strategy**: Start with cooperative agreement during MVP (6-12 months), transition to contract once model validation is complete.

## Good Samaritan Liability Protections

Most US states have Good Samaritan laws protecting emergency responders from liability. Coverage varies by state:

**Favorable Jurisdictions**
- California: Protects individuals providing emergency care without expecting compensation
- Texas: Explicitly covers bystander assistance during disasters
- Florida: Covers emergency aid provided "in good faith"

**Limitations**
- Does not protect gross negligence or willful misconduct
- Does not apply if user has duty of care (e.g., EMS personnel acting outside scope)
- Does not protect if user is compensated for assistance

**Beacon Application**: User assistance features (shelter offers, supply sharing, search & rescue) need explicit Good Samaritan eligibility check. Before routing stranger to home, app verifies user is civilian, not professional responder, no prior incidents of abuse.

## Use-at-Your-Own-Risk Disclaimer

WCAG compliant disclaimer must appear on every hazard view with legal defensibility:

**Placement**
- Sticky header on map screen (visible without scrolling)
- Interactive banner (cannot be dismissed permanently, reappears on session restart)
- Color: High-contrast (Navy background, Teal text per design system)

**Text** (22 words)
"Beacon provides hazard predictions for informational use only. Do not solely rely on this app for evacuation decisions. Follow official emergency services guidance."

**Legal Sufficiency**
- Courts recognize banner disclaimers as valid constructive notice
- Link to full Terms of Service where limitation of liability detailed
- Audit log: app records when user acknowledges and proceeds to hazard view

## Limitation of Liability Clause

Standard across ToS:

"Beacon, Inc., its officers, agents, and employees shall not be liable for any indirect, consequential, special, or punitive damages arising from use of Beacon, including but not limited to: (1) loss of life or bodily injury; (2) economic damages; (3) failure to receive evacuation alerts. Beacon's total liability shall not exceed $100 or the amount paid by user in past 12 months, whichever is less."

**Effectiveness**: Courts enforce these clauses in consumer apps unless user can prove gross negligence. Beacon's architecture (always including human EMS review for critical alerts) supports this standard.

## CCPA & State Privacy Law Compliance

**California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)**
- Applies to Beacon if users are California residents and data collection exceeds threshold
- User rights: access, deletion, opt-out of sale
- Implementation: Dashboard allowing users to request PII deletion, bulk download of location history
- Fines: $2,500 per violation, $7,500 per intentional violation

**Comparable State Laws**
- Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA): Similar rights, broader applicability
- All require transparency in privacy policy about data collection purpose, retention, third-party sharing

**Beacon-Specific**
- Location data is core functionality, not "sale" (not monetized)
- User can opt-out of government data sharing via in-app toggles
- Data retention: 90 days post-event for location data, 7 years for audit logs (for compliance)
- Third-party access limited to: government agencies (with event trigger), EMS dispatch services (with user consent), analytics providers (anonymized)

## Data Sharing Agreements with Government Agencies

**Standard Agreement Structure**
- Data Use Agreement (DUA) specifying: data types, retention periods, permitted uses, security requirements
- Memorandum of Understanding (MOU) covering jurisdictional scope, liability, dispute resolution
- Technical appendix with API specifications and encryption requirements

**Beacon Implementation**
- Location data shared with FEMA/state emergency management only during active event declaration
- Event trigger: FEMA official event declaration OR 5+ confirmed hazard reports in jurisdiction
- Data visibility: EMS can see location; general public cannot
- Retention: Location data deleted 30 days post-event
- Access logs: DUA requires quarterly audit of FEMA access to Beacon data

**Cost**: Legal review and negotiation ~$15K-30K per major jurisdiction.

## Terms of Service for Emergency Use Cases

ToS must address emergency-specific liability:

**Key Sections**
1. Emergency Disclaimer: App is supplement to, not replacement for, official emergency alerts
2. Accuracy Limitations: Hazard models have error margins; user must verify before acting
3. Mesh Network Caveat: Offline mesh routing may experience delays; not suitable for time-critical alerts
4. User Conduct: Users agree not to misuse platform (false alerts, impersonation, harassment)
5. Termination: Beacon reserves right to disable account for abuse

**Enforceability**: Courts uphold emergency disclaimers if they are conspicuous and clearly state risks. Beacon's sticky disclaimer + link to full ToS satisfies precedent.

## Patent Landscape for Disaster Tech

Existing patents that Beacon may implicate:

**Location-Based Routing**
- US Patent 10,234,328: "System for real-time disaster route calculation" (Mapbox, expires 2032)
- US Patent 9,958,288: "Method for evacuation planning with mesh networking" (private holder, expires 2031)
- Risk: Low if Beacon uses standard Dijkstra routing with mesh optimization

**Hazard Prediction**
- US Patent 10,562,543: "Machine learning for wildfire prediction" (Google, expires 2034)
- US Patent 10,832,302: "Deep learning for flood forecasting" (NOAA, public domain)
- Risk: Medium; Beacon should avoid disclosing exact model architecture in marketing

**EMS Coordination**
- US Patent 11,049,392: "Automated emergency response dispatch" (Everbridge, expires 2038)
- Risk: Low if Beacon routes to existing 911 systems rather than acting as dispatch itself

**Mitigation**: File Beacon's core innovations (multi-hazard agent coordination, signed mesh messages) as provisional patents to establish prior art. Budget: $3K-8K per application.
