import Animation from './anim'

const Builds = (...builds) => {
  document.currentScript[Builds] =
    document.currentScript[Builds] || []
  document.currentScript[Builds].push(...builds)
}

const buildSymbol = Symbol('builds')
Builds[Symbol.toPrimitive] = () => buildSymbol

export default Builds

class CSSBuilds {
  constructor(element, startClass=element.className) {
    this.last = new SetCSSClass(element, null, startClass)
  }

  setClass(newClass) {
    return this.last = this.last.setClass(newClass)
  }
}

global.CSSBuilds = CSSBuilds

class SetCSSClass {
  constructor(element, startClass, endClass) {
    this.element = element
    this.startClass = startClass
    this.endClass = endClass
  }

  setClass(nextClass) {
    return new SetCSSClass(this.element, this.endClass, nextClass)
  }

  build(startAt) {
    return Animation.instant(() => {
      this.element.classList.remove(this.startClass)
      this.element.classList.add(this.endClass)
    })
  }

  unbuild(startAt) {
    return Animation.instant(() => {
      this.element.classList.remove(this.endClass)
      this.element.classList.add(this.startClass)
    })
  }
}


class Playback {
  constructor(element, startState={playing: element.playing, currentTime: element.currentTime}) {
    this.last = new PlayState(element, null, startState)
  }

  play(mediaTime) {
    return this.last = this.last.play(mediaTime)
  }
}

window.Playback = Playback

class PlayState {
  constructor(element, startState, endState) {
    this.element = element
    this.startState = startState
    this.endState = endState
  }

  play() {
    return new PlayState(this.element,
      this.endState,
      Object.assign({}, this.endState, {playing: true}))
  }

  static changeState(element, end) {
    return Animation.instant(() => {
      if (element.currentTime !== end.currentTime)
        element.currentTime = end.currentTime

      if (element.playing !== end.playing) {
        end.playing ? element.play() : element.pause()
      }
    })
  }

  build() {
    return PlayState.changeState(this.element, this.endState)
  }

  unbuild() {
    return PlayState.changeState(this.element, this.startState)
  }
}

class Daemon {
  constructor(props) {
    this.props = props
    this.last = new DaemonState(this, false, false)
  }

  start() {
    return this.last = this.last.start()
  }

  stop() {
    return this.last = this.last.stop()
  }
}

global.Daemon = Daemon

class DaemonState {
  constructor(daemon, startState, endState) {
    this.daemon = daemon
    this.startState = startState
    this.endState = endState
  }

  start() {
    return new DaemonState(this.daemon, this.endState, true)
  }

  stop() {
    return new DaemonState(this.daemon, this.endState, false)
  }

  build() {
    return DaemonState.applyState(this.daemon, this.startState, this.endState)
  }

  unbuild() {
    return DaemonState.applyState(this.daemon, this.endState, this.startState)
  }

  static applyState(daemon, start, end) {
    if (start === end) return
    if (!end && daemon.proc)
      daemon.proc.running = false
    if (end && !daemon.proc) {
      daemon.proc = Animation.daemon(daemon.props)
    }
  }
}

global.Daemon = Daemon
