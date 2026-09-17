import { AXIS_LIST } from '../data/axes.js'

/**
 * 右欄：所有量軸的勾選卡 + 視覺化設定
 * 自由勾選 0–3 軸：1 軸＝左右量表、2 軸＝2D 正視圖、3 軸＝3D 立體圖；
 * 三軸時點擊未勾選的軸 → FIFO 替換最早的軸。啟用中的軸可點 X/Y/Z 徽章交換槽位。
 */
export default function AxisRail({
  axisMap,
  checked,
  onToggleAxis,
  onCycleSlot,
  showTraj,
  onToggleTraj,
  k,
  onKChange,
  onRecluster,
  canCluster,
}) {
  const slotOf = (key) => Object.keys(axisMap).find((s) => axisMap[s] === key)

  return (
    <aside className="rail">
      <div className="panel rail-panel">
        <h3 className="panel-title">量軸</h3>
        <div className="axis-list">
          {AXIS_LIST.map((ax) => {
            const isChecked = checked.includes(ax.key)
            const inSlot = slotOf(ax.key)
            return (
              <div
                key={ax.key}
                className={`axis-card${isChecked ? ' active' : ''}`}
                style={{ '--ax': ax.color }}
                onClick={() => onToggleAxis(ax.key)}
                title={
                  isChecked ? '取消勾選以收合維度' : '勾選以展開維度（1D 量表 → 2D 平面 → 3D 立體）'
                }
              >
                <span className="cbx">{isChecked ? '✓' : ''}</span>
                <div className="axis-info">
                  <div className="axis-name">
                    {ax.name}
                    {isChecked && inSlot && (
                      <button
                        className="slot-chip"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCycleSlot(ax.key)
                        }}
                        title="點擊交換槽位"
                      >
                        {inSlot.toUpperCase()}
                      </button>
                    )}
                  </div>
                  <div className="axis-poles">
                    {ax.left} ─ {ax.right}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="rail-hint">
          自由勾選 0–3 軸：一軸為左右量表、兩軸為 2D 平面、三軸為 3D 立體，切換皆有漸變補間。
          三軸時點擊未勾選的軸，將替換最早啟用的軸。
        </p>
      </div>

      <div className="panel rail-panel">
        <h3 className="panel-title">視覺化設定</h3>
        <div className="switch-row">
          <span>顯示軌跡</span>
          <span className={`switch${showTraj ? ' on' : ''}`} onClick={onToggleTraj}>
            <i />
          </span>
        </div>
        <div className={`k-row${canCluster ? '' : ' disabled'}`}>
          <span>
            分群數 k = <b>{k}</b>
          </span>
          <input
            type="range"
            min="2"
            max="8"
            value={k}
            disabled={!canCluster}
            onChange={(e) => onKChange(Number(e.target.value))}
          />
        </div>
        <button className="btn" disabled={!canCluster} onClick={onRecluster}>
          重新分群
        </button>
        {!canCluster && <p className="rail-hint">完成所有題目後，即可調整分群數並重新分群。</p>}
      </div>
    </aside>
  )
}
