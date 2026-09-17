import { AXIS_KEYS } from '../data/axes.js'

// ---------- 隨機工具 ----------
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeGauss(rng) {
  return function () {
    let u = 0
    let v = 0
    while (u === 0) u = rng()
    while (v === 0) v = rng()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// ---------- 潛在意識形態種子（bias 空間 [-1,1]^4，+1 = 平等/世界/自由/進步） ----------
const IDEOLOGY_SEEDS = [
  { name: '進步左派', bias: [0.8, 0.7, 0.6, 0.8] },
  { name: '保守右派', bias: [-0.7, -0.6, -0.5, -0.7] },
  { name: '自由意志派', bias: [-0.6, 0.3, 0.9, 0.4] },
  { name: '威權中間', bias: [0.2, -0.3, -0.8, 0.0] },
  { name: '溫和折衷派', bias: [0.05, 0.05, 0.05, 0.05] },
]

/**
 * 產生 N 個模擬受試者。
 * 約 75% 圍繞意識形態種子分佈（帶高斯雜訊），25% 完全隨機（雜訊點），
 * 讓分群結果既有結構又不會太乾淨。
 */
export function createAgents(n, seed = 1234) {
  const rng = mulberry32(seed)
  const gauss = makeGauss(rng)
  const agents = []
  for (let i = 0; i < n; i++) {
    // bias 以軸名為 key：{ econ, dipl, govt, scty }，各值 ∈ [-1, 1]
    let bias
    if (rng() < 0.75) {
      const s = IDEOLOGY_SEEDS[(rng() * IDEOLOGY_SEEDS.length) | 0]
      bias = Object.fromEntries(
        AXIS_KEYS.map((ax, d) => [ax, clamp(s.bias[d] + gauss() * 0.28, -1, 1)]),
      )
    } else {
      bias = Object.fromEntries(AXIS_KEYS.map((ax) => [ax, rng() * 2 - 1]))
    }
    agents.push({
      id: i,
      bias,
      scores: { econ: 0, dipl: 0, govt: 0, scty: 0 },
      history: [[0, 0, 0, 0]], // 每答完一題 push 一次 [econ, dipl, govt, scty]
    })
  }
  return agents
}

/**
 * 所有人回答同一題：依各自的隱藏偏好決定同意強度，更新分數並記錄軌跡。
 * multiplier ∈ {-2..+2} 對應「強烈不同意～強烈同意」。
 */
export function answerAll(agents, question, rng = Math.random) {
  const gauss = makeGauss(rng)
  for (const agent of agents) {
    // 與題目方向的契合度 = 兩個向量的加權內積（只算該題有影響的軸）
    let dot = 0
    let wsum = 0
    for (const ax of AXIS_KEYS) {
      const w = question.effect[ax]
      if (!w) continue
      dot += (w / 10) * agent.bias[ax]
      wsum += Math.abs(w) / 10
    }
    let agree = wsum ? dot / wsum : 0
    agree = clamp(agree + gauss() * 0.45, -1, 1) // 個人答題雜訊

    // 契合度 → 作答強度（帶隨機抖動，模擬真實作答的模糊性）
    const strength = (agree + 1) / 2
    const pos = strength * 4 + (rng() * 2 - 1) * 1.1
    const m = clamp(Math.round(pos), 0, 4) - 2

    const next = [0, 0, 0, 0]
    AXIS_KEYS.forEach((ax, d) => {
      agent.scores[ax] += question.effect[ax] * m
      next[d] = agent.scores[ax]
    })
    agent.history.push(next)
  }
}

/**
 * 預計算「每一步」各軸可能累積的最大 |分數|，
 * 用來把原始分數正規化到 0–100%（8values 的做法，改成逐步版）。
 * 回傳長度 = 題數 + 1 的表格，index i 表示答完 i 題後的正規化分母。
 */
export function buildMaxAbsTable(questions) {
  const table = [Object.fromEntries(AXIS_KEYS.map((ax) => [ax, 1]))]
  let acc = Object.fromEntries(AXIS_KEYS.map((ax) => [ax, 0]))
  for (const q of questions) {
    for (const ax of AXIS_KEYS) acc[ax] += 2 * Math.abs(q.effect[ax])
    table.push(Object.fromEntries(AXIS_KEYS.map((ax) => [ax, Math.max(acc[ax], 1)])))
  }
  return table
}

/** 分數 → 0–100% */
export function scoreToPct(scores, maxAbsRow) {
  const out = {}
  for (const ax of AXIS_KEYS) {
    out[ax] = 50 + 50 * clamp(scores[ax] / maxAbsRow[ax], -1, 1)
  }
  return out
}

/** 依目前的三軸設定，把某一步的分數換算成 3D 座標 [-1,1]^3
 *  activeSlots：2D 模式只傳入啟用的兩個槽位，未選槽的座標歸 0（壓平） */
export function scoreToCoords(historyEntry, axisMap, maxAbsRow, activeSlots = ['x', 'y', 'z']) {
  const pct = scoreToPct(
    { econ: historyEntry[0], dipl: historyEntry[1], govt: historyEntry[2], scty: historyEntry[3] },
    maxAbsRow,
  )
  const c = (sl) => (activeSlots.includes(sl) ? (pct[axisMap[sl]] - 50) / 50 : 0)
  return [c('x'), c('y'), c('z')]
}

/** 從題庫中隨機抽取 n 題（洗牌後取前 n） */
export function sampleQuestions(questions, n, seed = Date.now()) {
  if (n >= questions.length) return questions.slice()
  const rng = mulberry32(seed >>> 0)
  const arr = questions.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}
