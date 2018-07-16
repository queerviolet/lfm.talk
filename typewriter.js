import {blinkingCursor, solidCursor} from './typewriter.css'
import {Parametric} from './anim'

class Typewriter {
  constructor(element, startText='', typingRate=12, eraseRate=32) {
    this.typingRate = typingRate
    this.eraseRate = eraseRate
    this.element = element
    this.cursor = document.createElement('span')
    this.cursor.className = blinkingCursor
    this.textNode = document.createTextNode(startText)
    this.element.appendChild(this.textNode)
    this.element.appendChild(this.cursor)
    this.last = new Typing(this, '', startText, typingRate)
  }

  type(text, options) {
    return this.last = this.last.type(text, options)
  }

  erase(count, options) {
    return this.last = this.last.erase(count, options)
  }
}

window.Typewriter = Typewriter

class Typing {  
  constructor(tw, startText, endText, options={}) {
    this.tw = tw
    this.startText = startText
    this.endText = endText
    this.options = options

    const {textNode, cursor} = tw
    const text = this.keystrokeCount < 0
      ? startText
      : endText

    this.begin = () => {
    }

    this.frame = t => {

    }

    this.end = () => {
      
    }
  }

  get typingRate() {
    return this.options.typingRate || this.tw.typingRate
  }

  get eraseRate() {
    return this.options.eraseRate || this.tw.eraseRate
  }

  type(text, options) {
    return new Typing(this.tw,
      this.endText,
      this.endText + text,
      options
    )
  }

  erase(count=this.endText.length, options) {
    return new Typing(this.tw,
      this.endText,
      this.endText.substring(0, this.endText.length - count),
      options
    )
  }

  get typingInterval() {
    return 1000 / this.typingRate
  }

  get erasingInterval() {
    return 1000 / this.eraseRate
  }

  get keystrokeCount() {
    return this.endText.length - this.startText.length
  }

  build(startTime) {
    if (this.keystrokeCount === 0) return
    if (this.keystrokeCount > 0)
      return new TypingAnimation(this.tw, this.startText, this.endText, this.typingInterval, startTime)
    return new TypingAnimation(this.tw, this.startText, this.endText, this.erasingInterval, startTime)
  }

  unbuild(startTime) {
    if (this.keystrokeCount === 0) return
    if (this.keystrokeCount > 0)
      return new TypingAnimation(this.tw, this.endText, this.startText, this.erasingInterval, startTime)
    return new TypingAnimation(this.tw, this.endText, this.startText, this.typingInterval, startTime)
  }
}

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