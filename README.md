<p align="center">
  <img src="https://raw.githubusercontent.com/novflix/cutasks/5067d30d8a4c0ba6900b8c4260245c4ff62c4320/public/logo.svg" alt="CuTasks Logo" width="220" />
</p>

<p align="center">
  <strong>A beautiful, feature-rich task manager with Pomodoro timer, habits tracking, and cloud sync</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.2-ed9b6d?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-66bb6a?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/react-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-6-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-8-646cff?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/firebase-12-ffca28?style=for-the-badge&logo=firebase" alt="Firebase" />
</p>

---

## Why CuTasks?

CuTasks is a modern productivity app that combines task management, project organization, habit tracking, and focus techniques into one seamless experience. Built with performance and beauty in mind, it works offline and syncs across devices when you're connected.

---

## Features

<table>
  <tr>
    <td width="50%">

### Task Management
- Create, edit, and organize tasks with priorities
- Nested subtasks (up to 3 levels deep)
- Custom tags with color coding
- Smart deadlines with overdue detection
- Quick search and filtering
- Create new tasks directly from search (press Enter)
- Undo/redo support (Ctrl+Z)

    </td>
    <td width="50%">

### Projects
- Organize tasks into projects
- Custom icons and colors per project
- Sections within projects for kanban-style workflow
- Project-level task statistics
- Create new projects directly from search
- Drag-and-drop project reordering

    </td>
  </tr>
  <tr>
    <td>

### Pomodoro Timer
- Customizable work/break intervals
- Long break after configurable sessions
- Mini timer overlay while working on tasks
- Session counter with celebration animation
- Title bar shows current timer

    </td>
    <td>

### Habits Tracker
- Daily habit tracking with streaks
- Configurable daily repetitions (1–10) with colored progress
- Customizable weekday schedules
- Visual progress on home dashboard
- Best streak display

    </td>
  </tr>
  <tr>
    <td>

### Calendar View
- Monthly task overview
- See deadlines at a glance
- Click to view task details

    </td>
    <td>

### Smart Dashboard
- Daily greeting with motivation
- Completion ring chart
- Quick stats overview
- Links to habits, projects, and tasks

    </td>
  </tr>
</table>

### Additional Features

- **13 Languages** — EN, FR, DE, ES, IT, PT, NL, RU, TR, ZH, JA, KO, HI
- **3 Themes** — Dark, Light, and Midnight
- **Quick Create** — Type in search and press Enter to create a new task/project instantly
- **PWA Support** — Install on any device, works offline
- **Cloud Sync** — Firebase Firestore keeps your data safe
- **Responsive** — Beautiful on desktop and mobile
- **Easter Eggs** — Shake your device for motivational quotes

---

## Demo

<!-- Add your screenshots here -->

<p align="center">
  <em>Screenshots coming soon — replace this section with actual images</em>
</p>

<!-- Example placeholder:
<p align="center">
  <img src="docs/screenshots/home.png" alt="Dashboard" width="400" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/tasks.png" alt="Tasks" width="400" />
</p>
<p align="center">
  <img src="docs/screenshots/projects.png" alt="Projects" width="400" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/pomodoro.png" alt="Pomodoro" width="400" />
</p>
-->

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- npm or yarn
- A [Firebase](https://firebase.google.com/) project (for cloud sync)

### Installation

```bash
# Clone the repository
git clone https://github.com/novflix/cutasks.git
cd cutasks

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router DOM 7 |
| **Backend** | Firebase (Auth + Firestore) |
| **Icons** | Solar Icons |
| **i18n** | i18next + react-i18next |
| **PWA** | Service Worker |
| **Styling** | CSS Custom Properties |

---

## Project Structure

```
cutasks/
├── public/
│   ├── icons/              # PWA icons
│   ├── sw.js               # Service worker
│   └── manifest.webmanifest
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskFormModal.tsx
│   │   ├── TaskDetailModal.tsx
│   │   ├── ProjectFormModal.tsx
│   │   ├── HabitDetailModal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Toolbar.tsx
│   │   ├── PomoMiniTimer.tsx
│   │   ├── MobileNav.tsx
│   │   └── ...
│   ├── pages/              # Route pages
│   │   ├── HomePage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── HabitsPage.tsx
│   │   ├── PomodoroPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── LandingPage.tsx
│   ├── services/           # Firebase operations
│   │   ├── auth.ts
│   │   └── firestore.ts
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── i18n/               # Translations
│   │   ├── index.ts
│   │   └── locales/        # 13 languages
│   ├── styles/             # CSS modules
│   │   ├── themes.css
│   │   ├── sidebar.css
│   │   ├── modal.css
│   │   └── ...
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utility functions
│   ├── storage.ts          # localStorage layer
│   ├── firebase.ts         # Firebase init
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Data Architecture

CuTasks uses a **dual-sync** architecture:

1. **localStorage** — Instant offline access, no latency
2. **Firebase Firestore** — Cloud backup and cross-device sync

When a user is authenticated, data is saved to both localStorage (immediately) and Firestore (debounced 500ms). On login, Firestore data loads and merges with local data.

```
┌─────────────┐     ┌──────────────────┐
│   Browser   │────▶│    localStorage   │
│   (UI)      │     │   (instant sync)  │
└──────┬──────┘     └──────────────────┘
       │
       │ 500ms debounce
       ▼
┌─────────────┐
│   Firebase  │
│  Firestore  │
│  (cloud)    │
└─────────────┘
```

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Use TypeScript for all new files
- Add translations for new UI strings
- Test on both desktop and mobile viewports

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with care by <a href="https://github.com/novflix">novflix</a>
</p>
