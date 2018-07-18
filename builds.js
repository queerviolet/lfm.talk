import Animation from './anim'
import Effect from './effect'

const Builds = (...builds) => {
  document.currentScript[Builds] =
    document.currentScript[Builds] || []
  document.currentScript[Builds].push(...builds)
}

const buildSymbol = Symbol('builds')
Builds[Symbol.toPrimitive] = () => buildSymbol

export default Builds

class CSSBuilds extends Effect {
  constructor(element, startClass=element.className) {
    super(startClass)
    this.element = element
  }

  setClass(newClass) {
    return this.add(newClass)
  }

  applyState(endClass) {
    return Animation.instant(() => {
      this.element.className = endClass
    })
  }
}

global.CSSBuilds = CSSBuilds

class Playback extends Effect {
  constructor(element, startState={playing: false, currentTime: 0}) {
    super(startState)
    this.element = element
  }

  play(currentTime) {
    const newState = {playing: true}
    if (typeof currentTime === 'number') newState.currentTime = currentTime
    return this.add(Object.assign({}, this.last.endState, newState))
  }

  applyState(end) {
    const {element} = this
    return Animation.instant(() => {
      if (element.currentTime !== end.currentTime)
        element.currentTime = end.currentTime

      if (element.playing !== end.playing) {
        end.playing ? element.play() : element.pause()
      }
    })
  }
}

global.Playback = Playback

class Daemon extends Effect {
  constructor(params) {
    super(false)
    this.params = params
    this.proc = null
  }

  start() {
    return this.add(true)
  }

  stop() {
    return this.add(false)
  }

  applyState(end) {
    if (end && !this.proc)
      return this.proc = Animation.daemon(this.params)
    if (!end && this.proc) {
      this.proc.running = false
      this.proc = null
    }
  }
}

global.Daemon = Daemon
