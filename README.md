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

## Deploy to GitHub Pages

1. Push the repo to GitHub (including the new `.github/workflows/deploy-pages.yml`).
2. In your repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or `master`) to trigger the workflow. After it runs, the site will be at:
   - **https://&lt;username&gt;.github.io/&lt;repo-name&gt;/**

If the page is blank or assets fail to load, confirm the **Source** is **GitHub Actions** (not “Deploy from a branch”) and that the workflow run completed successfully under the **Actions** tab.
