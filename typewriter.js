import Effect from './effect'
import {blinkingCursor, solidCursor} from './typewriter.css'
import {Parametric} from './anim'

class Typewriter extends Effect {
  constructor(element, startText='', {typingRate=12, eraseRate=32}={}) {
    super(startText)
    this.typingRate = typingRate
    this.eraseRate = eraseRate
    this.element = element
    this.cursor = document.createElement('span')
    this.cursor.className = blinkingCursor
    this.textNode = document.createTextNode(startText)
    this.element.appendChild(this.textNode)
    this.element.appendChild(this.cursor)
  }

  type(text) {
    return this.add(this.last.endState + text)
  }

  erase(count=this.last.text) {
    const {endState} = this.last
    return this.add(endState.substring(0, endState.length - count))
  }

  get typingInterval() {
    return 1000 / this.typingRate
  }

  get erasingInterval() {
    return 1000 / this.eraseRate
  }

  applyState(end, start) {
    console.log('typewriter apply state', end, start)
    return new TypingAnimation(
      this,
      start, end,
      end.length > start.length ? this.typingInterval : this.erasingInterval)
  }
}

window.Typewriter = Typewriter

class TypingAnimation extends Parametric {
  constructor({textNode, cursor},          
              startText, endText, interval, startTime) {
    const delta = endText.length - startText.length
    super(interval * Math.abs(delta), startTime)
    this.delta = delta
    this.textNode = textNode
    this.cursor = cursor
    this.startText = startText
    this.endText = endText
    this.fullText = this.delta > 0 ? endText : startText
  }

  atStart() {    
    this.textNode.textContent = this.startText
    this.cursor.className = blinkingCursor
  }

  at(t) {
    const {textNode, cursor, fullText, startText} = this
    cursor.className = solidCursor
    const position = startText.length + Math.round(t * this.delta)
    textNode.textContent = fullText.substring(0, position)
  }

  atEnd() {
    this.textNode.textContent = this.endText
    this.cursor.className = blinkingCursor
  }
}