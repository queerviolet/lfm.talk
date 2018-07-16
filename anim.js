class Animation {
  constructor(duration=0, startAt) {
    this.duration = duration
    this.startAt = startAt
    this.hasBegun = false
    this.hasFinished = false
  }

  get endAt() {
    return this.startAt + this.duration
  }

  // Lifecycle callbacks
  atStart(ts) {}
  atFrame(ts) {}
  atEnd(ts) {}  

  step(ts) {
    if (typeof this.startAt !== 'number')
      this.startAt = ts
    const {startAt, endAt} = this
    if (ts < startAt) return this
    if (ts >= startAt && ts <= endAt) {
      if (!this.hasBegun) {
        this.atStart(ts)
        this.hasBegun = true
      }
      this.atFrame(ts)
      return true
    }
    if (ts > endAt) {
      if (!this.hasFinished) {
        this.atEnd(ts)
        this.hasFinished = true
      }
    }
  }
}


export default Animation

export class Parametric extends Animation {
  // Parametric callback
  at(t) {}

  atFrame(ts) {
    this.at((ts - this.startAt) / this.duration)
  }
}


// export default function animate(start, end, onBegin, onFrame, onFinish) {
//   const duration = end - start
//   let hasBegun = false
//   const frame = ts => {
//     if (ts < start) return frame
//     if (ts >= start && ts <= end) {
//       if (!hasBegun) {
//         onBegin(ts)
//         hasBegun = true
//       }
//       onFrame((ts - start) / duration)
//       return frame
//     }

//     onFinish(ts)
//     return null
//   }
//   return frame
// }

export const flip = f => t => f(1 - t)