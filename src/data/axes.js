// 四個價值軸定義（8values 風格）——配色取「文明帝國」式做舊珠寶色
// 每軸是連續光譜：left（0%）←→ right（100%）
// 答題 effect 為正 → 往 right 移動；為負 → 往 left 移動
export const AXES = {
  econ: { key: 'econ', name: '經濟', left: '市場', right: '平等', color: '#e0a83c' },
  dipl: { key: 'dipl', name: '外交', left: '民族', right: '世界', color: '#6aa5d8' },
  govt: { key: 'govt', name: '政府', left: '權威', right: '自由', color: '#6fbf8a' },
  scty: { key: 'scty', name: '社會', left: '傳統', right: '進步', color: '#d9695f' },
}

export const AXIS_KEYS = ['econ', 'dipl', 'govt', 'scty']

export const AXIS_LIST = AXIS_KEYS.map((k) => AXES[k])

// K-means 分群用調色盤（最多支援 8 群）——深色背景上的寶石色
export const CLUSTER_PALETTE = [
  '#c9564f',
  '#57a86e',
  '#5b8fc9',
  '#d9924f',
  '#9a6fc9',
  '#4fb3b3',
  '#c964a5',
  '#a89f4f',
]

// 分群編號用羅馬數字（介面呈現用）
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

export const NEUTRAL_COLOR = '#7d7466'
