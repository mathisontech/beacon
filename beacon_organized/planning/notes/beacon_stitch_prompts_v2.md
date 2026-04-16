# Beacon App — Google Stitch Prompts v2

## How to Use These Prompts

Stitch works best generating 1-2 screens at a time. Do NOT paste all prompts at once.

**Workflow:**
1. Paste the **Style Guide / Context Prompt** first
2. Generate each screen individually
3. Every 2-3 screens, Shift+Click multi-select all screens and apply the **Consistency Prompt**
4. Connect screens into flows using Stitch's prototyping tools
5. Iterate one change at a time

---

## Style Guide / Context Prompt (Paste This First)

```
I'm designing a mobile app called Beacon — an emergency management, hazard awareness, and community safety platform. Design for iPhone 15 Pro dimensions.

STYLE GUIDE (extracted from existing login screen mockup):

Color palette:
- Background: Deep dark navy/near-black (#0D1117 to #1A2332 gradient, subtle blue undertone)
- Text: White (#FFFFFF) for headings, light gray (#B0B8C4) for secondary text and labels
- Input fields: White (#FFFFFF) with rounded pill shape
- Input text: Dark charcoal (#2C2C2C)
- Field labels: Light gray (#B0B8C4), uppercase, letterspaced
- Accent colors from the phoenix logo: Flame orange (#EA7928), Purple (#B829FC), Steel blue (#3881B8), Deep purple (#50386A)
- Alert/CTA orange: #EA7928 (primary action color)
- Status colors: Green (#2D8B4E) for safe/active, Yellow (#E8B84E) for warning/idle, Red (#C0392B) for danger/off

Typography:
- Logo/brand name "Beacon": Nunito Sans Bold (closest commercially free match to Avenir — the original mockup uses Avenir). If Avenir is available, use Avenir. Large, clean, geometric.
- All other UI text: Poppins (Google Font, OFL licensed, free for commercial use). Use Poppins Light for body, Poppins Regular for labels, Poppins Medium for subheadings, Poppins SemiBold/Bold for headings.
- Field labels are UPPERCASE with wide letter-spacing

Shape language:
- Very high corner radius on all interactive elements (inputs, buttons, cards, tab bars) — pill-shaped, soft, 3D iOS feel
- Think iOS 18 / visionOS depth aesthetic: elements feel like they float above the background with subtle shadows and layering
- Cards and containers have a frosted glass / glassmorphism feel — semi-transparent backgrounds with blur, sitting above the dark base
- Depth through layered shadows, not flat design — elements should feel tactile and pressable
- The overall aesthetic is premium, dark-mode-first, with the colorful phoenix logo as the only burst of color against the monochrome interface

Navigation:
- 5 icon-only tabs in a bottom tab bar (no text labels): Map (compass/map pin icon), Nearby Activity (radar/broadcast icon), My Notifications (bell icon), Help (hand-heart icon), My Community (people icon)
- Active tab icon is white/bright, inactive tabs are muted gray
- The tab bar itself is a frosted dark glass pill floating above the bottom edge
- User's circular profile photo is persistently visible in the top-left corner across ALL tabs. Tapping it slides out a left-side settings panel

Accessibility: WCAG AA contrast ratios, minimum 44pt touch targets, one-handed reachability for key actions

Phoenix logo: A stylized phoenix bird facing right with a colorful fanned tail. Tail feathers use the accent gradient: flame orange (#EA7928) → purple (#B829FC) → steel blue (#3881B8) → deep purple (#50386A). The body is warm orange/gold. Used as app icon and on login/splash screens only — does not appear in the main app interface.
```

---

## Screen 1: Map Tab (Home Screen — Normal Day)

