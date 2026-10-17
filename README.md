# DayFlow — Routine & Google Calendar Planner

> A high-performance daily routine manager and 1-click Google Calendar synchronization system designed for students, engineers, and focused professionals.

---

## 🌟 Overview

**DayFlow** transforms an optimal daily routine into an interactive schedule manager and synchronized Google Calendar experience. It enforces time-blocking best practices:
- **Peak Cognitive Deep Work First**: 4 hours of dedicated deep work split across 2 morning blocks.
- **Automated 10-Minute Notifications**: Pre-session pop-up alerts before deep focus blocks to prepare your environment.
- **Color-Coded Google Calendar Events**: Standardized color taxonomy matching cognitive load and category types.
- **Weekly Recurrence (Mon–Fri)**: Scheduled via RFC 5545 `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`.
- **Weekend Preservation**: Dedicated **Saturday Light** and **Sunday Weekly Planning** presets.

---

## 📅 The Core Routine Schedule

| Time Interval | Task / Activity | Category | Google Calendar Color | 10m Alert |
|---|---|---|---|:---:|
| **6:00 – 6:30 AM** | Wake up, water, freshen up | Morning & Wakeup | Sage (#33b679 / `2`) | — |
| **6:30 – 7:00 AM** | Exercise or walk | Health & Exercise | Basil (#0b8043 / `10`) | — |
| **7:00 – 7:45 AM** | Breakfast and get ready | Morning & Wakeup | Sage (#33b679 / `2`) | — |
| **8:00 – 10:00 AM** | **Deep work / study block 1** *(hardest task first)* | Deep Focus | Blueberry (#3f51b5 / `9`) | 🔔 Yes |
| **10:00 – 10:15 AM** | Break | Break & Rest | Banana (#f6bf26 / `5`) | — |
| **10:15 – 12:15 PM** | **Deep work / study block 2** | Deep Focus | Blueberry (#3f51b5 / `9`) | 🔔 Yes |
| **12:15 – 1:15 PM** | Lunch and rest | Break & Nourish | Tangerine (#f4511e / `6`) | — |
| **1:15 – 3:15 PM** | Classes, meetings, or secondary tasks | Collaboration | Grape (#8e24aa / `3`) | — |
| **3:15 – 3:30 PM** | Break | Break & Rest | Banana (#f6bf26 / `5`) | — |
| **3:30 – 5:00 PM** | Light tasks: emails, assignments, errands | Admin & Execution | Flamingo (#e67c73 / `4`) | — |
| **5:00 – 6:30 PM** | Free time, hobbies, family or friends | Social & Personal | Lavender (#7986cb / `1`) | — |
| **6:30 – 7:30 PM** | Dinner | Break & Nourish | Tangerine (#f4511e / `6`) | — |
| **7:30 – 8:30 PM** | Revision or planning tomorrow | Review & Planning | Graphite (#616161 / `8`) | — |
| **8:30 – 10:00 PM** | Relax, no screens near the end | Wind Down & Sleep | Peacock (#039be5 / `7`) | — |
| **10:00 – 10:30 PM** | Sleep | Restorative Sleep | Basil (#0b8043 / `10`) | — |

---

## 🎨 Google Calendar Color Taxonomy

DayFlow uses Google Calendar's native `colorId` properties (1–11):

| Category | Google Color ID | Color Name | Hex Code | Visual Meaning |
|---|---|---|---|---|
| **Deep Work / Study** | `9` | Blueberry | `#3f51b5` | High cognitive demand & uninterrupted focus |
| **Morning Routine** | `2` | Sage | `#33b679` | Gentle waking, nutrition & physical setup |
| **Health & Exercise** | `10` | Basil | `#0b8043` | Vitality, movement & cardiovascular health |
| **Breaks (Quick)** | `5` | Banana | `#f6bf26` | Short cognitive recharge & eye rest |
| **Meals & Lunch** | `6` | Tangerine | `#f4511e` | Wholesome nourishment & social break |
| **Classes & Meetings** | `3` | Grape | `#8e24aa` | Lectures, discussions & team collaboration |
| **Light Tasks & Admin** | `4` | Flamingo | `#e67c73` | Low-energy tasks, inbox, correspondence |
| **Free Time & Hobbies** | `1` | Lavender | `#7986cb` | Creativity, unwinding, family & friends |
| **Revision & Planning** | `8` | Graphite | `#616161` | Daily reflection, logging wins, tomorrow setup |
| **Wind Down & Sleep** | `7` / `10` | Peacock / Basil | `#039be5` | Circadian rhythm & screen-free sleep |

---

## 💡 Google Calendar Integration Highlights

1. **Client-Side OAuth 2.0**:
   - Authorized via Google Workspace OAuth scope `https://www.googleapis.com/auth/calendar.events`.
   - Access tokens are kept strictly in memory for maximum security.
2. **Explicit User Confirmation**:
   - Conforms strictly with user consent guidelines before any mutating calendar calls.
   - Previews all 15 events with exact dates, times, and colors prior to execution.
3. **Flexible Target Destination**:
   - Sync directly into your **Primary Calendar** for unified notifications on Android/iOS/Desktop.
   - Or create a dedicated secondary calendar (*"DayFlow - Daily Routine"*) to isolate work blocks.
4. **10-Minute Reminder Overrides**:
   - Specifically configured for Deep Work blocks:
     ```json
     "reminders": {
       "useDefault": false,
       "overrides": [{ "method": "popup", "minutes": 10 }]
     }
     ```
5. **Clean Rollback / Clear Events**:
   - Synced events are tagged with private extended properties (`dayflowRoutine: 'true'`) allowing 1-click clean removal anytime.
6. **Offline .ICS Export**:
   - Generates standard RFC 5545 iCalendar files (`.ics`) with `VALARM` triggers for Apple Calendar, Outlook, and offline backup.

---

## 🌿 Weekend Routine Presets

- **Saturday Light**:
  - Gentle wake up (7:30 AM)
  - Outdoor walk / recreation
  - Creative hobby / side project
  - Errands without time pressure
  - Leisure & social evenings
- **Sunday Weekly Planning**:
  - Relaxed morning & movement
  - Space reset & meal preparation
  - **Weekly Review & Planning** (5:30 – 7:00 PM): Review past week wins, set top 3 weekly outcomes, and align calendar blocks for the upcoming week.

---

## ⚡ Interactive App Features

- **Live Focus Tracker**:
  - Automatically identifies your current active block based on local time.
  - Live progress bar showing percentage completed and minutes remaining.
  - "Next Up" preview card with countdown timer.
  - Audio chime bell toggle for block transitions.
- **Timeline & Phase Cards Views**:
  - **Timeline View**: Visual time ruler from 6:00 AM to 10:30 PM with active indicator.
  - **Phase Cards**: Organizes the day into Morning Foundation, Peak Deep Work, Afternoon Execution, and Evening Renewal.
- **Customization Modal**:
  - Add custom blocks, edit times, customize colors, toggle 10m reminder, and adjust day repetition.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Build Tool**: Vite 8.
- **Auth & Services**: Firebase Auth with Google OAuth (`calendar.events`).
- **Calendar Engine**: Google Calendar v3 REST API.
- **Testing**: Built-in `node:test` suite with `tsx`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+

### Installation & Run
```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Run unit tests
npx tsx --test src/services/schedule.test.ts

# Production build
npm run build
```

---

## 📄 License
Apache-2.0
