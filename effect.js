let nextEffectId = 0
class Effect {
  constructor(state={}) {
    this.id = nextEffectId++
    this.last = new Build(this, null, state)
  }

  add(newState) {
    return this.last = new Build(this, this.last.endState, newState)
  }

  applyState(endState, startState) {}
}

export default Effect

export class Build {
  constructor(effect, startState, endState) {
    this.effect = effect
    this.startState = startState
    this.endState = endState
  }

  build() {
    return this.effect.applyState(this.endState, this.startState)
  }

  unbuild() {
    return this.effect.applyState(this.startState, this.endState)
  }
}