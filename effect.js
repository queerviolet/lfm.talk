class Effect {
  constructor(state={}) {
    this.last = new Build(this, null, state)
  }

  build(params) {
    return this.last = this.last.build(params)
  }

  applyState(state) {}
}

class Build {
  constructor(effect, startState, endState) {
    this.effect = effect
    this.startState = startState
    this.endState = endState
  }

  build() {
    return this.effect.applyState(this.startState, this.endState)
  }

  unbuild() {
    return this.effect.applyState(this.endState, this.startState)
  }
}