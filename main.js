import Builds, {forBuild} from './builds'

global.Builds = Builds

console.log(Builds)

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

function main() {
  let id = 0;
  Array.from(document.scripts).forEach(script => {
    const builds = script[Builds]
    if (Array.isArray(builds)) {
      for (let i = 0; i != builds.length; ++i) {
        builds[i].id = id++
      }
      allBuilds.push(...builds)
    }
  })
  console.log('Builds:', allBuilds)

  setBuildHash(getBuildHash())
  
  let active = []
  let currentBuild = null

  const buildAt = startTime => build => build.build(startTime)
  const unbuildAt = startTime => build => build.unbuild(startTime)

  const launch = (forBuildId, builds, createAnimation) => {
    builds = Array.isArray(builds)
      ? builds
      : [builds]
    
    active.push(...builds.map(b => {
      const anim = createAnimation(b)
      if (anim) {
        anim[forBuild] = forBuildId
        return anim
      }
    }))
  }

  const frame = ts => {
    requestAnimationFrame(frame)

    const nextBuild = getBuildHash()
    if (nextBuild !== currentBuild) {
      active = active
        .filter(animation => animation[forBuild])
      if (nextBuild < currentBuild)
        launch(allBuilds[nextBuild], allBuilds[nextBuild + 1], unbuildAt(ts))
      else
        launch(allBuilds[nextBuild], allBuilds[nextBuild], buildAt(ts))
      currentBuild = nextBuild
      console.log('Building:', currentBuild)
      console.log('active:', active.length)
    }

    let i = active.length; while (i --> 0) {
      const animation = active[i]
      if (!animation) {
        active.splice(i, 1)
        continue
      }
      if (!animation.step(ts)) {
        active.splice(i, 1)
      }
    }
  }

  global.dumpState = () => console.log(currentBuild, active)

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

global.allBuilds = allBuilds
addEventListener('DOMContentLoaded', main)
addEventListener('keydown', onKey)