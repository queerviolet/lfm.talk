import Timeline from './timeline'
global.Timeline = Timeline

// import Builds from './builds'

// global.Builds = Builds

import {When, For, buildInRange, runAnimatorStep, always, match, lerp, every, sec, any} from './when'
Object.assign(global, {When, For, buildInRange, always, every, sec, lerp, any})

import './type-writer'
import './seek-able'
import './rat'
import './body-model'
import './oscill-o-scope'

// import './fire'

function collectBuilds() {
  const all = Array.from(document.getElementsByTagName('build-note'))
  let i = all.length; while (i --> 0) {
    const b = all[i]
    b.order = i
    b.nextBuild = all[i + 1]
    b.prevBuild = all[i - 1]
    b[match] = (_, current) => current === b
  }
  return all
}

let BUILDS, currentBuild = null
const getBuildIdFromHash = () => window.location.hash.substr(1)
const getCurrentBuild = () => document.getElementById(getBuildIdFromHash())
const setCurrentBuild = build => {
  build && (window.location.hash = '#' + build.id)
  localStorage.currentBuild = build.id
}

const activate = build => {
  if (build === currentBuild) return [build, build]
  if (currentBuild) {
    currentBuild.classList.remove('current')
    document.body.classList.remove(currentBuild.id)
  }
  if (!build) return
  document.body.classList.add(build.id)
  document.body.dataset.currentBuild = build.id
  build.classList.add('current')
  const prev = currentBuild
  currentBuild = build
  return [build, prev]
}

const getAssetsWithLoadStatus = (elementTypes=['video', 'img', 'audio']) =>
  elementTypes
    .map(tag => document.getElementsByTagName(tag))
    .reduce((all, set) => [...all, ...set])
    .map(v => {
      v.addEventListener('loadeddata', () => v.hasLoaded = true)
      v.addEventListener('load', () => v.hasLoaded = true)
      v.addEventListener('error', err => v.hasError = err)
      v.preload = 'auto'
      v.src = v.src
      return v
    })

const sleep = (dur=1[sec]) => new Promise(_ => setTimeout(_, dur))

const createLoadScreen = assets => {
  const loaders = assets.map(asset => Object.assign(
    document.createElement('type-writer'), {asset}))
  const term = document.createElement('type-writer')
  term.className = 'terminal'
  const loadScreen = document.createElement('div')
  loadScreen.appendChild(term)
  loadScreen.id = 'bootloader'
  loaders.forEach(l => loadScreen.appendChild(l))
  document.body.appendChild(loadScreen)
  loadScreen.term = term
  loadScreen.loaders = loaders
  return loadScreen
}

const destroyLoadScreen = screen =>
  document.body.removeChild(screen)

const anyKey = () => {
  let resolve, p = new Promise(_ => resolve = _)
  addEventListener('keydown', resolve)
  addEventListener('touchstart', resolve)
  addEventListener('mousedown', resolve)
  return p.then(() => {
    removeEventListener('keydown', resolve)
    removeEventListener('touchstart', resolve)
    removeEventListener('mousedown', resolve)
  })
}

