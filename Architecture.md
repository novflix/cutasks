# CUTasks — Technical Documentation

> Reflects the current project structure after restructuring.  
> This document answers three questions: **how the project is organized**, **why it's designed this way**, and **how to add a new feature without breaking anything**.

---

## Table of Contents

1. [Stack and Dependencies](#1-stack-and-dependencies)
2. [File Structure](#2-file-structure)
3. [Data Architecture](#3-data-architecture)
4. [Context Layer](#4-context-layer)
5. [Hooks](#5-hooks)
6. [Primitive Components](#6-primitive-components)
7. [Pages](#7-pages)
8. [Theming and Styles](#8-theming-and-styles)
9. [Settings Sync Across Devices](#9-settings-sync-across-devices)
10. [How to Add a New Page](#10-how-to-add-a-new-page)
11. [How to Add a New Modal](#11-how-to-add-a-new-modal)
12. [How to Add a New Data Type to Firestore](#12-how-to-add-a-new-data-type-to-firestore)
13. [Common Mistakes and How to Avoid Them](#13-common-mistakes-and-how-to-avoid-them)

---

## 1. Stack and Dependencies

| Technology | Role |
|---|---|
| **React 18** + **TypeScript** | UI and type safety |
| **Vite** | Build tool and dev server |
| **React Router v6** | Routing |
| **Firebase Auth** | Authentication (email/password + Google) |
| **Cloud Firestore** | Database (realtime subscriptions) |
| **Tailwind CSS** | Utility classes |
| **@solar-icons/react** | Icons |

Entry points:
- `src/main.tsx` — renders the provider tree and mounts the app
- `src/App.tsx` — routing and auth checks
- `src/firebase/config.ts` — Firebase SDK initialization

---

## 2. File Structure

```
src/
├── firebase/
│   └── config.ts              # Firebase initialization, exports auth + db
│
├── context/                   # global state
│   ├── AuthContext.tsx         # auth: types + createContext + Provider + useAuth
│   ├── AppSettings.tsx         # theme, sorting, deletion delay, pomodoro
│   └── PomodoroContext.tsx     # timer settings: types + Provider + usePomodoroSettings
│
├── hooks/                     # reusable logic
│   ├── useTasks.ts             # standalone task CRUD + Firestore realtime
│   ├── useProjects.ts          # project/section/project-task CRUD + drag order
│   ├── useTaskDeletion.ts      # deferred deletion of completed tasks
│   ├── useTaskSort.ts          # sortTasks function + SortField / SortConfig types
│   ├── useTheme.ts             # applies theme to DOM (CSS variables)
│   ├── useSettingsSync.ts      # cross-device settings sync via Firestore
│   └── useDragDrop.ts          # drag-and-drop for tasks and sections within a project
│
├── components/                # reusable UI components
│   │
│   ├── — PRIMITIVES (used everywhere) —
│   ├── Modal.tsx               # overlay + card: base building block for all modals
│   ├── ConfirmDialog.tsx       # "are you sure?" — overlay + two buttons
│   ├── Dropdown.tsx            # context menu / picker, closes on outside click
│   │
│   ├── — MODALS (built on Modal) —
│   ├── TaskModal.tsx           # create/edit standalone task
│   ├── ProjectModal.tsx        # create/edit project
│   ├── ProjectTaskModal.tsx    # create/edit task within a project
│   │
│   ├── — PROJECT (parts of ProjectDetail) —
│   ├── ProjectDetail.tsx       # full project screen (header, progress, task list)
│   ├── ProjectCard.tsx         # card in the /projects list
│   ├── SectionBlock.tsx        # section with its tasks, collapse, icon-picker
│   ├── ProjectTaskRow.tsx      # task row with checkbox, animation, drag handle
│   ├── InlineAddTask.tsx       # quick task addition without opening a modal
│   │
│   ├── — OTHER —
│   ├── Sidebar.tsx             # left navigation (desktop) / bottom (mobile)
│   ├── DatePicker.tsx          # date picker
│   ├── TaskCard.tsx            # standalone task card in TasksPage
│   ├── EmptyState.tsx          # "no data" placeholder
│   ├── PriorityBadge.tsx       # colored priority badge
│   ├── SkeletonLoader.tsx      # skeleton loading animations
│   └── LogoSVG.tsx             # logo
│
├── pages/                     # pages = layout + component orchestration only
│   ├── AuthPage.tsx            # sign in / sign up
│   ├── TasksPage.tsx           # standalone task list
│   ├── CalendarPage.tsx        # tasks by date
│   ├── ProjectsPage.tsx        # project list (169 lines)
│   ├── ProjectDetailPage.tsx   # wrapper — loads project, renders ProjectDetail
│   ├── PomodoroPage.tsx        # pomodoro timer
│   ├── SettingsPage.tsx        # app settings
│   └── NotFoundPage.tsx        # 404
│
├── types.ts                   # all TypeScript types and ProjectColor tokens
├── projectIcons.ts            # project icon registry (PROJECT_ICON_MAP, PROJECT_ICON_OPTIONS)
└── index.css                  # CSS variables, custom Tailwind utilities, animations
```

**One-directional rule**: pages import components and hooks; components import hooks and other components; hooks import only contexts and `firebase/config`. No reverse dependencies.

---

## 3. Data Architecture

### Firestore — Collection Schema

```
users/{uid}/
├── tasks/{taskId}          # standalone tasks
│   ├── title: string
│   ├── description?: string
│   ├── priority: 'low' | 'medium' | 'high'
│   ├── deadline?: string        # YYYY-MM-DD
│   ├── completed: boolean
│   ├── createdAt: Timestamp
│   └── completedAt?: number     # Unix ms, for deferred deletion
│
├── projects/{projectId}    # projects (tasks are stored INSIDE the project document)
│   ├── name: string
│   ├── description?: string
│   ├── color: ProjectColor
│   ├── emoji?: string           # key from PROJECT_ICON_MAP
│   ├── order?: number           # for drag-and-drop sorting
│   ├── completedCount: number   # number of deleted completed tasks (for progress)
│   ├── createdAt: Timestamp
│   ├── sections: ProjectSection[]   # array, not a subcollection
│   └── tasks: ProjectTask[]         # array, not a subcollection
│
└── settings/prefs          # one document per user
    ├── th: string           # theme (compact)
    ├── sf: string           # sort field (compact)
    ├── dd: string           # deletion delay (compact)
    ├── pm: object           # pomodoro (compact)
    └── _ts: Timestamp       # for conflict resolution
```

**Important**: project tasks and sections are stored as arrays inside the project document, not as separate collections. This is a deliberate decision — it allows the entire project to be atomically updated with a single write and avoids extra reads on realtime subscriptions.

### TypeScript Types — `src/types.ts`

All core types live in one file:

```typescript
// Task priority
type Priority = 'low' | 'medium' | 'high'

// Standalone task (TasksPage, CalendarPage)
interface Task { id, title, description?, priority, deadline?, completed, createdAt, completedAt? }

// Project
interface Project { id, name, description?, color, emoji?, sections, tasks, createdAt, order?, completedCount? }

// Task within a project
interface ProjectTask { /* same as Task */ + sectionId? }

// Section within a project
interface ProjectSection { id, title, order, icon? }

// Project color
type ProjectColor = 'terracotta' | 'sage' | 'sky' | 'lavender' | 'blush' | 'amber' | 'teal' | 'slate'
```

A utility is available for colors:

```typescript
import { resolveProjectColors } from '../types';
const { bg, text, border, dot } = resolveProjectColors(project.color, dark);
// bg, text, border are theme-dependent; dot is the same in both themes
```

---

## 4. Context Layer

### Provider Tree (`src/main.tsx`)

```
BrowserRouter
└── AuthProvider              # auth context
    └── AppSettingsProvider   # theme + settings + Pomodoro (nested inside AppSettings)
        └── PomodoroProvider  # (created inside AppSettingsProvider)
            └── App
```

### `AuthContext.tsx` — Authentication

Single file: types + context + provider + hook.

```typescript
import { useAuth } from '../context/AuthContext';

const { user, loading, signIn, signUp, signInWithGoogle, logOut, resetPassword } = useAuth();
// user === null → not authenticated
// loading === true → Firebase is still checking the session
```

### `AppSettings.tsx` — App Settings

Manages: theme, sort field, deletion delay, pomodoro settings.  
Each setter immediately pushes changes to Firestore via `useSettingsSync`.

```typescript
import { useAppSettings } from '../context/AppSettings';

const {
  theme,           // 'light' | 'dark' | 'slate'
  setTheme,
  dark,            // boolean — true for dark and slate
  sortField,       // 'createdAt' | 'priority' | 'deadline'
  setSortField,
  deletionDelay,   // 'immediate' | '24h' | '3d'
  setDeletionDelay,
  pomodoro,        // PomodoroSettings
  updatePomodoro,  // (patch: Partial<PomodoroSettings>) => void
} = useAppSettings();
```

### `PomodoroContext.tsx` — Timer Settings

Receives `settings` and `update` from `AppSettingsProvider`. Does not store state itself.

```typescript
import { usePomodoroSettings } from '../context/PomodoroContext';
const { settings, update } = usePomodoroSettings();
update({ workDuration: 30 }); // partial update
```

---

## 5. Hooks

### `useTasks()` — Standalone Tasks

Realtime Firestore subscription. Returns the current list and all operations.

```typescript
import { useTasks } from '../hooks/useTasks';

const {
  tasks,          // Task[]
  initialized,    // boolean — false until the first fetch completes
  addTask,        // (title, priority, deadline?, description?) => void
  editTask,       // (id, patch) => void
  deleteTask,     // (id) => void
  toggleTask,     // (id) => void
} = useTasks();
```

### `useProjects()` — Projects

```typescript
import { useProjects } from '../hooks/useProjects';

const {
  projects,       // Project[]
  loading,
  createProject,  // (name, color, emoji?, description?) => Promise<string | null>  (returns id)
  editProject,    // (id, patch) => void
  deleteProject,  // (id) => void
  reorderProject, // (id, beforeId?) => void  — drag-and-drop in project list

  // Sections
  addSection,     // (projectId, title, icon?) => void
  editSection,    // (projectId, sectionId, title, icon?) => void
  deleteSection,  // (projectId, sectionId) => void
  reorderSection, // (projectId, sectionId, beforeSectionId?) => void

  // Project tasks
  addTask,        // (projectId, title, priority, deadline?, description?, sectionId?) => void
  editTask,       // (projectId, taskId, patch) => void
  deleteTask,     // (projectId, taskId) => void
  toggleTask,     // (projectId, taskId) => void
  reorderTask,    // (projectId, taskId, targetSectionId?, beforeTaskId?) => void
} = useProjects();
```

### `useTaskSort` — Sorting

Stateless — provides only a function and types.

```typescript
import { sortTasks } from '../hooks/useTaskSort';
import type { SortConfig } from '../hooks/useTaskSort';

const sorted = sortTasks(tasks, { field: 'priority' });
// field: 'createdAt' | 'priority' | 'deadline'
```

### `useTaskDeletion` — Deferred Deletion

```typescript
import { getDeletionDelay } from '../hooks/useTaskDeletion';
// Synchronously reads from localStorage (before Firebase loads)
const delay = getDeletionDelay(); // 'immediate' | '24h' | '3d'
```

`useTaskDeletionCleanup(deletionDelay)` is called once in `App.tsx` and runs background cleanup every 5 minutes.

### `useDragDrop` — Drag-and-Drop Within a Project

```typescript
import { useDragDrop } from '../hooks/useDragDrop';

const { onPointerDown } = useDragDrop({
  onReorderTask:    (taskId, targetSectionId, beforeTaskId) => { ... },
  onReorderSection: (sectionId, beforeSectionId) => { ... },
});

// In JSX: pass to drag handle of task or section
<div onPointerDown={(e) => onPointerDown(e, { type: 'task', id, sectionId }, rowEl)} />
```

---

## 6. Primitive Components

These three components are the **only way** to create overlays in the app. Do not use `fixed inset-0` directly in new components.

### `Modal` — Full-Screen Modal

```tsx
import { Modal } from '../components/Modal';

<Modal
  title="New widget"           // header title
  onClose={() => setOpen(false)}
  maxWidth="max-w-lg"          // optional, default is max-w-md
>
  {/* any content */}
  <p>A form, a list, anything</p>
</Modal>
```

Included automatically:
- `fixed inset-0` overlay with `backdrop-blur`
- Close on overlay click
- Close on `Escape`
- Entrance animation
- Close button in the header

### `ConfirmDialog` — Action Confirmation

```tsx
import { ConfirmDialog } from '../components/ConfirmDialog';

{showConfirm && (
  <ConfirmDialog
    title="Delete project?"
    message="This cannot be undone."
    confirmLabel="Delete"    // default: "Confirm"
    cancelLabel="Cancel"     // default: "Cancel"
    destructive              // makes the confirm button red
    onConfirm={() => { deleteItem(); setShowConfirm(false); }}
    onCancel={() => setShowConfirm(false)}
  />
)}
```

### `Dropdown` — Context Menu

```tsx
import { Dropdown } from '../components/Dropdown';
import type { DropdownItem } from '../components/Dropdown';

// Wrap trigger + dropdown in a position: relative container
<div style={{ position: 'relative' }}>
  <button onClick={() => setOpen(p => !p)}>⋯</button>

  {open && (
    <Dropdown
      items={[
        { label: 'Edit',   icon: <PenNewSquare size={14} />, onClick: () => openEdit() },
        { label: 'Delete', icon: <TrashBin size={14} />,     onClick: () => openConfirm(), destructive: true, separator: true },
      ]}
      onClose={() => setOpen(false)}
      align="right"    // 'left' | 'right', default is 'right'
    />
  )}
</div>
```

Included automatically:
- Close on outside click (`mousedown`)
- Close on `Escape`
- Hover effects, including red for `destructive`
- Auto-closes after clicking an item

---

## 7. Pages

A page = **layout and orchestration only**. It should not contain inline components longer than ~20 lines.

What a page does:
1. Calls the necessary hooks (`useTasks`, `useProjects`, `useAppSettings`)
2. Manages local UI state (`showModal`, `editTarget`, etc.)
3. Renders components from `components/`
4. Passes handlers down as props

Example of a minimal page:

```tsx
export const WidgetsPage: React.FC = () => {
  const { widgets, addWidget, deleteWidget } = useWidgets(); // custom hook
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Widget | null>(null);

  return (
    <>
      <header>...</header>

      {widgets.map(w => (
        <WidgetCard
          key={w.id}
          widget={w}
          onEdit={() => setEditTarget(w)}
          onDelete={() => deleteWidget(w.id)}
        />
      ))}

      {showCreate && (
        <WidgetModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSubmit={(data) => addWidget(data)}
        />
      )}

      {editTarget && (
        <WidgetModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(data) => editWidget(editTarget.id, data)}
        />
      )}
    </>
  );
};
```

---

## 8. Theming and Styles

### CSS Variables (`src/index.css`)

The entire palette uses CSS variables. Tailwind classes where possible, `style={{}}` with variables for dynamic colors.

```css
--bg-main       /* primary page background */
--bg-card       /* background for cards and modals */
--bg-panel      /* background for secondary elements (buttons, inputs) */
--border        /* color for all borders */
--text-main     /* primary text */
--text-muted    /* secondary text */
--accent        /* accent color (blue) */
```

Three themes: `light`, `dark`, `slate`. Switched via `data-theme` on `<html>`.

### Getting the Current Theme in a Component

```typescript
const { dark } = useAppSettings();
// dark === true for 'dark' and 'slate' themes
// Used for resolveProjectColors() and conditional rendering
```

### Project Colors

Do not hardcode colors! Use tokens:

```typescript
import { resolveProjectColors } from '../types';
const colors = resolveProjectColors(project.color, dark);
// colors.dot    — accent color (same in both themes)
// colors.bg     — tinted background
// colors.text   — readable text
// colors.border — border
```

### Typography

```
font-display  → Fraunces (headings)
font-body     → DM Sans (body text, buttons)
```

---

## 9. Settings Sync Across Devices

`useSettingsSync` implements the following strategy:

1. On mount — reads `localStorage` (instant, no flash)
2. Subscribes to `users/{uid}/settings/prefs` in Firestore
3. If the remote `_ts` is newer than local — applies remote settings
4. On each change — writes to `localStorage` immediately + 800ms debounce to Firestore
5. On logout — unsubscribes

**Important**: settings are stored in compact format (`th`, `sf`, `dd`, `pm`) to minimize traffic. When adding a new settings field, add it to `encode()`, `decode()`, `readLocal()`, `writeLocal()`, and `AllSettings` in `useSettingsSync.ts`.

---

## 10. How to Add a New Page

### Step 1 — Create the Page File

```tsx
// src/pages/ReviewsPage.tsx
import React from 'react';

export const ReviewsPage: React.FC = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-main)' }}>
          Reviews
        </h1>
      </header>
      {/* content */}
    </>
  );
};
```

### Step 2 — Register the Route in `App.tsx`

```tsx
// Add import
import { ReviewsPage } from './pages/ReviewsPage';

// In the list of valid paths (is404 guard):
'/', '/tasks', '/calendar', '/projects', '/settings', '/pomodoro', '/reviews',

// Add Route:
<Route path="/reviews" element={<ReviewsPage />} />
```

### Step 3 — Add an Item to the Sidebar (`components/Sidebar.tsx`)

```typescript
import { Star } from '@solar-icons/react'; // or any icon

const BASE_NAV: NavItemDef[] = [
  // ...existing items...
  { path: '/reviews', label: 'Reviews', Icon: Star },
];
```

If the page should be conditionally hidden (like Pomodoro — optionally via settings):

```typescript
// In Sidebar: add a field to NavItemDef
interface NavItemDef {
  // ...
  reviews?: boolean; // conditional visibility flag
}

// In BASE_NAV:
{ path: '/reviews', label: 'Reviews', Icon: Star, reviews: true },

// In the filter:
const NAV = BASE_NAV.filter(item => {
  if (item.pomodoro) return settings.showInNav;
  if (item.reviews)  return reviewsShowInNav; // from AppSettings
  return true;
});
```

---

## 11. How to Add a New Modal

Create a file in `components/`. Always build on top of `Modal`:

```tsx
// src/components/ReviewModal.tsx
import React, { useState } from 'react';
import { Modal } from './Modal';

interface Props {
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: { text: string; rating: number }) => void;
}

export const ReviewModal: React.FC<Props> = ({ mode, onClose, onSubmit }) => {
  const [text, setText]     = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit({ text, rating });
    onClose();
  };

  return (
    <Modal title={mode === 'create' ? 'New review' : 'Edit review'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="input-field resize-none"
          placeholder="Write your review..."
          rows={4}
        />
        {/* ... other fields */}
        <div className="flex gap-2 mt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl ..."
            style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-2xl ..."
            style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}>
            {mode === 'create' ? 'Add review' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

Usage in a page:

```tsx
{showCreate && (
  <ReviewModal
    mode="create"
    onClose={() => setShowCreate(false)}
    onSubmit={({ text, rating }) => addReview(text, rating)}
  />
)}
```

### Confirm Dialog

```tsx
{confirmDelete && (
  <ConfirmDialog
    title="Delete review?"
    message="This review will be permanently deleted."
    confirmLabel="Delete"
    destructive
    onConfirm={() => { deleteReview(confirmDelete); setConfirmDelete(null); }}
    onCancel={() => setConfirmDelete(null)}
  />
)}
```

### Context Menu

```tsx
const menuItems: DropdownItem[] = [
  { label: 'Edit',   icon: <PenNewSquare size={14} />, onClick: () => setEdit(review) },
  { label: 'Delete', icon: <TrashBin size={14} />,     onClick: () => setConfirmDelete(review.id), destructive: true, separator: true },
];

<div style={{ position: 'relative' }}>
  <button onClick={() => setMenuOpen(p => !p)}>⋯</button>
  {menuOpen && <Dropdown items={menuItems} onClose={() => setMenuOpen(false)} />}
</div>
```

---

## 12. How to Add a New Data Type to Firestore

### Step 1 — Define the Type in `types.ts`

```typescript
export interface Review {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
}
```

### Step 2 — Create a Hook `hooks/useReviews.ts`

Follow the `useTasks` pattern:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Review } from '../types';

export function useReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Path: users/{uid}/reviews
  const colRef = useCallback(() =>
    user ? collection(db, 'users', user.uid, 'reviews') : null,
  [user]);

  useEffect(() => {
    if (!user) return;
    const ref = colRef();
    if (!ref) return;

    const q = query(ref, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setReviews(snap.docs.map(d => ({
        id: d.id,
        text: d.data().text ?? '',
        rating: d.data().rating ?? 5,
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      })));
      setLoading(false);
    });
    return unsub;
  }, [user, colRef]);

  const addReview = useCallback(async (text: string, rating: number) => {
    const ref = colRef();
    if (!ref) return;
    await addDoc(ref, { text, rating, createdAt: serverTimestamp() });
  }, [colRef]);

  const deleteReview = useCallback(async (id: string) => {
    const ref = colRef();
    if (!ref) return;
    await deleteDoc(doc(ref, id));
  }, [colRef]);

  return { reviews, loading, addReview, deleteReview };
}
```

### Step 3 — Use the Hook in a Page

```tsx
const { reviews, loading, addReview, deleteReview } = useReviews();
```

**Data is stored separately per user** — the path always starts with `users/{user.uid}/`.

---

## 13. Common Mistakes and How to Avoid Them

### ❌ Creating an Overlay Manually
```tsx
// Wrong:
<div style={{ position: 'fixed', inset: 0, zIndex: 999, backdropFilter: 'blur(8px)' }}>
  <div>...</div>
</div>

// Right:
<Modal title="..." onClose={...}>
  ...
</Modal>
```

### ❌ Hardcoding Colors
```tsx
// Wrong:
style={{ color: '#e07850' }}

// Right:
const colors = resolveProjectColors(project.color, dark);
style={{ color: colors.dot }}
```

### ❌ Writing Business Logic in a Component
```tsx
// Wrong — calling Firestore directly from a component:
await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));

// Right — only through a hook:
const { deleteTask } = useTasks();
deleteTask(taskId);
```

### ❌ Large Inline Components in a Page
```tsx
// Wrong — component defined directly in the page file:
const MyBigCard: React.FC<{...}> = ({ ... }) => {
  // 80+ lines
};

// Right — move it to components/MyBigCard.tsx
```

### ❌ Duplicating State That Already Exists in Context
```tsx
// Wrong:
const [isDark, setIsDark] = useState(false); // managing theme locally

// Right:
const { dark } = useAppSettings(); // read from context
```

### ❌ Using `createPortal` for Modals
Modals are rendered directly in page JSX. `fixed inset-0` works correctly without a portal — centering is relative to the entire viewport, which visually matches the working area (content `max-w-xl mx-auto`).

### ❌ Using a Hook Outside Its Scope
`useProjects` only works inside `AppSettingsProvider` (via `useAuth`). Do not call data hooks outside the authenticated area of the app.