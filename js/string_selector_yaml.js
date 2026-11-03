import { app } from '../../scripts/app.js'
import {
  getExtensionName,
  beforeRegisterNodeDef,
  NodeStates,
  replaceWidget
} from './common.js'
import * as YAML from './lib/yaml.mjs'

const ClassName = 'StringSelectorYaml'
const ValuesWidgetName = 'values'
const SelectWidgetName = 'select'

const nodeStates = new NodeStates({
  // 初期化時に widgetを確保して、以降の処理での再取得を避ける
  valueWidget: null,
  selectWidget: null,

  value: '',
  valueParsed: {},
  selectValues: []
})

app.registerExtension({
  name: getExtensionName(ClassName),

  // createdNodeではなくこちらで初期化を実行(className チェックを毎回行わないようにするため)
  beforeRegisterNodeDef(nodeType, nodeData) {
    beforeRegisterNodeDef(nodeType, nodeData, ClassName, onNodeCreated)
  }
})

function onNodeCreated(node) {
  try {
    initializeState(node)

    initValuesWidget(node)
    initSelectWidget(node)
  } catch (e) {
    console.error('Error initializing node: ', node, e)
  }
}

function initializeState(node) {
  const state = nodeStates.get(node)

  state.valueWidget = node.widgets?.find((w) => w.name === ValuesWidgetName)
  state.selectWidget = node.widgets?.find((w) => w.name === SelectWidgetName)
  if (!state.valueWidget || !state.selectWidget) {
    throw new Error('Required widgets not found')
  }
}

function onUpdateValueWidget(node, value) {
  try {
    const state = nodeStates.get(node)
    state.value = value

    const _parsed = tryParseValues(state.valueWidget.value)
    if (_parsed) {
      state.valueParsed = _parsed
      state.selectValues = generateSelectValues(_parsed)
    }

    updateSelectWidgetValues(node)
  } catch (e) {
    console.error('Error updating value widget: ', node, e)
  }
}

function initValuesWidget(node) {
  const state = nodeStates.get(node)
  const _callback = state.valueWidget.callback
  state.valueWidget.callback = function (value) {
    _callback?.apply(this, arguments)
    onUpdateValueWidget(node, value)
  }

  onUpdateValueWidget(node, state.valueWidget.value)
}

function initSelectWidget(node) {
  let widget = node.widgets?.find((w) => w.name === SelectWidgetName)
  if (!widget) {
    return
  }

  const state = nodeStates.get(node)

  // Note: ちょっとしたハックコード。pythonでのtypeをStringにしておき、ここでComboに変換することで、動作上Comboだけれど、inputの型をstringのままにすることができる
  // メリット: SubGraph内外の接続時に、複数Node間で接続の互換性が保たれる
  // widget.options.values = () => state.selectValues
  const oldWidget = state.selectWidget
  state.selectWidget = replaceWidget(
    node,
    oldWidget,
    'Combo',
    SelectWidgetName,
    oldWidget.value,
    () => {
      node.setDirtyCanvas(true, true)
    },
    {
      default: '',
      tooltip: 'please enter YAML content',
      values: () => state.selectValues
    }
  )

  updateSelectWidgetValues(node)
}

function tryParseValues(value) {
  try {
    // parseが成功して一般的な値(プリミティブ)であれば、stringに変更して返却
    const parsed = YAML.parse(value)
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every((v) => v === null || typeof v !== 'object')
    ) {
      return parsed
    }
    return null
  } catch (e) {
    return null
  }
}

function generateSelectValues(parsedValue) {
  return Object.keys(parsedValue ?? {})
}

function updateSelectWidgetValues(node) {
  const state = nodeStates.get(node)
  const widget = state.selectWidget
  const values = state.selectValues

  // fix select widget value =====
  if (values.length === 0) {
    widget.value = ''
    return
  }

  if (!values.includes(widget.value)) {
    widget.value = values[0] ?? ''
  }

  // update UI
  node.setDirtyCanvas(true, true)
}
