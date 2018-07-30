import {When, sec, lerp, every, addAnimator, removeAnimator} from './when'

import path from './ratpath'

const {min, floor, acos, random, PI} = Math

class GridCells extends HTMLElement {
  // static get observedAttributes() { return ['text'] }

  constructor() {
    super()

    const style = document.createElement('style')
    style.textContent = GridCells.style
    const canvas = document.createElement('canvas')   
    canvas.className = 'firingCanvas' 
    const trailCanvas = document.createElement('canvas')
    trailCanvas.className = 'trailCanvas'
    const container = document.createElement('div')
    container.className = 'container'
    container.appendChild(style)
    container.appendChild(trailCanvas)
    container.appendChild(canvas)
    this.container = container

    this.canvas = canvas
    this.trailCanvas = trailCanvas
    this.ctx = canvas.getContext('2d')
    this.trailCtx = trailCanvas.getContext('2d')

    this._pos = this.randomPos()
    this.onResize = this.onResize.bind(this)
    this.gridSize = 200
    this._trail = []
    this._playbackRate = 1
  }

  connectedCallback() {
    this.appendChild(this.container)
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
      fit(this.trailCanvas, this.trailCtx, box)
      this.buildGrid()
    }
  }

  get currentTime() {
    return path[this.pathIndex || 0][0]
  }

  step(ts) {
    if (!this.playbackRate) return
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
    } while(ourT * this.playbackRate > mediaT)

    const {ctx, trailCtx} = this

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
      
      this.pathIndex = i

      if (trail.length > 10) {
        trail.splice(0, trail.length - 10)
      }
    }

    trailCtx.clearRect(0, 0, this.width, this.height)
    trailCtx.strokeStyle = `rgba(73, 140, 248, 0.5)`
    trailCtx.lineWidth = 8
    trailPath && trailCtx.stroke(trailPath)
  }

  async buildGrid() {
    const gridCanvas = document.createElement('canvas')
    const {gridWidth: w, gridHeight: h, gridSize: sz} = this    
    const ctx = gridCanvas.getContext('2d')
    fit(gridCanvas, ctx, this.getBoundingClientRect())
    const grid = new Path2D, centers = new Path2D
    const moveTo = (x, y) => {
      grid.moveTo(x * sz, y * sz)
      centers.moveTo(x * sz, y * sz)
    }

    const lineTo = (x, y, center=true) => {
      center && centers.moveTo(x * sz, y * sz)
      center && centers.arc(x * sz, y * sz, 10, 0, 2 * PI)
      grid.lineTo(x * sz, y * sz)
    }

    moveTo(0, 0)
    for (let y = 0; y <= h; ++y) {
      if (y % 2) {
        for (let x = 0; x <= w; ++x) {
          lineTo(x, (y + 1))
          lineTo((x + 0.5), y)
          lineTo((x + 1), (y + 1))
        }
      } else {
        for (let x = 0; x <= w; ++x) {
          lineTo(x, y)
          lineTo((x + 0.5), (y + 1))
          lineTo((x + 1), y)
        }
      }
      moveTo(w, (y + 1))
      lineTo(0, (y + 1), y % 2)
    }

    ctx.fillStyle = `rgb(73, 140, 248, 1)`
    ctx.fill(centers);      
    ctx.strokeStyle = `rgb(73, 140, 248, 1)`
    ctx.lineWidth = 1
    ctx.stroke(grid)
    if (this._grid) {
      this.container.removeChild(this._grid)
    }
      // this._grid = gridCanvas
      // gridCanvas.className = 'grid'
      // this.container.appendChild(gridCanvas)
    this.gridCanvas = gridCanvas
    const div = document.createElement('div')
    div.className = 'grid'
    const img = await this.getGridImage(ctx)
    div.style.backgroundImage = `url(${img})`
    div.style.backgroundSize = `${this.gridSize * 2}px ${this.gridSize * 2}px`
    div.style.backgroundPosition = `${this.gridSize / 2}px 0`
    this.container.appendChild(div)
    this._grid = div
  }

  get gridHeight() {
    return Math.ceil(this.height / this.gridSize)
  }

  get gridWidth() {
    return Math.ceil(this.width / this.gridSize)
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

  async getGridImage(ctx, x=this.gridSize, y=this.gridSize, w=this.gridSize * 2, h=this.gridSize * 2) {
    var img = ctx.getImageData(x * 2, y * 2, w * 2, h * 2)
    var c = document.createElement('canvas')
    var c2 = c.getContext('2d')
    c.width = img.width; c.height = img.height
    c2.putImageData(img, 0, 0)
    return new Promise(_ => c.toBlob(b => _(URL.createObjectURL(b))))
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
canvas.firingCanvas, canvas.trailCanvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  transform-origin: top left;
}

.grid {
  position: absolute;
  width: 1000%;
  height: 1000%;
  opacity: 0;
  transform-origin: top left;
}

.container {
  position: absolute;
  width: 100%; height: 100%;
  perspective: 100vw;
}
`

customElements.define('grid-cells', GridCells)