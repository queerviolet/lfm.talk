import {Build} from './effect'

import Timeline from './timeline'
global.Timeline = Timeline

import Builds from './builds'

global.Builds = Builds

import {When, buildInRange, runAnimatorStep, always, match, every, sec, any} from './when'
Object.assign(global, {When, buildInRange, always, every, sec, any})

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
const setCurrentBuild = build => window.location.hash = '#' + build.id

const activate = build => {
  if (build === currentBuild) return [build, build]
  if (currentBuild) {
    currentBuild.classList.remove('current')
    document.body.classList.remove(currentBuild.id)
  }
  if (!build) return
  document.body.classList.add(build.id)
  build.classList.add('current')
  const prev = currentBuild
  currentBuild = build
  return [build, prev]
}

function main() {
  BUILDS = collectBuilds()
  Object.assign(global, {getCurrentBuild, BUILDS})

  const frame = ts => {
    requestAnimationFrame(frame)
    if (!getCurrentBuild()) { setCurrentBuild(BUILDS[0]) }
    const [current, prev] = activate(getCurrentBuild())
    global.__currentBuild = current
    global.__prevBuild = prev
    runAnimatorStep(ts, current, prev)
  }

  requestAnimationFrame(frame)
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

addEventListener('DOMContentLoaded', main)
addEventListener('keydown', onKey)