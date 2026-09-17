import { useMemo } from 'react'
import { AXES, CLUSTER_PALETTE, NEUTRAL_COLOR } from '../data/axes.js'
import { scoreToPct } from '../sim/simulation.js'

/**
 * 單一量軸的點分布條（beeswarm 式）：所有人在該軸 0–100% 光譜上的位置，
 * 垂直方向帶固定抖動以疏開重疊的點；分群後各點染上群組色。
 */
export default function DistributionStrip({ axisKey, agents, cluster, maxAbsRow, activeSlot }) {
  const axis = AXES[axisKey]

  const dots = useMemo(
    () =>
      agents.map((a) => {
        const h = a.history[a.history.length - 1]
        const pct = scoreToPct({ econ: h[0], dipl: h[1], govt: h[2], scty: h[3] }, maxAbsRow)[
          axisKey
        ]
        // 以 id 為種子的固定抖動，避免每次渲染跳動
        const h1 = (((a.id + 7) * 9301 + 49297) % 233280) / 233280
        const h2 = (((a.id + 41) * 7919 + 104729) % 65521) / 65521
        const top = 50 + (h1 - 0.5) * 72 // 14% ~ 86%
        const xj = (h2 - 0.5) * 1.4 // 輕微水平抖動，揉開離散分數造成的直列
        const color = cluster
          ? CLUSTER_PALETTE[cluster.assignments[a.id] % CLUSTER_PALETTE.length]
          : NEUTRAL_COLOR
        return { id: a.id, pct, top, xj, color }
      }),
    [agents, cluster, maxAbsRow, axisKey],
  )

  return (
    <div className="panel dist-strip">
      <div className="dist-head">
        <span className="dist-name" style={{ color: axis.color }}>
          {axis.name}
        </span>
        {activeSlot && <span className="dist-slot">{activeSlot} 軸</span>}
        <span className="dist-note">
          {axis.left} ── {axis.right}
        </span>
      </div>
      <div
        className="dist-track"
        style={{
          background: `linear-gradient(90deg, ${axis.color}26, rgba(10,13,17,0.5) 34% 66%, ${axis.color}26)`,
        }}
      >
        <span className="dist-center" />
        <span className="dist-pole left">{axis.left}</span>
        <span className="dist-pole right">{axis.right}</span>
        {dots.map((d) => (
          <span
            key={d.id}
            className="dist-dot"
            style={{
              left: `${Math.min(97.5, Math.max(2.5, d.pct + d.xj))}%`,
              top: `${d.top}%`,
              background: d.color,
            }}
          />
        ))}
      </div>
    </div>
  )
}
