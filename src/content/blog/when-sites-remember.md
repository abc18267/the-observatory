---
title: When Sites Remember
description: Using localStorage to make websites feel alive, personal, and aware of returning visitors.
date: 2026-01-02
tags: [javascript, ux, experiments]
---

Most websites have amnesia. You visit. You leave. You come back. The site has no idea who you are.

That always felt wrong to me.

## The Simplest Memory

localStorage is the simplest way to give a website memory. One key. One value. Persistent across sessions. No server. No cookies banner. No accounts.

```js
const visits = parseInt(localStorage.getItem('visits') || '0');
localStorage.setItem('visits', String(visits + 1));
```

Five lines. Now your site knows if someone is new or returning.

## What You Can Do With It

Once a site remembers you, everything changes. The greeting shifts. "Hello" becomes "Welcome back." Content unlocks. Easter eggs accumulate. The experience gets richer the more you visit.

On this site, I track discoveries. Every star click, constellation, game completion, and terminal command gets recorded. The ship log page shows everything you've found. It's your personal map of the hidden layer.

## Making It Feel Natural

The trick is subtlety. Don't announce it. Don't pop up a modal that says "Welcome back, visitor #47!" Just let the site quietly adapt.

A returning visitor might notice the greeting changed. A frequent visitor might see content that wasn't there before. The site doesn't explain why. It just does it.

## What About Privacy

localStorage is 100% local. I don't send this data anywhere. There's no analytics server. No tracking pixels. The browser stores it, and only your browser can read it.

If you clear your browser data, the site forgets you. That's fine. Start fresh. Discover everything again. The loop resets, but the site is still there.

## Beyond Visits

Memory opens up creative possibilities. Time-aware greetings. Content that unlocks after multiple visits. Easter eggs that only appear once and never again. Puzzle chains that span sessions.

Games have been doing this forever. Save files. Achievements. New Game Plus. Websites can do it too. They just usually don't.

Build something that remembers. Your visitors will notice. Even if they can't explain why.
