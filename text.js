const a = /^on([A-Z])([a-z])/
const b = 'onClick'.replace(a, function (a, b, c) {
  console.log('$1')

  return
})
// console.log(b)
