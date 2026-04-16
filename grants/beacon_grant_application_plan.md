# Beacon Grant Application Plan

Kristin Mullaney | April 2026

---

## Where Beacon Is Right Now

This matters because every grant application needs to honestly represent what exists, and the framing changes depending on what's built vs. planned.

**What's built and working:**
- Next.js 16 admin dashboard with 100+ pages (employee management, client management, product settings, community module stubs, audit logs, role-based access)
- PostgreSQL database with Prisma schema (12+ models: Employee, Client, PublicUser, MapDataset, Incident, etc.)
- Complete design system with all tokens, typography, button variants, and Tailwind integration
- WorldView OSS public app: a functional Cesium globe with real-time data layers (flights, satellites, earthquakes, disasters, weather radar) — this is live and deployable now
- MapLibre and Cesium map viewers in the admin dashboard (known drift bug on Cesium load)

**What's architected but not coded:**
- Community features: messaging, contacts, groups, trusted neighbors, equipment registries. UI page stubs exist. Backend is empty. Implementation plan is detailed (Waves A-I in COMMUNITY_IMPLEMENTATION_PLAN.md).
- Data ingestion pipeline for 70+ map layers (NWS CAP, USGS, NASA FIRMS, MRMS radar, etc.). Architecture is complete. Zero ingestion workers built.
- 25 hazard models (wildfire/Rothermel, flood/HEC-RAS, tsunami/MOST, etc.). Documentation is exhaustive. Zero physics or ML code.
- Crowdsourced sighting verification (credibility weighting, CV validation, multi-confirmation, proximity logic). Designed. Not built.
- Geofenced status-check notifications. Designed. Not built.
- Mesh networking / offline mode (BLE/WiFi Direct relay). Designed. Not built.

**Timeline:**
- **2 weeks (mid-April 2026):** Public app ships. Aggregates official emergency info relative to a user's location. Community features for neighbors to stay connected. Ready for real users.
- **3 weeks (late April 2026):** Law enforcement / EMS integration beta. Geofenced status checks, authorized location release, automated notifications for structural collapse scenarios. Enough to hand to an agency for beta testing.
- **After that:** Crowdsourced sighting verification (credibility weighting, CV, multi-confirmation), mesh networking, offline mode, and the full 25-hazard model suite. These are the features grants should fund — the public app and LE integration prove the platform works, and grant money builds the intelligence layer on top.

---

## How to Frame This in Applications

### Lead with the human story, then the technical case

Every application opens with why this matters, not what it does. The Lahaina fire killed 101 people — many had no warning and no way to check on neighbors. The Paradise fire killed 85 — evacuation routes were gridlocked because people didn't know which roads were open. The Yarnell Hill fire killed 19 Granite Mountain Hotshots — communication failures meant crews didn't know the fire had shifted. The Guadalupe River flooded Camp Mystic — families had no way to confirm their kids were safe.

These are the why. Funders respond to them before they respond to architecture slides. The technical rigor validates that you can actually execute on the mission. Every application should spend the first paragraph on a specific tragedy that the component you're pitching would have helped prevent, then transition to the technical approach.

### The core framing: force multiplication

Beacon doesn't replace emergency personnel. It multiplies what they can do with the same resources. This framing works across every grant because it positions you as infrastructure, not disruption. Key phrases to use:

- "Reduces response costs by giving responders automated accountability instead of manual headcounts"
- "Serves vulnerable populations first" — the equity angle is very fundable, especially at FEMA
- "Integrates with existing systems" — agencies are risk-averse about ripping out legacy infrastructure. Beacon extends IPAWS, ingests NWS/USGS/CAL FIRE feeds, and outputs to existing EOC dashboards. You're additive, not replacement.
- "Privacy-protected except in emergencies" — location sharing is opt-in. Authorized release only triggers under specific emergency conditions with user pre-consent.

### The honest pitch (adapt per grant)

"Beacon is a functioning emergency preparedness platform launching publicly in April 2026. The public app aggregates official emergency information relative to a user's location and connects communities during emergencies with group location sharing. A law enforcement and EMS integration enters beta testing in late April, enabling geofenced status-check notifications — when a building collapses, EMS geofences the area, Beacon automatically notifies anyone inside the zone and requests status confirmation, giving responders immediate accountability of who's trapped. Grant funding will build the next layer: credibility-weighted crowdsourced hazard sightings that use computer vision, multi-source confirmation, user expertise profiles, and spatial logic to give emergency managers better situational awareness than any existing system provides."

