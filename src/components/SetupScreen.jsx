import { useState } from 'react'

export default function SetupScreen({ onStart }) {
  const [nAgents, setNAgents] = useState(80)
  const [nQuestions, setNQuestions] = useState(24)

  return (
    <div className="hero panel">
      <div className="hero-crest">✦</div>
      <h1 className="hero-title">立場星圖</h1>
      <p className="hero-sub">VALUES CONSTELLATION</p>
      <div className="ornament">
        <span />
        <i>✦</i>
        <span />
      </div>
      <p className="hero-desc">
        召集一組虛擬國民，每人皆有隱藏的立場向量。隨著一道道題目揭曉，
        眾人的四軸分數——經濟、外交、政府、社會——將在三次元星圖中即時漂移； 待全部作答完成，以
        K-means 將眾人分為陣營，各授其色。
      </p>
      <div className="hero-controls">
        <label>
          <span>
            虛擬國民數：<b>{nAgents}</b>
          </span>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={nAgents}
            onChange={(e) => setNAgents(Number(e.target.value))}
          />
        </label>
        <label>
          <span>
            題數：<b>{nQuestions === 70 ? '全部 70 題' : nQuestions}</b>
          </span>
          <input
            type="range"
            min="8"
            max="70"
            step="1"
            value={nQuestions}
            onChange={(e) => setNQuestions(Number(e.target.value))}
          />
        </label>
      </div>
      <button className="btn primary big" onClick={() => onStart(nAgents, nQuestions)}>
        開始模擬
      </button>
      <p className="hint">題目翻譯自 8values（MIT License）· 資料為程式模擬，僅供展示</p>
    </div>
  )
}
