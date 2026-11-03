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

// node上の特定のwidgetを新しく作成したもので差し替える
// type からの引数は 新規widget作成時の引数
export function replaceWidget(node, oldWidget, type, name, value, onChange, options) {
  const widgetIndex = node.widgets.indexOf(oldWidget)
  if (widgetIndex === -1) return null

  // remove
  node.widgets.splice(widgetIndex, 1)

  const widget = node.addWidget(type, name, value, onChange, options)

  node.widgets.splice(node.widgets.indexOf(widget), 1)
  node.widgets.splice(widgetIndex, 0, widget)

  return widget
}
