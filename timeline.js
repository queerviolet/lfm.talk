import bs from 'binary-search'

const compareCueToTime = ({at}, time) => at - time

export default (cues=[]) => {
  cues.forEach((cue, i) => cue.index = i)

  const lookup = needle => {
    if (needle.currentTime) return lookup(needle.currentTime)
    return this.cues[bs(this.cues, needle, compareCueToTime)]
  }

  return lookup
}