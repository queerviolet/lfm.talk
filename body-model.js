class BodyModel extends HTMLElement {
  connectedCallback() {
    this.update = fill(this)
    this.update()
  }

  disconnectedCallback() {
    this.innerHTML = ''
  }
}

const {random: num} = Math

const True = () => 'true'
const False = () => 'false'

const Bool = (p=0.5) => (t=True, f=False) => num() < p ? t() : f()
const bool = Bool()

const Vec = size => (element=num) => () => `[${
  new Array(size).fill(0)
    .map(() => element())
    .join(', ')
}]`

const Enum = (...cases) => () => cases[Math.floor(cases.length * num())]

const vec4 = Vec(4)()
const vec2 = Vec(2)()
const mat4 = Vec(4)(vec4)
const mat8_2 = Vec(8)(vec2)

const params = {
  l: {
    upper_arm_pos: vec4,  
    l_forearm_pos: vec4,
    l_hand_pos: vec4,
    l_finger_pos: mat4,
    l_arm_pos: vec4,
    l_armpit_touch_pts: mat8_2,
  },

  r_upper_arm_pos: vec4,  
  r_forearm_pos: vec4,
  r_hand_pos: vec4,
  r_finger_pos: mat4,
  r_arm_pos: vec4,
  r_armpit_touch_pts: mat8_2,
  
  stomach_acid: num,
  __deprecated_appendix_t: num,
  is_hungry: bool,
  last_thought_about_breakup_t: num,
}

const tag = name => (attrs={}, ...children) => {
  const e = document.createElement(name)
  Object.entries(attrs)
    .forEach(([attr, value]) => e.setAttribute(attr, value))
  children.forEach(child => {
    if (typeof child === 'string') {
      e.appendChild(document.createTextNode(child))
      return
    }
    e.appendChild(child)
  })
  return e
}

const span = tag('span')
const wipe = Enum('wipe-north-south', 'wipe-east-west', 'wipe-west-east', 'wipe-south-north')
const paramElement = param => span({id: `${param}_param`, class: `param ${param} ${wipe()}`}, param, ':')
const valueElement = param => span({id: `${param}_value`, class: `value ${param} ${wipe()}`})

const fill = (parent, p=params) => {
  const children = Object.entries(p)
    .map(([param, gen]) => {
      const child = span()
      parent.appendChild(child)
      const p = paramElement(param)
      const v = valueElement(param)        
      child.appendChild(p)
      child.appendChild(v)
      child.id = param
      if (typeof gen === 'function') {
        return child.update = () => v.textContent = gen()
      }
      return child.update = fill(v, gen)
    })
  return () => children.forEach(x => x())
}

customElements.define('body-model', BodyModel)