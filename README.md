# Essentials of AI — Secure Proctored Exam

A self-contained web exam tool built to reduce AI-tool cheating in the college lab.

## Features
- **Fullscreen lock** — exam starts in fullscreen; leaving it is recorded.
- **Tab / app-switch detection** — switching tabs, windows or apps raises a warning and is logged with a timestamp + question number.
- **Per-question timer** — every question has its own countdown; when it ends the exam auto-advances. **No going back.**
- **Randomized per student** — each student gets a different random **60 of 120** questions, and the answer options are shuffled too.
- **Three question types** — single-correct, multi-correct (select all), and true/false.
- **Auto-grading** — score is computed instantly.
- **Google Sheet collection** — every submission + violation log is written to your Sheet.
- **Copy / paste / right-click disabled**, and the exam **auto-submits after 3 violations** (configurable).

## Files
| File | Purpose |
|---|---|
| `index.html` | The exam app (deploy this). |
| `questions.js` | The 120-question bank (Day 1–11). Edit to add/change questions. |
| `Code.gs` | Google Apps Script backend that saves results to a Google Sheet. |

## Setup — Part A: Results Sheet (5 min)
1. Create a new **Google Sheet**. Copy its ID from the URL.
2. Go to <https://script.new>, delete the starter code, paste all of `Code.gs`.
3. Set `SHEET_ID` to your Sheet ID.
4. **Deploy ▸ New deployment ▸ Web app** → *Execute as: Me*, *Who has access: Anyone* → Deploy → approve → **copy the Web app URL**.
5. Open `index.html`, find `CONFIG.appsScriptUrl`, and paste the URL there. Re-upload `index.html`.

> If you skip Part A, the exam still works and **auto-grades**, but each student's result downloads as a `.json` file they hand back instead of going to a Sheet.

## Setup — Part B: Hosting
The tool is deployed to **GitHub Pages** (free public URL). Students just open the link in the lab browsers. To update questions, edit `questions.js` and push again.

## Configuration (top of `index.html`)
```js
const CONFIG = {
  questionsPerStudent: 60,   // questions each student gets out of 120
  maxViolations: 3,          // auto-submit after this many tab-switch/fullscreen-exit events
  showScoreToStudent: true,  // false = hide score, just confirm submission
  appsScriptUrl: "..."       // your Google Apps Script Web App URL
};
```

## Important honesty note on anti-cheating
A browser page can **deter** cheating but cannot fully **prevent** it — a determined student can use a phone or a second device. For true lockdown on lab PCs, run this exam **inside [Safe Exam Browser](https://safeexambrowser.org/)** (free, open-source). Point SEB at the exam URL and it locks the whole machine. The web tool here is designed to work well inside SEB.
