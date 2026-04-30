// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - DICOM查看器页面 v0.2.0
// 医学影像查看 / DICOM阅读 / 图像处理 / 测量工具
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, Download, ZoomIn, ZoomOut, RotateCw, RotateCcw,
  FlipHorizontal, FlipVertical, Sun, Moon, Contrast,
  Ruler, Circle, Grid3x3, Maximize2, Minimize2,
  Play, Pause, ChevronLeft, ChevronRight, Layers,
  Settings, Eye, Heart, Activity, Dumbbell,
  Hand, Undo2, Redo2, Trash2, Printer, Camera,
  ArrowRight, Square, Palette, Info,
  MousePointer, ZoomInIcon, Move, Trash, Edit3, Check, X,
  Film, Gauge, Sparkles, Wand2, GitBranch
} from 'lucide-react'

// ---------- 类型 ----------
interface Annotation {
  id: string
  type: 'length' | 'angle' | 'area' | 'arrow' | 'text'
  points: { x: number; y: number }[]
  value?: number
  unit?: string
  color: string
  label?: string
}

interface HistoryState {
  annotations: Annotation[]
}

interface SeriesThumb {
  id: string
  number: number
  label: string
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 主布局
  mainLayout: { display: 'grid', gridTemplateColumns: '200px 1fr 260px', gap: 16, height: 'calc(100vh - 180px)' },
  // 左侧面板
  sidebar: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 12, overflowY: 'auto' },
  sidebarSection: { marginBottom: 16 },
  sidebarTitle: { fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', color: '#475569', fontSize: 12 },
  sidebarItemActive: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', background: '#eff6ff', color: '#3b82f6', fontSize: 12 },
  // 图像查看区
  viewerArea: { background: '#0a0a14', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  viewerToolbar: { background: '#1a1a2e', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  viewerToolbarLeft: { display: 'flex', gap: 4 },
  viewerToolbarRight: { display: 'flex', gap: 4 },
  viewerMain: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'crosshair' },
  viewerImageWrapper: { position: 'relative', width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  viewerControls: { background: '#1a1a2e', padding: '8px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  // 右侧信息面板
  infoPanel: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 12, overflowY: 'auto' },
  infoSection: { marginBottom: 14 },
  infoTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 11 },
  infoLabel: { color: '#64748b' },
  infoValue: { fontWeight: 600, color: '#1a3a5c' },
  // 工具按钮
  toolBtn: { width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  toolBtnActive: { width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: '#3b82f6', color: '#fff', fontSize: 12 },
  toolBtnDark: { width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: '#fff', color: '#475569' },
  toolBtnActiveDark: { width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: '#3b82f6', color: '#fff' },
  // 标注项目
  annotationItem: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#f8fafc', borderRadius: 6, marginBottom: 4, fontSize: 11 },
  annotationLabel: { flex: 1, color: '#475569' },
  annotationValue: { fontWeight: 600, color: '#1a3a5c' },
  // 缩略图
  thumbnail: { width: 56, height: 56, borderRadius: 4, background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)', border: '2px solid #334155', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 10, transition: 'all 0.15s' },
  thumbnailActive: { width: 56, height: 56, borderRadius: 4, background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)', border: '2px solid #3b82f6', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 600, transition: 'all 0.15s' },
  thumbnailStrip: { display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 0' },
  // 预设按钮
  presetBtn: { padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11, background: '#fff', color: '#475569', marginRight: 4, marginBottom: 4 },
  presetBtnActive: { padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, background: '#3b82f6', color: '#fff', marginRight: 4, marginBottom: 4 },
  // 窗宽窗位
  sliderContainer: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' },
  sliderLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', minWidth: 50 },
  slider: { flex: 1, height: 4, accentColor: '#3b82f6' },
  sliderValue: { fontSize: 10, color: '#fff', minWidth: 40, textAlign: 'right' },
  // 增强按钮
  enhanceBtn: { padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 10, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', marginRight: 4 },
  enhanceBtnActive: { padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10, background: '#8b5cf6', color: '#fff', marginRight: 4 },
  // 快捷键说明
  shortcutOverlay: { position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.85)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 10, zIndex: 100, minWidth: 180 },
  shortcutTitle: { fontWeight: 600, marginBottom: 8, color: '#fbbf24' },
  shortcutRow: { display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: 'rgba(255,255,255,0.8)' },
  shortcutKey: { background: 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: 3, fontSize: 9 },
  // 序列浏览器
  seriesBrowser: { display: 'flex', flexDirection: 'column', gap: 2 },
  seriesItem: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#475569', transition: 'all 0.15s' },
  seriesItemActive: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, background: '#eff6ff', color: '#3b82f6', fontWeight: 500 },
}

// 模拟DICOM信息
const DICOM_INFO = {
  patientName: '张三',
  patientId: 'P20240001',
  patientAge: 52,
  patientGender: '男',
  studyDate: '2024-12-15',
  studyModality: 'US',
  studyType: '腹部超声检查',
  studyDesc: '肝胆脾胰超声',
  hospital: '某某医院超声科',
  physician: '李明辉',
  equipment: 'GE Voluson E10',
  seriesNumber: '1',
  imageNumber: '12/24',
}

// 模拟序列数据
const SERIES_DATA: SeriesThumb[] = [
  { id: 's1', number: 1, label: '横断面 T1' },
  { id: 's2', number: 2, label: '横断面 T2' },
  { id: 's3', number: 3, label: '冠状面' },
  { id: 's4', number: 4, label: '矢状面' },
]

// 窗口预设
const WINDOW_PRESETS = [
  { name: '软组织', wc: 40, ww: 400 },
  { name: '肝脏', wc: 35, ww: 350 },
  { name: '骨骼', wc: 300, ww: 1500 },
  { name: '肺', wc: -600, ww: 1600 },
  { name: '腹部', wc: 40, ww: 350 },
  { name: '血管', wc: 20, ww: 300 },
]

// 颜色选项
const COLOR_OPTIONS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

// 快捷键说明
const SHORTCUTS = [
  { key: 'W', desc: '平移工具' },
  { key: 'Z', desc: '缩放工具' },
  { key: 'M', desc: '测量工具' },
  { key: 'L', desc: '长度测量' },
  { key: 'A', desc: '角度测量' },
  { key: 'S', desc: '面积测量' },
  { key: 'R', desc: '顺时针旋转' },
  { key: 'E', desc: '逆时针旋转' },
  { key: 'Ctrl+Z', desc: '撤销' },
  { key: 'Ctrl+Y', desc: '重做' },
  { key: '1/2/4', desc: '缩放倍数' },
  { key: '?', desc: '显示快捷键' },
]

export default function DicomViewerPage() {
  // 状态 - 缩放和变换
  const [zoom, setZoom] = useState(100)
  const [zoomMode, setZoomMode] = useState<'fixed' | 'fit'>('fixed')
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // 状态 - 窗宽窗位
  const [windowWidth, setWindowWidth] = useState(400)
  const [windowCenter, setWindowCenter] = useState(40)

  // 状态 - 工具
  const [activeTool, setActiveTool] = useState<'pan' | 'zoom' | 'measure' | 'length' | 'angle' | 'area' | 'arrow'>('pan')
  const [activeMeasure, setActiveMeasure] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([])

  // 状态 - 标注
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: 'a1', type: 'length', points: [{ x: 100, y: 200 }, { x: 300, y: 200 }], value: 8.5, unit: 'cm', color: '#22c55e', label: '肝脏长度' },
    { id: 'a2', type: 'angle', points: [{ x: 200, y: 100 }, { x: 250, y: 150 }, { x: 200, y: 200 }], value: 45, unit: '°', color: '#3b82f6', label: '角度' },
  ])
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [annotationColor, setAnnotationColor] = useState('#22c55e')

  // 状态 - 序列
  const [activeSeries, setActiveSeries] = useState('s1')
  const [activeFrame, setActiveFrame] = useState(12)
  const totalFrames = 24

  // 状态 - 历史
  const [history, setHistory] = useState<HistoryState[]>([{ annotations: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  // 状态 - 图像增强
  const [enhanceMode, setEnhanceMode] = useState<'none' | 'sharpen' | 'smooth' | 'edge' | 'pseudo'>('none')

  // 状态 - UI
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [invert, setInvert] = useState(false)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)

  const viewerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  // 添加到历史
  const addToHistory = useCallback((newAnnotations: Annotation[]) => {
    const newState: HistoryState = { annotations: JSON.parse(JSON.stringify(newAnnotations)) }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setAnnotations(JSON.parse(JSON.stringify(history[historyIndex - 1].annotations)))
    }
  }, [history, historyIndex])

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setAnnotations(JSON.parse(JSON.stringify(history[historyIndex + 1].annotations)))
    }
  }, [history, historyIndex])

  // 删除标注
  const deleteAnnotation = useCallback((id: string) => {
    const newAnnotations = annotations.filter(a => a.id !== id)
    setAnnotations(newAnnotations)
    addToHistory(newAnnotations)
    setSelectedAnnotation(null)
  }, [annotations, addToHistory])

  // 计算距离
  const calcDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) / 5
  }

  // 计算角度
  const calcAngle = (p1: { x: number; y: number }, vertex: { x: number; y: number }, p2: { x: number; y: number }) => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y }
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y }
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
    return Math.acos(dot / (mag1 * mag2)) * 180 / Math.PI
  }

  // 计算面积（三角形）
  const calcArea = (p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) => {
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2) / 10
  }

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!viewerRef.current) return
    const rect = viewerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeTool === 'pan') {
      setIsPanning(true)
      setPanStart({ x: x - pan.x, y: y - pan.y })
    } else if (activeTool === 'length' || activeTool === 'area' || activeTool === 'arrow') {
      setIsDrawing(true)
      setDrawStart({ x, y })
      setCurrentPoints([{ x, y }])
    } else if (activeTool === 'angle') {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawStart({ x, y })
        setCurrentPoints([{ x, y }])
      } else if (currentPoints.length === 1) {
        setCurrentPoints([...currentPoints, { x, y }])
      } else if (currentPoints.length === 2) {
        const newAnnotation: Annotation = {
          id: `a${Date.now()}`,
          type: 'angle',
          points: [currentPoints[0], { x, y }, currentPoints[1]],
          value: Math.round(calcAngle(currentPoints[0], { x, y }, currentPoints[1])),
          unit: '°',
          color: annotationColor
        }
        const newAnnotations = [...annotations, newAnnotation]
        setAnnotations(newAnnotations)
        addToHistory(newAnnotations)
        setIsDrawing(false)
        setCurrentPoints([])
        setDrawStart(null)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!viewerRef.current) return
    const rect = viewerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isPanning && activeTool === 'pan') {
      setPan({ x: x - panStart.x, y: y - panStart.y })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!viewerRef.current) return
    const rect = viewerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDrawing && drawStart) {
      if (activeTool === 'length') {
        const newAnnotation: Annotation = {
          id: `a${Date.now()}`,
          type: 'length',
          points: [drawStart, { x, y }],
          value: Math.round(calcDistance(drawStart, { x, y }) * 10) / 10,
          unit: 'cm',
          color: annotationColor
        }
        const newAnnotations = [...annotations, newAnnotation]
        setAnnotations(newAnnotations)
        addToHistory(newAnnotations)
      } else if (activeTool === 'area' && currentPoints.length === 2) {
        const newAnnotation: Annotation = {
          id: `a${Date.now()}`,
          type: 'area',
          points: [drawStart, { x: drawStart.x, y }, { x, y }],
          value: Math.round(calcArea(drawStart, { x: drawStart.x, y }, { x, y }) * 10) / 10,
          unit: 'cm²',
          color: annotationColor
        }
        const newAnnotations = [...annotations, newAnnotation]
        setAnnotations(newAnnotations)
        addToHistory(newAnnotations)
      } else if (activeTool === 'arrow') {
        const newAnnotation: Annotation = {
          id: `a${Date.now()}`,
          type: 'arrow',
          points: [drawStart, { x, y }],
          color: annotationColor
        }
        const newAnnotations = [...annotations, newAnnotation]
        setAnnotations(newAnnotations)
        addToHistory(newAnnotations)
      }
    }
    setIsDrawing(false)
    setDrawStart(null)
    setIsPanning(false)
  }

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -10 : 10
      setZoom(prev => Math.min(Math.max(prev + delta, 25), 400))
    }
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowShortcuts(prev => !prev)
        return
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
        return
      }
      switch (e.key.toLowerCase()) {
        case 'w': setActiveTool('pan'); break
        case 'z': setActiveTool('zoom'); break
        case 'm': setActiveTool('measure'); break
        case 'l': setActiveTool('length'); break
        case 'a': setActiveTool('angle'); break
        case 's': setActiveTool('area'); break
        case 'r': setRotation(prev => (prev + 90) % 360); break
        case 'e': setRotation(prev => (prev - 90 + 360) % 360); break
        case '1': setZoom(100); break
        case '2': setZoom(200); break
        case '4': setZoom(400); break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // 导出图像
  const handleExport = () => {
    alert('导出PNG功能 - 实际实现需要html2canvas或dom-to-image库')
  }

  // 打印报告
  const handlePrint = () => {
    window.print()
  }

  // 获取伪彩颜色
  const getPseudoColor = (value: number) => {
    const colors = [
      [0, 0, 128], [0, 0, 255], [0, 128, 255], [0, 255, 255],
      [0, 255, 128], [128, 255, 0], [255, 255, 0], [255, 128, 0], [255, 0, 0]
    ]
    const idx = Math.min(Math.floor((value / 255) * (colors.length - 1)), colors.length - 1)
    return `rgb(${colors[idx].join(',')})`
  }

  // 图像滤镜
  const getImageFilter = () => {
    let filter = ''
    if (invert) filter += 'invert(1) '
    if (brightness !== 50) filter += `brightness(${brightness / 50}) `
    if (contrast !== 50) filter += `contrast(${contrast / 50}) `
    if (enhanceMode === 'sharpen') filter += 'sharpen(1.5) '
    if (enhanceMode === 'smooth') filter += 'blur(0.5px) '
    if (enhanceMode === 'edge') filter += 'contrast(1.5) saturate(0) '
    if (enhanceMode === 'pseudo') filter += 'grayscale(0)'
    return filter || 'none'
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>DICOM医学影像查看器 v0.2.0</h1>
            <p style={s.subtitle}>模拟超声图像 · 窗宽窗位 · 测量工具 · 序列浏览</p>
          </div>
          <div style={s.headerRight}>
            <button style={{ ...s.toolBtnDark, padding: '6px 12px', width: 'auto', gap: 4, display: 'flex' }} onClick={handleExport}>
              <Download size={13} /> 导出
            </button>
            <button style={{ ...s.toolBtnDark, padding: '6px 12px', width: 'auto', gap: 4, display: 'flex' }} onClick={handlePrint}>
              <Printer size={13} /> 报告
            </button>
          </div>
        </div>
      </div>

      {/* 主布局 */}
      <div style={s.mainLayout}>
        {/* 左侧序列浏览器 */}
        <div style={s.sidebar}>
          {/* 工具 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Settings size={11} /> 工具</div>
            {[
              { id: 'pan', icon: Move, label: '平移 [W]' },
              { id: 'zoom', icon: ZoomInIcon, label: '缩放 [Z]' },
              { id: 'length', icon: Ruler, label: '长度 [L]' },
              { id: 'angle', icon: GitBranch, label: '角度 [A]' },
              { id: 'area', icon: Square, label: '面积 [S]' },
              { id: 'arrow', icon: ArrowRight, label: '箭头' },
            ].map((tool) => (
              <div
                key={tool.id}
                style={activeTool === tool.id ? s.sidebarItemActive : s.sidebarItem}
                onClick={() => setActiveTool(tool.id as any)}
              >
                <tool.icon size={14} />
                {tool.label}
              </div>
            ))}
          </div>

          {/* 序列浏览器 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Layers size={11} /> 序列</div>
            <div style={s.seriesBrowser}>
              {SERIES_DATA.map((series) => (
                <div
                  key={series.id}
                  style={activeSeries === series.id ? s.seriesItemActive : s.seriesItem}
                  onClick={() => setActiveSeries(series.id)}
                >
                  <Film size={12} />
                  <span style={{ flex: 1 }}>{series.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>24</span>
                </div>
              ))}
            </div>
          </div>

          {/* 帧导航 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><ChevronRight size={11} /> 帧 ({activeFrame}/{totalFrames})</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.max(1, activeFrame - 1))}><ChevronLeft size={14} /></button>
              <input
                type="range"
                min={1}
                max={totalFrames}
                value={activeFrame}
                onChange={(e) => setActiveFrame(Number(e.target.value))}
                style={{ flex: 1, height: 4, accentColor: '#3b82f6' }}
              />
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.min(totalFrames, activeFrame + 1))}><ChevronRight size={14} /></button>
            </div>
            <div style={s.thumbnailStrip}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  style={n === activeFrame ? s.thumbnailActive : s.thumbnail}
                  onClick={() => setActiveFrame(n)}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* 操作历史 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Undo2 size={11} /> 历史</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={s.toolBtnDark} onClick={undo} disabled={historyIndex <= 0} title="撤销 Ctrl+Z">
                <Undo2 size={14} />
              </button>
              <button style={s.toolBtnDark} onClick={redo} disabled={historyIndex >= history.length - 1} title="重做 Ctrl+Y">
                <Redo2 size={14} />
              </button>
            </div>
          </div>

          {/* 快捷键 */}
          <div style={{ marginTop: 'auto', padding: '8px 0' }}>
            <button
              style={{ ...s.presetBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={() => setShowShortcuts(!showShortcuts)}
            >
              <Info size={12} /> 快捷键 [?]
            </button>
          </div>
        </div>

        {/* 中间查看区 */}
        <div style={s.viewerArea}>
          {/* 顶部工具栏 */}
          <div style={s.viewerToolbar}>
            <div style={s.viewerToolbarLeft}>
              {/* 缩放控制 */}
              <button style={s.toolBtn} onClick={() => setZoom(prev => Math.max(25, prev - 25))}><ZoomOut size={14} /></button>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, width: 60 }}
              >
                <option value={25}>25%</option>
                <option value={50}>50%</option>
                <option value={100}>100%</option>
                <option value={200}>200%</option>
                <option value={400}>400%</option>
              </select>
              <button style={s.toolBtn} onClick={() => setZoom(prev => Math.min(400, prev + 25))}><ZoomIn size={14} /></button>
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 6px' }} />

              {/* 旋转 */}
              <button style={s.toolBtn} onClick={() => setRotation(prev => (prev + 90) % 360)} title="顺时针旋转 [R]"><RotateCw size={14} /></button>
              <button style={s.toolBtn} onClick={() => setRotation(prev => (prev - 90 + 360) % 360)} title="逆时针旋转 [E]"><RotateCcw size={14} /></button>

              {/* 反色 */}
              <button
                style={invert ? s.toolBtnActive : s.toolBtn}
                onClick={() => setInvert(!invert)}
                title="反色"
              >
                <Contrast size={14} />
              </button>
            </div>

            <div style={s.viewerToolbarRight}>
              {/* 帧信息 */}
              <span style={{ color: '#fff', fontSize: 11, padding: '0 8px' }}>
                {DICOM_INFO.imageNumber.split('/')[0]}/{totalFrames}
              </span>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.max(1, activeFrame - 1))}><ChevronLeft size={14} /></button>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.min(totalFrames, activeFrame + 1))}><ChevronRight size={14} /></button>
            </div>
          </div>

          {/* 图像区域 */}
          <div
            ref={viewerRef}
            style={{
              ...s.viewerMain,
              cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setIsPanning(false); setIsDrawing(false) }}
            onWheel={handleWheel}
          >
            {/* 快捷键说明 */}
            {showShortcuts && (
              <div style={s.shortcutOverlay}>
                <div style={s.shortcutTitle}>快捷键</div>
                {SHORTCUTS.map((sc) => (
                  <div key={sc.key} style={s.shortcutRow}>
                    <span>{sc.desc}</span>
                    <span style={s.shortcutKey}>{sc.key}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 图像容器 */}
            <div
              ref={imageRef}
              style={{
                ...s.viewerImageWrapper,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                filter: getImageFilter(),
              }}
            >
              {/* 模拟超声图像 */}
              <svg width="400" height="400" viewBox="0 0 400 400" style={{ borderRadius: 8 }}>
                <defs>
                  <radialGradient id="ultrasoundGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a1a2e" />
                    <stop offset="100%" stopColor="#0a0a14" />
                  </radialGradient>
                  <pattern id="ultrasoundPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                    <circle cx="4" cy="4" r="1" fill="rgba(0,255,128,0.15)" />
                  </pattern>
                  <clipPath id="circleClip">
                    <circle cx="200" cy="200" r="190" />
                  </clipPath>
                </defs>

                {/* 背景 */}
                <circle cx="200" cy="200" r="195" fill="url(#ultrasoundGrad)" />
                <circle cx="200" cy="200" r="190" fill="url(#ultrasoundPattern)" clipPath="url(#circleClip)" />

                {/* 模拟器官轮廓 */}
                <ellipse cx="200" cy="220" rx="80" ry="60" fill="none" stroke="rgba(0,200,100,0.4)" strokeWidth="2" clipPath="url(#circleClip)" />
                <ellipse cx="180" cy="200" rx="30" ry="40" fill="rgba(0,150,80,0.3)" clipPath="url(#circleClip)" />
                <ellipse cx="240" cy="230" rx="25" ry="30" fill="rgba(0,150,80,0.2)" clipPath="url(#circleClip)" />

                {/* 十字准星 */}
                <line x1="200" y1="10" x2="200" y2="390" stroke="rgba(0,255,128,0.5)" strokeWidth="1" strokeDasharray="5,5" clipPath="url(#circleClip)" />
                <line x1="10" y1="200" x2="390" y2="200" stroke="rgba(0,255,128,0.5)" strokeWidth="1" strokeDasharray="5,5" clipPath="url(#circleClip)" />
                <circle cx="200" cy="200" r="30" fill="none" stroke="rgba(0,255,128,0.3)" strokeWidth="1" clipPath="url(#circleClip)" />
                <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(0,255,128,0.2)" strokeWidth="1" strokePath="url(#circleClip)" />
                <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(0,255,128,0.15)" strokeWidth="1" clipPath="url(#circleClip)" />

                {/* 伪彩模式 */}
                {enhanceMode === 'pseudo' && (
                  <ellipse cx="200" cy="220" rx="80" ry="60" fill="rgba(255,100,100,0.3)" clipPath="url(#circleClip)" />
                )}

                {/* 刻度 */}
                <text x="15" y="205" fill="rgba(0,255,128,0.6)" fontSize="8">0°</text>
                <text x="370" y="205" fill="rgba(0,255,128,0.6)" fontSize="8">180°</text>
                <text x="195" y="25" fill="rgba(0,255,128,0.6)" fontSize="8">90°</text>
                <text x="195" y="390" fill="rgba(0,255,128,0.6)" fontSize="8">270°</text>

                {/* 超声伪影 */}
                <path d="M100,100 Q200,50 300,100" fill="none" stroke="rgba(0,200,100,0.2)" strokeWidth="1" clipPath="url(#circleClip)" />
                <path d="M80,150 Q200,80 320,150" fill="none" stroke="rgba(0,200,100,0.15)" strokeWidth="1" clipPath="url(#circleClip)" />
              </svg>

              {/* 标注渲染 */}
              <svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              >
                {annotations.map((ann) => {
                  if (ann.type === 'length') {
                    const [p1, p2] = ann.points
                    return (
                      <g key={ann.id}>
                        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={ann.color} strokeWidth={selectedAnnotation === ann.id ? 3 : 2} />
                        <circle cx={p1.x} cy={p1.y} r="3" fill={ann.color} />
                        <circle cx={p2.x} cy={p2.y} r="3" fill={ann.color} />
                        <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 8} fill={ann.color} fontSize="10" textAnchor="middle">
                          {ann.value} {ann.unit}
                        </text>
                      </g>
                    )
                  }
                  if (ann.type === 'angle') {
                    const [p1, vertex, p2] = ann.points
                    return (
                      <g key={ann.id}>
                        <line x1={p1.x} y1={p1.y} x2={vertex.x} y2={vertex.y} stroke={ann.color} strokeWidth={selectedAnnotation === ann.id ? 3 : 2} />
                        <line x1={vertex.x} y1={vertex.y} x2={p2.x} y2={p2.y} stroke={ann.color} strokeWidth={selectedAnnotation === ann.id ? 3 : 2} />
                        <circle cx={vertex.x} cy={vertex.y} r="3" fill={ann.color} />
                        <text x={vertex.x + 10} y={vertex.y - 10} fill={ann.color} fontSize="10">
                          {ann.value}°
                        </text>
                      </g>
                    )
                  }
                  if (ann.type === 'area') {
                    const [p1, p2, p3] = ann.points
                    return (
                      <g key={ann.id}>
                        <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill={`${ann.color}30`} stroke={ann.color} strokeWidth={selectedAnnotation === ann.id ? 3 : 2} />
                        <text x={(p1.x + p2.x + p3.x) / 3} y={(p1.y + p2.y + p3.y) / 3} fill={ann.color} fontSize="10" textAnchor="middle">
                          {ann.value} {ann.unit}
                        </text>
                      </g>
                    )
                  }
                  if (ann.type === 'arrow') {
                    const [p1, p2] = ann.points
                    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
                    const arrowLen = 10
                    return (
                      <g key={ann.id}>
                        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={ann.color} strokeWidth={selectedAnnotation === ann.id ? 3 : 2} />
                        <polygon
                          points={`${p2.x},${p2.y} ${p2.x - arrowLen * Math.cos(angle - Math.PI / 6)},${p2.y - arrowLen * Math.sin(angle - Math.PI / 6)} ${p2.x - arrowLen * Math.cos(angle + Math.PI / 6)},${p2.y - arrowLen * Math.sin(angle + Math.PI / 6)}`}
                          fill={ann.color}
                        />
                      </g>
                    )
                  }
                  return null
                })}

                {/* 当前绘制 */}
                {isDrawing && currentPoints.length > 0 && (
                  <g>
                    {currentPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" />
                    ))}
                    {drawStart && currentPoints.length === 1 && (
                      <line x1={drawStart.x} y1={drawStart.y} x2={drawStart.x} y2={drawStart.y} stroke="#fff" strokeWidth="1" strokeDasharray="3,3" />
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* 叠加信息 */}
            <div style={{ position: 'absolute', top: 12, left: 12, color: 'rgba(0,255,128,0.8)', fontSize: 10, lineHeight: 1.8, fontFamily: 'monospace' }}>
              <div>Patient: {DICOM_INFO.patientName} | {DICOM_INFO.patientId}</div>
              <div>Study: {DICOM_INFO.studyDate} | {DICOM_INFO.studyModality}</div>
              <div>Series: {DICOM_INFO.seriesNumber} | Frame: {activeFrame}/{totalFrames}</div>
              <div>WW: {windowWidth} | WC: {windowCenter}</div>
              <div>Zoom: {zoom}% | Rot: {rotation}°</div>
            </div>

            {/* 标注信息 */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, color: 'rgba(0,255,128,0.8)', fontSize: 10, fontFamily: 'monospace' }}>
              <div>Mode: {activeTool.toUpperCase()} | {annotations.length} annotations</div>
            </div>
          </div>

          {/* 底部控制栏 */}
          <div style={s.viewerControls}>
            {/* 窗宽窗位 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Gauge size={12} /> WW
              </span>
              <input
                type="range"
                min={0}
                max={500}
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
                style={s.slider}
              />
              <span style={{ minWidth: 35, textAlign: 'right' }}>{windowWidth}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Circle size={12} /> WC
              </span>
              <input
                type="range"
                min={-100}
                max={300}
                value={windowCenter}
                onChange={(e) => setWindowCenter(Number(e.target.value))}
                style={s.slider}
              />
              <span style={{ minWidth: 35, textAlign: 'right' }}>{windowCenter}</span>
            </div>

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />

            {/* 窗口预设 */}
            {WINDOW_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset.name}
                style={windowWidth === preset.ww && windowCenter === preset.wc ? s.enhanceBtnActive : s.enhanceBtn}
                onClick={() => { setWindowWidth(preset.ww); setWindowCenter(preset.wc) }}
              >
                {preset.name}
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />

            {/* 图像增强 */}
            <button style={enhanceMode === 'none' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'none' ? 'sharpen' : 'none')}>
              <Sparkles size={10} /> 锐化
            </button>
            <button style={enhanceMode === 'smooth' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'smooth' ? 'none' : 'smooth')}>
              <Wand2 size={10} /> 平滑
            </button>
            <button style={enhanceMode === 'edge' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'edge' ? 'none' : 'edge')}>
              <Sharpen size={10} /> 边缘
            </button>
            <button style={enhanceMode === 'pseudo' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'pseudo' ? 'none' : 'pseudo')}>
              <Palette size={10} /> 伪彩
            </button>

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />

            {/* 亮度对比度 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 10 }}>
              <Sun size={10} />
              <input
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                style={{ width: 60, height: 4, accentColor: '#3b82f6' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 10 }}>
              <Contrast size={10} />
              <input
                type="range"
                min={0}
                max={100}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                style={{ width: 60, height: 4, accentColor: '#3b82f6' }}
              />
            </div>
          </div>
        </div>

        {/* 右侧信息面板 */}
        <div style={s.infoPanel}>
          {/* 患者信息 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Heart size={12} /> 患者信息</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>姓名</span>
              <span style={s.infoValue}>{DICOM_INFO.patientName}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>ID</span>
              <span style={s.infoValue}>{DICOM_INFO.patientId}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>年龄/性别</span>
              <span style={s.infoValue}>{DICOM_INFO.patientAge}岁 / {DICOM_INFO.patientGender}</span>
            </div>
          </div>

          {/* 检查信息 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Activity size={12} /> 检查信息</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>日期</span>
              <span style={s.infoValue}>{DICOM_INFO.studyDate}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>类型</span>
              <span style={s.infoValue}>{DICOM_INFO.studyType}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>设备</span>
              <span style={s.infoValue}>{DICOM_INFO.equipment}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>医生</span>
              <span style={s.infoValue}>{DICOM_INFO.physician}</span>
            </div>
          </div>

          {/* 标注列表 */}
          <div style={s.infoSection}>
            <div style={{ ...s.infoTitle, justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={12} /> 标注列表 ({annotations.length})</span>
            </div>
            {annotations.length === 0 ? (
              <div style={{ fontSize: 11, color: '#94a3b8', padding: '8px 0' }}>暂无标注</div>
            ) : (
              annotations.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    ...s.annotationItem,
                    borderLeft: `3px solid ${ann.color}`,
                    cursor: 'pointer',
                    background: selectedAnnotation === ann.id ? '#eff6ff' : '#f8fafc'
                  }}
                  onClick={() => setSelectedAnnotation(selectedAnnotation === ann.id ? null : ann.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1a3a5c', textTransform: 'capitalize' }}>{ann.type}</div>
                    <div style={{ color: '#64748b', fontSize: 10 }}>
                      {ann.value !== undefined ? `${ann.value} ${ann.unit}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {/* 颜色选择 */}
                    <div style={{ position: 'relative' }}>
                      <button
                        style={{ width: 20, height: 20, borderRadius: 4, border: 'none', cursor: 'pointer', background: ann.color }}
                        onClick={(e) => {
                          e.stopPropagation()
                          const newColor = COLOR_OPTIONS[(COLOR_OPTIONS.indexOf(ann.color) + 1) % COLOR_OPTIONS.length]
                          const newAnnotations = annotations.map(a => a.id === ann.id ? { ...a, color: newColor } : a)
                          setAnnotations(newAnnotations)
                        }}
                      />
                    </div>
                    <button
                      style={{ width: 20, height: 20, borderRadius: 4, border: 'none', cursor: 'pointer', background: 'transparent', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAnnotation(ann.id)
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 颜色选择器 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Palette size={12} /> 当前颜色</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: annotationColor === color ? '2px solid #1a3a5c' : '1px solid #e2e8f0',
                    background: color,
                    cursor: 'pointer'
                  }}
                  onClick={() => setAnnotationColor(color)}
                />
              ))}
            </div>
          </div>

          {/* 测量说明 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Info size={12} /> 测量说明</div>
            <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.6 }}>
              <div><strong>长度:</strong> 点击拖动画线</div>
              <div><strong>角度:</strong> 依次点击三点</div>
              <div><strong>面积:</strong> 拖动画矩形</div>
              <div><strong>箭头:</strong> 点击拖动</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
