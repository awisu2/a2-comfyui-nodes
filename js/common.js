export const CATEGORY = 'A2'

export function getExtensionName(className) {
  return CATEGORY + '.' + className + '.Extension'
}

// beforeRegisterNodeDef の共通処理、nodeTypeが登録されるときに呼ばれる。インスタンスの生成前の処理
// createdNodesが全てのNodeから呼ばれるのを防止し,若干の軽量化および、不要なコールを防ぐ
export function beforeRegisterNodeDef(nodeType, nodeData, ClassName, onNodeCreated) {
  if (nodeData.name !== ClassName) return

  const original = nodeType.prototype.onNodeCreated

  nodeType.prototype.onNodeCreated = function () {
    original?.apply(this, arguments)

    const node = this
    onNodeCreated?.call(this, node)
  }
}

// simple node state management
export class NodeStates {
  constructor(defaultState = {}) {
    this.map = new WeakMap()
    this.defaultState = defaultState
  }

  get(node) {
    if (!this.map.has(node)) {
      this.map.set(node, { ...this.defaultState })
    }
    return this.map.get(node)
  }
}
