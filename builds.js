const Builds = (...builds) => {
  document.currentScript[Builds] =
    document.currentScript[Builds] || []
  document.currentScript[Builds].push(...builds)
}

const buildSymbol = Symbol('builds')
Builds[Symbol.toPrimitive] = () => buildSymbol
window.Builds = Builds

const forBuild = Symbol()

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
  window.location.hash = '#' + target
}
const allBuilds = []

function main() {
  Array.from(document.scripts).forEach(script => {
    if (script[Builds]) {
      allBuilds.push(...script[Builds])
    }
  })
  console.log('Builds:', allBuilds)

  setBuildHash(getBuildHash())
  
  let active = []
  let currentBuild = null

  const buildAt = startTime => build => build.build(startTime)
  const unbuildAt = startTime => build => build.unbuild(startTime)

  const launch = (builds, createAnimation) => {
    builds = Array.isArray(builds)
      ? builds
      : [builds]
    
    active.push(...builds.map(createAnimation))
  }

  const frame = ts => {
    requestAnimationFrame(frame)

    const nextBuild = getBuildHash()
    if (nextBuild !== currentBuild) {
      active = active
        .filter(animation => animation[forBuild] !== nextBuild)
      if (nextBuild < currentBuild)
        launch(allBuilds[nextBuild + 1], unbuildAt(ts))
      else
        launch(allBuilds[nextBuild], buildAt(ts))
      currentBuild = nextBuild
      console.log('Building:', currentBuild)
      console.log('active:', active.length)
    }

    let i = active.length; while (i --> 0) {
      const next = active[i](ts)
      if (!next) {
        active.splice(i, 1)
        continue
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