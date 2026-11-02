import { app } from '../../scripts/app.js'
import { getExtensionName, beforeRegisterNodeDef, NodeStates } from './common.js'
import * as YAML from './lib/yaml.mjs'

const ClassName = 'StringSelectorYaml'
const ValuesWidgetName = 'values'
const SelectWidgetName = 'select'

const nodeStates = new NodeStates({
  updating: false,
  value: '',
  valueParsed: {}
})

app.registerExtension({
  name: getExtensionName(ClassName),

  // createdNodeではなくこちらで初期化を実行(className チェックを毎回行わないようにするため)
  beforeRegisterNodeDef(nodeType, nodeData) {
    beforeRegisterNodeDef(nodeType, nodeData, ClassName, onNodeCreated)
  }
})

function onNodeCreated(node) {
  initValuesWidget(node)
  initSelectWidget(node)
}

function initValuesWidget(node) {
  const widget = node.widgets?.find((w) => w.name === ValuesWidgetName)
  if (!widget) return

  const _update = (node) => {
    const state = nodeStates.get(node)
    state.value = widget.value

    const _oldParsed = state.valueParsed
    const _parsed = parseValues(widget.value)
    state.valueParsed = _parsed ?? _oldParsed ?? {}
  }

  const _callback = widget.callback
  widget.callback = function (value) {
    _callback?.apply(this, arguments)

    _update(node)

    updateSelectWidgetValues(node)
  }

  _update(node)
}

function initSelectWidget(node) {
  let widget = node.widgets?.find((w) => w.name === SelectWidgetName)
  if (!widget) {
    return
  }

  const state = nodeStates.get(node)

  // convert widget to combo if it's not already
  if (widget.type != 'combo') {
    const widgetIndex = node.widgets.indexOf(widget)
    const _value = widget.value

    // remove
    node.widgets.splice(widgetIndex, 1)

    widget = node.addWidget(
      'combo',
      SelectWidgetName,
      _value,
      () => {
        node.setDirtyCanvas(true, true)
      },
      {
        values: () => getSelectValues(state.valueParsed)
      }
    )
    widget.serialize = true

    node.widgets.splice(node.widgets.indexOf(widget), 1)
    node.widgets.splice(widgetIndex, 0, widget)
  }

  updateSelectWidgetValues(node)
}

function parseValues(value) {
  try {
    const parsed = YAML.parse(value)
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every((v) => v === null || typeof v !== 'object')
    ) {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => {
          return [key, String(value ?? '')]
        })
      )
    }
    return null
  } catch (e) {
    return null
  }
}

function getSelectValues(parsedValue) {
  const keys = Object.keys(parsedValue ?? {})

  const selectValues = []
  for (let i = 0; i < keys.length; i++) {
    selectValues.push(i + ': ' + keys[i])
  }
  return selectValues
}

function updateSelectWidgetValues(node) {
  const widget = node.widgets?.find((w) => w.name === SelectWidgetName)
  if (!widget) return

  const state = nodeStates.get(node)
  const values = getSelectValues(state.valueParsed)

  widget.options.values = () => getSelectValues(state.valueParsed)
  widget.value = values.includes(widget.value) ? widget.value : (values[0] ?? '')

  node.setDirtyCanvas(true, true)
}