```
Design the Map tab — the home/default screen of the Beacon app. This screen has two halves: the top half is an interactive map, the bottom half is a scrollable location overview.

TOP SECTION — MAP (upper ~50% of screen):

Top-left: User's circular profile photo (small, ~36pt, always visible). Tapping opens a left-side slide-out menu.

The map itself shows the user's current location with a subtle pulsing blue dot, surrounding streets, terrain, and points of interest. Normal day — no emergencies active. The map style is dark/satellite hybrid that matches the app's dark aesthetic.

Map overlay controls (floating on the map, frosted glass pill style):
- TOP-RIGHT of map: A layers icon (stacked squares). Tapping opens a right-side slide-out panel with toggleable layer checkboxes (weather radar, fire perimeters, evacuation zones, road closures, utility outages, air quality heat map, smoke, team locations, traffic, etc.)
- BOTTOM-LEFT of map: A circular play/time button icon. The user holds this and scrubs in a circular motion clockwise to fast-forward the map through time (weather radar progression, fire movement, etc.) or counter-clockwise to rewind and see the map's history. Show a subtle timestamp label when active.
- BOTTOM-RIGHT of map: A circular "+" button. Tapping opens options for the user to add reports to the map — report smoke/fire, report flooding, report road hazard, report downed power line, report suspicious activity, general observation with photo.

DIVIDER — LOCATION PREVIEW BAR:

Between the map and the scrollable area below, there is a thin, elegant bar showing:
- LEFT side: Current temperature (e.g., "72°") with a small weather icon (sun, clouds, rain, etc.) representing today's weather
- RIGHT side: A small preview of any noteworthy hazard or event (e.g., "Wind Advisory until 6pm" or "Air Quality: Moderate"). On a calm day this might just say "No active alerts". Long-pressing this bar navigates to the Nearby Activity tab with full event details.

BOTTOM SECTION — SCROLLABLE LOCATION OVERVIEW (lower ~50% of screen):

When the user scrolls down on the location preview bar, the map smoothly collapses upward and the location overview expands to fill the screen. This is a vertically scrolling page with the following sections in order:

Section 1 — Official Status Reports (cards with frosted glass style):
- Air Quality Index (number + color indicator + label like "Good" or "Moderate")
- Fire Risk / Fire Danger Rating (Low/Moderate/High/Very High/Extreme with color)
- UV Index
- Wind overview (speed, direction, gusts — small wind rose graphic)
- Humidity percentage
- Allergy/Pollen report (tree, grass, ragweed levels)
- Ocean/surf conditions if coastal (current, wave height, rip current risk, water temp)
- Avalanche danger if mountainous
- Flood risk if applicable
- Each card is compact, visual, uses color coding. Think Apple Weather widget style but with the Beacon dark glass aesthetic.

Section 2 — Daily Community Survey (fun, social, lightweight):
This is a unique Beacon feature — anonymous micro-polls from people in the area. Displayed as horizontal bar charts or percentage pills:
- "Think it's gonna rain today?" — 23% yes
- "Allergies acting up?" — 67% yes
- "Coughing / sneezing / feeling run down?" — 14% reporting (anonymous)
- "Regretting your outfit choice?" — 41% yes (with a "What to wear" recommendation)
- "Seen anything weird in the sky?" — 2% yes (UFO/unusual sightings, playful tone)
- "Community vibe check" — emoji mood meter showing the area's collective mood (mostly sunny faces today)

The survey section has a lighter, more playful tone than the official reports — casual typography, subtle animations, community-driven. Users can tap to submit their own vote. This section keeps people opening the app daily even when there are no emergencies.

BOTTOM TAB BAR:
5 icon-only tabs in a frosted dark glass floating pill:
- Map icon (active/white — this is the current tab)
- Radar/broadcast icon (Nearby Activity)
- Bell icon (My Notifications)
- Hand-heart icon (Help)
- People icon (My Community)

The overall feel on a normal day: calm, informative, beautiful. Like a premium weather app crossed with a community pulse check. It should feel useful every single day — not just during emergencies.
```

---

## Screen 2: Left-Side Profile / Settings Menu (Slide-Out Panel)

