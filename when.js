export const defaultContext = {
  add: addAnimator,
  remove: removeAnimator,
}

export const unattached = {
  add: _ => {},
  remove: _ => {}
}

export const always = () => true

export const When = (condition=always, ctx=defaultContext) => {
  const handlers = {start: [], frame: [], at: [], end: [], changed: []}
  const run = type => {
    const cbs = handlers[type]
    return (ts, currentBuild, lastBuild) => {
      const count = cbs.length
      for (let i = 0; i !== count; ++i)
        cbs[i].apply(step, [ts, currentBuild, lastBuild])
    }
  }

  const start = run('start')
  const frame = run('frame')
  const at = run('at')
  const end = run('end')
  const changed = run('changed')

  let resolveDone = null
  const resetDone = () => step.done = new Promise(_ => resolveDone = _)

  const step = (ts, currentBuild, lastBuild) => {
    const shouldRun = condition[match](ts, currentBuild, lastBuild)
    if (shouldRun && !step.running) {
      start(ts, currentBuild, lastBuild)
      step.startedAt = ts
      step.running = true
    }
    if (!shouldRun && step.running) {
      end(ts, currentBuild, lastBuild)
      step.endedAt = ts
      step.running = false
      resolveDone(step)
      resetDone()
    }
    if (step.running) {
      if (currentBuild !== lastBuild) changed(ts, currentBuild, lastBuild)
      frame(ts, currentBuild, lastBuild)
      if (typeof step.duration === 'number') {
        const t = (ts - step.startedAt) / step.duration
        at(t, currentBuild, lastBuild)
      }
    }
  }

  resetDone()
  step.running = false
  step.start = cb => { handlers.start.push(cb); return step }
  step.changed = cb => { handlers.changed.push(cb); return step }
  step.frame = cb => { handlers.frame.push(cb); return step }
  step.at = cb => { handlers.at.push(cb); return step }
  step.end = cb => { handlers.end.push(cb); return step }
  step.withName = name => { step.animatorName = name; return step }
  step.withDuration = duration => { step.duration = duration; return step }
  step.remove = () => ctx && ctx.remove(step)
  ctx.add && ctx.add(step)
  return step
}

export const For = (duration, ctx=defaultContext) => {
  let endTime
  const anim =
    When(ts => !anim.running || ts < endTime, ctx).withDuration(duration)
      .start(ts => endTime = ts + duration)
      .end(() => ctx.remove(anim))
  return anim
}

export const every = interval => {
  lastTick = null
  return cb => function (ts, currentBuild, lastBuild) {
    const currentTick = Math.floor((ts - this.startedAt) / interval)
    if (currentTick !== lastTick)
      cb.apply(this, [currentTick, currentBuild, lastBuild])
    lastTick = currentTick
  }
}

/****** Unit utilities ******/
export const sec = seconds => 1000 * seconds
sec.symbol = Symbol('seconds')
sec[Symbol.toPrimitive] = () => sec.symbol
Object.defineProperty(Number.prototype, sec, {
  get() { return sec(this.valueOf()) }
})

/****** Animation utils ******/
export const lerp = (from, to) => {
  const delta = to - from
  return t => from + t * delta
}

/****** Animator framework ******/
global.__animators = global.__animators || []
export function addAnimator(animator) {
  global.__animators.push(animator)
  console.log('added animator', animator)
  console.table(global.__animators)
}
export function removeAnimator(animator) {
  const animators = global.__animators
  const idx = animators.indexOf(animator)
  if (idx >= 0)
    animators.splice(idx, 1)
}
export const runAnimatorStep = (ts, currentBuild, prevBuild) => {
  const animators = global.__animators
  let i = animators.length; while (i --> 0) 
    animators[i](ts, currentBuild, prevBuild)
}

/****** Condition helpers ******/
export const match = Symbol('when/match')
Object.defineProperty(Function.prototype, match, { get() { return this } })

export const buildInRange = (from, to) =>
  (ts, current, last) => current.order >= from.order && current.order <= to.order

export const any = (...matchers) => (ts, current, next) =>
  matchers.some(m => m [match] (ts, current, next))