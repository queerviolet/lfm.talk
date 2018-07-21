import {Daemon} from './builds'

class InceptionViz extends Daemon {
  constructor(video, canvas) {
    super()
    this.params = this
    this.video = video
    this.ctx = canvas.getContext('2d'),
    this.canvas = canvas

    this.atStart = this.atStart.bind(this)
    this.atFrame = this.atFrame.bind(this)
    this.atEnd = this.atEnd.bind(this)
  }  

  atStart() {
    return true
  }
  
  atFrame() {
    this.resize(this.canvas)
    const {ctx, video, width, height} = this
    this.paint(ctx, video, width, height)
    return true
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLVideoElement} video
   * @param {Number} width
   * @param {Number} height
   */
  paint(ctx, video, width, height) {
    const vw = video.width, vh = video.height;
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(video, 0, 0, 32, 32, 0, 0, width, height)
  }

  atEnd() {
  }

  resize(canvas) {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth / 2
      canvas.height = window.innerHeight / 2
      this.width = window.innerWidth / 2
      this.height = window.innerHeight / 2
    }
  }
}

global.InceptionViz = InceptionViz