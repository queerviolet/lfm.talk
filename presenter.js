class BuildNote extends HTMLElement {
  static update(note) {
    const e = findOrCreateById('build-note', note.id)
    e.update(note)
  }

  get title() {
    return findOrCreateByClass('h1', 'title', this)
  }

  get content() {
    return findOrCreateByClass('div', 'note', this)
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

const updateNotes = (notes=JSON.parse(localStorage.buildNotes)) =>
  notes.forEach(BuildNote.update)

const updateScroll = (id=localStorage.currentBuild) => {
  const e = document.getElementById(id)
  if (!e) return
  e.scrollIntoView({behavior: 'smooth'})
  const current = document.querySelector('build-note.current')
  current && current.classList.remove('current')
  e.classList.add('current')
}

const update = () => {
  updateNotes()
  updateScroll()
}

addEventListener('DOMContentLoaded', update)
addEventListener('storage', update)

