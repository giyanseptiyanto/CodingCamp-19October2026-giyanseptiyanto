# Life Dashboard — Project Steering

## Purpose

A To-Do List Life Dashboard built as a software engineering course assignment.
The goal is a clean, single-page dashboard that runs entirely in the browser
with no backend server or build tools.

## Required Stack

- **HTML** for structure (`index.html` at the project root).
- **CSS** for all styling (`css/style.css`).
- **Vanilla JavaScript** for all behaviour (`js/app.js`).
- No frontend frameworks (React, Vue, Angular, etc.).
- No npm packages, bundlers, or transpilers.

## File Rules

- Exactly **one CSS file** inside `css/` — always `style.css`.
- Exactly **one JavaScript file** inside `js/` — always `app.js`.
- Do not create additional CSS or JavaScript files.

## Required Widgets

1. **Greeting** — displays the current time (auto-updating), current date, and a
   time-of-day greeting (Good Morning / Afternoon / Evening / Night).
2. **Focus Timer** — 25-minute countdown with Start, Stop, and Reset buttons.
3. **To-Do List** — add, complete, edit, and delete tasks.
4. **Quick Links** — add, open (new tab), and delete favourite website links.

## Selected Challenges

- **Light / Dark Mode** — toggled by a button; preference persisted in Local Storage.
- **Custom Name in Greeting** — user sets their name once; shown in the greeting.
- **Prevent Duplicate Tasks** — case-insensitive, whitespace-trimmed comparison
  when adding or editing tasks.

## Persistence

All user data is stored in the browser's **Local Storage** using `JSON.stringify`
/ `JSON.parse`. No external database or API is used.

| Key | Contents |
|---|---|
| `namePromptHandled` | `"true"` once the initial name prompt has been shown |
| `userName` | The user's display name (string, may be absent) |
| `dashboardTheme` | `"light"` or `"dark"` |
| `tasks` | JSON array of `{ id, text, completed }` objects |
| `quickLinks` | JSON array of `{ id, name, url }` objects |

## Development Rules

- Always read existing files before editing them.
- Never break an already-working feature when adding a new one.
- Keep code readable and well-commented for a beginner audience.
- All colours must use CSS variables so both themes stay consistent.
- The `.kiro` folder must be committed to the GitHub repository alongside
  the source files.
