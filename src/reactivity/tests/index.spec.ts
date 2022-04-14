import { add } from '../index'

// it('init', () => {
//   expect(add(1, 2)).toBe(3)
// })

test('add 1 + 1 equal 2', () => {
  expect(add(1, 1)).not.toBe(1)
  expect(add(1, 1)).toBe(2)
})
