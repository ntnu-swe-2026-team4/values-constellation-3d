import { mulberry32 } from './simulation.js'

/**
 * K-means 分群（k-means++ 初始化 + 多次重啟取最佳）
 * @param {number[][]} points 資料點陣列
 * @param {number} k 分群數
 * @returns {{ assignments: number[], centroids: number[][], inertia: number }}
 */
export function kmeans(points, k, { restarts = 10, maxIter = 60, seed = 42 } = {}) {
  const n = points.length
  if (n === 0) return { assignments: [], centroids: [], inertia: 0 }
  k = Math.max(1, Math.min(k, n))
  const dim = points[0].length
  const rng = mulberry32(seed)
  let best = null

  for (let r = 0; r < restarts; r++) {
    // --- k-means++ 初始化 ---
    const centroids = [points[(rng() * n) | 0].slice()]
    while (centroids.length < k) {
      const dists = new Float64Array(n)
      let total = 0
      for (let i = 0; i < n; i++) {
        let minD = Infinity
        for (const c of centroids) {
          let s = 0
          for (let d = 0; d < dim; d++) {
            const t = points[i][d] - c[d]
            s += t * t
          }
          if (s < minD) minD = s
        }
        dists[i] = minD
        total += minD
      }
      let target = rng() * total
      let idx = n - 1
      for (let i = 0; i < n; i++) {
        target -= dists[i]
        if (target <= 0) {
          idx = i
          break
        }
      }
      centroids.push(points[idx].slice())
    }

    // --- 主要迭代 ---
    const assignments = new Array(n).fill(0)
    for (let iter = 0; iter < maxIter; iter++) {
      let moved = false
      for (let i = 0; i < n; i++) {
        let bestC = 0
        let bestD = Infinity
        for (let c = 0; c < k; c++) {
          let s = 0
          for (let d = 0; d < dim; d++) {
            const t = points[i][d] - centroids[c][d]
            s += t * t
          }
          if (s < bestD) {
            bestD = s
            bestC = c
          }
        }
        if (assignments[i] !== bestC) {
          assignments[i] = bestC
          moved = true
        }
      }

      // 重算重心
      const sums = Array.from({ length: k }, () => new Float64Array(dim))
      const counts = new Array(k).fill(0)
      for (let i = 0; i < n; i++) {
        counts[assignments[i]]++
        const s = sums[assignments[i]]
        for (let d = 0; d < dim; d++) s[d] += points[i][d]
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] === 0) {
          centroids[c] = points[(rng() * n) | 0].slice() // 空群：重新播種
        } else {
          centroids[c] = Array.from(sums[c], (v) => v / counts[c])
        }
      }
      if (!moved && iter > 0) break
    }

    // --- 計算這次重啟的總變異 ---
    let inertia = 0
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let d = 0; d < dim; d++) {
        const t = points[i][d] - centroids[assignments[i]][d]
        s += t * t
      }
      inertia += s
    }
    if (!best || inertia < best.inertia) best = { assignments, centroids, inertia }
  }

  return best
}

/**
 * 肘部法：算 k=1..maxK 的 inertia，提供「該分幾群」的參考。
 */
export function elbowCurve(points, maxK = 8) {
  const curve = []
  for (let k = 1; k <= Math.min(maxK, points.length); k++) {
    const { inertia } = kmeans(points, k, { restarts: 6, maxIter: 40 })
    curve.push({ k, inertia })
  }
  return curve
}
