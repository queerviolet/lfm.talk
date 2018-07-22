import {When} from './when'

global.inceptionPixelsViz = (condition, video, canvas) => {
  const ctx = canvas.getContext('2d')
  let width = null, height = null

  const resize = () => {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth / 2
      canvas.height = window.innerHeight / 2
      width = window.innerWidth / 2
      height = window.innerHeight / 2
    }
  }

  return When(condition)
    .start(() => ctx.imageSmoothingEnabled = false)
    .frame(() => {
      resize()
      ctx.drawImage(video, 0, 0, 32, 32, 0, 0, width, height)  
    })
}
