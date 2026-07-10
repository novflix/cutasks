<p align="center">
  <img src="https://github.com/novflix/cutasks/blob/main/media/banner-2.png?raw=true" alt="CuTasks Logo"/>
</p>

<p align="center">
  <strong>Task manager for focused people</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#philosophy">Philosophy</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.9.2_Beta-ed9b6d?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-66bb6a?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/react-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/firebase-12-ffca28?style=for-the-badge&logo=firebase" alt="Firebase" />
</p>


## What is CuTasks?

CuTasks is a personal productivity app that brings together everything you need to stay organized and focused — without the clutter. Task management, project boards, habit tracking, a Pomodoro timer, and a calendar view — all in one place, synced across your devices in real time.

Whether you're managing daily to-dos, building long-term habits, or running multiple projects, CuTasks keeps it simple and beautiful.


## Philosophy

Most productivity tools fall into two traps: they're either too simple to be useful, or so complex they become a task in themselves. CuTasks aims for the middle ground — **powerful enough to handle real workflows, minimal enough to stay out of your way**.

A few principles that guide the design:

- **Instant feedback.** Every action feels immediate. No loading spinners between you and your work.
- **Respect your data.** You can export everything as JSON anytime. No vendor lock-in.
- **Progressive complexity.** Start with simple tasks, add projects and sections when you need them, track habits when you're ready. Nothing is forced.
- **Focus first.** The built-in Pomodoro timer isn't an afterthought — it's integrated into the experience. A mini-timer follows you across pages while you work.


## Features

- **Tasks** — priorities, deadlines, tags, nested subtasks (up to 3 levels), auto-cleanup of completed tasks
- **Projects** — custom icons and colors, kanban-style sections, drag-and-drop reordering
- **Habits** — daily tracking with streaks, configurable repetitions and weekday schedules
- **Pomodoro Timer** — customizable focus/break intervals, mini overlay across pages, long break every 4 sessions
- **Calendar** — monthly deadline overview with task details
- **Dashboard** — personalized greeting, completion ring chart, quick stats, navigation shortcuts




## Screenshots

<p align="center">
  <img src="https://github.com/novflix/cutasks/blob/main/media/screen-1.png?raw=true" alt="Screenshot 1"/>
</p>
<p align="center">
  <img src="https://github.com/novflix/cutasks/blob/main/media/screen-2.png?raw=true" alt="Screenshot 2"/>
</p>


## Quick Start

```bash
git clone https://github.com/novflix/cutasks.git
cd cutasks
npm install
cp .env.example .env   # add your Firebase credentials
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Tech at a glance

React 19 · TypeScript · Vite · Firebase · CSS Custom Properties · PWA · i18next


## Contributing

Contributions are welcome! Fork the repo, create a feature branch, and open a Pull Request. Please follow the existing code style and add translations for any new UI strings.


## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care by <a href="https://github.com/novflix">novflix</a>
</p>
