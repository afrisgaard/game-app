# Scorepad

A score keeper for card games: add players, enter each round, and the totals add up. Runs entirely in the browser; games are saved in the browser's local storage.

## Develop

```bash
npm install
npm run dev
```

## Release and deploy

Every published GitHub release builds the app and deploys it to GitHub Pages.

1. Commit and push your changes to `main`.
2. On GitHub, open **Releases → Draft a new release**.
3. Create a new tag such as `v1.1.0`, add notes, and tap **Publish release**.
4. The **Deploy to GitHub Pages** workflow runs, and the site updates in about a minute. The version shows in the app's footer.

You can also run the workflow by hand from the **Actions** tab.

One-time setup: **Settings → Pages → Source** must be set to **GitHub Actions**.
