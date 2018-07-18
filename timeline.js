import bs from 'binarysearch'

const compareCueToTime = ({at}, time) => at - time

export default (cues=[]) => {
  cues.forEach((cue, i) => cue.index = i)

  const lookup = needle => {
    if (needle.currentTime) return lookup(needle.currentTime)
    return cues[index(needle, compareCueToTime)]
  }

  const index = (needle, compare=compareCueToTime) =>
    bs.closest(cues, needle, compare)

  lookup.cues = cues
  lookup.index = index

  return lookup
}

