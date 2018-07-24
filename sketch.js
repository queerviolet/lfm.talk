import {addAnimator, removeAnimator} from './when'

class SketchCanvas extends HTMLElement {
  constructor() {
    super()
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)  
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)  
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onResize = this.onResize.bind(this)
  
    const shadow = this.attachShadow({mode: 'open'});
    this.shadow = shadow
    const canvas = document.createElement('canvas')
    shadow.appendChild(canvas)
    this.canvas = canvas
    Object.assign(this.canvas.style, {
      width: '100%',
      height: '100%',
    })

    this.logEl = document.createElement('div')
    Object.assign(this.logEl.style, {
      position: 'fixed',
      bottom: 0, right: 0,
      background: 'fuchsia',
      color: 'white',
      minWidth: '25vw',
      minHeight: '100px',
      zIndex: 500,
    })
    console.log('hi')
    shadow.appendChild(this.logEl)

    this.ctx = canvas.getContext('2d')
    this.active = {}
    this.strokes = []
  }

  connectedCallback() {
    const {canvas} = this
    canvas.addEventListener('touchstart', this.onTouchStart)
    canvas.addEventListener('touchmove', this.onTouchMove)
    canvas.addEventListener('touchend', this.onTouchEnd)
    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mouseup', this.onMouseUp)
    addEventListener('resize', this.onResize)
    // addAnimator(this)
    this.onResize()
  }

  log(...msg) {
    this.logEl.innerHTML += '<br>' + msg.join(' | ')
  }

  disconnectedCallback() {
    const {canvas} = this
    canvas.removeEventListener('touchstart', this.onTouchStart)
    canvas.removeEventListener('touchmove', this.onTouchMove)
    canvas.removeEventListener('touchend', this.onTouchEnd)
    canvas.removeEventListener('mousedown', this.onMouseDown)
    canvas.removeEventListener('mousemove', this.onMouseMove)
    canvas.removeEventListener('mouseup', this.onMouseUp)
    removeEventListener('resize', this.onResize)
    // removeAnimator(this)
  }

  step() {
    // const {ctx} = this
    // ctx.fillStyle = 'cyan'
    // ctx.fillRect(0, 0, this.width, this.height)

    // for (const [_, stroke] of Object.entries(this.active)) {
    //   ctx.stroke(stroke)
    // }
  }

  onResize() {
    const box = this.getBoundingClientRect()
    this.log('resize', box.width, box.height, devicePixelRatio)
    if (this.width !== box.width || this.height !== box.height) {
      this.width = box.width * devicePixelRatio
      this.height = box.height * devicePixelRatio
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.ctx.scale(devicePixelRatio, devicePixelRatio)
    }
  }

  onMouseDown({clientX, clientY}) {
    this.startStroke({identifier: 'mouse', clientX, clientY})
  }

  onMouseMove(e) {
    const {clientX, clientY, deltaX, deltaY} = e
    console.log(e)
    if (this.active.mouse)
      this.drawStroke({identifier: 'mouse', clientX, clientY})
  }

  onMouseUp({clientX, clientY}) {
    this.endStroke({identifier: 'mouse', clientX, clientY})
  }

  onTouchStart({changedTouches}) {
    let i = changedTouches.length; while (i --> 0) {
      this.startStroke(changedTouches[i])
    }
  }

  startStroke({identifier, clientX, clientY}) {
    this.log('start', identifier, clientX, clientY)
    const path = new Path2D
    path.moveTo(clientX, clientY)
    this.active[identifier] = path
  }

  drawStroke({identifier, clientX, clientY, deltaX, deltaY}) {
    this.log('draw', identifier, deltaX, deltaY)
    const stroke = this.active[identifier]
    stroke.lineTo(clientX, clientY)   
    const {ctx} = this
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.05)'
    ctx.lineCap = 'round'
    ctx.lineWidth = 2; 
    ctx.stroke(stroke)
  }

  endStroke({identifier}) {
    this.log('end', identifier)
    this.strokes.push(this.active[identifier])
    delete this.active[identifier]
  }

  onTouchMove({changedTouches}) {
    let i = changedTouches.length; while (i --> 0) {
      this.drawStroke(changedTouches[i])
    }
  }

  onTouchEnd({changedTouches}) {
    let i = changedTouches.length; while (i --> 0) {
      this.endStroke(changedTouches[i])
    }
  }
}

customElements.define('sketch-canvas', SketchCanvas)
