```sh
# Install our dependencies
npm install

# Fetch the assets
npm run fetch

# Start the talk
npm start
```

By default, the talk serves at [localhost:1234](http://localhost:1234), and the presenter's notes are at [localhost:1234/presenter.html](http://localhost:1234/presenter.html).

# How the talk works
Learning from Machines is an app bundled up with `parcel`. It has two entry points: [index.html](./index.html), which has the talk itself, and [presenter.html](./presenter.html), which renders the presenter interface—just all the build notes in a line, with some widgets for timing. The presenter view gets its data from index.html through some localStorage magic—I've never needed to edit it to make a change to the talk.

## Structure

[index.html](./index.html) has every element for the entire presentation, all on one big page. Nothing is dynamically loaded. This is on purpose. This is a talk to be delivered on stage. I don't really care if the page takes a minute to load. But I absolutely need the page to be very reliable once it's loaded; slide transitions shouldn't require loading resources. If the talk were much bigger, this might be a problem, but it isn't, so it isn't.

The talk is organized into a linear sequence of *builds*.  A build is a state the talk can be in. (You might think of them as slides, but slides to me conveys that the whole screen is changing, and that's usually not true—most builds change just a few elements currently on screen).

The builds of the talk are defined by `<build-note>` elements written directly in the page itself. **Every build must have a unique id**. These are just specified as HTML ids, like `<build-note id=inception>`.

## A note on style

You might be a little surprised when you start looking deeply at [index.html](./index.html), because I've done things a little differently than most HTML files, and used some well-supported but infrequently used features of HTML and JS. Specifically:

  - When you give HTML elements `id`s, they immediately become available as variables in the page's global scope. **I was surprised when I learned this too! Nobody tells you these things!** You don't see it used that much because it's considered "bad practice," but *for inline scripts* like LfM has all over the place, I think it's perfect. It lets you talk about an element you just defined in the page in a very sensible way, and I use this feature in LfM constantly.
  - Quotes are optional in HTML, unless of course the attribute value has spaces. Wherever I can, I avoid quotes, because I like how it looks and I am a *rebel*.
  - At one point (in Hallucinations), I use `document.write` to generate a grid. This would probably be better as a custom element, but whatever, this works. I only ever needed to generate one grid, so I'm rather glad I didn't spend the effort to rig up a custom element.

## Navigation

When the presentation boots (in [main.js](./main.js)), it queries for all the `<build-note>` elements on the page, and takes their page order to be the order they occur in the presentation. It adds some additional JS properties to the elements, too, so a `<build-note>` element will have a `nextBuild` and `prevBuild`, which point to the build after and before it, respectively.

The `<build-note>`s contain the presenter notes for that build. The presenter notes in this talk are literally the exact script. For some reason, this works for me better than bullet points, even though I've mostly committed the talk to memory and rarely look at the script.

These notes don't appear on the page (they are never styled, and so have the default styling for unknown elements, which is `display: none`). But, as part of the initial `<build-note>` scan, we take their `textContent` and `innerHTML` and throw them into localStorage, which is how the presenter view gets access to them.

The presentation is driven by the location hash. If there's no hash when the page loads, or if the hash isn't the `id` of a build on the page, we navigate to the hash for the first build.

When we receive key events, we set the location hash to the hash of either the next or previous build, depending on the key event. Right and Page Down move to the next build; Left and Page Up move to the previous (I wired up Page Up/Page Down because that's what some clickers send, for some reason).

We also change the location hash in response to `storage` events, which are emitted whenever `localStorage` changes. If we see an update to `localStorage.currentBuild`, we set the location hash to that build ID. This is how the presenter view controls the presentation.

One last very very important thing: **When the build changes, we set the ID of the current build as a class on the body**.  This is what drives like 99% of the action in the talk. We use CSS child selectors to define what the page should look like at each build. You can see how this works in the stylesheets: [title.less](./title.less), [hallucinations.less](./hallucinations.less), [inside.less](./inside.less), [dreams.less](./dreams.less) and [stones.less](./stones.less).  That's the order they occur in the presentation, but my technique for writing them changed over time, so I actually think [stones.less](./stones.less) contains the best practices for it. They're incredibly repetitive. When I add a build, I copy-paste the build that's most like how I want it to look, and change what needs to be changed. This means they're *huge*: by weight, this talk is 38% HTML (most of which is the presenter notes), and 30% CSS, which is pretty wild. But it *works*, is the thing, and extremely reliably, which is what you want in a talk.

## When...
Reading through [index.html](./index.html), you'll encounter a lot of stuff like this:

```js
  When(dreamFullscreenPaused)
    .start(() => {
      deepDream.currentTime = 0
      deepDream.pause()
    })
```

`When` is a function defined in [when.js](./when.js) (and exported globally from [main.js](./main.js)).  It lets us define *animators*, which run, uh, *when* a condition is truthy. 

Conditions can be any JS function, which will be evaluated once per frame. They can also be any JS object that defines a `[match]` method (a Symbol defined in `when.js`). In the initial scan, I add that method to all the `<build-note>`s, so I can treat them like conditions, which is what's happening above. 

Animators define `start`, `frame`, `end` and, for animators with a defined duration, `at` callbacks. For `When` animators, these callbacks run:
  1. `start` — when the condition becomes true
  2. `frame` — once per frame while the condition is true
  3. `end` — after the condition becomes false

They all receive `(ts, currentBuild, prevBuild)`:
  - `ts` — the current timestamp, in milliseconds since page load
  - `currentBuild` — the DOM element for the current build
  - `prevBuild` — the DOM element for the previous build

If we are not currently changing builds, `currentBuild === prevBuild`.

A couple of commented examples:

```js
  // When the build is dreamFullscreenPaused…
  When(dreamFullscreenPaused)
    // When the build becomes dreamFullscreenPaused
    .start(() => {
      // Set the currentTime of the <video id=deepDream> element to 0
      deepDream.currentTime = 0
      // And pause it.
      deepDream.pause()
    })
```

Here's a more complex one:

```js
  // When the build is in the range dreamFullscreenMiquel…dreamFullscreenFleshZones, inclusive…
  When(buildInRange(dreamFullscreenMiquel, dreamFullscreenFleshZones))
    // When we enter the range, start the deepDream video element playing…
    .start(() => {
      deepDream.play()
    })
    // While we're in the range, every frame:
    .frame((_, current, prev) => {
      // If I forgot to define deepDream.timeline, bail out
      // so the rest of this animator still works and we don't spew
      // errors all over the console.
      //
      // Not like that ever happened or anything 😉
      if (!deepDream.timeline) return
      // Set the text of deepDreamCurrentLayer to description of the layer
      deepDreamCurrentLayer.text = deepDream.timeline(deepDream).layer
      // When we change builds, tell the video
      // element to spend at most 2 seconds seeking to the time defined on the
      // current build-note, resuming playback at normal speed.
      //
      // (The deepDream video element is a custom element,
      // specified with `is=seekable-video`, which gives it this power).
      if (current !== prev && current.dataset.time) {
        deepDream.seekTo({time: +current.dataset.time, duration: 2, playbackRate: 1})
      }
    })
```

## Custom Elements and other animations

`When` is part of an animation framework built into the talk. There's an animation framework built into most of my talks—for some reason, I can't stop writing animation frameworks.

Anyway, when I first started writing LfM, I thought I would do most of the effects with WebGL. Then I got Miquel's deep dream video playing in a texture, and it was flickering, and… I gave up, and used CSS instead. This has proven to be a good decision, for this talk at least.

If we couldn't rely so hard on CSS animations, the animation framework would be more important. As it is, it still drives a few important things apart from `When`s in the script:
  - The [`<type-writer>`](./type-writer.js) custom element, which does the typewriter effect you see all over the place (which is *thematic consistency* and also *hey, I wrote this thing, may as well…*)
  - The [`<video is=seekable-video>`](./seek-able.js) custom element, which does a kind of "smart seek," getting a video to a particular timestamp within a particular seek duration. It watches the state of the seek and either adjusts the playback rate or directly seeks the video, depending on how much time it has left. It's not as smooth as I'd like—the long seek into the flesh zones usually times out to a direct seek—but it's pretty good.
  - The [`<grid-cells>`](./rat.js) custom element uses it to animate a rat running around. It's also a rare example of a direct animator, i.e., the custom element itself is an animator and adds itself manually to the animation queue.
  - The [`<body-model>`](./body-model.js) custom element, which shows that constantly shifting pile of random numbers and body parts to represent the brain's internal model of the body's state.

These mostly use `For`, which is `When`'s sister. Whereas `When` defines animators which trigger on conditions, `For` defines animators which trigger immediately and have a duration. They receive the same callbacks, although using `at` is more common than `frame` with `For`—you can look at those custom elements if you're curious about it.

## Conclusion

You know, when I wrote this talk, I kept thinking, "Gosh, I'll rewrite this with React or something someday and I'm sure it'll be so much cleaner and easier."

Having tried writing a talk of similar complexity with React? Fuck that noise. I wrote two talks in React that were of similar complexity, and while they are both cool in their own ways, they are also both janky AF, and were incredible pains to write, and would be more reliable and less painful *without React*.

This is the most reliable talk I've ever given. It all *just works* and *really well*. You can *hold down the arrow key* and it'll dutifully animate through a flicker of builds—and when you release it, the last build will transition smoothly to its resting state. You want to see a wild demonstration of this? Check out [how I did that "going to sleep" effect at the end of hallucinations](./index.html#L680). What more could you ask for in a talk.

These frameworks are killing us. They are warping our *minds*.

There are, of course, things I'd change about LfM, things I'd refactor, and there are probably some corners of the code that are a bit out there. But after going deep into the forest of more complex presentation frameworks and coming back and looking at this, I have to say: **the raw web platform rocks**. There's nothing else that comes close to letting you do this, on basically every screen in the world, for free.