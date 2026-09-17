import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { AXES, CLUSTER_PALETTE, NEUTRAL_COLOR } from '../data/axes.js'
import { scoreToCoords } from '../sim/simulation.js'

const CUBE = 1 // 座標範圍 [-1, 1]
const SLOTS = ['x', 'y', 'z']
const SLOT_DIRS = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
}
// 各平面組合的「正面」機位與 up 向量（笛卡爾座標：第一軸水平、第二軸垂直）
const PLANAR_VIEWS = {
  'x,y': { pos: [0, 0, 3.2], up: [0, 1, 0] },
  'x,z': { pos: [0, -3.2, 0], up: [0, 0, 1] },
  'y,z': { pos: [3.2, 0, 0], up: [0, 0, 1] },
}
// 單軸量表：讓該軸呈水平左右的機位
const LINE_VIEWS = {
  x: { pos: [0, 0, 3.2], up: [0, 1, 0] },
  y: { pos: [3.2, 0, 0], up: [0, 0, 1] },
  z: { pos: [0, 3.2, 0], up: [1, 0, 0] },
}

const DUR = 900 // 維度切換統一時長（鏡頭、軸生長、點位同一時鐘）
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function makeTextSprite(text, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.font = 'bold 34px "Noto Serif TC", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(8, 6, 4, 0.95)'
  ctx.shadowBlur = 7
  ctx.fillStyle = color
  ctx.fillText(text, 128, 34)
  ctx.fillText(text, 128, 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.72, 0.18, 1)
  return sprite
}

