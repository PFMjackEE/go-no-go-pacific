# Go / No-Go Pacific — Setup Guide
### Powerflow Marine · S/V Gemini

One-time setup: ~20 minutes. After that, pushing updates takes 2 minutes.

---

## What You're Building

```
GitHub repo  →  Netlify detects push  →  auto-builds  →  live at gemini-enso.netlify.app
     ↑
  you push updated files here
```

Every time you push a change to GitHub, Netlify rebuilds and redeploys automatically.  
No manual steps after initial setup.

---

## PART 1 — Install Node.js (one time only)

Node is required to build the app. You only install this once.

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the left button)
3. Run the installer, click through defaults
4. Open **Terminal** (Mac: Spotlight → type Terminal)
5. Confirm it worked:
   ```
   node --version
   ```
   Should print something like `v20.11.0`

---

## PART 2 — Create the GitHub Repo

1. Go to **https://github.com/Powerflow-Marine**
2. Click the green **New** button (top left)
3. Repository name: `go-no-go-pacific`
4. Description: `ENSO decision dashboard — Pacific crossing Baja to Marquesas`
5. Set to **Public** (required for free Netlify)
6. **Do NOT** check "Add README" or any other options
7. Click **Create repository**
8. GitHub shows you a page with setup commands — leave it open, you'll use it next

---

## PART 3 — Get the Files onto Your Computer

You have two options:

### Option A — Download from Claude (easiest)
The files Claude gave you are in a folder called `go-no-go-pacific`.  
Move that entire folder somewhere permanent on your Mac — for example:
```
/Users/yourname/Projects/go-no-go-pacific
```

### Option B — Create the folder manually
```
mkdir ~/Projects/go-no-go-pacific
cd ~/Projects/go-no-go-pacific
```
Then copy each file Claude provided into the correct locations:
```
go-no-go-pacific/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    └── App.jsx
```

---

## PART 4 — Push to GitHub

Open Terminal and run these commands one at a time.  
Replace `yourname` with your Mac username in the first line if needed.

```bash
# Navigate into the project folder
cd ~/Projects/go-no-go-pacific

# Install dependencies (only needed once)
npm install

# Test that it builds correctly
npm run build
```

You should see output ending in something like:
```
dist/index.html    0.50 kB
dist/assets/...    280 kB
✓ built in 4.2s
```

If that worked, push to GitHub:

```bash
# Initialize git
git init

# Stage all files
git add .

# First commit
git commit -m "Initial release v1.0.0 — ENSO dashboard"

# Connect to your GitHub repo (copy this exactly)
git remote add origin https://github.com/Powerflow-Marine/go-no-go-pacific.git

# Push
git branch -M main
git push -u origin main
```

GitHub will ask for your username and password.  
**Note:** GitHub no longer accepts your account password here.  
You need a **Personal Access Token** instead:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check **repo** scope → copy the token
3. Use that token as your password when prompted

---

## PART 5 — Set Up Netlify

1. Go to **https://netlify.com** → Sign up with your GitHub account
2. Click **Add new site** → **Import an existing project**
3. Click **GitHub**
4. Authorize Netlify to access your GitHub
5. Find and select **Powerflow-Marine/go-no-go-pacific**
6. Netlify reads your `netlify.toml` automatically — settings are pre-filled:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click **Deploy site**
8. Wait ~90 seconds — Netlify builds and deploys
9. You'll see a random URL like `happy-waves-abc123.netlify.app` — it works!

### Set your custom URL
1. In Netlify dashboard → **Domain management**
2. Click **Options** next to the random name → **Edit site name**
3. Type: `gemini-enso`
4. Save → your site is now live at **https://gemini-enso.netlify.app**

---

## PART 6 — Add to Home Screen (share with beta testers)

Tell your beta testers:

**iPhone/iPad:**
1. Open **https://gemini-enso.netlify.app** in Safari
2. Tap the Share button (box with arrow)
3. Scroll down → **Add to Home Screen**
4. Name it "Gemini ENSO" → Add
5. It appears on the home screen like an app

**Android:**
1. Open in Chrome
2. Tap the three-dot menu → **Add to Home screen**

---

## PART 7 — Pushing Updates (ongoing workflow)

When Claude gives you an updated `App.jsx`:

```bash
# Navigate to the project
cd ~/Projects/go-no-go-pacific

# Copy the new App.jsx into src/ (replacing the old one)
# Then:

git add src/App.jsx
git commit -m "Update: [describe what changed]"
git push
```

Netlify detects the push and redeploys automatically in ~60 seconds.  
Everyone on the live URL gets the update — no action needed from beta testers.

---

## Updating the Version Number

In `src/App.jsx`, near the top:
```javascript
const APP_VERSION = "1.0.0";
const APP_UPDATED = "May 2026";
```

Change these with each meaningful update. Shows in the app footer so testers know which version they're on.

Example versions:
- `1.0.0` — initial beta
- `1.0.1` — bug fixes
- `1.1.0` — new feature added
- `2.0.0` — major redesign

---

## How to Get Fixes from Claude

When something needs changing:

1. Open a new Claude conversation
2. Paste your current `src/App.jsx` file content
3. Describe exactly what's wrong or what you want changed
4. Claude makes the targeted edit and gives you back the updated file
5. You copy it into `src/App.jsx` and push

**Be specific:**
- ✅ "Change the HOLD threshold for Niño 3.4 from 1.5 to 2.0"
- ✅ "The fetch button shows an error on my phone — here's what it says"
- ✅ "Add a section showing the MJO index below the SOI card"
- ❌ "Make it better"

---

## Repo Structure Reference

```
go-no-go-pacific/
├── index.html          ← App shell (don't touch)
├── package.json        ← Dependencies (don't touch)
├── vite.config.js      ← Build config (don't touch)
├── netlify.toml        ← Deploy config (don't touch)
├── .gitignore          ← Git ignore rules (don't touch)
├── public/
│   └── favicon.svg     ← Browser tab icon
└── src/
    ├── main.jsx        ← Entry point (don't touch)
    └── App.jsx         ← THE APP — this is the only file you edit
```

**Rule of thumb:** You only ever touch `src/App.jsx`.  
Everything else is infrastructure — leave it alone.

---

## Troubleshooting

**`npm install` fails:**
Make sure Node.js is installed. Run `node --version` to check.

**`git push` asks for password and fails:**
Use a Personal Access Token, not your GitHub password. See Part 4.

**Netlify build fails:**
Check the build log in the Netlify dashboard. Usually a syntax error in App.jsx.  
Run `npm run build` locally first to catch errors before pushing.

**App shows but fetch button errors:**
The Anthropic API call may be blocked by browser settings or a network issue.  
The historical data still displays — app is functional without live fetch.

**Site not updating after push:**
Check Netlify dashboard → Deploys tab. Should show a new deploy triggered.  
If stuck, click "Retry deploy."

---

*Built by Claude for Powerflow Marine · S/V Gemini*  
*https://github.com/Powerflow-Marine/go-no-go-pacific*
