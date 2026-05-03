# DevFlow

> A real-time collaborative code review and task management platform built for modern development teams.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## Overview

DevFlow is a full-stack project management application designed to streamline how development teams plan, track, and review their work. It combines a Kanban-style task board with an integrated code review discussion system, team management, and a real-time analytics dashboard — all in one place.

Built as a portfolio project to demonstrate production-ready full-stack engineering with the Next.js 15 App Router, Better-Auth, MongoDB/Mongoose, and modern React patterns.

---

## Features

### 📊 Analytics Dashboard
- Greeting-based header with live stats (Total Tasks, In Progress, Code Reviews, Open Issues)
- Weekly activity bar chart (Tasks / Reviews / Comments per day)
- Project progress tracking with visual progress bars
- Recent tasks feed with assignee, status, and priority
- Top contributors leaderboard ranked by task activity

### 📋 Kanban Board
- 5-column board: **Backlog → To Do → In Progress → In Review → Done**
- Drag-and-drop with optimistic UI updates and DB rollback on failure (`@dnd-kit`)
- Inline task creation per column with title, description, priority, assignee, due date, and tags
- Real-time search and priority filter (All / Critical / High / Medium / Low)
- Tag system with color-coded badges (frontend, backend, testing, etc.)

### ✅ Task Management
- Full task detail modal with inline editing (title, priority, assignee, due date, description)
- Comment threads per task with code snippet support and syntax highlighting
- Delete tasks with confirmation dialog
- Priority levels: Critical, High, Medium, Low

### 👥 Team Management
- Team page showing all members with completed/active task stats
- Role-based access: Admin and Member roles
- Admins can promote/demote members via dropdown on member cards
- Invite members to projects by email address

### 🔍 Code Reviews
- Dedicated review page listing all tasks in `In Review` status
- Per-task discussion thread with full comment history
- Inline code snippet posting with language selector and syntax highlighting
- Real-time comment submission without page reload

### ⚙️ Settings
- Profile settings with first/last name editing
- Avatar upload via Cloudinary (JPG, PNG, WebP, max 2MB)
- Role display with contact-owner note
- Tabbed layout (Profile, Notifications, Security, Appearance)

### 🔐 Authentication & Authorization
- Email/password authentication via **Better-Auth**
- Session-based middleware with role-protected routes
- RBAC (Role-Based Access Control) with `admin` and `member` roles
- Edge-compatible session checks in middleware

### 🗂️ Project Management
- Create, view, and delete projects
- Progress tracking per project (done/total tasks)
- Member management: add by email, remove members, owner-only controls
- Project cards with color-coded accent, progress bar, member avatars

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MongoDB + Mongoose |
| Auth | Better-Auth |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Image Upload | Cloudinary |
| Syntax Highlighting | react-syntax-highlighter |
| Notifications | Sonner |
| Date Utilities | date-fns |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                      # Authenticated app routes
│   │   ├── dashboard/              # Analytics dashboard
│   │   ├── projects/               # Project list + [id] board
│   │   │   └── [id]/               # Kanban board per project
│   │   ├── reviews/                # Code review discussions
│   │   ├── settings/               # User profile settings
│   │   └── team/                   # Team members page
│   ├── api/auth/[...all]/          # Better-Auth catch-all route
│   └── auth/                       # Login & Register pages
├── components/
│   ├── layout/                     # AppShell, Navbar, Sidebar
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── actions/                    # Server Actions
│   │   ├── comment.actions.ts
│   │   ├── dashboard.actions.ts
│   │   ├── project.actions.ts
│   │   ├── review.actions.ts
│   │   ├── settings.actions.ts
│   │   ├── task.actions.ts
│   │   └── user.actions.ts
│   ├── auth/                       # Better-Auth config + client
│   ├── db.ts                       # Cached MongoDB connection
│   └── routes.ts                   # Route constants for middleware
├── models/                         # Mongoose schemas
│   ├── Comment.ts
│   ├── Project.ts
│   ├── Task.ts
│   └── User.ts
└── store/
    └── uiStore.ts                  # Zustand (sidebar, filters)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Cloudinary account (for avatar uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/devflow.git
cd devflow

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Cloudinary (for avatar uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload → Upload Presets**
3. Create a new preset with signing mode set to **Unsigned**
4. Set folder to `devflow/avatars`
5. Copy the preset name and cloud name into `.env.local`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Implementation Details

### Authentication
Better-Auth handles session management with a MongoDB adapter. The middleware checks sessions on every protected route using `auth.api.getSession({ headers: request.headers })` and enforces role-based access via a `routePermissions` config.

### Data Layer
All database operations are implemented as **Next.js Server Actions** (`'use server'`). This eliminates the need for a separate API layer while keeping database logic server-side. Each action calls `connectDB()` for a cached Mongoose connection, then serializes results with `JSON.parse(JSON.stringify())` to strip ObjectIds before returning to client components.

### User References
Better-Auth stores users with both an `_id` (ObjectId) and a string `id` field. Projects and Tasks reference users by ObjectId (`_id`), while comments reference users via the ObjectId stored in the `author` field. All user lookups use `{ _id: { $in: objectIds } }` against the Better-Auth `user` collection.

### Optimistic UI
The Kanban board uses optimistic state updates — drag-and-drop reorders tasks locally first, then persists to the database. If the DB write fails, the board rolls back to `initialTasks`. Task deletion is also optimistic via an `onDeleted` callback that filters the task from local state immediately.

### Filtering
Kanban filters (priority, search) are computed with `useMemo` on the client. Global filter state (priority, assignee) was previously in Zustand; the current implementation uses local state within `KanbanBoard` for search and priority pills.

---

## Screenshots

> Dashboard, Kanban Board, Code Reviews, Team, and Settings pages.

---

## License

MIT License — feel free to use this project as a reference or starting point.

---

## Author

**Wali Muhammad**  
Full Stack Developer · Rawalpindi, Pakistan  
Bachelor of Computer Science — Sarhad University  

> *"The best backend work is invisible."*
