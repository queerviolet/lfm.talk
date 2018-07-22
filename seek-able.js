import {defaultContext, For, every, sec} from './when'

const Seekable = MediaBase => class SeekAble extends MediaBase {
  seekTo({duration: seekDuration=1, time=this.currentTime, paused=this.paused}) {
    if (this.anim) { this.anim.remove(); this.anim = null }
    if (!seekDuration || time < this.currentTime)
      this.currentTime = time
    if (seekDuration) {
      const setFinalState = () => {
        this.currentTime = time
        if (!paused && this.paused) this.play()
        if (paused && !this.paused) this.pause()
      }      
      if (this.currentTime !== time) {
        if (this.paused) this.play()
        let endTime = null
        const duration = seekDuration[sec]
        return this.anim = For(seekDuration[sec]).withName('seekVideo')
          .start(ts => endTime = ts + duration)
          .frame(every(0.5[sec]) (ts => {
            const remaining = endTime - ts
            const delta = (time - this.currentTime)[sec]
            const targetRate = Math.min(Math.max(delta / remaining, 0.1), 5)
            this.playbackRate = targetRate
          }))
          .end(setFinalState)
      } else {
        setFinalState()
      }
    }
  }
}

customElements.define('seekable-video', Seekable(HTMLVideoElement), {extends: 'video'})
customElements.define('seekable-audio', Seekable(HTMLAudioElement), {extends: 'audio'})