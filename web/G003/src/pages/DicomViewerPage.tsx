// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - DICOM查看器页面 v0.6.0 DICOM查看器全面升级，新增序列对比/MPR三视图/报告关联/布局切换
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
  Film, Gauge, Sparkles, Wand2, GitBranch,
  SplitSquareHorizontal, Columns, SquareStack, LayoutGrid,
  Crosshair, Aperture, ScanEye, Image as ImageIcon,
  FileText, Clock, List, Maximize, Camera as Capture,
  SkipBack, SkipForward, FastForward, Rewind,
  Calendar
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
  instanceCount: number
}

interface Study {
  id: string
  name: string
  patientName: string
  patientId: string
  date: string
  modality: string
  type: string
  series: SeriesThumb[]
  reportId?: string
}

interface Report {
  id: string
  studyId: string
  title: string
  date: string
  author: string
  content: string
}

interface DicomMetadata {
  patient: Record<string, string>
  study: Record<string, string>
  series: Record<string, string>
  image: Record<string, string>
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 主布局
  mainLayout: { display: 'grid', gridTemplateColumns: '200px 1fr 280px', gap: 16, height: 'calc(100vh - 180px)' },
  mainLayoutCompare: { display: 'grid', gridTemplateColumns: '200px 1fr 320px', gap: 16, height: 'calc(100vh - 180px)' },
  mainLayoutMPR: { display: 'grid', gridTemplateColumns: '200px 1fr 280px', gap: 16, height: 'calc(100vh - 180px)' },
  mainLayoutSingle: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: 'calc(100vh - 180px)' },
  // 左侧面板
  sidebar: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 12, overflowY: 'auto' },
  sidebarSection: { marginBottom: 16 },
  sidebarTitle: { fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', color: '#475569', fontSize: 12 },
  sidebarItemActive: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', background: '#eff6ff', color: '#3b82f6', fontSize: 12 },
  // 图像查看区
  viewerArea: { background: '#0a0a14', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  viewerAreaFullscreen: { background: '#0a0a14', borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' },
  viewerToolbar: { background: '#1a1a2e', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  viewerToolbarLeft: { display: 'flex', gap: 4 },
  viewerToolbarRight: { display: 'flex', gap: 4 },
  viewerMain: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'crosshair' },
  viewerMainGrid: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 8, overflow: 'hidden' },
  viewerMainMPR: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8, overflow: 'hidden' },
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
  thumbnailStripWrap: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, overflowY: 'auto', maxHeight: 200, padding: '4px 0' },
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
  // 比较模式
  comparePanel: { background: '#0a0a14', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  comparePanelHeader: { background: '#1a1a2e', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  comparePanelTitle: { color: '#fff', fontSize: 11, fontWeight: 600 },
  comparePanelMain: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 8 },
  // MPR视图
  mprPanel: { background: '#0a0a14', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  mprLabel: { position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4 },
  // 元数据表格
  metadataTable: { width: '100%', borderCollapse: 'collapse', fontSize: 10 },
  metadataTh: { textAlign: 'left', padding: '4px 8px', background: '#f1f5f9', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' },
  metadataTd: { padding: '4px 8px', borderBottom: '1px solid #f1f5f9', color: '#1a3a5c' },
  // 报告列表
  reportItem: { padding: '8px 10px', background: '#f8fafc', borderRadius: 6, marginBottom: 6, cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.15s' },
  reportItemActive: { padding: '8px 10px', background: '#eff6ff', borderRadius: 6, marginBottom: 6, cursor: 'pointer', border: '1px solid #3b82f6', transition: 'all 0.15s' },
  // 布局按钮组
  layoutBtnGroup: { display: 'flex', gap: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: 2 },
  // 标签页
  tabBar: { display: 'flex', gap: 4, borderBottom: '1px solid #e2e8f0', marginBottom: 12 },
  tab: { padding: '6px 12px', cursor: 'pointer', fontSize: 11, color: '#64748b', borderBottom: '2px solid transparent', transition: 'all 0.15s' },
  tabActive: { padding: '6px 12px', cursor: 'pointer', fontSize: 11, color: '#3b82f6', borderBottom: '2px solid #3b82f6', fontWeight: 600 },
  // 播放控制
  playbackControls: { display: 'flex', alignItems: 'center', gap: 8 },
  speedSelect: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10 },
}

// 模拟数据 - 3个研究（肝胆/心脏/甲状腺）
const STUDIES_DATA: Study[] = [
  {
    id: 'study1',
    name: '肝胆脾胰超声',
    patientName: '张三',
    patientId: 'P20240001',
    date: '2024-12-15',
    modality: 'US',
    type: '腹部超声检查',
    series: [
      { id: 's1-1', number: 1, label: '横断面 T1', instanceCount: 12 },
      { id: 's1-2', number: 2, label: '横断面 T2', instanceCount: 10 },
      { id: 's1-3', number: 3, label: '冠状面', instanceCount: 8 },
    ],
    reportId: 'r1'
  },
  {
    id: 'study2',
    name: '心脏超声',
    patientName: '李四',
    patientId: 'P20240002',
    date: '2024-12-10',
    modality: 'US',
    type: '心脏超声检查',
    series: [
      { id: 's2-1', number: 1, label: '左室长轴', instanceCount: 10 },
      { id: 's2-2', number: 2, label: '四腔心', instanceCount: 12 },
    ],
    reportId: 'r2'
  },
  {
    id: 'study3',
    name: '甲状腺超声',
    patientName: '王五',
    patientId: 'P20240003',
    date: '2024-12-08',
    modality: 'US',
    type: '浅表器官超声',
    series: [
      { id: 's3-1', number: 1, label: '横断面', instanceCount: 8 },
      { id: 's3-2', number: 2, label: '纵断面', instanceCount: 8 },
      { id: 's3-3', number: 3, label: '彩色血流', instanceCount: 6 },
    ],
    reportId: 'r3'
  }
]

// 模拟报告数据
const REPORTS_DATA: Record<string, Report> = {
  'r1': { id: 'r1', studyId: 'study1', title: '肝胆超声诊断报告', date: '2024-12-15', author: '李明辉', content: '肝脏大小正常，实质回声均匀...' },
  'r2': { id: 'r2', studyId: 'study2', title: '心脏超声诊断报告', date: '2024-12-10', author: '王芳', content: '左室壁运动正常，射血分数58%...' },
  'r3': { id: 'r3', studyId: 'study3', title: '甲状腺超声诊断报告', date: '2024-12-08', author: '赵强', content: '甲状腺双侧叶大小正常...' },
}

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
  { key: 'Space', desc: '播放/暂停' },
  { key: 'F', desc: '全屏' },
  { key: '?', desc: '显示快捷键' },
]

// 播放速度选项
const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2, 3, 4]

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
  const [activeStudy, setActiveStudy] = useState('study1')
  const [activeSeries, setActiveSeries] = useState('s1-1')
  const [activeFrame, setActiveFrame] = useState(1)
  const totalFrames = 24

  // 状态 - 历史
  const [history, setHistory] = useState<HistoryState[]>([{ annotations: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  // 状态 - 图像增强
  const [enhanceMode, setEnhanceMode] = useState<'none' | 'sharpen' | 'smooth' | 'edge' | 'pseudo' | 'harmonic' | 'contrast'>('none')

  // 状态 - UI
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [invert, setInvert] = useState(false)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)

  // 状态 - 布局模式
  const [layoutMode, setLayoutMode] = useState<'single' | 'compare' | 'mpr'>('single')
  const [compareSeries, setCompareSeries] = useState<string | null>(null)

  // 状态 - 播放动画
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  // 状态 - 全屏
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 状态 - 右侧面板标签
  const [rightPanelTab, setRightPanelTab] = useState<'info' | 'metadata' | 'reports'>('info')

  // 状态 - 选中报告
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  // Refs
  const viewerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 当前研究
  const currentStudy = STUDIES_DATA.find(st => st.id === activeStudy) || STUDIES_DATA[0]

  // DICOM元数据
  const dicomMetadata: DicomMetadata = {
    patient: {
      '姓名': currentStudy.patientName,
      '患者ID': currentStudy.patientId,
      '出生日期': '1972-05-15',
      '性别': '男',
      '年龄': '52岁',
    },
    study: {
      '研究日期': currentStudy.date,
      '研究描述': currentStudy.name,
      '检查类型': currentStudy.type,
      '检查号': 'EX20240001',
      '操作医师': '李明辉',
      '申请医师': '张伟',
      '医院名称': '某某医院超声科',
    },
    series: {
      '序列号': '1',
      '序列描述': currentStudy.series.find(s => s.id === activeSeries)?.label || '',
      '序列类型': '超声',
      '图像数量': String(currentStudy.series.find(s => s.id === activeSeries)?.instanceCount || 0),
      '设备': 'GE Voluson E10',
      '探头': 'C1-6',
    },
    image: {
      '图像号': String(activeFrame),
      '采集时间': '14:32:15',
      '窗宽': String(windowWidth),
      '窗位': String(windowCenter),
      '缩放': `${zoom}%`,
      '旋转': `${rotation}°`,
      '像素间距': '0.3mm',
      '层厚': '5mm',
    }
  }

  // 获取当前序列帧数
  const getCurrentSeriesInstanceCount = useCallback(() => {
    const study = STUDIES_DATA.find(st => st.id === activeStudy)
    const series = study?.series.find(s => s.id === activeSeries)
    return series?.instanceCount || 24
  }, [activeStudy, activeSeries])

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

  // 键盘快捷键 - 修复依赖数组
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
      if (e.key === ' ' && !e.ctrlKey) {
        e.preventDefault()
        setIsPlaying(prev => !isPlaying)
        return
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
        return
      }
      switch (e.key.toLowerCase()) {
        case 'w': setActiveTool('pan'); break
        case 'z': setActiveTool('zoom'); break
        case 'm': setActiveTool('measure'); break
        case 'l': setActiveTool('length'); break
        case 'a': setActiveTool('angle'); break
        case 's': if (!e.ctrlKey) setActiveTool('area'); break
        case 'r': setRotation(prev => (prev + 90) % 360); break
        case 'e': setRotation(prev => (prev - 90 + 360) % 360); break
        case '1': setZoom(100); break
        case '2': setZoom(200); break
        case '4': setZoom(400); break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, isPlaying])

  // 播放动画
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setTimeout(() => {
        setActiveFrame(prev => {
          const max = getCurrentSeriesInstanceCount()
          return prev >= max ? 1 : prev + 1
        })
      }, 1000 / playbackSpeed)
    } else {
      if (playbackRef.current) {
        clearTimeout(playbackRef.current)
        playbackRef.current = null
      }
    }
    return () => {
      if (playbackRef.current) {
        clearTimeout(playbackRef.current)
      }
    }
  }, [isPlaying, activeFrame, playbackSpeed, getCurrentSeriesInstanceCount])

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // 全屏变化监听
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 导出图像（截图）
  const handleCapture = () => {
    if (!imageRef.current) return
    // 模拟截图功能
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0a0a14'
      ctx.fillRect(0, 0, 400, 400)
      ctx.fillStyle = '#00ff88'
      ctx.font = '12px monospace'
      ctx.fillText(`${currentStudy.patientName} - ${currentStudy.name}`, 20, 30)
      ctx.fillText(`Frame: ${activeFrame}/${getCurrentSeriesInstanceCount()}`, 20, 50)
      ctx.fillText(`Zoom: ${zoom}%`, 20, 70)
      
      const link = document.createElement('a')
      link.download = `dicom_capture_${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  // 导出图像
  const handleExport = () => {
    handleCapture()
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
    if (enhanceMode === 'sharpen') filter += 'contrast(1.3) saturate(1.2) '
    if (enhanceMode === 'smooth') filter += 'blur(0.3px) '
    if (enhanceMode === 'edge') filter += 'contrast(1.5) saturate(0) '
    if (enhanceMode === 'pseudo') filter += 'hue-rotate(180deg) saturate(2) '
    if (enhanceMode === 'harmonic') filter += 'contrast(1.4) saturate(1.5) brightness(1.1) '
    if (enhanceMode === 'contrast') filter += 'contrast(1.6) brightness(1.05) '
    return filter || 'none'
  }

  // 获取超声图像SVG
  const renderUltrasoundImage = (frameNum: number, size: number = 400) => {
    const offset = (frameNum - 1) * 5
    return (
      <svg width={size} height={size} viewBox="0 0 400 400" style={{ borderRadius: 8 }}>
        <defs>
          <radialGradient id={`ultrasoundGrad${frameNum}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={enhanceMode === 'harmonic' ? '#1a2a4a' : '#1a1a2e'} />
            <stop offset="100%" stopColor="#0a0a14" />
          </radialGradient>
          <pattern id={`ultrasoundPattern${frameNum}`} patternUnits="userSpaceOnUse" width="8" height="8">
            <circle cx="4" cy="4" r="1" fill="rgba(0,255,128,0.15)" />
          </pattern>
          <clipPath id={`circleClip${frameNum}`}>
            <circle cx="200" cy="200" r="190" />
          </clipPath>
        </defs>

        <circle cx="200" cy="200" r="195" fill={`url(#ultrasoundGrad${frameNum})`} />
        <circle cx="200" cy="200" r="190" fill={`url(#ultrasoundPattern${frameNum})`} clipPath={`url(#circleClip${frameNum})`} />

        {/* 模拟器官轮廓 - 根据帧号变化 */}
        <ellipse cx={200 + Math.sin(offset * 0.1) * 10} cy={220 + Math.cos(offset * 0.1) * 5} rx="80" ry="60" fill="none" stroke="rgba(0,200,100,0.4)" strokeWidth="2" clipPath={`url(#circleClip${frameNum})`} />
        <ellipse cx={180 + Math.sin(offset * 0.15) * 8} cy={200 + Math.cos(offset * 0.12) * 6} rx="30" ry="40" fill="rgba(0,150,80,0.3)" clipPath={`url(#circleClip${frameNum})`} />
        <ellipse cx={240 + Math.sin(offset * 0.08) * 6} cy={230 + Math.cos(offset * 0.1) * 4} rx="25" ry="30" fill="rgba(0,150,80,0.2)" clipPath={`url(#circleClip${frameNum})`} />

        {/* 谐波造影模式效果 */}
        {enhanceMode === 'harmonic' && (
          <>
            <ellipse cx="200" cy="220" rx="75" ry="55" fill="rgba(255,100,50,0.2)" clipPath={`url(#circleClip${frameNum})`} />
            <ellipse cx="200" cy="220" rx="50" ry="35" fill="rgba(255,150,100,0.15)" clipPath={`url(#circleClip${frameNum})`} />
          </>
        )}

        {/* 对比增强模式 */}
        {enhanceMode === 'contrast' && (
          <>
            <ellipse cx="200" cy="220" rx="80" ry="60" fill="rgba(100,200,255,0.15)" clipPath={`url(#circleClip${frameNum})`} />
          </>
        )}

        {/* 十字准星 */}
        <line x1="200" y1="10" x2="200" y2="390" stroke="rgba(0,255,128,0.5)" strokeWidth="1" strokeDasharray="5,5" clipPath={`url(#circleClip${frameNum})`} />
        <line x1="10" y1="200" x2="390" y2="200" stroke="rgba(0,255,128,0.5)" strokeWidth="1" strokeDasharray="5,5" clipPath={`url(#circleClip${frameNum})`} />
        <circle cx="200" cy="200" r="30" fill="none" stroke="rgba(0,255,128,0.3)" strokeWidth="1" clipPath={`url(#circleClip${frameNum})`} />
        <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(0,255,128,0.2)" strokeWidth="1" clipPath={`url(#circleClip${frameNum})`} />
        <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(0,255,128,0.15)" strokeWidth="1" clipPath={`url(#circleClip${frameNum})`} />

        {/* 伪彩模式 */}
        {enhanceMode === 'pseudo' && (
          <ellipse cx="200" cy="220" rx="80" ry="60" fill="rgba(255,100,100,0.3)" clipPath={`url(#circleClip${frameNum})`} />
        )}

        {/* 刻度 */}
        <text x="15" y="205" fill="rgba(0,255,128,0.6)" fontSize="8">0°</text>
        <text x="370" y="205" fill="rgba(0,255,128,0.6)" fontSize="8">180°</text>
        <text x="195" y="25" fill="rgba(0,255,128,0.6)" fontSize="8">90°</text>
        <text x="195" y="390" fill="rgba(0,255,128,0.6)" fontSize="8">270°</text>

        {/* 帧号标识 */}
        <text x="330" y="385" fill="rgba(0,255,128,0.8)" fontSize="12" fontWeight="bold">{frameNum}</text>
      </svg>
    )
  }

  // 获取主布局样式
  const getMainLayoutStyle = () => {
    if (isFullscreen) return { ...s.mainLayoutSingle, height: 'calc(100vh - 100px)' }
    switch (layoutMode) {
      case 'compare': return s.mainLayoutCompare
      case 'mpr': return s.mainLayoutMPR
      default: return s.mainLayout
    }
  }

  // 渲染单个图像查看器
  const renderImageViewer = (seriesId: string, frame: number, wrapperStyle?: React.CSSProperties) => {
    const series = currentStudy.series.find(s => s.id === seriesId)
    return (
      <div
        style={{
          ...s.viewerImageWrapper,
          width: '100%',
          height: '100%',
          ...wrapperStyle
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
            filter: getImageFilter(),
            transition: 'transform 0.1s ease'
          }}
        >
          {renderUltrasoundImage(frame)}
        </div>
      </div>
    )
  }

  // 渲染缩略图
  const renderThumbnails = (seriesId: string, count: number, onSelect: (n: number) => void, active: number) => {
    return (
      <div style={s.thumbnailStripWrap}>
        {Array.from({ length: Math.min(count, 12) }, (_, i) => i + 1).map((n) => (
          <div
            key={`${seriesId}-${n}`}
            style={{
              ...s.thumbnail,
              width: '100%',
              aspectRatio: '1',
              ...(n === active ? s.thumbnailActive : {})
            }}
            onClick={() => onSelect(n)}
          >
            {n}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={s.root} ref={containerRef}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>DICOM医学影像查看器 v0.6.0</h1>
            <p style={s.subtitle}>模拟超声图像 · 窗宽窗位 · 测量工具 · 序列浏览 · MPR三视图 · 序列对比</p>
          </div>
          <div style={s.headerRight}>
            {/* 布局切换 */}
            <div style={s.layoutBtnGroup}>
              <button 
                style={layoutMode === 'single' ? s.toolBtnActive : s.toolBtn} 
                onClick={() => setLayoutMode('single')}
                title="单图模式"
              >
                <Square size={14} />
              </button>
              <button 
                style={layoutMode === 'compare' ? s.toolBtnActive : s.toolBtn} 
                onClick={() => setLayoutMode('compare')}
                title="序列对比"
              >
                <Columns size={14} />
              </button>
              <button 
                style={layoutMode === 'mpr' ? s.toolBtnActive : s.toolBtn} 
                onClick={() => setLayoutMode('mpr')}
                title="MPR三视图"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />
            <button style={{ ...s.toolBtnDark, padding: '6px 12px', width: 'auto', gap: 4, display: 'flex' }} onClick={handleCapture} title="图像采集">
              <Capture size={13} /> 采集
            </button>
            <button style={{ ...s.toolBtnDark, padding: '6px 12px', width: 'auto', gap: 4, display: 'flex' }} onClick={handleExport}>
              <Download size={13} /> 导出
            </button>
            <button style={{ ...s.toolBtnDark, padding: '6px 12px', width: 'auto', gap: 4, display: 'flex' }} onClick={handlePrint}>
              <Printer size={13} /> 报告
            </button>
            <button 
              style={{ ...s.toolBtnDark, padding: '6px 12px', width: 'auto', gap: 4, display: 'flex' }} 
              onClick={toggleFullscreen}
              title={isFullscreen ? "退出全屏" : "全屏"}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* 主布局 */}
      <div style={getMainLayoutStyle()}>
        {/* 左侧序列浏览器 */}
        <div style={s.sidebar}>
          {/* 研究列表 - 历史对比 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Clock size={11} /> 历史研究</div>
            <div style={s.seriesBrowser}>
              {STUDIES_DATA.map((study) => (
                <div
                  key={study.id}
                  style={activeStudy === study.id ? s.seriesItemActive : s.seriesItem}
                  onClick={() => {
                    setActiveStudy(study.id)
                    const firstSeries = study.series[0]
                    if (firstSeries) {
                      setActiveSeries(firstSeries.id)
                      setActiveFrame(1)
                    }
                  }}
                >
                  <Calendar size={12} />
                  <span style={{ flex: 1, fontSize: 11 }}>
                    <div style={{ fontWeight: 500 }}>{study.name}</div>
                    <div style={{ fontSize: 9, opacity: 0.6 }}>{study.date}</div>
                  </span>
                </div>
              ))}
            </div>
          </div>

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
              {currentStudy.series.map((series) => (
                <div
                  key={series.id}
                  style={activeSeries === series.id ? s.seriesItemActive : s.seriesItem}
                  onClick={() => {
                    setActiveSeries(series.id)
                    setActiveFrame(1)
                  }}
                >
                  <Film size={12} />
                  <span style={{ flex: 1 }}>{series.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>{series.instanceCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 帧导航 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><ChevronRight size={11} /> 帧 ({activeFrame}/{getCurrentSeriesInstanceCount()})</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.max(1, activeFrame - 1))}><SkipBack size={12} /></button>
              <input
                type="range"
                min={1}
                max={getCurrentSeriesInstanceCount()}
                value={activeFrame}
                onChange={(e) => setActiveFrame(Number(e.target.value))}
                style={{ flex: 1, height: 4, accentColor: '#3b82f6' }}
              />
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.min(getCurrentSeriesInstanceCount(), activeFrame + 1))}><SkipForward size={12} /></button>
            </div>
            <div style={s.thumbnailStripWrap}>
              {Array.from({ length: Math.min(getCurrentSeriesInstanceCount(), 12) }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  style={{
                    ...s.thumbnail,
                    width: '100%',
                    aspectRatio: '1',
                    ...(n === activeFrame ? s.thumbnailActive : {})
                  }}
                  onClick={() => setActiveFrame(n)}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* 播放控制 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Play size={11} /> 播放</div>
            <div style={s.playbackControls}>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.max(1, activeFrame - 1))}><Rewind size={12} /></button>
              <button 
                style={isPlaying ? s.toolBtnActive : s.toolBtn} 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.min(getCurrentSeriesInstanceCount(), activeFrame + 1))}><FastForward size={12} /></button>
              <select 
                value={playbackSpeed} 
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                style={s.speedSelect}
              >
                {PLAYBACK_SPEEDS.map(speed => (
                  <option key={speed} value={speed}>{speed}x</option>
                ))}
              </select>
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
        <div style={isFullscreen ? s.viewerAreaFullscreen : s.viewerArea}>
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

              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 6px' }} />

              {/* 播放控制 */}
              <button 
                style={isPlaying ? s.toolBtnActive : s.toolBtn} 
                onClick={() => setIsPlaying(!isPlaying)}
                title="播放/暂停 [Space]"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              {/* 全屏 */}
              <button
                style={isFullscreen ? s.toolBtnActive : s.toolBtn}
                onClick={toggleFullscreen}
                title="全屏 [F]"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            <div style={s.viewerToolbarRight}>
              {/* 帧信息 */}
              <span style={{ color: '#fff', fontSize: 11, padding: '0 8px' }}>
                {activeFrame}/{getCurrentSeriesInstanceCount()}
              </span>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.max(1, activeFrame - 1))}><ChevronLeft size={14} /></button>
              <button style={s.toolBtn} onClick={() => setActiveFrame(Math.min(getCurrentSeriesInstanceCount(), activeFrame + 1))}><ChevronRight size={14} /></button>
            </div>
          </div>

          {/* 图像区域 */}
          {layoutMode === 'single' && (
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
                {renderUltrasoundImage(activeFrame)}

                {/* 标注渲染 */}
                <svg
                  width={400}
                  height={400}
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
                <div>Patient: {currentStudy.patientName} | {currentStudy.patientId}</div>
                <div>Study: {currentStudy.date} | {currentStudy.modality}</div>
                <div>Series: {activeSeries} | Frame: {activeFrame}/{getCurrentSeriesInstanceCount()}</div>
                <div>WW: {windowWidth} | WC: {windowCenter}</div>
                <div>Zoom: {zoom}% | Rot: {rotation}°</div>
              </div>

              {/* 标注信息 */}
              <div style={{ position: 'absolute', bottom: 12, left: 12, color: 'rgba(0,255,128,0.8)', fontSize: 10, fontFamily: 'monospace' }}>
                <div>Mode: {activeTool.toUpperCase()} | {annotations.length} annotations</div>
              </div>
            </div>
          )}

          {/* 比较模式 */}
          {layoutMode === 'compare' && (
            <div style={s.viewerMainGrid}>
              {/* 左侧序列 */}
              <div style={s.comparePanel}>
                <div style={s.comparePanelHeader}>
                  <span style={s.comparePanelTitle}>{currentStudy.series[0]?.label || '序列1'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{activeFrame}/{currentStudy.series[0]?.instanceCount || 0}</span>
                </div>
                <div style={s.comparePanelMain}>
                  {renderUltrasoundImage(activeFrame, 300)}
                </div>
                <div style={{ padding: '4px 8px 8px' }}>
                  {renderThumbnails(currentStudy.series[0]?.id || '', currentStudy.series[0]?.instanceCount || 0, setActiveFrame, activeFrame)}
                </div>
              </div>

              {/* 右侧序列 */}
              <div style={s.comparePanel}>
                <div style={s.comparePanelHeader}>
                  <span style={s.comparePanelTitle}>{currentStudy.series[1]?.label || '序列2'}</span>
                  <select 
                    value={compareSeries || currentStudy.series[1]?.id || ''} 
                    onChange={(e) => setCompareSeries(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: 10, maxWidth: 100 }}
                  >
                    {currentStudy.series.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div style={s.comparePanelMain}>
                  {renderUltrasoundImage(activeFrame, 300)}
                </div>
                <div style={{ padding: '4px 8px 8px' }}>
                  {renderThumbnails(compareSeries || currentStudy.series[1]?.id || '', currentStudy.series[1]?.instanceCount || 0, setActiveFrame, activeFrame)}
                </div>
              </div>
            </div>
          )}

          {/* MPR三视图 */}
          {layoutMode === 'mpr' && (
            <div style={s.viewerMainMPR}>
              {/* 横断面 (Axial) */}
              <div style={s.mprPanel}>
                <div style={s.mprLabel}>横断面 (Axial)</div>
                <div style={{ ...s.comparePanelMain, padding: 4 }}>
                  {renderUltrasoundImage(activeFrame, 280)}
                </div>
              </div>

              {/* 矢状面 (Sagittal) */}
              <div style={s.mprPanel}>
                <div style={s.mprLabel}>矢状面 (Sagittal)</div>
                <div style={{ ...s.comparePanelMain, padding: 4 }}>
                  {renderUltrasoundImage(Math.min(activeFrame + 4, getCurrentSeriesInstanceCount()), 280)}
                </div>
              </div>

              {/* 冠状面 (Coronal) */}
              <div style={s.mprPanel}>
                <div style={s.mprLabel}>冠状面 (Coronal)</div>
                <div style={{ ...s.comparePanelMain, padding: 4 }}>
                  {renderUltrasoundImage(Math.min(activeFrame + 8, getCurrentSeriesInstanceCount()), 280)}
                </div>
              </div>
            </div>
          )}

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
              <Aperture size={10} /> 边缘
            </button>
            <button style={enhanceMode === 'pseudo' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'pseudo' ? 'none' : 'pseudo')}>
              <Palette size={10} /> 伪彩
            </button>
            <button style={enhanceMode === 'harmonic' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'harmonic' ? 'none' : 'harmonic')}>
              <ScanEye size={10} /> 谐波
            </button>
            <button style={enhanceMode === 'contrast' ? s.enhanceBtnActive : s.enhanceBtn} onClick={() => setEnhanceMode(enhanceMode === 'contrast' ? 'none' : 'contrast')}>
              <Crosshair size={10} /> 造影
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
          {/* 标签页切换 */}
          <div style={s.tabBar}>
            <div style={rightPanelTab === 'info' ? s.tabActive : s.tab} onClick={() => setRightPanelTab('info')}>
              <Eye size={11} style={{ marginRight: 4 }} />患者信息
            </div>
            <div style={rightPanelTab === 'metadata' ? s.tabActive : s.tab} onClick={() => setRightPanelTab('metadata')}>
              <Info size={11} style={{ marginRight: 4 }} />元数据
            </div>
            <div style={rightPanelTab === 'reports' ? s.tabActive : s.tab} onClick={() => setRightPanelTab('reports')}>
              <FileText size={11} style={{ marginRight: 4 }} />报告
            </div>
          </div>

          {/* 患者信息 */}
          {rightPanelTab === 'info' && (
            <>
              <div style={s.infoSection}>
                <div style={s.infoTitle}><Heart size={12} /> 患者信息</div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>姓名</span>
                  <span style={s.infoValue}>{currentStudy.patientName}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>ID</span>
                  <span style={s.infoValue}>{currentStudy.patientId}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>检查</span>
                  <span style={s.infoValue}>{currentStudy.name}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>日期</span>
                  <span style={s.infoValue}>{currentStudy.date}</span>
                </div>
              </div>

              {/* 检查信息 */}
              <div style={s.infoSection}>
                <div style={s.infoTitle}><Activity size={12} /> 检查信息</div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>类型</span>
                  <span style={s.infoValue}>{currentStudy.type}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>设备</span>
                  <span style={s.infoValue}>GE Voluson E10</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>医生</span>
                  <span style={s.infoValue}>李明辉</span>
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
            </>
          )}

          {/* DICOM元数据表格 */}
          {rightPanelTab === 'metadata' && (
            <div style={s.infoSection}>
              <div style={s.infoTitle}><Info size={12} /> Patient层级</div>
              <table style={s.metadataTable}>
                <tbody>
                  {Object.entries(dicomMetadata.patient).map(([key, value]) => (
                    <tr key={key}>
                      <td style={s.metadataTh}>{key}</td>
                      <td style={s.metadataTd}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ ...s.infoTitle, marginTop: 12 }}><Activity size={12} /> Study层级</div>
              <table style={s.metadataTable}>
                <tbody>
                  {Object.entries(dicomMetadata.study).map(([key, value]) => (
                    <tr key={key}>
                      <td style={s.metadataTh}>{key}</td>
                      <td style={s.metadataTd}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ ...s.infoTitle, marginTop: 12 }}><Layers size={12} /> Series层级</div>
              <table style={s.metadataTable}>
                <tbody>
                  {Object.entries(dicomMetadata.series).map(([key, value]) => (
                    <tr key={key}>
                      <td style={s.metadataTh}>{key}</td>
                      <td style={s.metadataTd}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ ...s.infoTitle, marginTop: 12 }}><ImageIcon size={12} /> Image层级</div>
              <table style={s.metadataTable}>
                <tbody>
                  {Object.entries(dicomMetadata.image).map(([key, value]) => (
                    <tr key={key}>
                      <td style={s.metadataTh}>{key}</td>
                      <td style={s.metadataTd}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 报告列表 */}
          {rightPanelTab === 'reports' && (
            <div style={s.infoSection}>
              <div style={s.infoTitle}><FileText size={12} /> 关联报告</div>
              {currentStudy.reportId ? (
                <div
                  style={selectedReport === currentStudy.reportId ? s.reportItemActive : s.reportItem}
                  onClick={() => setSelectedReport(selectedReport === currentStudy.reportId ? null : currentStudy.reportId!)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} style={{ color: '#3b82f6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 11, color: '#1a3a5c' }}>
                        {REPORTS_DATA[currentStudy.reportId]?.title || '超声诊断报告'}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                        {REPORTS_DATA[currentStudy.reportId]?.date || currentStudy.date} | {REPORTS_DATA[currentStudy.reportId]?.author || '李明辉'}
                      </div>
                    </div>
                  </div>
                  {selectedReport === currentStudy.reportId ? (
                    <div style={{ marginTop: 8, padding: 8, background: '#fff', borderRadius: 4, fontSize: 10, color: '#475569', lineHeight: 1.6 }}>
                      {REPORTS_DATA[currentStudy.reportId]?.content || '报告内容...'}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#94a3b8', padding: '12px 0' }}>
                  暂无关联报告
                </div>
              )}

              {/* 历史报告 */}
              <div style={{ ...s.infoTitle, marginTop: 16 }}><Clock size={12} /> 其他研究</div>
              {STUDIES_DATA.filter(st => st.id !== activeStudy).map(study => (
                <div
                  key={study.id}
                  style={s.reportItem}
                  onClick={() => {
                    setActiveStudy(study.id)
                    const firstSeries = study.series[0]
                    if (firstSeries) {
                      setActiveSeries(firstSeries.id)
                      setActiveFrame(1)
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} style={{ color: '#64748b' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 11, color: '#1a3a5c' }}>{study.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{study.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