```
Design the left-side slide-out settings panel that appears when the user taps their profile photo from any screen in the Beacon app. It slides in from the left edge, covering about 75-80% of the screen width, with the remaining right edge showing the dimmed main app behind it.

The panel has the same dark frosted glass aesthetic as the rest of the app.

Layout from top to bottom:

ROW 1 — Profile + Mesh Status:
- LEFT: User's profile photo (larger circle, ~60pt), next to it their name ("Kristin Mullaney") in Poppins SemiBold white
- RIGHT of the name: A small BeaconMesh icon (a mesh/network node icon). This icon is COLOR-CODED:
  - Green (#2D8B4E): Active — the user's device is actively routing data through the mesh network
  - Yellow (#E8B84E): Idle — the device is standing by as a repeater if needed (the user can control in mesh settings whether to allow all traffic or emergency-only traffic)
  - Red (#C0392B): Off — the device is not participating in mesh relay
  Currently showing yellow/idle state. Tappable to open mesh settings.

ROW 2 — Location:
- Current location text: "Riverside, CA" in Poppins Regular light gray
- To the right of the location text: a small map-pin/location icon that is tappable. Tapping opens options to:
  - Switch to another saved location (e.g., "Mom's House — Portland, OR", "Cabin — Lake Arrowhead, CA")
  - Browse the "World" page (global hazard overview)
  - Search for any specific location
- The location selector lets users monitor conditions anywhere, not just where they physically are

ROW 3 — Status (iChat-style):
- A status indicator inspired by classic iChat/AIM activity statuses
- Shows a colored dot + status text. Examples:
  - Green dot: "Available"
  - Yellow dot: "Busy"
  - Red dot: "Do Not Disturb"
  - Custom: "Evacuating to Mom's house" or "At the cabin this weekend"
- Tappable to change status. Status is visible to the user's team members.
- During emergencies this doubles as the check-in status: "Safe", "Evacuating", "Sheltering in Place", "Need Help"

DIVIDER LINE (subtle)

MENU ITEMS (vertical list, each row has an icon + label, tappable):
- My Household (family icon) — manage household members, dependents, pets
- My Vehicles & Equipment (truck icon) — registered vehicles, trailers, equipment (generator, chainsaw, boat, ATV)
- Emergency Plan (clipboard icon) — household emergency plan, go-bag checklist, important documents, evacuation routes
- My Teams (people icon) — list of teams with role and notification settings
- Notifications & Alerts (bell icon) — alert preferences, quiet hours, emergency override
- BeaconMesh Settings (mesh icon) — mesh participation level, emergency-only mode, battery optimization
- Accessibility (accessibility icon) — text size, high contrast, screen reader, one-handed mode
- Privacy & Location (shield icon) — location sharing controls, data visibility, who sees your check-in
- Account & Subscription (person icon) — account details, subscription tier, verification status
- Help & Support (question mark icon)
- Sign Out (door icon, at very bottom, muted)

The panel feels premium, organized, and not overwhelming. Icons are simple line style in light gray, text in Poppins. Sections that need attention (like an incomplete emergency plan) could show a subtle orange dot indicator.
```

---

## Screen 3: Map Layers Panel (Right-Side Slide-Out)

```
Design the right-side slide-out layers panel that appears when the user taps the layers icon on the top-right of the map. It slides in from the right edge, covering about 65-70% of the screen width.

Same dark frosted glass aesthetic. The panel contains toggleable layer checkboxes organized in collapsible sections:

Header: "Map Layers" in Poppins SemiBold, with an X close button on the left.

Section: "Weather" (collapsible, expanded by default)
- [ ] Weather Radar
- [ ] Temperature Overlay
- [ ] Wind Patterns
- [ ] Cloud Cover
- [ ] Lightning Strikes (live)

Section: "Hazards" (collapsible)
- [ ] Active Fire Perimeters
- [ ] Evacuation Zones
- [ ] Flood Zones
- [ ] Smoke / Air Quality
- [ ] Severe Weather Warnings
- [ ] Tsunami Warning Zones

Section: "Infrastructure" (collapsible)
- [ ] Road Closures
- [ ] Utility Outages (power, water, gas)
- [ ] Traffic Conditions
- [ ] Shelter Locations
- [ ] Hospital / ER Status

Section: "Community" (collapsible)
- [ ] Team Locations
- [ ] User Reports / Sightings
- [ ] Community Events
- [ ] Evacuation Convoys (active)

Section: "Terrain" (collapsible)
- [ ] Satellite Imagery
- [ ] Topographic Contours
- [ ] Vegetation / Fuel Type
- [ ] Flood Plains
- [ ] Fire History

Each toggle is a clean iOS-style switch. Active layers show their accent color. At the bottom: "Reset to Defaults" link in muted text.
```