The EMS dashboard being a real revenue-generating customer tier (not just a feature) strengthens every application. This isn't a consumer app hoping for donations — it's infrastructure with a sustainability model.

---

## Your Three Blockers

You said it: lawyer, performance testing, and getting people to find out about it. Here's how each one maps to what you're building.

**Lawyer ($30K-$50K).** You already have detailed legal planning docs: Good Samaritan liability analysis by state, CCPA/CPRA compliance framework, data sharing agreement templates, limitation of liability clauses, use-at-your-own-risk disclaimer language. What you need is a lawyer to review all of this and sign off. The consent tracking system (legal release versioning, data deletion flows) is specced out in your community implementation plan but needs legal validation before you build it. This is a line item in any grant budget under "legal and compliance review."

**Performance testing ($15K-$30K).** WorldView already handles real-time data layers. The question is whether it holds up when 100K users hit it simultaneously during a disaster — which is exactly when it matters most. Your map architecture doc specs out explosive traffic handling, CDN edge caching, and tile precaching. You need load testing infrastructure to validate those designs. AWS Disaster Response partnership or Microsoft Azure credits are the fastest path here.

**User acquisition.** This is the cold start problem: the app is only useful if enough people in a given area are on it. Your existing plan targets state emergency management contracts ($5M/year per state), which is the long game. For the beta, the fastest path is a county emergency management partnership where the county directs residents to Beacon as part of their official preparedness communications. One county partnership solves user acquisition for the pilot. BRIC and NGWSGP both fund "community engagement" as a line item.

**Website.** You need a public-facing website before you start contacting IPAWS coordinators, county emergency managers, or grant reviewers. When someone Googles "Beacon emergency app" after your email, something credible needs to come up. This isn't a blocker on the same level as a lawyer — it's a weekend task — but it needs to happen before outreach starts. A clean landing page that explains what Beacon does, shows the public app, links to the app store listing (when ready), and has a contact form. No blog, no documentation site, no feature matrix. One page that answers "what is this and is it real." Do this before or in parallel with the 2-page capability brief — the website IS the capability brief for people who Google you instead of reading your email attachment.

---

## Tier 1: Apply Now (Open Deadlines)

### 1. FEMA NGWSGP (Next Generation Warning System Grant Program)

**Deadline: April 30, 2026. 26 days.**

- **Funding:** $136M total program
- **Applicants:** States and tribal nations (you partner through your state)
- **What it funds:** Public alert/warning solutions for emergency information delivery

This is the single best-fit federal grant for Beacon. The program literally exists to fund what you're building. Your geofenced status-check feature — EMS geofences a collapsed building, automatic notification goes to anyone in range, users confirm their status, responders know who's unaccounted for — is a next-generation warning system. IPAWS pushes alerts one way. Beacon makes them bidirectional.

**What to pitch to your state IPAWS coordinator:** "Beacon extends IPAWS from broadcast to bidirectional. When your state sends an alert, Beacon delivers it with location-aware context and lets residents report back their status. In a structural collapse, EMS geofences the site and gets automated accountability of who's in the building. No other consumer app does this. The law enforcement integration enters beta in late April — we can demo it."

**What to ask for:** $200K-$1M. Covers: hardening the geofenced notification system from beta to production, formal IPAWS integration, running a live exercise with county EMS, legal review, performance testing at scale, and community onboarding in 2-3 pilot areas. The LE beta is already being built — this money takes it from "works in testing" to "works when 50K people are on it during a real event."

**Action this week:** Find your state IPAWS coordinator. Google "[your state] IPAWS coordinator" or check the FEMA IPAWS lab directory. Call them. You have 26 days and you need them to include Beacon in their application.

### 2. FEMA BRIC (Building Resilient Infrastructure and Communities)

**Deadline: July 23, 2026. Open now.**

- **Funding:** $1B total pool. $50K-$50M per subapplication.
- **Applicants:** States, local governments, territories, tribal nations. You partner through a county.
- **Cost share:** 75% federal / 25% local (county can cover 25% as in-kind: staff time, office space, data access)

