import {blinkingCursor, solidCursor} from './typewriter.css'
import animate, {flip} from './anim'

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

  type(text, rate=this.typingRate) {
    return this.last = this.last.type(text, rate)
  }

  erase(count, rate=this.eraseRate) {
    return this.last = this.last.erase(count, rate)
  }
}

window.Typewriter = Typewriter

class Typing {
  constructor(tw, startText, endText, rate) {
    this.tw = tw
    this.startText = startText
    this.endText = endText
    this.rate = rate

    const {textNode, cursor} = tw
    const text = this.keystrokeCount < 0
      ? startText
      : endText

    this.begin = () => {
      textNode.textContent = startText
      cursor.className = blinkingCursor
    }

    this.frame = t => {
      cursor.className = solidCursor
      const position = startText.length + Math.round(t * this.keystrokeCount)
      textNode.textContent = text.substring(0, position)
    }

    this.end = () => {
      textNode.textContent = endText
      cursor.className = blinkingCursor
    }
  }

  type(text, rate) {
    return new Typing(this.tw,
      this.endText, this.endText + text,
      rate)
  }

  erase(count=this.endText.length, rate) {
    return new Typing(this.tw,
      this.endText,
      this.endText.substring(0, this.endText.length - count),
      rate
    )
  }

  get keystrokeInterval() {
    return 1000 / this.rate
  }

  get keystrokeCount() {
    return this.endText.length - this.startText.length
  }

  get duration() {
    return Math.abs(this.keystrokeInterval * this.keystrokeCount)
  }

  build(startTime) {
    const endTime = startTime + this.duration
    const {tw: {textNode, cursor}} = this

    return animate(startTime, endTime,
      this.begin, this.frame, this.end
    )
  }

  unbuild(startTime) {
    const endTime = startTime + this.duration
    return animate(startTime, endTime,
      this.end, flip(this.frame), this.begin)
  }
}