---

## Screen 4: Nearby Activity Tab

```
Design the Nearby Activity tab — the second tab in the Beacon app. This is a Reddit-style feed of community postings, sightings, and map markings from people in the user's area.

Top-left: User's profile photo (persistent across all tabs)
Header: No text title — the tab icon in the tab bar indicates the current page. Instead, the top area shows a location label ("Riverside, CA area") and sort/filter controls.

Sort options (horizontal pills below location): "Trending" (default, most upvoted), "New", "Nearby", "Events"

THE FEED:
A vertically scrolling list of post cards. Each card has the Reddit-style structure:
- Left edge: Upvote/downvote arrows with vote count between them
- Post content area:
  - Author info: Username or "Anonymous", team badge if posted from a team, timestamp, distance ("0.4 mi away")
  - Post type badge: "Sighting", "Report", "Question", "Photo", "Event" — each with a distinct subtle color
  - Title/text of the post
  - Optional: photo thumbnail, map snippet showing tagged location
  - Comment count and share button at bottom

EXAMPLE POSTS (normal day):
1. [Sighting] "Beautiful double rainbow over the hills right now" — photo attached, 47 upvotes, 12 comments, 0.8mi away
2. [Report] "Construction on Main St blocking the right lane near 3rd Ave. Expect delays" — map pin attached, 23 upvotes, 3 comments, 0.2mi
3. [Question] "Anyone else's allergies going crazy today? Worse than usual" — 31 upvotes, 18 comments, area-wide
4. [Event] "Multiple reports: Smoke visible from the northeast" — this card has a special "Event" treatment: it's an auto-grouped cluster of 6 individual reports that users confirmed are about the same thing. Shows a consolidated map view of all sighting locations, a timeline of when reports came in, and the combined discussion thread. Orange border indicating potential hazard.
5. [Photo] "Coyote family spotted near Sycamore Park trail — keep your dogs leashed!" — photo, 89 upvotes, 24 comments, 1.1mi

EVENT GROUPING LOGIC (shown in the UI):
When multiple people post about the same thing (like smoke sightings), the system:
- Asks users "Is this related to [other post]?" with a simple yes/no
- Or users can suggest a merge by tapping "Same as..." on any post
- Once confirmed, posts merge into a single Event card with a consolidated view, timeline of sub-posts, and combined discussion
- Event cards get a special border treatment and are visually distinct from individual posts

Floating action button (bottom-right, above tab bar): "+" icon to create a new post — opens options for text post, photo post, map sighting/report

Bottom tab bar: Nearby Activity icon is active/white, all others muted.

The feel should be like a hyperlocal Reddit — casual, community-driven, conversational. On normal days people are sharing observations about weather, wildlife, traffic, local conditions. During emergencies the feed naturally fills with urgent reports that get grouped into events.
```

---

## Screen 5: Notifications Tab

```
Design the My Notifications tab — the third tab in the Beacon app. This is the user's personal notification inbox — alerts, team messages, and system notifications specifically for them.

Top-left: User's profile photo (persistent)

Segmented control at top: "All" | "Alerts" | "Teams" | "System"

THE NOTIFICATION LIST:
A chronological list (newest first) of notification cards. Each card shows:
- Left: Icon representing the notification type + colored severity/type indicator
- Main content: Source name, notification title, preview text, timestamp
- Right: Unread dot (if unread), or small action button

EXAMPLE NOTIFICATIONS:
1. ALERT (orange stripe): NWS verified badge — "Wind Advisory in effect until 6pm. Gusts up to 45mph expected." — 23 min ago
2. TEAM (blue stripe): Oakridge Neighborhood — "New announcement from admin: Emergency preparedness meeting Saturday 10am" — 1 hr ago
3. ALERT (yellow stripe): Riverside Electric (verified) — "Planned maintenance outage Thursday 8am-12pm in your area" — 3 hrs ago
4. TEAM (blue stripe): Mullaney Family — "Mom updated her status: At home" — 4 hrs ago
5. SYSTEM (gray stripe): Beacon — "Complete your emergency plan to get personalized evacuation routes" — 1 day ago
6. TEAM (blue stripe): Lincoln Elementary (followed) — "School closure tomorrow due to air quality" — 1 day ago

Each notification is tappable to expand details or navigate to the source (map, team, alert detail). Swipe actions: swipe left to dismiss, swipe right to save/bookmark.

During emergencies, critical alerts pin to the top of the list with a red banner and cannot be dismissed.

Bottom tab bar: Bell icon active/white.
```

