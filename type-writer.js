import {For, sec, lerp} from './when'

const {ceil, floor} = Math

class TypeWriter extends HTMLElement {
  static get observedAttributes() { return ['text'] }

  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'});
    const text = document.createTextNode('')
    const cursor = document.createElement('span')
    const style = document.createElement('style')
    style.textContent = TypeWriter.style
    cursor.className = 'blinking cursor'
    shadow.appendChild(style)
    shadow.appendChild(text)
    shadow.appendChild(cursor)
    this.cursor = cursor
    this.textNode = text
    this.currentTargetText = ''
  }

  type(input, rate=this.typingRate) {
    const {textNode: text} = this
    const startText = text.textContent
    if (this.anim) this.anim.remove()
    return this.anim =
      For(input.length [sec] / rate)
        .withName('typing')
        .start(() => this.cursor.classList.remove('blinking'))
        .at(t =>
          text.textContent = startText + input.substr(0, ceil(t * input.length))
        )
        .end(() => {
          this.cursor.classList.add('blinking')
          text.textContent = startText + input
        })
  }

  erase(count=this.textNode.textContent.length, rate=this.erasingRate) {
    const {textNode: text} = this
    const startText = text.textContent
    const length = lerp(startText.length, startText.length - count)
    if (this.anim) this.anim.remove()
    return this.anim =
      For(count [sec] / rate)
        .withName('erasing')
        .start(() => this.cursor.classList.remove('blinking'))
        .at(t =>
          text.textContent = startText.substr(0, floor(length(t)))
        )
        .end(() => {
          text.textContent = startText.substr(0, startText.length - count)
          this.cursor.classList.add('blinking')
        })
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'text') this.setText(newValue)
  }

  set text(newText) {
    this.setText(newText)
  }

  get text() {
    return this.textNode.textContent
  }

  async setText(newText) {
    const {textNode} = this
    if (this.currentTargetText === newText) return
    this.currentTargetText = newText
    const currentText = this.text
    const prefixLength = commonPrefix(currentText, newText)
    const delta = currentText.length - prefixLength
    if (delta) await this.erase(delta).done
    this.type(newText.substr(prefixLength))
  }

  get typingRate() {
    return +getComputedStyle(this).getPropertyValue('--typewriter-typing-rate') || 32;
  }

  get erasingRate() {
    return +getComputedStyle(this).getPropertyValue('--typewriter-erasing-rate') || 60;
  }
}

const commonPrefix = (a, b) => {
  for (let i = 0; i != a.length; ++i) {
    if(a[i] !== b[i]) return i
  }
  return a.length
}

TypeWriter.style = `
.cursor {
  display: inline-block;
  background: var(--typewriter-cursor-color);
  width: 2px;
  height: 1.2em;
  position: relative;
  top: 0.2em;
}

.cursor.blinking {
  animation-name: blink;
  animation-duration: var(--typewriter-cursor-blink-rate);
  animation-iteration-count: infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 1; }
  60% { opacity: 0; }
  90% { opacity: 0; }
  100% { opacity: 1; }
}
`

customElements.define('type-writer', TypeWriter)

if (module.hot) module.hot.accept(() => false)