BRIC funds pre-disaster hazard mitigation. Lead with force multiplication and equity: Beacon makes communities more resilient before the disaster hits by giving every resident — including non-English speakers, elderly, disabled, and rural populations — free access to the same situational awareness that emergency managers have. Frame the cost angle: one county deployment reduces post-disaster response costs by giving responders automated accountability and pre-established community coordination networks instead of ad hoc search operations.

**What to pitch to a county emergency manager:** "Beacon is a live emergency preparedness app launching publicly this month. It aggregates official info relative to a user's location and connects communities during emergencies. We also have a law enforcement and EMS integration in beta — geofenced status checks that tell your responders who's in a collapse zone and whether they've confirmed they're safe. Your BRIC application needs a technology component that shows innovation. A 2-year pilot in your county gives your residents a free tool, gives your EMS teams better situational awareness, and generates the data your agency needs for future mitigation planning."

**What to ask for:** $500K-$2M for a 2-year pilot. Covers: building community module (messaging, contacts, groups, location sharing), wiring up data ingestion for the first 10-15 map layers relevant to that county's hazards, legal review, load testing, community onboarding, and evaluation.

**Target counties:** Pick ones that had major disasters in the last 2 years. They're motivated, they probably already have BRIC relationships with FEMA, and Beacon directly addresses their recent experience. LA County (2025 wildfires), Sonoma County (recurring fires), Maui County (2023 fires), any Gulf Coast county post-hurricane.

**Action this month:**
1. Write a 2-page capability brief. Page 1: what Beacon does (keep it to the public-facing features: alert aggregation, community coordination, status checks, crowdsourced sightings). Page 2: what the pilot looks like (timeline, metrics, what you need from the county).
2. Email 3 county emergency management directors. Ask: "Are you submitting a BRIC subapplication this cycle? I have a community resilience technology platform that could strengthen your application."

### 3. SBIR/STTR (Small Business Innovation Research)

**Deadline: Rolling. SBIR reauthorized March 2026 through September 2031.**

- **Phase 1:** ~$150K for 6-9 months (feasibility study)
- **Phase 2:** ~$1M for 2 years (full development)
- **Key advantage:** Non-dilutive. You keep your IP. Designed for small businesses. No county partner or nonprofit status needed.

SBIR is not a "doing good" grant. You need a deliverable technical report and eventually a working prototype. The pitch is "we are answering a specific technical question the agency wants answered," not "fund our app." Position Beacon's AI and sensor modeling work as the research question, not the product.

**Agency-specific framing:**

**DHS S&T** — Emergency alerting, situational awareness, critical infrastructure resilience. Frame around last-mile alert delivery gaps and sensor fusion. "Current IPAWS infrastructure has no mechanism for bidirectional status confirmation or crowdsourced intelligence verification. This Phase 1 study evaluates whether credibility-weighted crowdsourced reports — using CV validation, user expertise scoring, spatial plausibility, and multi-source confirmation — produce measurably better situational awareness than unfiltered social media during emergency events."

**NSF America's Seed Fund** — Lightest deliverable requirements, best for early-stage feasibility. Frame the AI modeling stack as novel scientific and technical merit. The wildfire surrogate model (Rothermel physics compressed to a DL surrogate that runs on-device) and the flash flood hybrid physical-ML stack are both legitimate research topics. "Can physics-informed neural networks produce real-time hazard predictions with accuracy comparable to full-physics simulations at 1000x reduced computational cost?"

**AFWERX (Air Force)** — High volume: ~1,000-1,500 Phase I awards per year at ~$50K each. Good entry point with lower competition. Frame around autonomous systems, sensor fusion, multi-modal detection. The mesh networking architecture and multi-sensor position estimation system both fit AFWERX topics.

**DARPA** — Much harder bar. Save for after you have Phase I results from one of the above. The mesh networking + denied-environment communications angle is the strongest DARPA fit, but you need proof of concept first.

**Key constraint:** SBIR IP is yours, which matters for your acquisition strategy and eventual state contracts.

**What Phase 1 covers at DHS S&T:** Feasibility of credibility-weighted crowdsourcing. Can you reduce false positive rates by weighting sightings by user expertise, CV confirmation, and spatial logic? $150K covers 6-9 months of your time, legal review, and infrastructure to prototype and test it.

