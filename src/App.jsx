import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderBar from './components/HeaderBar.jsx'
import SectionTitle from './components/SectionTitle.jsx'
import Scene3D from './components/Scene3D.jsx'
import AxisRail from './components/AxisRail.jsx'
import QuestionCard from './components/QuestionCard.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import DistributionStrip from './components/DistributionStrip.jsx'
import ClusterSection from './components/ClusterSection.jsx'
import { AXIS_LIST } from './data/axes.js'
import { QUESTIONS } from './data/questions.js'
import {
  createAgents,
  answerAll,
  buildMaxAbsTable,
  sampleQuestions,
  scoreToCoords,
} from './sim/simulation.js'
import { kmeans } from './sim/kmeans.js'

const SLOTS = ['x', 'y', 'z']

export default function App() {
  const [phase, setPhase] = useState('setup') // setup | quiz | done
  const [agents, setAgents] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [step, setStep] = useState(0) // 已回答題數
  const [version, setVersion] = useState(0) // 強制重算派生資料的計數器
  const [axisMap, setAxisMap] = useState({ x: 'econ', y: 'dipl', z: 'scty' })
  const [checked, setChecked] = useState(['econ', 'dipl', 'scty']) // 啟用的軸（0–3 個，順序 = 啟用序）
  const [k, setK] = useState(4)
  const [cluster, setCluster] = useState(null)
  const [showTraj, setShowTraj] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const agentsRef = useRef([])

  const dim = checked.length // 0空白 · 1量表 · 2平面 · 3立體
  const activeSlots = useMemo(
    () => SLOTS.filter((s) => checked.includes(axisMap[s])),
    [checked, axisMap],
  )

  const maxAbsTable = useMemo(() => buildMaxAbsTable(quizQuestions), [quizQuestions])

  const bump = () => setVersion((v) => v + 1)

  // ---------- 流程控制 ----------
  function handleStart(nAgents, nQuestions) {
    const fresh = createAgents(nAgents, (Date.now() % 100000) + 7)
    const qs = sampleQuestions(QUESTIONS, nQuestions)
    agentsRef.current = fresh
    setAgents(fresh)
    setQuizQuestions(qs)
    setStep(0)
    setCluster(null)
    setAutoPlay(false)
    setPhase('quiz')
    bump()
  }

  // slots：低維模式只取啟用槽位（未啟用座標歸 0，分群即在線／面上進行）
  function runCluster(ag = agentsRef.current, kk = k, am = axisMap, ch = checked) {
    if (ag.length === 0 || ch.length === 0) {
      setCluster(null)
      return
    }
    const slots = ch.length === 3 ? undefined : SLOTS.filter((s) => ch.includes(am[s]))
    const pts = ag.map((a) => {
      const last = a.history[a.history.length - 1]
      return scoreToCoords(last, am, maxAbsTable[a.history.length - 1], slots)
    })
    setCluster(kmeans(pts, kk, { seed: 42 + kk * 17 }))
  }

  function answerCurrent() {
    if (step >= quizQuestions.length) return
    answerAll(agentsRef.current, quizQuestions[step])
    const next = step + 1
    setStep(next)
    if (next === quizQuestions.length) {
      setAutoPlay(false)
      setPhase('done')
      runCluster(agentsRef.current, k, axisMap, checked)
    }
    bump()
  }

  // 自動播放：每 1.2 秒推進一題
  useEffect(() => {
    if (!autoPlay || phase !== 'quiz') return
    const t = setTimeout(answerCurrent, 1200)
    return () => clearTimeout(t)
  })

  // ---------- 量軸勾選：0–3 維自由切換 ----------
  function toggleAxis(key) {
    if (checked.includes(key)) {
      // 取消勾選：降低維度（軸留在槽位圖中，隨時可恢復）
      const nextChecked = checked.filter((k2) => k2 !== key)
      setChecked(nextChecked)
      if (cluster) runCluster(agentsRef.current, k, axisMap, nextChecked)
    } else if (checked.length === 3) {
      // 3→3：替換最早啟用的軸（繼承其槽位）
      const oldest = checked[0]
      const slot = SLOTS.find((s) => axisMap[s] === oldest)
      const am = { ...axisMap, [slot]: key }
      const nextChecked = [...checked.slice(1), key]
      setAxisMap(am)
      setChecked(nextChecked)
      if (cluster) runCluster(agentsRef.current, k, am, nextChecked)
    } else {
      // 升維：若該軸不在槽位圖中，遞補第一個閒置槽位
      let am = axisMap
      if (!Object.values(axisMap).includes(key)) {
        const slot = SLOTS.find((s) => !checked.includes(axisMap[s]))
        am = { ...axisMap, [slot]: key }
        setAxisMap(am)
      }
      const nextChecked = [...checked, key]
      setChecked(nextChecked)
      if (cluster) runCluster(agentsRef.current, k, am, nextChecked)
    }
    bump()
  }

  function cycleSlot(key) {
    const act = SLOTS.filter((s) => checked.includes(axisMap[s]))
    let am
    if (act.length === 2) {
      // 兩軸：交換兩個啟用槽位
      am = { ...axisMap, [act[0]]: axisMap[act[1]], [act[1]]: axisMap[act[0]] }
    } else if (act.length === 3) {
      const cur = SLOTS.find((s) => axisMap[s] === key)
      const nxt = SLOTS[(SLOTS.indexOf(cur) + 1) % 3]
      am = { ...axisMap, [nxt]: key, [cur]: axisMap[nxt] }
    } else {
      return // 0/1 軸沒有可交換的對象
    }
    setAxisMap(am)
    if (cluster) runCluster(agentsRef.current, k, am, checked)
    bump()
  }

  function handleKChange(nextK) {
    setK(nextK)
    if (cluster) runCluster(agentsRef.current, nextK, axisMap, checked)
  }

  function handleRestart() {
    setPhase('setup')
    setAgents([])
    agentsRef.current = []
    setCluster(null)
    setStep(0)
    setAutoPlay(false)
  }

  // ---------- 畫面 ----------
  const slotOf = (key) => {
    const s = SLOTS.find((s2) => axisMap[s2] === key)
    return s ? s.toUpperCase() : null
  }

  const dimChip =
    dim === 0
      ? '空白 · 勾選量軸以展開'
      : dim === 1
        ? '一維量表'
        : dim === 2
          ? '二維正視圖 · 笛卡爾座標'
          : '三次元立場空間'

  return (
    <div className="page">
      <HeaderBar phase={phase} step={step} total={quizQuestions.length} onRestart={handleRestart} />

      <main className="container">
        {phase === 'setup' && <SetupScreen onStart={handleStart} />}

        {phase === 'quiz' && (
          <QuestionCard
            index={step}
            total={quizQuestions.length}
            question={quizQuestions[step]}
            onAnswer={answerCurrent}
            autoPlay={autoPlay}
            onToggleAutoPlay={() => setAutoPlay((a) => !a)}
          />
        )}

        {phase === 'done' && (
          <div className="panel done-banner">✦ 全部作答完成 —— 眾人已分為陣營，各授其色 ✦</div>
        )}

        <section className="viz-grid">
          <div className="panel viz-card">
            <Scene3D
              agents={agents}
              version={version}
              axisMap={axisMap}
              cluster={cluster}
              showTraj={showTraj}
              maxAbsTable={maxAbsTable}
              dim={dim}
              activeSlots={activeSlots}
            />
            <span className="viz-chip tl">{dimChip}</span>
            <span className="viz-chip br">{dim === 3 ? '拖曳旋轉 · 滾輪縮放' : '滾輪縮放'}</span>
          </div>

          <AxisRail
            axisMap={axisMap}
            checked={checked}
            onToggleAxis={toggleAxis}
            onCycleSlot={cycleSlot}
            showTraj={showTraj}
            onToggleTraj={() => setShowTraj((s) => !s)}
            k={k}
            onKChange={handleKChange}
            onRecluster={() => runCluster()}
            canCluster={phase === 'done' && dim > 0}
          />
        </section>

        {phase !== 'setup' && (
          <section className="section">
            <SectionTitle zh="各軸點分布" en="DISTRIBUTIONS" />
            <div className="dist-list">
              {AXIS_LIST.map((ax) => (
                <DistributionStrip
                  key={ax.key}
                  axisKey={ax.key}
                  agents={agents}
                  cluster={cluster}
                  maxAbsRow={maxAbsTable[step]}
                  activeSlot={slotOf(ax.key)}
                />
              ))}
            </div>
          </section>
        )}

        {phase === 'done' && cluster && (
          <section className="section">
            <SectionTitle zh="分群結果" en="K-MEANS CLUSTERS" />
            <ClusterSection cluster={cluster} axisMap={axisMap} activeSlots={activeSlots} />
          </section>
        )}

        <footer className="footer">題目翻譯自 8values（MIT License）· 受試者由程式模擬</footer>
      </main>
    </div>
  )
}
