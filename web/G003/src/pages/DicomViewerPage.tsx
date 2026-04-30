// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - DICOM查看器页面
// 医学影像查看 / DICOM阅读 / 图像处理 / 测量工具
// ============================================================
import { useState } from 'react'
import {
  Search, Download, ZoomIn, ZoomOut, RotateCw, RotateCcw,
  FlipHorizontal, FlipVertical, Sun, Moon, Contrast,
  Ruler, Circle, Grid3x3, Maximize2, Minimize2,
  Play, Pause, ChevronLeft, ChevronRight, Layers,
  Settings, Eye, Heart, Activity, Dumbbell
} from 'lucide-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 主布局
  mainLayout: { display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 16, height: 'calc(100vh - 180px)' },
  // 左侧工具栏
  sidebar: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 16, overflowY: 'auto' },
  sidebarSection: { marginBottom: 20 },
  sidebarTitle: { fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', color: '#475569', fontSize: 13 },
  sidebarItemActive: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', background: '#eff6ff', color: '#3b82f6', fontSize: 13 },
  // 图像查看区
  viewerArea: { background: '#1a1a2e', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  viewerToolbar: { background: '#252540', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  viewerToolbarLeft: { display: 'flex', gap: 8 },
  viewerToolbarRight: { display: 'flex', gap: 8 },
  viewerMain: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  viewerImage: { background: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #2d3436 100%)', borderRadius: 8, width: '90%', height: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair' },
  viewerPatient: { color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 8 },
  viewerInfo: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  viewerOverlay: { position: 'absolute', top: 16, left: 16, color: 'rgba(255,255,255,0.8)', fontSize: 11, lineHeight: 1.8 },
  viewerControls: { background: '#252540', padding: '10px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 },
  // 右侧信息面板
  infoPanel: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 16, overflowY: 'auto' },
  infoSection: { marginBottom: 20 },
  infoTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  infoLabel: { fontSize: 12, color: '#64748b' },
  infoValue: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  // 工具按钮
  toolBtn: { width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: 'rgba(255,255,255,0.1)', color: '#fff' },
  toolBtnActive: { width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: '#3b82f6', color: '#fff' },
  toolBtnDark: { width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: '#fff', color: '#475569' },
  toolBtnActiveDark: { width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: '#3b82f6', color: '#fff' },
  // 测量结果
  measurementItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 },
  measurementLabel: { fontSize: 12, color: '#64748b' },
  measurementValue: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  // 缩略图
  thumbnailStrip: { display: 'flex', gap: 8, padding: '8px 0', overflowX: 'auto' },
  thumbnail: { width: 60, height: 60, borderRadius: 6, background: '#f8fafc', border: '2px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' },
  thumbnailActive: { width: 60, height: 60, borderRadius: 6, background: '#f8fafc', border: '2px solid #3b82f6', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#3b82f6', fontWeight: 600 },
  // 预设
  presetBtn: { padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#475569', marginRight: 8, marginBottom: 8 },
  presetBtnActive: { padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, background: '#3b82f6', color: '#fff', marginRight: 8, marginBottom: 8 },
  // 窗口预设
  windowPresets: [
    { name: '软组织', wl: 40, ww: 400 },
    { name: '肝脏', wl: 35, ww: 350 },
    { name: '骨骼', wl: 300, ww: 1500 },
    { name: '肺', wl: -600, ww: 1600 },
    { name: '腹部', wl: 40, ww: 350 },
    { name: '血管', wl: 20, ww: 300 },
  ],
  // 序列列表
  seriesList: [
    { id: 1, name: '横断面 T1', images: 24, checked: true },
    { id: 2, name: '横断面 T2', images: 24, checked: false },
    { id: 3, name: '冠状面', images: 20, checked: false },
  ],
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

export default function DicomViewerPage() {
  const [zoom, setZoom] = useState(100)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)
  const [invert, setInvert] = useState(false)
  const [activeTool, setActiveTool] = useState('pan')
  const [activeMeasure, setActiveMeasure] = useState(null)
  const [windowPreset, setWindowPreset] = useState('软组织')
  const [annotations, setAnnotations] = useState({ grid: false, ruler: true })

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = (dir) => {
    // 旋转逻辑
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>DICOM医学影像查看器</h1>
            <p style={s.subtitle}>医学影像查看 · DICOM阅读 · 图像处理 · 测量工具</p>
          </div>
          <div style={s.headerRight}>
            <button style={{ ...s.toolBtnDark, padding: '8px 16px', width: 'auto' }}><Download size={14} /> 导出图像</button>
            <button style={{ ...s.toolBtnDark, padding: '8px 16px', width: 'auto' }}><Settings size={14} /> 报告</button>
          </div>
        </div>
      </div>

      {/* 主布局 */}
      <div style={s.mainLayout}>
        {/* 左侧工具栏 */}
        <div style={s.sidebar}>
          {/* 工具 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Settings size={14} /> 工具</div>
            {[
              { id: 'pan', icon: Hand, label: '移动' },
              { id: 'zoom', icon: ZoomIn, label: '缩放' },
              { id: 'measure', icon: Ruler, label: '测量' },
              { id: 'circle', icon: Circle, label: '圆形' },
              { id: 'angle', icon: Activity, label: '角度' },
            ].map((tool) => (
              <div
                key={tool.id}
                style={activeTool === tool.id ? s.sidebarItemActive : s.sidebarItem}
                onClick={() => setActiveTool(tool.id)}
              >
                <tool.icon size={16} />
                {tool.label}
              </div>
            ))}
          </div>

          {/* 窗口预设 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Sun size={14} /> 窗口预设</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {s.windowPresets.map((preset) => (
                <button
                  key={preset.name}
                  style={windowPreset === preset.name ? s.presetBtnActive : s.presetBtn}
                  onClick={() => setWindowPreset(preset.name)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 标注 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Eye size={14} /> 显示标注</div>
            <div
              style={annotations.grid ? s.sidebarItemActive : s.sidebarItem}
              onClick={() => setAnnotations(prev => ({ ...prev, grid: !prev.grid }))}
            >
              <Grid3x3 size={16} /> 网格
            </div>
            <div
              style={annotations.ruler ? s.sidebarItemActive : s.sidebarItem}
              onClick={() => setAnnotations(prev => ({ ...prev, ruler: !prev.ruler }))}
            >
              <Ruler size={16} /> 标尺
            </div>
          </div>

          {/* 序列列表 */}
          <div style={s.sidebarSection}>
            <div style={s.sidebarTitle}><Layers size={14} /> 序列</div>
            {s.seriesList.map((series) => (
              <div key={series.id} style={series.checked ? s.sidebarItemActive : s.sidebarItem}>
                <input type="checkbox" checked={series.checked} onChange={() => {}} style={{ marginRight: 8 }} />
                {series.name} ({series.images})
              </div>
            ))}
          </div>
        </div>

        {/* 中间查看区 */}
        <div style={s.viewerArea}>
          {/* 工具栏 */}
          <div style={s.viewerToolbar}>
            <div style={s.viewerToolbarLeft}>
              <button style={s.toolBtn} onClick={handleZoomOut}><ZoomOut size={16} /></button>
              <span style={{ color: '#fff', fontSize: 13, minWidth: 60, textAlign: 'center' }}>{zoom}%</span>
              <button style={s.toolBtn} onClick={handleZoomIn}><ZoomIn size={16} /></button>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
              <button style={s.toolBtn} onClick={() => handleRotate('cw')}><RotateCw size={16} /></button>
              <button style={s.toolBtn} onClick={() => handleRotate('ccw')}><RotateCcw size={16} /></button>
              <button style={{ ...s.toolBtn, background: invert ? '#3b82f6' : 'rgba(255,255,255,0.1)' }} onClick={() => setInvert(!invert)}><Contrast size={16} /></button>
            </div>
            <div style={s.viewerToolbarRight}>
              <button style={s.toolBtn}><ChevronLeft size={16} /></button>
              <span style={{ color: '#fff', fontSize: 13 }}>{DICOM_INFO.imageNumber}</span>
              <button style={s.toolBtn}><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* 图像区域 */}
          <div style={s.viewerMain}>
            <div style={{ ...s.viewerImage, transform: `scale(${zoom / 100})`, filter: invert ? 'invert(1)' : 'none' }}>
              <Activity size={80} style={{ opacity: 0.2, marginBottom: 20 }} />
              <div style={s.viewerPatient}>{DICOM_INFO.patientName}</div>
              <div style={s.viewerInfo}>{DICOM_INFO.studyType}</div>
            </div>
            {/* 叠加信息 */}
            <div style={s.viewerOverlay}>
              <div>Patient: {DICOM_INFO.patientName} | {DICOM_INFO.patientId}</div>
              <div>Study: {DICOM_INFO.studyDate} | {DICOM_INFO.studyModality}</div>
              <div>Series: {DICOM_INFO.seriesNumber} | Image: {DICOM_INFO.imageNumber}</div>
              <div>WL: 40 | WW: 400 | {windowPreset}</div>
            </div>
          </div>

          {/* 底部控制栏 */}
          <div style={s.viewerControls}>
            <button style={s.toolBtn}><Minimize2 size={16} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 12 }}>
              <Sun size={14} /> 亮度
              <input type="range" min="0" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} style={{ width: 100 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 12 }}>
              <Contrast size={14} /> 对比度
              <input type="range" min="0" max="100" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} style={{ width: 100 }} />
            </div>
          </div>
        </div>

        {/* 右侧信息面板 */}
        <div style={s.infoPanel}>
          {/* 患者信息 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Heart size={14} /> 患者信息</div>
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
            <div style={s.infoTitle}><Activity size={14} /> 检查信息</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查日期</span>
              <span style={s.infoValue}>{DICOM_INFO.studyDate}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查类型</span>
              <span style={s.infoValue}>{DICOM_INFO.studyType}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>设备</span>
              <span style={s.infoValue}>{DICOM_INFO.equipment}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查医生</span>
              <span style={s.infoValue}>{DICOM_INFO.physician}</span>
            </div>
          </div>

          {/* 测量结果 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Ruler size={14} /> 测量结果</div>
            <div style={s.measurementItem}>
              <span style={s.measurementLabel}>肝脏大小</span>
              <span style={s.measurementValue}>18.5 cm</span>
            </div>
            <div style={s.measurementItem}>
              <span style={s.measurementLabel}>脾脏厚度</span>
              <span style={s.measurementValue}>3.2 cm</span>
            </div>
            <div style={s.measurementItem}>
              <span style={s.measurementLabel}>胆囊壁厚</span>
              <span style={s.measurementValue}>0.3 cm</span>
            </div>
          </div>

          {/* 缩略图 */}
          <div style={s.infoSection}>
            <div style={s.infoTitle}><Grid3x3 size={14} /> 缩略图</div>
            <div style={s.thumbnailStrip}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} style={n === 12 ? s.thumbnailActive : s.thumbnail}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 补充缺失的图标
const Hand = (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