**Action this month:**
1. Create account on sbir.gov
2. Search open solicitations at DHS S&T, NSF America's Seed Fund, and AFWERX
3. Sign up for email notifications on new topics across all three
4. AFWERX is the easiest entry point — consider submitting there first even at lower dollar amounts to get a Phase I win on your record

---

## Tier 2: Apply Within 1-3 Months

### 4. NSF Smart and Connected Communities (S&CC)

- **Award:** Up to $1.5M for 3-4 years
- **Deadline:** Annual, typically winter. Prep now for the next cycle.
- **Requires:** Academic PI at a university. You're the community partner.

You've already scoped university partnerships (UC Berkeley AI Safety, Stanford ML Systems, UCLA CV Lab, UCSD Supercomputer Center) and planned $1.1M/year in research funding from future revenue. Flip this: instead of you funding them later, they bring you into an NSF proposal now. Faculty get publications and grant funding. You get a funded pilot, academic validation, and credibility.

**The research question:** "Does credibility-weighted crowdsourced intelligence produce measurably better emergency situational awareness than unweighted social media reports?" That's publishable, fundable, and directly validates Beacon's core differentiator.

**What to ask for:** $1.2M over 3 years. University handles research design and evaluation. Beacon handles deployment. Grant covers your personnel time, legal review, 3-community pilot, and infrastructure.

**Action:** Email a faculty member at one of your target schools. Pitch: "I have a deployable emergency platform. I'm looking for a co-PI for an NSF S&CC proposal studying crowdsourced emergency intelligence. You get publications and funding. I get validation and a pilot."

### 5. Microsoft AI for Good / Google.org / AWS Disaster Response / NVIDIA Inception

These four are worth pursuing in parallel. They're not mutually exclusive and each gives you something different:

- **Microsoft:** Azure credits ($5M+) slash your cloud costs. Apply when a nationwide call opens.
- **Google.org:** Cash grants + credibility. Frame Beacon as community-level complement to Google Crisis Response's broadcast tools.
- **AWS Disaster Response:** Not a grant. A partnership. They run 4-6 field testing exercises per year. Free infrastructure during exercises. Joining their partner network is a credibility marker that strengthens every other application.
- **NVIDIA Inception:** Not a grant either. GPU compute credits for surrogate model training. The framing: you complete their stack, you don't compete with it. "Between prediction and survival, there's Beacon." NVIDIA builds the GPU hardware and AI frameworks. You build the application layer that turns their compute into life-saving predictions. Frame the specific compute need (surrogate model training for wildfire spread, flood inundation, multi-hazard prediction), not the app broadly.

**Action:** Sign up for notifications from Microsoft and Google. Apply to AWS partner network and NVIDIA Inception now (rolling, no deadline).

---

## Tier 3: Longer Horizon

### 6. FEMA Cooperative Agreement

$500K-$2M for 2-3 year pilot. Your legal docs already outline this path (cooperative agreement first, lower compliance burden than a full contract, no FedRAMP needed). This is relationship-driven — 6-12 month courtship. Attend IAEM annual conference or FEMA National Preparedness Conference. Meet people. Pitch Beacon as a pilot.

### 7. State Emergency Management Agency Pilots + Government Contracts

Your existing plan targets CA, OR, WA, NV, UT at $5M/year per state. These dwarf grants. Use grant-funded pilots to prove the model, then convert to contracts.

**WOSB/EDWOSB status.** If you qualify as a Woman-Owned Small Business or Economically Disadvantaged Woman-Owned Small Business, register for it. This reduces the competition pool on set-aside contracts significantly. Many state and federal procurements have WOSB set-asides specifically for the $50K-$500K range.

**SAM.gov registration.** If you haven't already, register on SAM.gov. You need a UEI (Unique Entity Identifier) to apply for any federal grant or contract. This takes 1-2 weeks to process, so start now if not done.

**Realistic entry point:** Target the $50K-$500K pilot contract range with state agencies. Don't go straight for the $500K-$2M full contracts — you need a pilot success story first. One successful state pilot becomes the proof point for every subsequent state conversation. A successful BRIC or NGWSGP pilot is your entry.

### 8. Rockefeller Foundation Adaptation and Resilience Fund