---

## Screen 6: Help Tab (Normal Day)

```
Design the Help tab — the fourth tab in the Beacon app. This is the mutual aid coordination page where people give help, get help, and coordinate with strangers during emergencies.

Top-left: User's profile photo (persistent)

On a normal quiet day, the layout from top to bottom:

TWO PROMINENT BUTTONS:
- "Request Help" — pill-shaped, orange (#EA7928) background, white text, full width
- "Offer to Help" — pill-shaped, outlined style with white border, white text, full width

SECTION: "Nearby Requests"
Currently empty on a calm day. Shows a gentle empty state: a simple line illustration of hands reaching toward each other, with text: "All quiet nearby. No active help requests in your area." Subtle and reassuring, not clinical.

SECTION: "My Skills & Equipment"
A compact frosted glass card showing what the user has registered:
- Icons + labels: "4WD Vehicle", "First Aid Certified", "Generator", "Chainsaw"
- Small "Edit" button to update registrations
- If nothing registered yet, shows a prompt: "Register your skills and equipment so neighbors can find you when they need help"

SECTION: "Quick Reports"
A horizontal scrolling row of circular icon buttons for common reports:
- Report Fire/Smoke (flame icon)
- Report Flooding (water icon)
- Report Downed Line (lightning/wire icon)
- Report Hazard (warning triangle)
- Welfare Check (heart icon)
- Missing Person (person-search icon)

Bottom tab bar: Hand-heart icon active/white.

The tone is warm and community-oriented — "your neighbors have your back." Calm and preparedness-focused on quiet days.
```

---

## Screen 7: My Community Tab

```
Design the My Community tab — the fifth tab in the Beacon app. This is where users manage their teams, see team activity, and message team members.

Top-left: User's profile photo (persistent)
Top-right: Search icon, compose/new message icon

SECTION: "My Teams"
A horizontal scrolling row of circular team avatars with the team name below each. Each avatar has a subtle role indicator:
- "Mullaney Family" (house icon, "Member" badge)
- "Oakridge Neighborhood" (tree icon, "Member" badge)
- "Lincoln Elementary" (school icon, "Following" badge — different visual treatment since user is a follower, not a member)
- "Riverside Fire Dept" (fire icon, "Following" badge)
- "+" circle at the end to create or join a new team
Tapping a team opens the team detail/chat view.

SECTION: "Recent Activity"
A vertical feed of recent posts from the user's teams. Each post card shows:
- Team icon + team name at top
- "Announcement" badge (orange, from admins — visible to followers too) or "Member Post" badge (blue, members only)
- Author name
- Post content (text, sometimes with an attached image or map snippet)
- Timestamp
- Reply count, reaction icons

EXAMPLE POSTS:
1. ANNOUNCEMENT from "Oakridge Neighborhood": Admin posted "Reminder: preparedness meeting Saturday at the park pavilion, 10am." — 2 hrs ago, 4 replies
2. MEMBER POST from "Mullaney Family": "Mom checked in: Safe, at home" — 3 hrs ago
3. ANNOUNCEMENT from "Riverside Fire Dept" (following): "Prescribed burn north ridge Thursday. Expect smoke, no action needed." — 6 hrs ago, 12 replies
4. MEMBER POST from "Oakridge Neighborhood": "Does anyone have a ladder I can borrow this weekend?" — 8 hrs ago, 7 replies

Bottom tab bar: People icon active/white.

The feel is like a clean group messaging interface — WhatsApp Communities or Discord channels but purpose-built for safety, with the Beacon dark glass aesthetic. Familiar and social.
```

