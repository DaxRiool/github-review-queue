# GitHub Review Queue

Browser extension for Chrome and Firefox that adds a **To review** tab next to *Open / Closed* in GitHub's pull request lists. Click it to see only pull requests that:

- are open and not a draft,
- are not approved yet,
- you have not reviewed yet (no approval, comment or change request from you).

Click it again to go back to the list you had.

## Install

**Chrome**

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Reload a GitHub pull request list.

**Firefox** (109 or later)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and select this folder's `manifest.json`.
3. Reload a GitHub pull request list.

## How it works

The tab adds GitHub's own search qualifiers to the query in the URL:

```
draft:false -review:approved -reviewed-by:@me
```

plus `state:open` when no state is chosen. Because GitHub does the filtering, pagination and the
counters stay correct and no token or API call is needed. Other qualifiers in the query (labels,
author, ...) are kept, so the filter combines with them. `@me` only resolves when you are signed in.

The tab is placed after the *Closed* link, found by its `href` because GitHub's class names are hashed.
Where that link isn't on the page, the toggle is shown as a floating button in the bottom right.

## Tests

```sh
node --test
```
