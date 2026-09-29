<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4310e2ef-ba05-48d0-a27c-f8637b0ac9b4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CK Chat - Install (one time only)
1. Run `npm install && npm run build`, upload the contents of `dist/` to your PHP hosting (public_html).
2. Create a MySQL database + user in cPanel.
3. Open your domain: installer asks for DB details + admin details (all required).
4. After install, `api/install.lock` is created - the installer never shows again for anyone. All visitors get the login page and share the same data.
To reinstall: delete `api/install.lock` and `api/config.php`.

## Node.js setup (current)
1. `npm install`
2. `npm run build`
3. `npm start`  (runs server.js on PORT, default 3000)
4. Open the site, fill database (MySQL) + admin details once. After that `data/install.lock` blocks the installer for everyone.
Reinstall: delete the `data/` folder.
Dev: run `node server.js` and `npm run dev` together.
