# Scorepad

A score keeper for card games: add players, enter each round, and the totals add up. Runs entirely in the browser; games are saved in the browser's local storage.

## Develop

```bash
npm install
npm run dev
```

## Workflow

1. Create a branch, e.g. `feat/target-score`, `fix/negative-totals` or `chore/update-deps`.
2. Open a pull request into `main`. CI builds the app, and Release Drafter labels the PR from its branch name or title.
3. Merge the PR. Release Drafter adds it to the draft release and picks the next version from the labels:
   - `major` / `breaking` → next major
   - `feature` / `enhancement` / `minor` → next minor
   - anything else → next patch

## Release and deploy

1. On GitHub, open **Releases**. The draft is already written.
2. Tap **Edit** on the draft, check the notes, and tap **Publish release**.
3. The **Deploy to GitHub Pages** workflow builds and deploys the site in about a minute. The version shows in the app's footer.

You can also run the deploy by hand from the **Actions** tab.

One-time setup: **Settings → Pages → Source** must be set to **GitHub Actions**.
