const zero = t => 0

global.createLayers = ({
  prefix='layer', className='layer', count=5, content=[],
  x=t => t, y=t => t, z=t => t
}) => {
  const ids = []
  let i = count; while (i --> 0) {
    const t = i / (count - 1) 
    const id = `${prefix}_${i}`
    ids.push(id)
    const style=`--layer-t: ${t}; --layer-x: ${x(t)}; --layer-y: ${y(t)}; --layer-z: ${z(t)};`
    document.write(`<div
      id="${id}"
      data-t=${t}
      style="${style}"
      class="${className}">${content[i] || ''}</div>`)
  }

  let elements = null
  process.nextTick(() => {
    elements = ids.map(id => {
      const e = document.getElementById(id)
      e.t = +e.dataset.t
      return e
    })
    if (elements.length)
      elements[0].parentNode.layerElements = elements
  })


  const refresh = () => elements.forEach(({t, style}) => {
    style.setProperty('--layer-x', x(t))
    style.setProperty('--layer-y', y(t))
    style.setProperty('--layer-z', z(t))
  })
  return {
    get x() { return x },
    set x(newX) { x = newX; refresh() },
    get y() { return y },
    set y(newY) { y = newY; refresh() },
    get z() { return z },
    set z(newZ) { z = newZ; refresh() },
  }
}