$50M multi-funder pool. Emphasis on early warning systems and community-based disaster response in underserved communities. Frame: Beacon is free, works offline (mesh networking), and serves rural areas that current alert systems miss. Lead with the equity angle — vulnerable populations, non-English speakers, rural communities without adequate IPAWS coverage.

---

## Component-to-Grant Map

Beacon is not one product for grant purposes. It's a platform with distinct components, and each component tells a different story to a different funder. Every application should lead with one component and treat the rest as supporting context.

**Geofenced Status Checks + Authorized Location Release (LE/EMS Integration)**
- Lead grant: NGWSGP
- Supporting grants: FEMA Cooperative Agreement, HSGP (Homeland Security Grant Program)
- The story: "Next-generation warning system. IPAWS alerts go out one-way. Beacon makes them two-way. EMS geofences a collapse zone, everyone inside gets notified, responders get instant accountability of who's confirmed safe and who's unaccounted for."
- Don't dilute this pitch with crowdsourcing or hazard models. This is about notification and response. Keep it tight.

**Credibility-Weighted Crowdsourced Sightings (CV + expertise + spatial logic)**
- Lead grant: SBIR Phase 1 (DHS S&T for situational awareness angle, NSF America's Seed Fund for scientific merit angle), NSF S&CC
- Supporting grants: Google.org AI Impact Challenge, Microsoft AI for Good, AFWERX (sensor fusion angle)
- The story: "Novel intelligence system. A retired firefighter's sighting is weighted differently than a random report. Computer vision validates whether that photo shows real smoke. Spatial logic checks whether a reported fire makes sense given wind and terrain. Multiple confirmations required before it hits the map."
- This is R&D. Position as a research question, not a product: "Can credibility-weighted crowdsourced reports produce measurably better situational awareness than unfiltered social media?" SBIR and NSF eat this up. Don't pitch it to FEMA — they want proven systems, not experiments.

**Community Connection + Group Location Sharing + Neighbor Networks**
- Lead grant: BRIC
- Supporting grants: Rockefeller Foundation, FEMA EMPG
- The story: "Community resilience infrastructure. Neighbors who know each other survive disasters better. Beacon lets communities form groups, share locations during emergencies, coordinate supplies, and check on vulnerable members. Free, permanently."
- BRIC reviewers think in terms of community resilience, social infrastructure, and mitigation. This component speaks their language. The tech stuff (CV, ML, hazard models) would actually weaken this pitch — lead with people helping people.

**Hazard Models (Wildfire/Rothermel, Flood/HEC-RAS, Tsunami/MOST, 25 total)**
- Lead grant: NSF America's Seed Fund (scientific merit, lightest deliverable requirements), SBIR Phase 2 (after Phase 1 win elsewhere)
- Supporting grants: NOAA Climate Adaptation, USGS cooperative agreements, NVIDIA Inception (GPU credits for surrogate training)
- The story: "Physics-based hazard prediction compressed into DL surrogates that run on phones. A wildfire spread model that gives you a 60-second-refresh perimeter prediction without waiting for FARSITE to run for 3 hours on a server. A flash flood hybrid physical-ML stack that combines HEC-RAS hydraulics with neural network speed."
- Frame as research question for NSF: "Can physics-informed neural networks produce real-time hazard predictions with accuracy comparable to full-physics simulations at 1000x reduced computational cost?" For NVIDIA: frame the specific GPU compute need for surrogate model training, not the app.
- This is deep technical work. It needs academic validation. It's a Phase 2 pitch for SBIR, but a Phase 1 pitch for NSF Seed Fund where deliverable requirements are lightest.

**Mesh Networking + Offline Mode**
- Lead grant: SBIR (DOD or DHS), AFWERX, DARPA (after Phase I results)
- Supporting grants: NSF Resilient Infrastructure, Starlink partnership
- The story: "When cell towers go down — which is when the app matters most — Beacon keeps working. BLE/WiFi Direct mesh relays queue data between devices, sync through Starlink when available, and maintain community coordination when everything else has failed."
- AFWERX framing: autonomous systems, sensor fusion, multi-modal detection in denied environments. ~1,000-1,500 Phase I awards per year at ~$50K — high volume, good entry point.
- DARPA: much harder bar. Save for after Phase I results exist elsewhere. The denied-environment communications angle is the strongest fit.
- Don't pitch this to civilian disaster grants — they'll see it as too speculative. Defense grants see it as communications resilience.

**Data Aggregation + Official Info by Location (Public App)**
- Lead grant: None — this is your foundation, not your ask
- Role in every application: "This is already built and shipping. It's the platform everything else runs on. Grant funding builds [specific component] on top of this proven base."
- Never lead a grant application with "we aggregate official info." That's table stakes. Lead with the component that matches the funder, and reference the public app as evidence the platform is real.

**Position Estimation + Building Intelligence (Sensor Module)**
- Lead grant: NSF CPS (Cyber-Physical Systems), SBIR Phase 2
- Supporting grants: NIST, university partnerships
- The story: "Passive building topology learning. The system learns staircases, exits, and flow patterns from how people move through buildings every day. During an evacuation, it knows stairwell A is blocked on floor 6 because someone stopped moving, and routes everyone else to stairwell B."
- This is your most technically novel component. It's also the furthest from deployment. Save it for Phase 2/3 grants after you have user data from the public app to demonstrate feasibility.

**The principle:** Each grant application features ONE component as the headline. The public app and LE beta are always mentioned as proof the platform is real. The other components exist as future roadmap, not as part of the ask. Reviewers fund focused proposals, not platforms that try to do everything.

---

## The Nonprofit Question

Many of the best grants require 501(c)(3) status. Three options:

**Option A (do now): Fiscal sponsor.** Partner with an existing nonprofit (civic tech or emergency management focused). They're your applicant. They take 5-10% overhead. You keep control. Gets you applying within weeks. Look at: Code for America, All Hands and Hearts, local community foundations.

**Option B (start now, ready in 6 months): File your own 501(c)(3).** Unlocks the broadest funding. Doesn't prevent a for-profit arm later. Many orgs run both (nonprofit for grants and public mission, for-profit for government contracts and EMS subscriptions).

**Option C (no structural change): Stay for-profit, focus on SBIR and government contracts.** Narrower pool but no overhead, no board, no reporting. SBIR is built for this.

**Recommendation:** A now, B in parallel, C as your baseline.

---

## Application Timeline Mapped to Your Build Timeline

### April 2026 — Public Launch + LE Beta + NGWSGP Sprint

**Build (week 1-2):** Public app ships. Official info aggregated by user location. Community connection features. Group location sharing. Real users on it. **Ship the website in this window too** — even a single landing page. It needs to exist before you email anyone.

**Build (week 3):** Law enforcement / EMS integration beta. Geofenced status checks, authorized location release, automated collapse-zone notifications. Hand to an agency for beta testing.

**Grants:**
- NGWSGP closes April 30. Contact state IPAWS coordinator THIS WEEK. You can tell them the LE beta will be ready before the deadline — that's a demo, not a promise.
- Draft 2-page capability brief for county/state partners
- Start BRIC county outreach (you have until July 23)
- Create sbir.gov account

### May 2026 — Harden LE Integration + BRIC Application

**Build:** Incorporate beta feedback from LE agency. Performance testing. Additional data layers. Crowdsourced sighting prototype begins.

**Grants:**
- Co-develop BRIC subapplication with county partner (you now have a live public app AND an LE beta to reference — that's stronger than 95% of BRIC tech proposals)
- Submit SBIR Phase 1 if an open DHS topic matches
- Apply to AWS Disaster Response partner network
- Research fiscal sponsors

### June-July 2026 — Crowdsourced Intelligence + BRIC Submission

**Build:** Credibility-weighted sighting verification. CV smoke/fire validation. Multi-confirmation logic. Spatial plausibility checks. User expertise profiles.

**Grants:**
- BRIC submission (July 23 deadline)
- Begin university outreach for NSF S&CC (winter submission)
- Sign up for Microsoft/Google notifications

### August-December 2026 — Scale

**Build:** Mesh networking / offline mode. Full hazard model suite. Equipment/skills registries. Help module. Load testing at 100K+ concurrent.

**Grants:**
- NSF S&CC proposal writing with university co-PI
- NGWSGP and SBIR results
- FEMA cooperative agreement relationship-building (conferences, meetings)
- Foundation grant applications as calls open
- First state contract conversations using pilot data from live app + LE beta

---

## Budget: What to Request Across All Sources

| Category | Need | Why | Best Source |
|---|---|---|---|
| Legal review | $30-50K | ToS, privacy policy, Good Samaritan, DUAs, consent framework | SBIR, BRIC, NSF |
| Load testing infra | $15-30K | Validate 100K+ concurrent users during disaster events | AWS partnership, Azure credits, SBIR |
| Community pilot (3 counties) | $100-200K | Onboarding, training, outreach, local partnerships | BRIC, NGWSGP |
| User acquisition | $50-100K | Marketing, county partnerships, institutional endorsements | BRIC, NGWSGP |
| Personnel (12 months) | $120-150K | Your time building the features grants fund | NSF, SBIR, FEMA cooperative agreement |
| University partnership | $100-200K | Research validation of credibility-weighted crowdsourcing | NSF S&CC |
| Cloud infrastructure (12 months) | $30-60K | Compute, storage, CDN for production deployment | Azure credits, AWS, SBIR |
| **Total** | **$445-790K** | | |

Stack 2-3 grants covering different pieces. SBIR for R&D. BRIC for community deployment. AWS/Microsoft for infrastructure. NSF for research validation. They don't overlap.

---

## What Makes Your Application Different From Every Other Emergency App Pitch

Grant reviewers see dozens of "we're building an app for emergencies" proposals. Here's what separates yours:

**You open with Lahaina, not a feature list.** 101 people died in the Lahaina fire. Many had no warning. Families couldn't confirm if their parents were alive for days. Your application opens with that, not with "we built a platform." The human story is the why. The technical rigor is the proof you can fix it. Every reviewer who lived through a disaster — and many FEMA reviewers have — responds to this before they respond to architecture slides.

**You have a live product, not a deck.** The public app launches mid-April. The LE/EMS integration enters beta testing late April. The admin dashboard has 100+ pages. The design system is complete. When a reviewer asks "is this real?" you can hand them a phone and show them.

**You multiply force, you don't replace it.** Beacon doesn't ask emergency managers to change how they work. It gives them automated accountability instead of manual headcounts. It extends IPAWS with bidirectional status confirmation. It aggregates official sources (NWS, USGS, CAL FIRE) — data flows one-way in from government sources, with community features layered on top. Agencies are risk-averse about new systems. You're additive, not replacement.

**Your architecture handles the hard problems.** A retired firefighter's sighting carries more weight than a random report. CV validates whether that photo actually shows smoke. Spatial logic checks whether a reported fire is plausible given wind direction and terrain. Mesh networking keeps the app functional when cell towers go down. Reviewers who understand emergency management recognize these as the right problems.

**The public version is free, permanently.** The revenue model is EMS subscriptions ($2K-$10K/month tiered) and state contracts, not user monetization. The free tier isn't a growth hack — it's the mission. The EMS dashboard is a real revenue-generating customer tier, which means the sustainability plan isn't "we hope for more grants." Grant reviewers care about this distinction.

**You serve vulnerable populations first.** Free, works offline via mesh, serves rural areas that current IPAWS coverage misses, designed for non-English speakers. The equity angle is fundable across FEMA, NSF, and foundation grants.

---

## Priority Actions: This Week

1. **Ship a landing page.** One page: what Beacon is, what it does, a screenshot or demo link, and a contact form. This has to exist before you email a single IPAWS coordinator or county manager. They will Google you.
2. Google "[your state] IPAWS coordinator" — call them about NGWSGP (26 days to deadline). Lead with: "I have an emergency notification platform launching publicly this month with an EMS geofencing integration entering beta. Can we talk about your NGWSGP application?"
3. Google "[your state] BRIC application 2026" — find the state hazard mitigation officer
4. Write the 2-page capability brief (I can help draft this)
5. Create sbir.gov account and search open solicitations at DHS S&T, NSF America's Seed Fund, and AFWERX
6. Register on SAM.gov if you haven't already — you need a UEI for any federal grant or contract, and it takes 1-2 weeks to process
7. Check WOSB/EDWOSB eligibility — if you qualify, register. Reduces competition pool on set-aside contracts in the $50K-$500K range.
8. Ship the public app — then ship the LE beta. A live product with an agency beta-testing it is the strongest possible position for every application you'll write this year
