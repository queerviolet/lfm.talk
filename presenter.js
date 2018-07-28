class BuildNote extends HTMLElement {
  static update(note) {
    const e = findOrCreateById('build-note', note.id)
    e.update(note)
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick)
  }

  onClick() {
    localStorage.currentBuild = this.id
    update({key: 'currentBuild', newValue: this.id})
  }

  get title() {
    return findOrCreateByClass('h1', 'title', this)
  }

  get content() {
    return findOrCreateByClass('div', 'note', this)
  }

  get timer() {
    return findOrCreateByClass('div', 'timer', this)
  }

  set time(time) {
    this.timer.textContent = time && tformat(time)
  }

  update({innerHTML, order, id}) {
    this.id = id
    this.title.textContent = id
    this.content.innerHTML = innerHTML.trim()
    this.style.order = order
  }
}

customElements.define('build-note', BuildNote)

const findOrCreateById = (tag, id, container=document.body) => {
  let e = document.getElementById(id)
  if (e) return e
  container.appendChild(e = document.createElement(tag))
  return e
}

const findOrCreateByClass = (tag, className, container=document.body) => {
  let e = container.getElementsByClassName(className)[0]
  if (e) return e
  e = document.createElement(tag)
  e.className = className
  container.appendChild(e)
  return e
}

const BUILDS = {}
const updateNotes = (notes=JSON.parse(localStorage.buildNotes)) => {
  notes.forEach(note => {
    BuildNote.update(note)
    BUILDS[note.id] = note
  })
}

const updateScroll = (id=localStorage.currentBuild) => {
  const e = document.getElementById(id)
  if (!e) return
  process.nextTick(() => e.scrollIntoView({behavior: 'smooth'}))
  const current = document.querySelector('build-note.current')
  current && current.classList.remove('current')
  e.classList.add('current')
}

const init = () =>
  Object.entries(localStorage)
    .forEach(([key, newValue]) => update({key, newValue}))

function onKey({code}) {
  switch (code) {
    case 'ArrowRight':
    case 'PageDown':
      const next = BUILDS[localStorage.currentBuild].nextBuildId
      if (next) {
        localStorage.currentBuild = next
        update({key: 'currentBuild', newValue: next})
      }
      return
    
    case 'ArrowLeft':
    case 'PageUp':
      const prev = BUILDS[localStorage.currentBuild].prevBuildId
      if (prev) {
        localStorage.currentBuild = prev
        update({key: 'currentBuild', newValue: prev})
      }
      return
  }
}

function update({key, newValue, oldValue}) {
  switch (key) {
  case 'currentBuild':
    return updateScroll(newValue)
  case 'buildNotes':
    return updateNotes(JSON.parse(newValue))
  }

  if (key.startsWith('time:')) {
    const e = document.getElementById(key.substr(5))
    if (e) e.time = newValue
  }
}

addEventListener('DOMContentLoaded', init)
addEventListener('storage', update)
addEventListener('keydown', onKey)

let raf = null
__timer.addEventListener('click', () => {
  if (raf) {
    console.log('cancelling', raf)
    cancelAnimationFrame(raf)
    __timer.classList.remove('running')
    raf = null
    return
  }
  lastTick = null
  raf = requestAnimationFrame(tick)
})

let lastTick = null
function tick(ts) {
  raf = requestAnimationFrame(tick)
  __timer.classList.add('running')
  if (!lastTick) return lastTick = ts
  const delta = ts - lastTick
  lastTick = ts
  const elapsed = (+localStorage.totalTime || 0) + delta  
  localStorage.totalTime = elapsed
  __timer_display.textContent = tformat(elapsed)
  const buildKey = `time:${localStorage.currentBuild}`
  const buildTime = +localStorage[buildKey] || 0
  localStorage[buildKey] = buildTime + delta
  update({key: buildKey, newValue: buildTime})
  update({key: 'totalTime', newValue: elapsed})
}

const {floor} = Math
const tformat = ms => {
  const sec = +ms / 1000
  const min = sec / 60
  return `${zpad(floor(min))}:${zpad(floor(sec % 60))}`
}

const zpad = (x, count=2) => {
  const str = '' + x
  if (str.length < count) return new Array(count - str.length).fill(0).join('') + str
  return str
}

const resetTimer = () => {
  localStorage.removeItem('totalTime')
  update({key: 'totalTime'})
  Object.keys(localStorage)
    .filter(k => k.startsWith('time:'))
    .forEach(key => {
      localStorage.removeItem(key)
      update({key})
    })
}

global.resetTimer = resetTimer