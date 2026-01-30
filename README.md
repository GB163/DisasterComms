<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xHOqgKeeHkC0AiUOtfKag6oPTOC0Hul4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy (recommended: Vercel or Netlify)

GitHub Pages often has path/base issues with Vite apps. Use **Vercel** or **Netlify** for reliable hosting:

### Option A: Vercel (easiest)

1. Go to **[vercel.com](https://vercel.com)** and sign in (e.g. with GitHub).
2. Click **Add New… → Project** and **Import** your **DisasterComms** repo.
3. Leave Build Command: `npm run build`, Output: `dist`. Click **Deploy**.
4. In about a minute you get a URL like `disastercomms.vercel.app` and the full UI loads.

### Option B: Netlify

1. Go to **[netlify.com](https://netlify.com)** → **Add new site → Import** → GitHub → **DisasterComms**.
2. Build: `npm run build`, Publish: `dist`. Click **Deploy**. You get a URL and the UI loads.

---

## Deploy to GitHub Pages (optional)

1. Push the repo to GitHub (including `.github/workflows/deploy-pages.yml`).
2. In your repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or `master`) to trigger the workflow. After it runs, the site will be at:
   - **https://&lt;username&gt;.github.io/&lt;repo-name&gt;/**

If the page is blank or assets fail to load, confirm the **Source** is **GitHub Actions** (not “Deploy from a branch”) and that the workflow run completed successfully under the **Actions** tab.