---

## Consistency Prompt (Apply After Every 2-3 Screens)

```
Unify all selected screens with these exact specifications:
- Bottom tab bar: 5 icon-only tabs in a frosted dark glass floating pill shape, high corner radius. Active icon is white, inactive icons are muted gray (#6B7280). Same height and position across all screens.
- User profile photo: Small circle (~36pt) in top-left corner, persistent on every screen, same size and position
- Background: Dark navy gradient (#0D1117 to #1A2332)
- Cards/containers: Frosted glass effect — semi-transparent dark backgrounds with subtle blur and layered shadows, very high corner radius (pill-shaped)
- Typography: Poppins throughout (Light for body, Regular for labels, SemiBold for headings). White for primary text, #B0B8C4 for secondary
- Buttons: Primary = orange (#EA7928) pill with white text. Secondary = outlined white pill
- Consistent spacing rhythm: 16px between elements, 24px between sections
- All interactive elements: minimum 44pt touch targets
- Status/severity colors consistent: Red (#C0392B) = critical/danger, Orange (#EA7928) = warning/action, Yellow (#E8B84E) = caution/advisory, Green (#2D8B4E) = safe/good, Blue (#3881B8) = info/team, Gray = neutral/system
- The 3D iOS depth feel: elements float above the background, pressable and tactile, shadows create depth hierarchy
```

---

## Follow-Up Prompts for Secondary Screens

After generating the core screens above, use these to add detail screens:

```
"Generate the time scrubber interface — when the user holds the play button on the map and scrubs clockwise/counterclockwise, show the timestamp overlay and how the map layers animate through time"

"Generate the + report flow from the map — the menu that appears when tapping + on the bottom-right of the map, then the report submission form with photo upload, location tagging, and category selection"

"Generate the Event detail view from the Nearby Activity tab — a consolidated event card expanded into a full screen showing the merged timeline of reports, the map with all sighting pins, and the combined discussion thread"

"Generate the team detail view when tapping a team from My Community — show the team chat, members list, team map boundary, announcements vs discussion tabs, and the followers vs members distinction"

"Generate the onboarding flow — 3 screens: welcome with Beacon phoenix logo, set up household (add family members, pets, vehicles), select your location and notification preferences"

"Generate the emergency state transformation — take the normal-day map screen and show how it changes when an evacuation warning is issued: the alert banner, evacuation zones lighting up, shelter pins appearing, the Emergency Actions floating button"

"Generate the location switcher dropdown that appears when tapping the location icon in the left-side settings panel — showing saved locations, world view option, and search bar"
```

---

## Font Reference

| Usage | Font | Weight | License | Notes |
|-------|------|--------|---------|-------|
| Logo "Beacon" | Nunito Sans (or Avenir if licensed) | Bold | OFL (Nunito Sans) / Monotype license (Avenir) | Closest free geometric sans match to Avenir |
| All UI text | Poppins | Light/Regular/Medium/SemiBold/Bold | SIL Open Font License (OFL) — free for commercial use | Google Font, widely supported |
| Field labels | Poppins | Regular, UPPERCASE, letterspaced | Same | Matches login mockup style |

## Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0D1117 | Base background gradient start |
| Background Light | #1A2332 | Base background gradient end |
| Primary Text | #FFFFFF | Headings, active elements |
| Secondary Text | #B0B8C4 | Labels, descriptions, muted text |
| Input/Card Background | #FFFFFF (or frosted semi-transparent) | Input fields, light cards |
| Input Text | #2C2C2C | Text inside white input fields |
| Flame Orange | #EA7928 | Primary CTA, alerts, warnings, logo accent |
| Purple | #B829FC | Logo accent, special highlights |
| Steel Blue | #3881B8 | Logo accent, info/team color |
| Deep Purple | #50386A | Logo accent, depth tones |
| Safe Green | #2D8B4E | Safe status, good conditions, active mesh |
| Warning Yellow | #E8B84E | Caution, advisory, idle mesh |
| Danger Red | #C0392B | Critical, danger, mesh off |
| Muted Gray | #6B7280 | Inactive tabs, disabled elements |
