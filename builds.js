const Builds = (...builds) => {
  document.currentScript[Builds] =
    document.currentScript[Builds] || []
  document.currentScript[Builds].push(...builds)
}

const buildSymbol = Symbol('builds')
Builds[Symbol.toPrimitive] = () => buildSymbol

export default Builds

export const forBuild = Symbol()

export const chain = (...builds) => {
  return {
    build(startTime) {
      
    },

    unbuild(startTime) {

    }
  }
}