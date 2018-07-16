export default function animate(start, end, onBegin, onFrame, onFinish) {
  const duration = end - start
  let hasBegun = false
  const frame = ts => {
    if (ts < start) return frame
    if (ts >= start && ts <= end) {
      if (!hasBegun) {
        onBegin(ts)
        hasBegun = true
      }
      onFrame((ts - start) / duration)
      return frame
    }

    onFinish(ts)
    return null
  }
  return frame
}

export const flip = f => t => f(1 - t)