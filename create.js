global.createLayers = ({prefix='layer', className='layer', count=5, interpolate={
  '--width': ['50%', '100%'],
  '--height': ['50%', '100%'],
}}={}, content=[]) => {
  let i = count; while (i --> 0) {
    const t = i / (count - 1)    
    const style=`--layer-t: ${t};`
    document.write(`<div
      id="${prefix}_${i}"
      style="${style}"
      class="${className}">${content[i] || ''}</div>`)
  }
}