export default function Scene3D({
  agents,
  version,
  axisMap,
  cluster,
  showTraj,
  maxAbsTable,
  dim,
  activeSlots,
}) {
  const mountRef = useRef(null)
  const threeRef = useRef(null)

  // ---- 目標位置（React 資料 → 座標；未啟用槽位歸 0，0 軸時全員歸中間點） ----
  const targets = useMemo(() => {
    const t = new Float32Array(agents.length * 3)
    agents.forEach((a, i) => {
      const step = a.history.length - 1
      const c = scoreToCoords(a.history[step], axisMap, maxAbsTable[step], activeSlots)
      t[i * 3] = c[0]
      t[i * 3 + 1] = c[1]
      t[i * 3 + 2] = c[2]
    })
    return t
    // version 是 mutation 計數器：agents 陣列刻意原地變異以省記憶體，需靠它強制重算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, version, axisMap, maxAbsTable, activeSlots])

  // ---- 每個點的顏色 ----
  const colors = useMemo(() => {
    const c = new Float32Array(agents.length * 3)
    const neutral = new THREE.Color(NEUTRAL_COLOR)
    const tmp = new THREE.Color()
    agents.forEach((_, i) => {
      if (cluster) {
        tmp.set(CLUSTER_PALETTE[cluster.assignments[i] % CLUSTER_PALETTE.length])
      } else {
        tmp.copy(neutral)
      }
      c[i * 3] = tmp.r
      c[i * 3 + 1] = tmp.g
      c[i * 3 + 2] = tmp.b
    })
    return c
  }, [agents, cluster])

  // ---- 軌跡折線資料（維持完整 3D 形狀，收合交給 trajGroup 縮放） ----
  const trajectories = useMemo(() => {
    if (!showTraj) return null
    return agents.map((a) => {
      const arr = new Float32Array(a.history.length * 3)
      a.history.forEach((h, s) => {
        const c = scoreToCoords(h, axisMap, maxAbsTable[s])
        arr[s * 3] = c[0]
        arr[s * 3 + 1] = c[1]
        arr[s * 3 + 2] = c[2]
      })
      return arr
    })
    // 同上：靠 version 偵測歷史資料更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, showTraj, axisMap, maxAbsTable, version])

  // ---------- Three.js 場景初始化（只跑一次） ----------
  useEffect(() => {
    const mount = mountRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#191510')

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
    camera.position.set(2.1, 1.7, 2.7)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 1.2
    controls.maxDistance = 10

    // 立方體外框（3D 模式）
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE * 2, CUBE * 2, CUBE * 2)),
      new THREE.LineBasicMaterial({ color: '#4a3b28', transparent: true, opacity: 0.9 }),
    )
    scene.add(frame)

    // 底面格線（3D 模式）
    const grid = new THREE.GridHelper(CUBE * 2, 8, '#33291a', '#261e13')
    grid.material.transparent = true
    grid.position.y = -CUBE
    scene.add(grid)

    // 2D 平面（金框 + 內格線，2D 模式淡入並隨軸生長展開）
    const plane = new THREE.Group()
    const planeOutline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-CUBE, -CUBE, 0),
        new THREE.Vector3(CUBE, -CUBE, 0),
        new THREE.Vector3(CUBE, CUBE, 0),
        new THREE.Vector3(-CUBE, CUBE, 0),
      ]),
      new THREE.LineBasicMaterial({ color: '#c8aa6e', transparent: true, opacity: 0 }),
    )
    planeOutline.userData.base = 0.9
    const planeGrid = new THREE.GridHelper(CUBE * 2, 8, '#4a3b28', '#2c2418')
    planeGrid.rotation.x = Math.PI / 2
    planeGrid.material.transparent = true
    planeGrid.material.opacity = 0
    planeGrid.userData.base = 0.55
    plane.add(planeOutline, planeGrid)
    plane.visible = false
    scene.add(plane)

    // 動態元素群組
    const axisGroup = new THREE.Group() // 軸線 + 端點標籤
    const trajGroup = new THREE.Group() // 軌跡
    const centroidGroup = new THREE.Group() // 群心
    scene.add(axisGroup, trajGroup, centroidGroup)

    // 散點
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3))
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const state = {
      scene,
      camera,
      renderer,
      controls,
      axisGroup,
      trajGroup,
      centroidGroup,
      points,
      plane,
      frame,
      grid,
      targets: new Float32Array(0),
      disposed: false,
      dim: 3,
      slotP: { x: 1, y: 1, z: 1 },
      planeP: 0,
      cubeP: 1,
      pointSize: 0.05,
      tween: null,
      camAnim: null,
      posAnim: null,
      pendingPosAnim: false,
      axisVisuals: {},
      planeScaleMap: { mx: 'x', my: 'y' },
    }
    threeRef.current = state
    const s = state // init effect 內的別名

    // 1D/2D 模式的滾輪縮放（OrbitControls 已停用）
    const onWheel = (e) => {
      if (s.dim === 3 || s.camAnim) return
      e.preventDefault()
      const dir = s.camera.position.clone().normalize()
      const d = THREE.MathUtils.clamp(
        s.camera.position.length() * (e.deltaY > 0 ? 1.08 : 0.925),
        1.6,
        7,
      )
      s.camera.position.copy(dir.multiplyScalar(d))
      s.camera.lookAt(0, 0, 0)
    }
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

    const animate = () => {
      if (state.disposed) return
      requestAnimationFrame(animate)
      const now = performance.now()

      // 鏡頭動畫（ease-in-out，與軸生長、點位同一時鐘）
      if (s.camAnim) {
        const a = s.camAnim
        const t = Math.min(1, (now - a.start) / a.dur)
        const e = easeInOutCubic(t)
        s.camera.position.lerpVectors(a.fromPos, a.toPos, e)
        s.camera.up.lerpVectors(a.fromUp, a.toUp, e).normalize()
        s.camera.lookAt(0, 0, 0)
        if (t >= 1) {
          s.camAnim = null
          a.cb && a.cb()
        }
      } else if (s.controls.enabled) {
        s.controls.update()
      }

      // 維度補間時鐘：各槽位生長進度、平面/立方體濃度
      if (s.tween) {
        const a = s.tween
        const t = Math.min(1, (now - a.start) / a.dur)
        const e = easeInOutCubic(t)
        for (const sl of SLOTS) s.slotP[sl] = a.fromS[sl] + (a.toS[sl] - a.fromS[sl]) * e
        s.planeP = a.fromPlane + (a.toPlane - a.fromPlane) * e
        s.cubeP = a.fromCube + (a.toCube - a.fromCube) * e
        if (t >= 1) s.tween = null
      }

      // 軸線從中心生長（左右展開），標籤隨之滑出
      for (const sl of SLOTS) {
        const v = s.axisVisuals[sl]
        if (!v) continue
        const k = s.slotP[sl]
        v.line.material.opacity = 0.9 * k
        v.line.visible = k > 0.01
        v.line.scale.set(1, 1, 1)
        v.line.scale[sl] = Math.max(0.001, k)
        v.labels.forEach((sp) => {
          sp.material.opacity = k
          sp.visible = k > 0.01
          sp.position.copy(SLOT_DIRS[sl]).multiplyScalar(CUBE * 1.32 * k * (sp.userData.sign ?? 1))
        })
      }

      // 軌跡隨各槽位收合
      s.trajGroup.scale.set(
        Math.max(0.001, s.slotP.x),
        Math.max(0.001, s.slotP.y),
        Math.max(0.001, s.slotP.z),
      )

      // 2D 平面：濃度淡入 + 沿兩軸展開
      s.plane.visible = s.planeP > 0.005
      if (s.plane.visible) {
        s.plane.traverse((o) => {
          if (o.material) o.material.opacity = (o.userData.base ?? 1) * s.planeP
        })
        s.plane.scale.set(
          Math.max(0.001, s.slotP[s.planeScaleMap.mx]),
          Math.max(0.001, s.slotP[s.planeScaleMap.my]),
          1,
        )
      }

      // 3D 骨架
      s.frame.material.opacity = 0.9 * s.cubeP
      s.grid.material.opacity = s.cubeP
      s.frame.visible = s.grid.visible = s.cubeP > 0.005

      // 點徑隨維度平滑調整（低維時點更明顯）
      const sizeTarget = s.dim === 1 ? 0.105 : s.dim === 2 ? 0.068 : 0.05
      material.size += (sizeTarget - material.size) * 0.12

      // 點位：維度切換時以 ease-in-out 補間；平時用指數趨近（逐題漂移）
      const pos = geometry.attributes.position.array
      const tgt = s.targets
      if (pos.length === tgt.length) {
        if (s.pendingPosAnim) {
          s.pendingPosAnim = false
          s.posAnim = {
            start: now,
            dur: DUR,
            from: Float32Array.from(pos),
            to: Float32Array.from(tgt),
          }
        }
        if (s.posAnim) {
          const a = s.posAnim
          const t = Math.min(1, (now - a.start) / a.dur)
          const e = easeInOutCubic(t)
          for (let i = 0; i < pos.length; i++) pos[i] = a.from[i] + (a.to[i] - a.from[i]) * e
          if (t >= 1) s.posAnim = null
        } else {
          for (let i = 0; i < pos.length; i++) {
            pos[i] += (tgt[i] - pos[i]) * 0.085
          }
        }
        geometry.attributes.position.needsUpdate = true
      }
      renderer.render(scene, camera)
    }
    animate()

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    return () => {
      state.disposed = true
      ro.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('wheel', onWheel)
      geometry.dispose()
      material.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      })
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      threeRef.current = null
    }
  }, [])

  // ---------- 人數變動 → 重建點位緩衝區 ----------
  useEffect(() => {
    const s = threeRef.current
    if (!s) return
    const geometry = s.points.geometry
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(agents.length * 3), 3),
    )
    geometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(), 3))
    // 新一輪測驗：直接跳到初始位置，不做補間
    s.targets = targets.slice()
    geometry.attributes.position.array.set(targets)
    geometry.attributes.position.needsUpdate = true
  }, [agents.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- 軸線與標籤（依 axisMap 重建，記錄各槽位視覺） ----------
  useEffect(() => {
    const s = threeRef.current
    if (!s) return
    const { axisGroup } = s
    axisGroup.clear()
    const visuals = {}
    for (const slot of SLOTS) {
      const axis = AXES[axisMap[slot]]
      if (!axis) continue
      const dir = SLOT_DIRS[slot]
      const from = dir.clone().multiplyScalar(-CUBE * 1.12)
      const to = dir.clone().multiplyScalar(CUBE * 1.12)
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([from, to]),
        new THREE.LineBasicMaterial({ color: axis.color, transparent: true, opacity: 0.9 }),
      )
      axisGroup.add(line)
      const negLabel = makeTextSprite(axis.left, axis.color)
      negLabel.position.copy(dir.clone().multiplyScalar(-CUBE * 1.32))
      negLabel.userData.sign = -1
      axisGroup.add(negLabel)
      const posLabel = makeTextSprite(axis.right, axis.color)
      posLabel.position.copy(dir.clone().multiplyScalar(CUBE * 1.32))
      posLabel.userData.sign = 1
      axisGroup.add(posLabel)
      visuals[slot] = { line, labels: [negLabel, posLabel] }
    }
    s.axisVisuals = visuals
  }, [axisMap])

  // ---------- 維度切換：鏡頭、軸生長、點位壓平／展開（同一時鐘同步） ----------
  useEffect(() => {
    const s = threeRef.current
    if (!s) return
    s.dim = dim
    s.controls.enabled = false // 動畫期間停用軌道控制
    s.pendingPosAnim = true // 下一幀以當下點位為起點，ease 到新目標

    // 各槽位生長目標
    const toS = { x: 0, y: 0, z: 0 }
    for (const sl of activeSlots) toS[sl] = 1
    s.tween = {
      start: performance.now(),
      dur: DUR,
      fromS: { ...s.slotP },
      toS,
      fromPlane: s.planeP,
      toPlane: dim === 2 ? 1 : 0,
      fromCube: s.cubeP,
      toCube: dim === 3 ? 1 : 0,
    }

    // 2D 平面轉到對應的面上，並記錄展開軸對應
    if (dim === 2 && activeSlots.length === 2) {
      const [a, b] = activeSlots
      if (a === 'x' && b === 'y') {
        s.plane.rotation.set(0, 0, 0)
        s.planeScaleMap = { mx: 'x', my: 'y' }
      } else if (a === 'x' && b === 'z') {
        s.plane.rotation.set(Math.PI / 2, 0, 0)
        s.planeScaleMap = { mx: 'x', my: 'z' }
      } else {
        s.plane.rotation.set(0, Math.PI / 2, 0)
        s.planeScaleMap = { mx: 'z', my: 'y' }
      }
    }

    // 依維度選鏡頭：3=立體、2=正面、1=量表水平、0=正面空白
    let view
    if (dim === 3) view = { pos: [2.1, 1.7, 2.7], up: [0, 1, 0] }
    else if (dim === 2) view = PLANAR_VIEWS[activeSlots.join(',')]
    else if (dim === 1) view = LINE_VIEWS[activeSlots[0]]
    else view = { pos: [0, 0, 3.2], up: [0, 1, 0] }

    s.camAnim = {
      start: performance.now(),
      dur: DUR,
      fromPos: s.camera.position.clone(),
      toPos: new THREE.Vector3(...view.pos),
      fromUp: s.camera.up.clone(),
      toUp: new THREE.Vector3(...view.up),
      cb: () => {
        s.controls.enabled = dim === 3
      },
    }
  }, [dim, activeSlots])

  // ---------- 資料更新：目標位置 / 顏色 / 軌跡 / 群心 ----------
  useEffect(() => {
    const s = threeRef.current
    if (!s) return
    s.targets = targets
    s.points.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // 軌跡
    s.trajGroup.clear()
    if (trajectories) {
      agents.forEach((_, i) => {
        const arr = trajectories[i]
        if (arr.length < 6) return
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
        const color = cluster
          ? CLUSTER_PALETTE[cluster.assignments[i] % CLUSTER_PALETTE.length]
          : NEUTRAL_COLOR
        const line = new THREE.Line(
          g,
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.28 }),
        )
        s.trajGroup.add(line)
      })
    }

    // 群心球（低維模式時重心本來就落在線／面上）
    s.centroidGroup.clear()
    if (cluster) {
      cluster.centroids.forEach((c) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 20, 20),
          new THREE.MeshBasicMaterial({
            color: CLUSTER_PALETTE[cluster.centroids.indexOf(c) % CLUSTER_PALETTE.length],
            transparent: true,
            opacity: 0.5,
          }),
        )
        mesh.position.set(c[0], c[1], c[2])
        s.centroidGroup.add(mesh)
      })
    }
  }, [targets, colors, trajectories, cluster, agents])

  return <div ref={mountRef} className="scene3d" />
}
