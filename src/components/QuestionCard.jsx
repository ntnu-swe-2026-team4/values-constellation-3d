export default function QuestionCard({
  index,
  total,
  question,
  onAnswer,
  autoPlay,
  onToggleAutoPlay,
}) {
  return (
    <div className="panel question-card">
      <div className="question-top">
        <span className="q-count">
          第 {index + 1} 題 · 共 {total} 題
        </span>
        <span className="q-auto">
          自動播放
          <span className={`switch${autoPlay ? ' on' : ''}`} onClick={onToggleAutoPlay}>
            <i />
          </span>
        </span>
      </div>
      <div className="ornament">
        <span />
        <i>✦</i>
        <span />
      </div>
      <p className="question-text">{question.text}</p>
      <button className="btn primary" onClick={onAnswer} disabled={autoPlay}>
        所有人作答
      </button>
      <p className="hint">每位虛擬國民將依自身隱藏立場，決定同意的程度</p>
    </div>
  )
}
