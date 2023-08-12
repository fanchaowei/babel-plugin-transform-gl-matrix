// 调用 babel 的插件接口
module.exports = function ({ types: t }) {
  // plugin contents
  return {
    visitor: {
      // 我们修改 CallExpression 类型节点下的 callee.name 为 vac2.fromValues
      CallExpression: {
        exit(path) {
          const funcName = path.node.callee.name
          if (funcName === 'vec2') {
            const args = path.node.arguments
            // 判断参数个数，如果是 2 个，就修改 callee.name
            if (args.length === 2) {
              path.node.callee.name = 'vac2.fromValues'
            }
          }
        },
      },
      // vec2(a) + vec2(b)  -> vec2.add(vec2.create(), a, b)
      BinaryExpression: {
        exit(path) {
          const { left, right } = path.node
          // t.isCallExpression 用于判断是否是函数调用节点
          // t.isIdentifier 用于判断是否是标识符节点
          if (t.isCallExpression(left) && right.callee.name === 'vec2') {
            if (t.isCallExpression(right) && left.callee.name === 'vec2') {
              const { operator } = path.node
              if (operator === '+') {
                // t.callExpression 用于创建函数调用节点
                const node = t.callExpression(
                  // t.identifier 用于创建标识符节点
                  t.identifier(`${left.callee.name}.add`),
                  [
                    t.callExpression(
                      t.identifier(`${left.callee.name}.create`),
                      []
                    ),
                    left.arguments[0],
                    right.arguments[0],
                  ]
                )
                path.replaceWith(node)
              }
            }
          }
        },
      },
    },
  }
}