async function boot() {
  if (localStorage.loadQuietly) return true
  const assets = getAssetsWithLoadStatus()
  const loadScreen = createLoadScreen(assets)

  const log = (msg, nl='\n') => loadScreen.term.type(msg + nl).done
  log('Please wait, preloading assets for smoother playback...')

  const loading = When().frame(every(0.5[sec])((_, t) => {
    const dots = new Array(t % 4).fill('.').join('')
    const stillLoading = loadScreen.loaders.filter(l => !l.reportedDone)
    if (!stillLoading.length) return loading.remove()
    stillLoading.forEach(loader => {
      const {asset} = loader, {src, hasLoaded, hasError} = asset
      if (hasLoaded) {
        loader.reportedDone = true
        return loader.text = `${src}... DONE!`
      }
      if (hasError) {
        loader.reportedDone = true
        return loader.text = `${src}... ERROR! ${hasError}`
      }
      loader.text = loader.asset.src + dots
    })
  }))

  const skip = document.createElement('a')
  skip.innerText = '[ Skip Preload (tap here or ESC) ]'
  skip.onclick = skipPreload
  addEventListener('keydown', onPreloadKeydown)
  function onPreloadKeydown(e) {
    if (e.key !== 'Escape') return
    skipPreload()
  }
  function skipPreload() {
    skip.innerText = 'Preload skipped (video playback may be choppy)'
    localStorage.loadQuietly = true
    loading.remove()
  }
  loadScreen.prepend(skip)

  try {
    await loading.done
    removeEventListener('keydown', onPreloadKeydown)
    await log('OK, assets loaded.')
    if (!localStorage.instructionsDelivered) {
      localStorage.instructionsDelivered = true
      await log('Use ⬅ and ➡ arrow keys to move, or 👆🏽 tap to advance on touch devices.')
      await log('Press any key or tap to continue.')
      await anyKey()
    }
    return true
  } finally {
    document.body.removeChild(loadScreen)
  }
}

// function observeElementBoxes(
//   set=(prop, value) => document.documentElement.style.setProperty(prop, value + 'px')
// ) {
//   const watchId = Symbol('watchId')
//   const observer = new ResizeObserver(entries => {
//     let i = entries.length; while (i --> 0) {
//       const {contentRect, target: {[watchId]: id}} = entries[i]
//       console.log(contentRect.left)
//       set(`--${id}-top`, contentRect.top)
//       set(`--${id}-left`, contentRect.left)
//       set(`--${id}-bottom`, contentRect.bottom)
//       set(`--${id}-right`, contentRect.right)
//       set(`--${id}-width`, contentRect.width)
//       set(`--${id}-height`, contentRect.height)      
//     }
//   })

//   const watching = document.querySelectorAll('[data-watch-box]')
//   let i = watching.length; while (i --> 0) {
//     const e = watching[i]
//     e[watchId] = e.dataset.watchBox || e.id
//     observer.observe(e)
//   }
// }

async function main() {
  BUILDS = collectBuilds()
  Object.assign(global, {getCurrentBuild, BUILDS})

  localStorage.buildNotes = JSON.stringify(BUILDS.map(
    ({id, order, textContent, innerHTML,
      nextBuild, prevBuild}) => {
      return {
        id, order, textContent, innerHTML,
        nextBuildId: nextBuild && nextBuild.id,
        prevBuildId: prevBuild && prevBuild.id,
      }
    }))

  // observeElementBoxes()

  let ready = false
  const frame = ts => {
    requestAnimationFrame(frame)
    if (!ready) return runAnimatorStep(ts, null, null)
    if (!getCurrentBuild()) { setCurrentBuild(BUILDS[0]) }
    const [current, prev] = activate(getCurrentBuild())
    global.__currentBuild = current
    global.__prevBuild = prev
    runAnimatorStep(ts, current, prev)
  }

  requestAnimationFrame(frame)

  ready = await boot()
}

function onKey({code}) {
  switch (code) {
    case 'ArrowRight':
    case 'PageDown':
      currentBuild &&
      currentBuild.nextBuild &&
      setCurrentBuild(currentBuild.nextBuild)
      return
    
    case 'ArrowLeft':
    case 'PageUp':
      currentBuild &&
      currentBuild.prevBuild &&
      setCurrentBuild(currentBuild.prevBuild)
      return
  }
}

function updateBuildFromLocalStorage() {
  const build = document.getElementById(localStorage.currentBuild)
  if (build) setCurrentBuild(build)
}

addEventListener('storage', updateBuildFromLocalStorage)
addEventListener('DOMContentLoaded', main)
addEventListener('keydown', onKey)
addEventListener('mousedown', () => currentBuild &&
currentBuild.nextBuild &&
setCurrentBuild(currentBuild.nextBuild))
addEventListener('touchstart', () => currentBuild &&
currentBuild.nextBuild &&
setCurrentBuild(currentBuild.nextBuild))