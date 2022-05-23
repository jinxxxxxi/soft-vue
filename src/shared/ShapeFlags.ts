// 为了性能，使用位运算，但是牺牲了可读性
// 修改 用 或运算
// 查找 用 与运算
export const enum ShapeFlags {
  ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, //0100
  ARRAY_CHILDREN = 1 << 3 // 1000
}
