export default function HeaderBar({ phase, step, total, onRestart }) {
  const progress = total ? (step / total) * 100 : 0
  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <div className="brand">
          <span className="brand-gem">
            <b>✦</b>
          </span>
          <div>
            <div className="brand-name">立場星圖</div>
            <div className="brand-sub">VALUES CONSTELLATION</div>
          </div>
        </div>
        {phase !== 'setup' && (
          <div className="topbar-right">
            <div className="progress-wrap">
              <span className="progress-text">
                {phase === 'done' ? `全部 ${total} 題 · 已完成` : `第 ${step} / ${total} 題`}
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button className="btn small ghost" onClick={onRestart}>
              重新開始
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
