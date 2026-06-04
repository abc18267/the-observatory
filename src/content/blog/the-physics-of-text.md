---
title: The Physics of Text
description: Building a component that makes text explode with Matter.js, and what it teaches about interaction design.
date: 2025-09-20
tags: [physics, matter-js, interaction]
---

Click the heading on the About page. The letters explode. They fall. They bounce off each other and settle at the bottom of their container. It's 40 lines of code and it changes how the page feels.

## Matter.js in 30 Seconds

Matter.js is a 2D physics engine for the browser. You create a world, add bodies, and run the simulation. The engine handles gravity, collisions, and friction. You just render the results.

The library is about 80KB. That's too much for a static page load. So I dynamically import it only when the PhysicsText component mounts. If JavaScript is off, you just see normal text.

## How PhysicsText Works

Each letter becomes a physics body. I measure the rendered position of every character, create a rectangle body at that position, and add it to the world. Then I start the engine.

Gravity pulls the letters down. The container walls keep them from falling off screen. The letters collide with each other, stack up, and eventually settle.

The visual update runs on `requestAnimationFrame`. Each frame, I read the position and rotation of every body and apply CSS transforms to the corresponding DOM element.

## The Click Trigger

The physics don't start automatically. The text looks normal until you click it. That's important. If every heading exploded on load, it would be noise. The click makes it intentional. You chose to break the text. That's a moment of delight.

After the letters settle, they stay where they fell. No reset. The page remembers your destruction. Scroll away and come back. The letters are still on the floor.

## What It Teaches

Interaction design isn't just buttons and forms. It's about making every element potentially interactive. A heading that responds to clicks. A word that opens a game. A background that tracks your mouse.

The web is an interactive medium. Most sites use 5% of that interactivity. Buttons, links, and forms. That's like using a piano to play one note.

## Performance Notes

Matter.js runs at 60fps on modern devices. The physics world is small (20-30 bodies max), so the simulation is lightweight. The DOM updates are the expensive part. Using CSS transforms keeps the browser happy because transforms don't trigger layout recalculation.

I kill the physics engine after the letters settle (velocity below a threshold for 2 seconds). No reason to run a simulation for static bodies.

Build something that responds to touch. Even if it's just text falling apart.
