import {Build} from './effect'

import Timeline from './timeline'
global.Timeline = Timeline

import Builds from './builds'

global.Builds = Builds

const getBuildHash = () => +window.location.hash.substr(1) || 0
const setBuildHash = build => {
  const target =
    build < 0
      ? 0
      :
    build >= allBuilds.length
      ? allBuilds.length - 1
      :
      build
  console.log('build target:', target)
  window.location.hash = '#' + target
}
const allBuilds = []
const allEffectBuilds = []
global.allBuilds = allBuilds
global.allEffectBuilds = allEffectBuilds

function main() {
  let orderCounter = 0, lastBuildForEffect = []

  const addBuildGroup = group => {
    allBuilds.push(group)

    if (!Array.isArray(group)) group = [group]

    const order = orderCounter++
    group.forEach(build => {
      build.order = order
      lastBuildForEffect[build.effect.id] = build
    })

    allEffectBuilds[order] = lastBuildForEffect
      .map(lastBuild => {
        if (lastBuild.order === order) return lastBuild
        return new Build(lastBuild.effect, lastBuild.endState, lastBuild.endState)
      })
  }

  Array.from(document.scripts).forEach(script => {
    const buildGroups = script[Builds]
    if (Array.isArray(buildGroups)) {
      buildGroups.forEach(addBuildGroup)
    }
  })
  console.log('Builds:', allBuilds)

  setBuildHash(getBuildHash())
  
  let active = []
  let currentBuildIndex = null

  let nextTaskId = 0

  const build = _ => _.build()
  build[Symbol.toPrimitive] = () => 'build'

  const unbuild = _ => _.unbuild()
  unbuild[Symbol.toPrimitive] = () => 'unbuild'

  const launch = createAnimation => builds => {
    builds = Array.isArray(builds)
      ? builds
      : [builds]
    
    let i = builds.length; while (i --> 0) {
      const b = builds[i]
      const anim = createAnimation(b)
      if (anim) {
        anim.id = nextTaskId++
        console.log('[%s] (%s) START animation for build order:%s',
          anim.id, createAnimation, b.order, anim, b)
        active.push(anim)
      }
    }
  }

  const launchBuilds = launch(build)
  const launchUnbuilds = launch(unbuild)

  const rebuildForward = order => launchBuilds(allEffectBuilds[order])
  const rebuildBackward = order => launchUnbuilds(allEffectBuilds[order + 1])
  const buildForward = order => launchBuilds(allBuilds[order])
  const buildBackward = order => launchUnbuilds(allBuilds[order + 1])

  const initiateBuilds = () => {
    const nextBuildIndex = getBuildHash()
    if (nextBuildIndex !== currentBuildIndex) {
      active = active
        .filter(animation => animation.daemon)
      if (currentBuildIndex === null)
        rebuildForward(nextBuildIndex)

      const delta = nextBuildIndex - currentBuildIndex
      console.log('nextBuildIndex', nextBuildIndex)
      if (Math.abs(delta) === 1)
        delta === 1 ? buildForward(nextBuildIndex) : buildBackward(nextBuildIndex)
      else if (nextBuildIndex < currentBuildIndex)
        rebuildBackward(nextBuildIndex)
      else
        rebuildForward(nextBuildIndex)
      currentBuildIndex = nextBuildIndex
      console.log('Building:', currentBuildIndex)
      console.log('active:', active.length)
    }
  }

  const runAnimations = ts => {
    let i = active.length; while (i --> 0) {
      const animation = active[i]
      if (!animation) {
        active.splice(i, 1)
        continue
      }
      if (!animation.step(ts)) {
        active.splice(i, 1)
        console.log('[%s] DONE', animation.id)
      }
    }
  }

  const frame = ts => {
    requestAnimationFrame(frame)
    initiateBuilds()
    runAnimations(ts)
  }

  global.dumpState = () => console.log(currentBuildIndex, active)

  requestAnimationFrame(frame)
}

function onKey({code}) {
  switch (code) {
    case 'ArrowRight':
    case 'PageDown':
      setBuildHash(getBuildHash() + 1)
      return
    
    case 'ArrowLeft':
    case 'PageUp':
      setBuildHash(getBuildHash() - 1)
      return
  }
}

addEventListener('DOMContentLoaded', main)
addEventListener('keydown', onKey)