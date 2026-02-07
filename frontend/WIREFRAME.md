# THE CUTTING ROOM — Full Wireframe Breakdown

> This document provides a complete analysis of every page, popup, and UI element in the wireframe, along with navigation flow and routing instructions for implementation.

---

## Table of Contents

1. [Wireframe Overview & Navigation Map](#wireframe-overview--navigation-map)
2. [Page 1 — Landing Page (Hero)](#page-1--landing-page-hero)
3. [Popup — Welcome / Sign-In Modal](#popup--welcome--sign-in-modal)
4. [Component — Sidebar Menu](#component--sidebar-menu)
5. [Page 2 — New Track (This Week's Storyline — Grid View)](#page-2--new-track-this-weeks-storyline--grid-view)
6. [Page 3 — New Track (Expanded Story View)](#page-3--new-track-expanded-story-view)
7. [Popup — Daily Update Notification](#popup--daily-update-notification)
8. [Page 4 — Finish Track (Past Week's Storyline)](#page-4--finish-track-past-weeks-storyline)
9. [Page 5 — Story Reading Page (Left Unfinished / Recap)](#page-5--story-reading-page-left-unfinished--recap)
10. [Page 6 — The Cutting Room (Community/Explore)](#page-6--the-cutting-room-community--explore)
11. [Page 7 — Owner / Friends' Profile](#page-7--owner--friends-profile)
12. [Page 8 — View Specific Track](#page-8--view-specific-track)
13. [Page 9 — Friends List](#page-9--friends-list)
14. [Page 10 — Account Owner Monthly Track (Showcase)](#page-10--account-owner-monthly-track-showcase)
15. [Routing Plan & Page Linking](#routing-plan--page-linking)
16. [Component Inventory](#component-inventory)
17. [State Management Notes](#state-management-notes)

---

## Wireframe Overview & Navigation Map

The wireframe describes a multi-page storytelling application with the following high-level flow:

```
Landing Page (Hero)
    │
    ├──→ Welcome/Sign-In Modal (popup)
    │        │
    │        └──→ (after auth) → New Track Page
    │
    ├──→ Sidebar Menu (slide-in overlay)
    │        │
    │        ├──→ Cutting Room (Home/Explore)
    │        ├──→ New Track
    │        ├──→ My Tracks
    │        ├──→ Friends
    │        └──→ Sign Out
    │
    └──→ CTA Button ("Let your story begins here →")
             │
             └──→ New Track Page (or Sign-In if not authed)

New Track Page (Grid View)
    │
    ├──→ Expanded Story View (click on a Pic card)
    │        │
    │        └──→ Daily Update Notification (popup/toast)
    │
    ├──→ Finish Track (past week's storyline)
    │
    └──→ scroll bar (horizontal scroll for more entries)

Story Reading Page (Recap / "Left Unfinished")
    │
    ├──→ scroll content
    └──→ links to The Cutting Room (Community/Explore)

The Cutting Room (Community/Explore)
    │
    ├──→ Featured/random creative content
    ├──→ scroll to discover
    └──→ links to specific tracks

Owner / Friends' Profile
    │
    ├──→ View Specific Track detail page
    │        │
    │        ├──→ upvote / downvote / comment / share
    │        └──→ (for own track only — edit)
    │
    └──→ Account Owner Monthly Track (Showcase)

Friends List
    │
    ├──→ Friend cards → Friend Profile
    └──→ scroll / pagination
```

---

## Page 1 — Landing Page (Hero)

**Route:** `/`  
**Status:** ✅ Already implemented (`src/pages/LandingPage.tsx`)

### Description
The landing page is the grand entrance to the app. It has a dark, cinematic aesthetic with a film/cutting-room theme.

### Elements (Top to Bottom)
| Element | Description |
|---------|-------------|
| **Header Bar** | Contains hamburger menu (☰) on the left, "The Cutting Room" brand text center-left, and a "Sign In" button on the right. The header is persistent across pages. |
| **Scissors Icon** | Decorative scissors icon reinforcing the "cutting room" metaphor, positioned near the top. |
| **Hero Title** | Large display text: **"The Cutting Room"** — bold, dramatic, centered. Uses a handwriting/artistic font style. |
| **Tagline Block** | Subtitle text: *"Impressionism – Realism"* followed by *"Where random moments strikes into untold narrative masterpieces..."*. Smaller, lighter text below the hero title. |
| **CTA Button** | Gradient button: **"Let your story begins here →"**. Clicking navigates to the story/track page (or triggers sign-in if not authenticated). |
| **Wavy Footer** | Decorative wavy SVG divider at the bottom of the page. |
| **Decorative Lines** | Hand-drawn style decorative line elements scattered on the page for visual texture. |

### Navigation Outbound
- **Hamburger Menu (☰)** → Opens Sidebar Menu (overlay)
- **Sign In button** → Opens Welcome/Sign-In Modal (popup)
- **CTA Button** → Navigates to `/story` (New Track page) — should check auth first

---

## Popup — Welcome / Sign-In Modal

**Route:** N/A (modal overlay on current page)  
**Status:** ❌ Not yet implemented

### Description
A modal popup that appears when the user clicks "Sign In" from the header. It has a clean, lighter design contrasting with the dark page behind it.

### Elements
| Element | Description |
|---------|-------------|
| **Modal Title** | **"Welcome!"** in large bold text at the top. |
| **Subtitle** | *"Gain Access to Your Personalized Visual Narrative"* — explains the purpose of signing in. |
| **Username Field** | Text input labeled "Username:" with a dark input box. |
| **Password Field** | Text input labeled "Password:" with a dark input box. |
| **Submit Button** | Primary action button to log in. |
| **Close/X Button** | Top-right corner close button to dismiss the modal. |
| **Backdrop** | Semi-transparent dark overlay behind the modal. |

### Behavior
- On successful login → navigate to `/story` (New Track page), store auth state
- On close → return to landing page
- Future: could add "Sign Up" link/tab, "Forgot Password" link, or OAuth buttons

### Navigation Outbound
- **Submit (success)** → Redirect to `/story` (first sentence pinned)
- **Close** → Dismiss modal, stay on current page

---

## Component — Sidebar Menu

**Route:** N/A (slide-in overlay)  
**Status:** ✅ Already implemented (`src/components/SidebarMenu/SidebarMenu.tsx`)

### Description
A slide-in menu panel from the left side of the screen, triggered by the hamburger icon. It provides global navigation across the app.

### Elements
| Element | Description |
|---------|-------------|
| **Brand Title** | "Cutting Room" heading at the top of the sidebar. |
| **Navigation Links** | Vertical list of links: |
| | — **Cutting Room** (Home/Explore) → `/` or `/explore` |
| | — **New Track** → `/story` |
| | — **My Tracks** → `/tracks` |
| | — **Friends** → `/friends` |
| **Sign Out Button** | At the bottom: signs the user out and redirects to landing page. |
| **Close Area / Overlay** | Clicking outside the menu (on the dark overlay) closes it. |

### Navigation Outbound
- **Cutting Room** → `/` or `/explore`
- **New Track** → `/story`
- **My Tracks** → `/tracks`
- **Friends** → `/friends`
- **Sign Out** → Clear auth → `/`

---

## Page 2 — New Track (This Week's Storyline — Grid View)

**Route:** `/story`  
**Status:** 🟡 Partially implemented (`src/pages/StoryPage.tsx`)

### Description
This is the main content creation page. It shows this week's storyline as a grid/collage of picture cards. The wireframe labels this "This week's storyline" with individual picture entries (Pic #01, Pic #02, etc.). It has a dark background consistent with the app's aesthetic.

### Elements
| Element | Description |
|---------|-------------|
| **Header Bar** | Same persistent header with hamburger menu and brand name. No "Sign In" button (user is authenticated). |
| **Page Title** | **"This week's storyline"** — section heading indicating the current week's track. |
| **Picture Cards Grid** | A grid/masonry layout of content cards. Each card shows: |
| | — Card label (e.g., "Pic #01", "Pic #02", "Pic #03") |
| | — Thumbnail image preview |
| | — Short text/caption snippet |
| | — Cards are interactive (clickable to expand) |
| **Empty Card Slots** | Marked with "???" — placeholder slots where the user can add new content. Clicking these should trigger the Upload Modal. |
| **Scroll Bar** | Horizontal or vertical scroll indicator — the content extends beyond the viewport. Wireframe annotation says "scroll bar" in red, indicating scrollable content area. |
| **Upload Button** | Fixed position button (bottom-right in current implementation) showing remaining pics count (e.g., "7/10 left"). Opens the Upload Modal. |
| **"First sentence pinned"** | Red annotation in wireframe indicates the first sentence/recap is pinned at the top of the storyline view. |

### Navigation Outbound
- **Click a Pic Card** → Navigate to Expanded Story View (Page 3) or expand in-place
- **Click "???" empty slot** → Open Upload Modal
- **Upload Button** → Open Upload Modal
- **Hamburger Menu** → Sidebar Menu
- **"Finish Track"** label/button → Navigate to `/finish-track` (Past Week's Storyline)

---

## Page 3 — New Track (Expanded Story View)

**Route:** `/story/:trackId` or expanded view within `/story`  
**Status:** ❌ Not yet implemented

### Description
When a user clicks on a specific picture card from the grid view, it expands into a detailed story view. The wireframe shows this as a separate panel with the full content visible, including generated text/recap.

### Elements
| Element | Description |
|---------|-------------|
| **Header Bar** | Same persistent header. |
| **Page Title** | **"This week's storyline"** — same as grid view, but now showing expanded content. |
| **Expanded Content Cards** | Cards now show: |
| | — Full-size image (Pic #01, Pic #04 visible in wireframe) |
| | — Full narrative text / recap paragraph alongside or below the image |
| | — The layout is more reading-focused: image + text side by side |
| **Empty Slots** | Still showing "???" for unfilled entries — user can continue adding. |
| **Scroll Bar** | Vertical scroll to read through the full storyline content. Red "scroll bar" annotation. |
| **Navigation Controls** | Ability to go back to grid view or to next/previous entries. |

### Navigation Outbound
- **Back** → Return to Grid View (Page 2)
- **Click "???"** → Upload Modal
- **Hamburger Menu** → Sidebar Menu

---

## Popup — Daily Update Notification

**Route:** N/A (toast/notification popup)  
**Status:** ❌ Not yet implemented

### Description
A small notification card/popup that appears (likely on the right side of the screen) showing daily update information. The wireframe shows it with a clean, lighter background.

### Elements
| Element | Description |
|---------|-------------|
| **Title** | **"Daily update!"** or similar heading. |
| **Overview Info** | Brief summary: |
| | — Number of friends active |
| | — Preview of content posted today |
| **Timestamp** | When the update was generated (e.g., "Updated 15 min ago"). |
| **Dismiss** | Close button or auto-dismiss after a few seconds. |

### Behavior
- Appears automatically when user opens the app or at a scheduled time
- Can be dismissed
- Clicking may navigate to the relevant content

---

## Page 4 — Finish Track (Past Week's Storyline)

**Route:** `/finish-track` or `/tracks/past`  
**Status:** ❌ Not yet implemented

### Description
Shows the previous/past week's storyline that is already completed or ready to be "finished." The wireframe labels it "Past week's storyline" and shows it in a similar card grid format but with different entries (Pic #09, Pic #10 visible).

### Elements
| Element | Description |
|---------|-------------|
| **Header Bar** | Same persistent header. |
| **Page Title** | **"Past week's storyline"** — indicating this is a completed/finishing track. |
| **Picture Cards** | Similar grid to the New Track page but showing completed entries: |
| | — Pic #09, Pic #10 visible in wireframe |
| | — Each with image + caption/text |
| **Empty Slots** | Some "???" slots may still exist if the user didn't fill the week. |
| **Scroll Bar** | Horizontal/vertical scroll for content. Red "scroll bar" annotation. |
| **"Finish Track" Action** | A button or interaction to finalize/close this week's track, triggering the weekly story generation. |

### Navigation Outbound
- **Finish action** → Triggers story generation → redirects to Story Reading Page (Page 5)
- **Hamburger Menu** → Sidebar Menu
- **Back** → Return to New Track (Page 2)

---

## Page 5 — Story Reading Page (Left Unfinished / Recap)

**Route:** `/story/recap` or `/tracks/:trackId/recap`  
**Status:** ❌ Not yet implemented

### Description
A full reading experience page that presents the AI-generated narrative for the user's track. The wireframe shows two variants side by side:

### Variant A — "Listening to what you left unfinished..."
The left panel in the wireframe. This appears when a user has an incomplete track from a previous week.

| Element | Description |
|---------|-------------|
| **Title** | **"Listening to what you left unfinished..."** — artistic, handwritten style heading with scissors icon. |
| **Narrative Text** | A full paragraph of AI-generated narrative text. The wireframe shows placeholder text describing reflective, poetic content about the user's posts. |
| **"Please Reading" Label** | Annotation encouraging the user to read through the content. |
| **Scroll** | Red "scroll" annotation — content is scrollable vertically. |

### Variant B — "The Cutting Room" Recap
The right panel in the wireframe. This is the polished weekly recap.

| Element | Description |
|---------|-------------|
| **Title** | **"The Cutting Room"** with scissors icon — styled as a masthead. |
| **Subtitle** | *"Impressionism – Realism"* — same tagline as landing page. |
| **Recap Content** | Description: *"Where random moments strikes into untold narrative and personal experiences"*. |
| **Action Buttons** | Red-annotated buttons/links — possibly "Read More", "Share", or navigation actions. |
| **Scroll** | Scrollable content. |

### Navigation Outbound
- **Continue / Next** → Navigate to Explore/Community page (Page 6)
- **Back** → Return to tracks list
- **Hamburger Menu** → Sidebar Menu

---

## Page 6 — The Cutting Room (Community / Explore)

**Route:** `/explore` or `/cutting-room`  
**Status:** ❌ Not yet implemented

### Description
This is the community/discovery page where users can explore tracks and stories from other people. The wireframe mentions "The Cutting Room" as a hub for exploring content. This page is referenced from the sidebar menu as "Cutting Room."

Based on the wireframe flow, this page connects to:
- Specific tracks from the community
- Friend profiles
- Showcased/featured content

### Elements
| Element | Description |
|---------|-------------|
| **Header Bar** | Persistent header with navigation. |
| **Featured Content** | Highlighted or curated stories from the community. |
| **Discovery Feed** | Cards showing other users' completed tracks. |
| **Search/Filter** | Potential search or filter mechanism. |

### Navigation Outbound
- **Click a track** → View Specific Track (Page 8)
- **Click a user** → Owner/Friends' Profile (Page 7)
- **Hamburger Menu** → Sidebar Menu

---

## Page 7 — Owner / Friends' Profile

**Route:** `/profile/:userId` or `/profile`  
**Status:** ❌ Not yet implemented

### Description
The profile page for viewing a user's (own or friend's) profile. The wireframe labels this "Owner / Friends' Profile" in red annotation. It has a clean, lighter design with structured layout.

### Elements
| Element | Description |
|---------|-------------|
| **Profile Header** | User information section at the top: |
| | — Username / display name |
| | — Profile picture / avatar |
| | — Bio or status text |
| | — Stats (e.g., number of tracks, friends count) |
| **Navigation Tabs** | Tab bar with sections: |
| | — "Disconnected Profile" (main profile info) |
| | — Possibly tabs for different content views |
| **Track Thumbnails** | Grid of track preview cards (C1, C2, C3, C4 in wireframe) — small square thumbnails representing completed tracks. |
| **Scrollable Area** | The profile content scrolls vertically. |

### Navigation Outbound
- **Click a Track Thumbnail (C1, C2, etc.)** → View Specific Track (Page 8)
- **Hamburger Menu** → Sidebar Menu
- **Back** → Previous page

---

## Page 8 — View Specific Track

**Route:** `/tracks/:trackId`  
**Status:** ❌ Not yet implemented

### Description
A detailed view of a specific completed track. The wireframe labels this "View specific track" in red annotation. It shows a split-view with visuals on one side and written content on the other.

### Elements
| Element | Description |
|---------|-------------|
| **Header Bar** | Persistent header. |
| **Tab Navigation** | Two tabs at the top: |
| | — **"Visuals"** — Shows the images/photos from the track |
| | — **"Lyrics"** (or text/narrative) — Shows the written narrative content |
| **Visual Content** | When "Visuals" tab is active: grid or carousel of the track's images. |
| **Text Content** | When "Lyrics" tab is active: the AI-generated narrative story. |
| **Interaction Bar** | Bottom section with social interactions: |
| | — ⬆ Upvote |
| | — ⬇ Downvote |
| | — 💬 Comment |
| | — 🔗 Share (share track) |
| | — ✏️ Edit (for own tracks only) |
| **Red Annotations** | Wireframe notes: *"can upvote/downvote/comment/share/tracks"* and *"for your track only"* (for edit). |

### Navigation Outbound
- **Back** → Return to Profile (Page 7) or Explore (Page 6)
- **Comment** → Opens comment section/modal
- **Share** → Share dialog
- **Edit** → Edit track mode (own tracks only)
- **Hamburger Menu** → Sidebar Menu

---

## Page 9 — Friends List

**Route:** `/friends`  
**Status:** ❌ Not yet implemented

### Description
A page listing the user's friends (max 40 per app constraints). The wireframe shows a grid of friend cards with profile thumbnails.

### Elements
| Element | Description |
|---------|-------------|
| **Header Bar** | Persistent header. |
| **Title** | The page heading area. |
| **Tab Navigation** | Two tabs: |
| | — **"My Friends"** — Current friends list |
| | — Another tab (possibly "Requests" or "Find Friends") |
| **Friend Cards Grid** | Grid layout of friend cards: |
| | — Each card shows a profile thumbnail image (F1, F2, F3, F4 in wireframe — first row) |
| | — Second row: F5, F6 and more |
| | — Cards are clickable to visit that friend's profile |
| **Scroll / Pagination** | Content scrolls or paginates for users with many friends. |
| **Add Friend Button** | Action to search/add new friends. |
| **Wavy Footer** | Decorative wavy divider at the bottom (same as landing page style). |

### Navigation Outbound
- **Click a Friend Card (F1, F2, etc.)** → Navigate to Friend's Profile (Page 7)
- **Add Friend** → Search/invite modal
- **Hamburger Menu** → Sidebar Menu

---

## Page 10 — Account Owner Monthly Track (Showcase)

**Route:** `/tracks/monthly` or `/tracks/showcase`  
**Status:** ❌ Not yet implemented

### Description
A showcase view of the account owner's monthly tracks. The wireframe labels this "Account Owner Monthly Track" in red. It presents a horizontal carousel or grid of featured tracks.

### Elements
| Element | Description |
|---------|-------------|
| **Header Area** | Title: **"Showcase Tracks"** or similar. |
| **Track Tabs/Filter** | Navigation tabs to filter by time period or category. |
| **Track Cards Carousel** | Horizontal scrolling row of track preview cards: |
| | — V1, V2, V3, V4 (in wireframe) — representing different archived tracks |
| | — Each card shows a thumbnail + track title/date |
| **Scroll Arrow** | Right arrow indicating more tracks to scroll through. |

### Navigation Outbound
- **Click a Track Card (V1, V2, etc.)** → View Specific Track (Page 8)
- **Hamburger Menu** → Sidebar Menu
- **Back** → Profile (Page 7)

---

## Routing Plan & Page Linking

### Route Definitions

Below is the complete routing table for the application. Add these routes to `App.tsx`:

```
Route Path                  Component              Auth Required?
─────────────────────────────────────────────────────────────────
/                           LandingPage             No
/story                      StoryPage (New Track)   Yes
/story/:trackId             ExpandedStoryView       Yes
/story/recap                StoryRecapPage          Yes
/tracks                     MyTracksPage            Yes
/tracks/monthly             MonthlyShowcasePage     Yes
/tracks/:trackId            ViewTrackPage           Yes
/tracks/:trackId/recap      TrackRecapPage          Yes
/finish-track               FinishTrackPage         Yes
/explore                    ExplorePage             Yes
/profile                    ProfilePage (own)       Yes
/profile/:userId            ProfilePage (other)     Yes
/friends                    FriendsPage             Yes
```

### Updated App.tsx Route Structure

```tsx
<BrowserRouter>
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />

    {/* Authenticated */}
    <Route path="/story" element={<StoryPage />} />
    <Route path="/story/:trackId" element={<ExpandedStoryView />} />
    <Route path="/story/recap" element={<StoryRecapPage />} />
    <Route path="/finish-track" element={<FinishTrackPage />} />
    <Route path="/tracks" element={<MyTracksPage />} />
    <Route path="/tracks/monthly" element={<MonthlyShowcasePage />} />
    <Route path="/tracks/:trackId" element={<ViewTrackPage />} />
    <Route path="/tracks/:trackId/recap" element={<TrackRecapPage />} />
    <Route path="/explore" element={<ExplorePage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/profile/:userId" element={<ProfilePage />} />
    <Route path="/friends" element={<FriendsPage />} />
  </Routes>
</BrowserRouter>
```

### Navigation Flow (Step by Step)

#### Flow 1: First-Time User
1. User lands on **Landing Page** (`/`)
2. User clicks **"Sign In"** → **Welcome Modal** appears
3. User enters credentials → submits → auth state saved
4. Redirect to **New Track** (`/story`) — "first sentence pinned"
5. User sees this week's storyline grid with empty "???" slots

#### Flow 2: Creating Content
1. User is on **New Track** (`/story`)
2. User clicks an empty "???" slot or the **Upload Button**
3. **Upload Modal** appears — user selects image, adds caption
4. User saves → card appears in the grid
5. Repeat up to 3 nodes per day (7-10 per week)
6. User can click any filled card → **Expanded Story View** (read narrative)

#### Flow 3: Finishing a Track
1. User navigates to **Finish Track** (`/finish-track`) from sidebar or in-page link
2. User reviews past week's content (Pic #09, #10, etc.)
3. User clicks "Finish" → system generates weekly story
4. Redirect to **Story Reading Page** (`/story/recap`)
5. User reads AI-generated narrative

#### Flow 4: Exploring Community
1. User opens **Sidebar Menu** → clicks "Cutting Room"
2. Navigates to **Explore** (`/explore`)
3. Discovers other users' tracks
4. Clicks a track → **View Specific Track** (`/tracks/:trackId`)
5. Can upvote, downvote, comment, share

#### Flow 5: Viewing Profiles & Friends
1. User opens **Sidebar Menu** → clicks "Friends"
2. Navigates to **Friends List** (`/friends`)
3. Clicks a friend card → **Friend's Profile** (`/profile/:userId`)
4. Sees friend's track thumbnails (C1, C2, C3, C4)
5. Clicks a track → **View Specific Track** (`/tracks/:trackId`)

#### Flow 6: Monthly Showcase
1. User goes to their own **Profile** (`/profile`)
2. Scrolls down to monthly section or clicks a link
3. Navigates to **Monthly Showcase** (`/tracks/monthly`)
4. Horizontal carousel of past tracks (V1, V2, V3, V4)
5. Clicks a track → **View Specific Track** (`/tracks/:trackId`)

---

## Component Inventory

### Shared / Global Components

| Component | File | Used On | Status |
|-----------|------|---------|--------|
| Header | `components/Header/Header.tsx` | All pages | ✅ Built |
| SidebarMenu | `components/SidebarMenu/SidebarMenu.tsx` | All pages (overlay) | ✅ Built |
| UploadModal | `components/UploadModal/UploadModal.tsx` | StoryPage | ✅ Built |
| CardImage | `components/CardStack/CardImage.tsx` | StoryPage | ✅ Built |
| CardStack | `components/CardStack/CardStack.tsx` | StoryPage | ✅ Built |
| RecapColumn | `components/RecapColumn/RecapColumn.tsx` | StoryPage | ✅ Built |
| Marquee | `components/Marquee/Marquee.tsx` | Various | ✅ Built |
| TwoColumnLayout | `components/Layout/TwoColumnLayout.tsx` | Various | ✅ Built |

### New Components Needed

| Component | Used On | Description |
|-----------|---------|-------------|
| **SignInModal** | Landing Page | Username/password login form in a modal |
| **AuthGuard** | Wraps authenticated routes | Redirects to `/` if not logged in |
| **PictureCard** | New Track, Finish Track | Single content card showing image + caption + label |
| **EmptySlot** | New Track, Finish Track | Clickable "???" placeholder that opens upload |
| **ContentGrid** | New Track, Finish Track | Masonry/grid layout for picture cards |
| **StoryReader** | Story Reading Page | Full-width narrative reading component |
| **DailyUpdateToast** | Global (toast) | Small notification popup for daily updates |
| **ProfileHeader** | Profile Page | Avatar, username, bio, stats |
| **TrackThumbnail** | Profile, Explore | Small clickable track preview card |
| **TrackViewer** | View Track Page | Tabbed view (Visuals / Lyrics) |
| **InteractionBar** | View Track Page | Upvote, downvote, comment, share buttons |
| **FriendCard** | Friends Page | Card with profile thumbnail, clickable |
| **TrackCarousel** | Monthly Showcase | Horizontal scrolling track cards |
| **TabBar** | Track Viewer, Profile, Friends | Reusable tab navigation component |
| **WavyDivider** | Multiple pages | Reusable wavy SVG footer/divider |

---

## State Management Notes

### Zustand Store Expansion

The current `scrollStore.ts` handles scroll state. Additional stores needed:

```
Store              Purpose
─────────────────────────────────────────────
authStore          User authentication state (user, token, isAuth)
trackStore         Current track data, nodes, track list
profileStore       User profile data, friend profiles
friendsStore       Friends list, friend requests
notificationStore  Daily update notifications, toasts
uploadStore        Upload state, progress, remaining count
```

### Key State Shapes

```typescript
// authStore
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

// trackStore
interface TrackState {
  currentTrack: Track | null
  pastTracks: Track[]
  communityTracks: Track[]
  selectedTrack: Track | null
  createNode: (node: NodeInput) => Promise<void>
  finishTrack: () => Promise<void>
}
```

---

## File Structure (Proposed)

```
src/
├── App.tsx                          # Router with all routes
├── main.tsx                         # Entry point
│
├── components/
│   ├── Header/Header.tsx            ✅ exists
│   ├── SidebarMenu/SidebarMenu.tsx  ✅ exists
│   ├── UploadModal/UploadModal.tsx  ✅ exists
│   ├── CardStack/                   ✅ exists
│   ├── RecapColumn/                 ✅ exists
│   ├── Marquee/                     ✅ exists
│   ├── Layout/                      ✅ exists
│   │
│   ├── SignInModal/SignInModal.tsx       ❌ NEW
│   ├── AuthGuard/AuthGuard.tsx          ❌ NEW
│   ├── PictureCard/PictureCard.tsx      ❌ NEW
│   ├── EmptySlot/EmptySlot.tsx          ❌ NEW
│   ├── ContentGrid/ContentGrid.tsx      ❌ NEW
│   ├── StoryReader/StoryReader.tsx      ❌ NEW
│   ├── DailyUpdateToast/Toast.tsx       ❌ NEW
│   ├── ProfileHeader/ProfileHeader.tsx  ❌ NEW
│   ├── TrackThumbnail/TrackThumbnail.tsx ❌ NEW
│   ├── TrackViewer/TrackViewer.tsx       ❌ NEW
│   ├── InteractionBar/InteractionBar.tsx ❌ NEW
│   ├── FriendCard/FriendCard.tsx         ❌ NEW
│   ├── TrackCarousel/TrackCarousel.tsx   ❌ NEW
│   ├── TabBar/TabBar.tsx                 ❌ NEW
│   └── WavyDivider/WavyDivider.tsx      ❌ NEW
│
├── pages/
│   ├── LandingPage.tsx              ✅ exists
│   ├── StoryPage.tsx                ✅ exists (needs expansion)
│   │
│   ├── ExpandedStoryView.tsx        ❌ NEW
│   ├── FinishTrackPage.tsx          ❌ NEW
│   ├── StoryRecapPage.tsx           ❌ NEW
│   ├── MyTracksPage.tsx             ❌ NEW
│   ├── MonthlyShowcasePage.tsx      ❌ NEW
│   ├── ViewTrackPage.tsx            ❌ NEW
│   ├── ExplorePage.tsx              ❌ NEW
│   ├── ProfilePage.tsx              ❌ NEW
│   └── FriendsPage.tsx              ❌ NEW
│
├── store/
│   ├── scrollStore.ts               ✅ exists
│   ├── authStore.ts                 ❌ NEW
│   ├── trackStore.ts                ❌ NEW
│   ├── profileStore.ts             ❌ NEW
│   ├── friendsStore.ts             ❌ NEW
│   └── notificationStore.ts        ❌ NEW
│
├── types/
│   └── index.ts                     ✅ exists (needs expansion)
│
├── data/
│   ├── storyContent.ts              ✅ exists
│   ├── cardImages.ts                ✅ exists
│   └── recapContent.ts              ✅ exists
│
└── styles/
    ├── index.css                    ✅ exists
    └── fluid-type-scale.css         ✅ exists
```

---

## Implementation Priority Order

Based on the wireframe's flow and dependencies:

| Priority | Page/Component | Why |
|----------|---------------|-----|
| 1 | SignInModal + authStore | Gate for all authenticated pages |
| 2 | AuthGuard wrapper | Protect routes |
| 3 | StoryPage enhancements (ContentGrid, PictureCard, EmptySlot) | Core feature |
| 4 | UploadModal integration | Content creation loop |
| 5 | ExpandedStoryView | Reading experience for single entries |
| 6 | FinishTrackPage | Week completion flow |
| 7 | StoryRecapPage (StoryReader) | AI narrative reading |
| 8 | ProfilePage (ProfileHeader, TrackThumbnail) | User identity |
| 9 | ViewTrackPage (TrackViewer, InteractionBar, TabBar) | Social engagement |
| 10 | FriendsPage (FriendCard) | Social connections |
| 11 | ExplorePage | Community discovery |
| 12 | MonthlyShowcasePage (TrackCarousel) | Archival feature |
| 13 | DailyUpdateToast | Notifications |

---

## Design Tokens & Visual Notes from Wireframe

| Aspect | Description |
|--------|-------------|
| **Color Scheme** | Predominantly dark backgrounds (near-black), white/cream text, gradient accent buttons |
| **Typography** | Handwritten/artistic font for headings, clean sans-serif for body text |
| **Card Style** | Dark cards with subtle borders, rounded corners, image + text content |
| **Icons** | Scissors icon (✂) is the app's signature motif — appears on headers, story pages |
| **Layout** | Mix of grid layouts (content cards) and full-width reading layouts (story/recap) |
| **Animations** | Framer Motion for page transitions, card reveals, sidebar slide-in |
| **Footer** | Wavy SVG dividers used as decorative section separators |
| **Responsive** | Mobile-first indicated by the sidebar menu pattern and scrollable content |
