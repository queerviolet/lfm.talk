export const defaultContext = {
  add: addAnimator,
  remove: removeAnimator,
}

export const unattached = {
  add: _ => {},
  remove: _ => {}
}

export function always() { return true }

export function When(condition=always, ctx=defaultContext) {
  if (new.target == null) return new When(condition, ctx)
  this.condition = condition
  this.running = false

  this._handlers = {start: [], frame: [], at: [], end: [], changed: []}
  this._resetDone()
  this._ctx = ctx
  ctx.add && ctx.add(this)
}

const fire = type => ({
  [type](cb) { this._handlers[type].push(cb); return this },
  [`_fire_${type}`](ts, currentBuild, lastBuild) {
    const cbs = this._handlers[type]
    const count = cbs.length
    for (let i = 0; i !== count; ++i)
      cbs[i].apply(this, [ts, currentBuild, lastBuild])
  }
})

Object.assign(When.prototype, ...['start', 'frame', 'at', 'end', 'changed'].map(fire))

When.prototype._resetDone = function() {
  this.done = new Promise(_ => this._resolveDone = _)
}

When.prototype.withName = function(name) {
  this.name = name
  return this
}

When.prototype.withDuration = function(duration) {
  this.duration = duration
  return this
}

When.prototype.remove = function() {
  this._ctx.remove(this)
  return this
}

When.prototype.step = function(ts, currentBuild, lastBuild) {
  const shouldRun = this.condition[match](ts, currentBuild, lastBuild)
  if (shouldRun && !this.running) {
    this._fire_start(ts, currentBuild, lastBuild)
    this.startedAt = ts
    this.running = true
  }
  if (!shouldRun && this.running) {
    this._fire_end(ts, currentBuild, lastBuild)
    this.endedAt = ts
    this.running = false
    this._resolveDone(this)
    this._resetDone()
  }
  if (this.running) {
    if (currentBuild !== lastBuild) this._fire_changed(ts, currentBuild, lastBuild)
    this._fire_frame(ts, currentBuild, lastBuild)
    if (typeof this.duration === 'number') {
      const t = (ts - this.startedAt) / this.duration
      this.t = t
      this._fire_at(t, currentBuild, lastBuild)
    }
  }
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
      cb.apply(this, [ts, currentTick, currentBuild, lastBuild])
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
Object.defineProperty(String.prototype, sec, {
  get() { return sec(+this) }
})

/****** Animation utils ******/
export const lerp = (from, to, map=_=>_) => {
  const delta = to - from
  return t => map(from + t * delta)
}

/****** Animator framework ******/
global.__animators = global.__animators || []
global.__cascadeDebug = (debug=true) =>
  debug
    ? log = console
    : log = debuggingOff

const debuggingOff = { log() {}, table() {}, }
let log = debuggingOff

export function addAnimator(animator) {
  global.__animators.push(animator)
  log.log('added animator', animator)
  log.table(global.__animators)
}
export function removeAnimator(animator) {
  const animators = global.__animators
  const idx = animators.indexOf(animator)
  if (idx >= 0)
    animators.splice(idx, 1)
  animator._resolveDone()
}
export const runAnimatorStep = (ts, currentBuild, prevBuild) => {
  const animators = global.__animators
  let i = animators.length; while (i --> 0) 
    animators[i].step(ts, currentBuild, prevBuild)
}

/****** Condition helpers ******/
export const match = Symbol('when/match')
Object.defineProperty(Function.prototype, match, { get() { return this } })

export const buildInRange = (from, to) =>
  (ts, current) =>
    current &&
    current.order >= from.order &&
    current.order <= to.order

export const any = (...matchers) => (ts, current, next) =>
  matchers.some(m => m [match] (ts, current, next))