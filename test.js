let a = { num: 1, parent: null }
let b = {}
let c = {}

function createProtype(son, parent) {
  son.num = parent.num
}

createProtype(b, a)
createProtype(c, b)

console.log(c)
