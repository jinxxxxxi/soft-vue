var str = 'abcdbc'
str = str.replace(/(bc)/g, function (val) {
  console.log(arguments)
  val = '1'
  return val
})
console.log(str)
