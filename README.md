<div align="center">
  <img src="public/logo.svg" alt="CuTasks" height="48" />
  <br/><br/>
  <p><strong>A cozy, focused task manager built for people who like getting things done.</strong></p>
</div>

---

## Overview

CuTasks is a personal productivity web app with a warm, minimal aesthetic. It combines a straightforward task list with project management, a calendar view, and real-time sync across devices — all in a single-page app that feels fast and comfortable to use every day.

The design philosophy: no clutter, no dashboards, no noise. Just your tasks, your projects, and a clear picture of what needs doing.

## Features

### Tasks
- Create, edit, and delete tasks with **title**, **description**, **priority**, and **due date**
- Three priority levels — Low, Medium, High — each with distinct color coding
- Toggle completion with animated feedback
- Filter by All / Active / Done
- **Drag-and-drop reordering** via a custom pointer-event hook (works on both desktop and mobile)

### Projects
- Organize work into color-coded projects with custom icons
- Add **sections** within a project to group related tasks
- Drag tasks between sections and reorder both tasks and sections
- Per-project progress tracking with a circular indicator
- 8 accent colors × 24+ icon options

### Calendar
- Monthly grid view with task indicators per day
- Click any day to see and manage its tasks
- Overdue detection with visual badges
- Add tasks directly from the calendar with the date pre-filled
- Weekend highlighting and today ring

### Themes
- **Light**, **Dark**, and **Slate** (AMOLED-friendly dark) themes
- Theme persisted to `localStorage`, respects `prefers-color-scheme` on first load
- Smooth transitions on all theme changes

### Auth & Sync
- Email/password authentication via Firebase Auth
- All data stored per-user in **Firestore** with real-time listeners
- Works across devices simultaneously

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Backend | Firebase Auth + Cloud Firestore |
| Routing | React Router v7 |
| Icons | Solar Icons (`@solar-icons/react`) |
| Fonts | Fraunces (display) + DM Sans (body) |
| Deployment | Vercel |

## Project Structure

```
src/
├── components/         # Shared UI components
│   ├── TaskCard.tsx      # Task card with drag handle, priority badge, deadline
│   ├── TaskModal.tsx     # Create / edit task modal
│   ├── PriorityBadge.tsx # Priority label pill
│   ├── Sidebar.tsx       # Desktop sidebar + mobile bottom nav
│   ├── DatePicker.tsx    # Custom inline date picker
│   ├── SkeletonLoader.tsx
│   └── ...
├── pages/              # Route-level page components
│   ├── TasksPage.tsx     # Main task list
│   ├── CalendarPage.tsx  # Monthly calendar + day task list
│   ├── ProjectsPage.tsx  # Project list + ProjectDetail (inline)
│   ├── SettingsPage.tsx  # Theme + account settings
│   └── AuthPage.tsx      # Login / sign-up
├── hooks/
│   ├── useTasks.ts       # Firestore CRUD + real-time sync for tasks
│   ├── useProjects.ts    # Firestore CRUD for projects, sections, tasks
│   ├── useDragDrop.ts    # Custom pointer-event drag-and-drop engine
│   └── useTheme.ts       # Theme state + DOM class management
├── context/
│   └── AuthContext.tsx   # Firebase auth state provider
├── firebase/
│   └── config.ts         # Firebase initialization
├── types.ts              # Shared TypeScript types
└── projectIcons.ts       # Icon registry for project customization
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://firebase.google.com/) project with **Authentication** (Email/Password) and **Firestore** enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cutasks.git
cd cutasks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

All values are available in your Firebase project settings under **Project Settings → General → Your apps**.

### 4. Set up Firestore security rules

In the Firebase console, go to **Firestore → Rules** and apply the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available Scripts

```bash
npm run dev       # Start development server with HMR
npm run build     # Type-check + production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Data Model

Firestore stores data under a per-user path:

```
users/{uid}/
  tasks/          # Global tasks (with optional deadline)
    {taskId}
      title:        string
      description:  string | undefined
      priority:     'low' | 'medium' | 'high'
      deadline:     string | undefined  // YYYY-MM-DD
      completed:    boolean
      createdAt:    Timestamp

  projects/       # Projects
    {projectId}
      name:         string
      description:  string | undefined
      color:        ProjectColor
      emoji:        string | undefined
      order:        number
      createdAt:    Timestamp
      sections:     ProjectSection[]   // stored inline
      tasks:        ProjectTask[]      // stored inline
```

## Design Decisions

**Why inline styles over pure Tailwind?**
CSS custom properties (`var(--bg-main)`, `var(--accent)`, etc.) make theme switching trivial — a single class on `<html>` changes everything. Tailwind's `dark:` variant requires the `darkMode: 'class'` strategy and can't express three separate themes cleanly. Inline styles for dynamic values, Tailwind for layout utilities — both are used where they shine.

**Why a custom drag-and-drop hook?**
Third-party DnD libraries (react-dnd, dnd-kit) add significant bundle weight and introduce abstraction that fights with mobile touch events. The custom `useDragDrop` hook uses the Pointer Events API directly, which gives consistent behavior across desktop and touch with no external dependency.

**Why Fraunces + DM Sans?**
Fraunces is an optical-size serif with personality — it gives CuTasks its "cozy" character in headings and large text. DM Sans is clean and highly legible at small sizes for body text and UI labels. They pair well and load quickly via Google Fonts.

## Contributing

This is a personal project, but issues and suggestions are welcome. If you find a bug or have an idea, open an issue with as much context as possible.

## License

MIT