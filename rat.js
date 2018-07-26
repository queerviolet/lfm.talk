import {When, sec, lerp, every, addAnimator, removeAnimator} from './when'

import path from './ratpath'

const {sin, cos, floor, acos, random, PI} = Math

class GridCells extends HTMLElement {
  // static get observedAttributes() { return ['text'] }

  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'});
    const rat = document.createElement('span')
    rat.textContent = '🐭'
    rat.className = 'rat'
    const style = document.createElement('style')
    style.textContent = GridCells.style
    const canvas = document.createElement('canvas')    
    const centersCanvas = document.createElement('canvas')
    shadow.appendChild(style)
    shadow.appendChild(rat)
    shadow.appendChild(canvas)
    shadow.appendChild(centersCanvas)
    this.rat = rat
    this.canvas = canvas
    this.centersCanvas = centersCanvas
    this.ctx = canvas.getContext('2d')
    this.centersCtx = centersCanvas.getContext('2d')
    this.dRot = 0

    this._pos = this.randomPos()
    this.onResize = this.onResize.bind(this)
    this.gridSize = 200
    this._centers = []
    this._trail = []
    this._playbackRate = 1
  }

  connectedCallback() {
    addEventListener('resize', this.onResize)
    addAnimator(this)
  }

  disconnectedCallback() {
    removeEventListener('resize', this.onResize)
    removeAnimator(this)
  }

  get playbackRate() {
    return this._playbackRate
  }

  set playbackRate(rate) {
    this.mediaTsBase = this.currentTime
    this._playbackRate = rate
    this.tsBase = null
  }

  onResize() {
    const box = this.getBoundingClientRect()
    if (this.width !== box.width || this.height !== box.height) {
      ;[this.width, this.height] = fit(this.canvas, this.ctx, box)
      this.center = scale([this.width, this.height], 0.5)
      fit(this.centersCanvas, this.centersCtx, box)
    }
  }

  get currentTime() {
    return path[this.pathIndex][0]
  }

  step(ts) {
    if (!this.width) this.onResize()
    if (!this.tsBase) {
      this.tsBase = ts
    }
    let ourT = ts - this.tsBase
    let i = this.pathIndex || 0
    let mediaT, lastMediaTs, x, y, pos
    const {_trail: trail} = this
    do {
      ;[lastMediaTs, x, y] = path[i]
      lastMediaTs = lastMediaTs
      if (!i) {
        this.mediaTsBase = lastMediaTs
        this.tsBase = ts
        ourT = 0
      }
      if (++i >= path.length) i = 0
      mediaT = lastMediaTs - this.mediaTsBase

      pos = [
        this.width * x + (random() - 0.5) * this.gridSize * min(this.playbackRate / 10, 1),
        this.height * y + (random() - 0.5) * this.gridSize * min(this.playbackRate / 10, 1)
      ]
      trail.push(pos)     
      if (this.drawCenters) {
        this.nearestCenters(pos).forEach(c => this._centers[c] = true)
      }
    } while(ourT * this.playbackRate > mediaT)

    const {ctx, centersCtx} = this

    let trailPath = null
    if (trail.length) {
      const bufLen = this.playbackRate / 4
      let buf = []
      ctx.beginPath()
      trail.forEach((p, i) => {
        buf.push(p)
        const [x, y] = p

        if (buf.length >= bufLen) {
          const [x, y] = scale(buf.reduce(add), 1 / buf.length)
          if (!trailPath) {
            trailPath = new Path2D
            trailPath.moveTo(x, y)
          } else {
            trailPath.lineTo(x, y)
          }
          if (buf.length > 3)
            buf.splice(0, buf.length - bufLen)
        }
        
        if (!this.doesFire(p)) return
        ctx.moveTo(x, y)
        ctx.arc(x, y, 2, 0, 2 * PI)
      })

      ctx.fillStyle = 'rgb(255, 0, 255, 0.4)'
      ctx.fill()
      
      // const avg = scale(
      //   trail
      //     .reduce((a, b) => add(a, b)),
      //   1 / trail.length)
      // this.pos = avg
      this.pathIndex = i

      if (trail.length > 10) {
        trail.splice(0, trail.length - 10)
      }
    }

    centersCtx.clearRect(0, 0, this.width, this.height)
    centersCtx.fillStyle = `rgb(73, 140, 248, ${sin(ts / 300) + 0.5})`
    centersCtx.strokeStyle = `rgba(73, 140, 248, 0.5)`
    centersCtx.lineWidth = 8
    trailPath && centersCtx.stroke(trailPath)
    if (this.drawCenters) {
      centersCtx.beginPath()
      Object.keys(this._centers).forEach(c => {
        ;[x, y] = c.split(',')
        centersCtx.moveTo(x, y)
        centersCtx.arc(x, y, 10, 0, 2 * PI)
        // centersCtx.fillRect(+x, +y, 10, 10)      
      })
      centersCtx.fill();
    }
  }

  rectGridPos([x, y]=this._pos) {
    const {gridSize: size} = this
    return [floor(x / size), floor(y / size)]
  }

  doesFire(pos) {
    return random() < this.firingProbability(pos) * 0.75
  }

  firingProbability(pos=this._pos) {
    const npos = neg(pos)
    const {dist} = this.nearestCenters(pos)
      .map(p => ({p, dist: mag(add(p, npos))}))
      .sort((a, b) => a.dist - b.dist)
      [0]
    const p = 2 ** (-8 * dist / this.gridSize)
    // console.log(dist / this.gridSize / 2)
    // console.log(p)
    return p
  }

  nearestCenters(pos=this._pos) {
    const {gridSize: size} = this
    const [x, y] = this.rectGridPos(pos)
    if (y % 2) {
      // center top and two bottom corners
      return [
        [x + 0.5, y],   // top center
        [x, y + 1],     // bottom left
        [x + 1, y + 1], // bottom right       
      ].map(corner => scale(corner, size))
    }
    // two top corners and center bottom.
    return [
      [x + 0.5, y + 1], // bottom center
      [x, y],       // top left
      [x + 1, y],   // top right       
    ].map(corner => scale(corner, size))
  }

  randomPos() {
    return [random() * this.width, random() * this.height]
  }

  set pos([x, y]) {
    const {rat: {style: rat}} = this
    this._pos = [x, y]
    rat.setProperty('--rat-x', x + 'px')
    rat.setProperty('--rat-y', y + 'px')
  }

  get pos() { return this._pos }
}

const add = ([a, b], [x, y]) => [a + x, b + y]
const neg = ([x, y]) => [-x, -y]
const scale = ([a, b], scale) => [scale * a, scale * b]
const mag = ([x, y]) => Math.sqrt(x**2 + y**2)
const norm = v => scale(v, 1 / mag(v))
const dot = ([a, b], [x, y]) => a * x + b * y
const ang = (v, w) => acos(dot(v, w) / (mag(v) * mag(w)))
Object.assign(global, {add, neg, scale, mag, norm, dot, ang})

const fit = (canvas, ctx, box) => {
  const width = box.width * devicePixelRatio
  const height = box.height * devicePixelRatio
  canvas.width = width
  canvas.height = height
  Object.assign(canvas.style, {
    width: box.width + 'px',
    height: box.height + 'px'
  })
  ctx.scale(devicePixelRatio, devicePixelRatio)
  return [width, height]
}

GridCells.style = `
.rat {
  display: block;
  position: absolute;
  transform:
    translate(
      var(--rat-x),
      var(--rat-y))
    ;
}

canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}
`

customElements.define('grid-cells', GridCells)