import { AXES, CLUSTER_PALETTE, ROMAN } from '../data/axes.js'

const SLOTS = ['x', 'y', 'z']

/**
 * 分群結果卡片網格：各群人數、羅馬數字徽記、重心在顯示中軸上的位置。
 * 顯示軸數量隨維度（1–3）變化。
 */
export default function ClusterSection({ cluster, axisMap, activeSlots }) {
  const shown = activeSlots.map((slot) => ({
    slot,
    axisKey: axisMap[slot],
    idx: SLOTS.indexOf(slot), // 重心向量固定為 [x, y, z] 順序，未啟用維度為 0
  }))
  const total = cluster.assignments.length

  return (
    <div className="cluster-grid">
      {cluster.centroids.map((c, i) => {
        const count = cluster.assignments.filter((a) => a === i).length
        const color = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length]
        return (
          <div className="panel cluster-card" key={i}>
            <div className="cluster-head">
              <span className="cluster-gem" style={{ background: color, color }} />
              <span className="cluster-name">群組 {ROMAN[i]}</span>
              <span className="cluster-n">
                <b>{count}</b> 人 · {Math.round((count / total) * 100)}%
              </span>
            </div>
            <div className="cluster-bars">
              {shown.map(({ slot, axisKey, idx }) => {
                const ax = AXES[axisKey]
                const pct = 50 + 50 * c[idx]
                return (
                  <div className="mini-row" key={slot}>
                    <span className="mini-name" style={{ color: ax.color }}>
                      {ax.name}
                    </span>
                    <div className="mini-track" title={`${ax.left} ←→ ${ax.right}`}>
                      <span
                        className="mini-marker"
                        style={{
                          left: `${Math.min(97, Math.max(3, pct))}%`,
                          background: ax.color,
                          color: ax.color,
                        }}
                      />
                    </div>
                    <span className="mini-pct">{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
