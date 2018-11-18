import {addAnimator, removeAnimator} from './when'

const {random} = Math

class OscillOScope extends HTMLElement {
  constructor() {
    super()

    const style = document.createElement('style')
    style.textContent = OscillOScope.style
    const canvas = document.createElement('canvas')   

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onResize = this.onResize.bind(this)
  }

  connectedCallback() {
    this.appendChild(this.canvas)
    addEventListener('resize', this.onResize)
    this.onResize()
    addAnimator(this)
  }

  disconnectedCallback() {
    removeEventListener('resize', this.onResize)
    removeAnimator(this)
    delete this.analysers
  }

  onResize() {
    const box = this.getBoundingClientRect()
    if (this.width !== box.width || this.height !== box.height) {
      ;[this.width, this.height] = fit(this.canvas, this.ctx, box)
      this.center = scale([this.width, this.height], 0.5)
    }
  }

  setup() {
    const ctx = new AudioContext
    this.analysers = [...this.getElementsByTagName('audio')]
      .map(audio => {
        const src = ctx.createMediaElementSource(audio)
        const analyser = ctx.createAnalyser()
        src.connect(analyser)
        analyser.connect(ctx.destination)
        analyser.fftSize = 2048
        const bufferLength = analyser.frequencyBinCount
        const data = new Uint8Array(bufferLength)
        return {analyser, data, audio, strokeStyle: audio.dataset.stroke}
      })
  }

  step() {
    if (!this.width) return this.onResize()
    if (this.analysers) {
      const {ctx} = this
      ctx.clearRect(0, 0, this.width, this.height)
      this.analysers.forEach(src => this.draw(src))
    }
  }

  draw({analyser, data, audio, strokeStyle}) {
    const {ctx, width, height} = this
    audio.paused
      ? fillNoise(data)
      : analyser.getByteTimeDomainData(data)
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = 2
    const step = width / data.length
    ctx.beginPath()
    let x = width
    let i = data.length; while (i --> 0) {
      const v = data[i] / 128
      const y = v * height / (2 * devicePixelRatio)

      x === width
        ? ctx.moveTo(x, y)
        : ctx.lineTo(x, y)
      x -= step
    }
    ctx.stroke()
  }
}

const fillNoise = data => {
  let v = randomSample()
  let {length: i} = data; while (i --> 0) {
    //if (random() < 0.5)
     v = randomSample()
    data[i] = v
  }
}

const randomSample = (range=0.5) => 128 + (random() + random() + random() - 3) * range

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

OscillOScope.style = `
canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}
`

customElements.define('oscill-o-scope', OscillOScope)