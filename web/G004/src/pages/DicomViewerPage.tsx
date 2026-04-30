import React, { useState } from 'react'
import {
  Monitor, Download, ZoomIn, ZoomOut, RotateCcw,
  Ruler, Pen, Eye, ChevronLeft, ChevronRight,
  FileImage, Layers, Circle, Trash2, Save
} from 'lucide-react'

interface DicomImage {
  id: string
  patientId: string
  patientName: string
  studyDate: string
  modality: string
  bodyPart: string
  thumbnail: string
  windowWidth: number
  windowCenter: number
}

const mockImages: DicomImage[] = [
  { id: 'D001', patientId: 'P001', patientName: '张伟', studyDate: '2026-04-28', modality: 'EGD', bodyPart: '胃', thumbnail: 'thum01', windowWidth: 400, windowCenter: 40 },
  { id: 'D002', patientId: 'P002', patientName: '李娜', studyDate: '2026-04-27', modality: 'COL', bodyPart: '结肠', thumbnail: 'thum02', windowWidth: 350, windowCenter: 35 },
  { id: 'D003', patientId: 'P003', patientName: '王建国', studyDate: '2026-04-26', modality: 'EGD', bodyPart: '食管', thumbnail: 'thum03', windowWidth: 380, windowCenter: 38 },
  { id: 'D004', patientId: 'P004', patientName: '陈晓梅', studyDate: '2026-04-25', modality: 'EUS', bodyPart: '胰腺', thumbnail: 'thum04', windowWidth: 420, windowCenter: 42 },
  { id: 'D005', patientId: 'P005', patientName: '刘大力', studyDate: '2026-04-24', modality: 'EGD', bodyPart: '胃窦', thumbnail: 'thum05', windowWidth: 390, windowCenter: 39 },
  { id: 'D006', patientId: 'P006', patientName: '赵丽', studyDate: '2026-04-23', modality: 'COL', bodyPart: '直肠', thumbnail: 'thum06', windowWidth: 360, windowCenter: 36 },
]

const tools = [
  { id: 'pan', icon: Eye, label: '平移' },
  { id: 'zoom', icon: ZoomIn, label: '放大' },
  { id: 'window', icon: Layers, label: '窗宽窗位' },
  { id: 'ruler', icon: Ruler, label: '测量长度' },
  { id: 'angle', icon: Circle, label: '测量角度' },
  { id: 'annotate', icon: Pen, label: '标注' },
]

export default function DicomViewerPage() {
  const [selectedImage, setSelectedImage] = useState<DicomImage>(mockImages[0])
  const [activeTool, setActiveTool] = useState('pan')
  const [ww, setWw] = useState(selectedImage.windowWidth)
  const [wc, setWc] = useState(selectedImage.windowCenter)
  const [zoom, setZoom] = useState(1)
  const [annotations, setAnnotations] = useState<{ id: string; x: number; y: number; text: string }[]>([])
  const [annotationText, setAnnotationText] = useState('')
  const [showAnnotate, setShowAnnotate] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalityFilter, setModalityFilter] = useState('全部')

  const filteredImages = mockImages.filter(img => {
    const matchSearch = img.patientName.includes(searchTerm) || img.patientId.includes(searchTerm) || img.id.includes(searchTerm)
    const matchModality = modalityFilter === '全部' || img.modality === modalityFilter
    return matchSearch && matchModality
  })

  const handleImageSelect = (img: DicomImage) => {
    setSelectedImage(img)
    setWw(img.windowWidth)
    setWc(img.windowCenter)
    setZoom(1)
    setAnnotations([])
  }

  const handleZoom = (delta: number) => {
    setZoom(z => Math.min(5, Math.max(0.2, z + delta)))
  }

  const handleReset = () => {
    setWw(selectedImage.windowWidth)
    setWc(selectedImage.windowCenter)
    setZoom(1)
    setAnnotations([])
  }

  const handleAddAnnotation = () => {
    if (!annotationText.trim()) return
    setAnnotations(a => [...a, { id: Date.now().toString(), x: 150 + Math.random() * 200, y: 100 + Math.random() * 150, text: annotationText }])
    setAnnotationText('')
    setShowAnnotate(false)
  }

  const s: Record<string, React.CSSProperties> = {
    root: { display: 'flex', height: '100vh', backgroundColor: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' },
    sidebar: { width: 280, backgroundColor: '#161b22', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    sidebarHeader: { padding: '16px', borderBottom: '1px solid #30363d' },
    searchInput: { width: '100%', padding: '10px 12px', backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14, outline: 'none' },
    filterRow: { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' },
    filterBtn: { padding: '4px 10px', borderRadius: 4, border: '1px solid #30363d', backgroundColor: 'transparent', color: '#8b949e', cursor: 'pointer', fontSize: 12 },
    imageList: { flex: 1, overflowY: 'auto', padding: '8px' },
    imageItem: { display: 'flex', gap: 10, padding: '10px', borderRadius: 6, cursor: 'pointer', mb: 6, border: '1px solid transparent', transition: 'all 0.15s' },
    imageItemActive: { border: '1px solid #58a6ff', backgroundColor: '#1f3a5f' },
    thumb: { width: 60, height: 45, backgroundColor: '#21262d', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#8b949e' },
    imageInfo: { flex: 1 },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    toolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#161b22', borderBottom: '1px solid #30363d' },
    toolBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s', minWidth: 60, minHeight: 44 },
    toolBtnActive: { backgroundColor: '#1f6feb', color: '#fff' },
    toolBtnDefault: { backgroundColor: '#21262d', color: '#8b949e' },
    divider: { width: 1, height: 30, backgroundColor: '#30363d', mx: 4 },
    viewerContainer: { flex: 1, display: 'flex', overflow: 'hidden' },
    viewer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', position: 'relative', cursor: activeTool === 'pan' ? 'grab' : 'crosshair' },
    dicomDisplay: { width: 512 * zoom, height: 400 * zoom, backgroundColor: '#000', border: '1px solid #30363d', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', overflow: 'hidden' },
    annotationLabel: { position: 'absolute', padding: '2px 6px', backgroundColor: 'rgba(255,200,0,0.85)', borderRadius: 3, fontSize: 11, color: '#000', cursor: 'pointer', whiteSpace: 'nowrap' },
    rightPanel: { width: 260, backgroundColor: '#161b22', borderLeft: '1px solid #30363d', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    panelSection: { padding: '14px 16px', borderBottom: '1px solid #30363d' },
    panelTitle: { fontSize: 13, color: '#8b949e', marginBottom: 10, fontWeight: 500 },
    paramRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 },
    paramLabel: { fontSize: 13, color: '#8b949e' },
    paramValue: { fontFamily: 'monospace', fontSize: 13, color: '#e6edf3' },
    slider: { width: '100%', accentColor: '#58a6ff' },
    rangeRow: { display: 'flex', alignItems: 'center', gap: 8, mb: 6 },
    rangeLabel: { fontSize: 12, color: '#8b949e', width: 50 },
    actionBtn: { width: '100%', padding: '10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, transition: 'all 0.15s' },
  }

  return (
    <div style={s.root}>
      {/* 左侧图像列表 */}
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <input
            style={s.searchInput}
            placeholder="搜索患者/检查号..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div style={s.filterRow}>
            {['全部', 'EGD', 'COL', 'EUS'].map(m => (
              <button
                key={m}
                style={{ ...s.filterBtn, ...(modalityFilter === m ? { backgroundColor: '#1f6feb', color: '#fff', borderColor: '#1f6feb' } : {}) }}
                onClick={() => setModalityFilter(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div style={s.imageList}>
          {filteredImages.map(img => (
            <div
              key={img.id}
              style={{ ...s.imageItem, ...(selectedImage.id === img.id ? s.imageItemActive : {}) }}
              onClick={() => handleImageSelect(img)}
            >
              <div style={s.thumb}><FileImage size={20} /></div>
              <div style={s.imageInfo}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{img.patientName}</div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>{img.id} · {img.modality} · {img.bodyPart}</div>
                <div style={{ fontSize: 11, color: '#6e7681' }}>{img.studyDate}</div>
              </div>
            </div>
          ))}
          {filteredImages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#8b949e' }}>
              <FileImage size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
              <div>未找到匹配的检查</div>
            </div>
          )}
        </div>
      </div>

      {/* 主查看区 */}
      <div style={s.mainArea}>
        {/* 工具栏 */}
        <div style={s.toolbar}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {tools.map(tool => (
              <button
                key={tool.id}
                style={{ ...s.toolBtn, ...(activeTool === tool.id ? s.toolBtnActive : s.toolBtnDefault) }}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                <tool.icon size={16} />
                <span style={{ fontSize: 11 }}>{tool.label}</span>
              </button>
            ))}
          </div>
          <div style={s.divider} />
          <button style={{ ...s.toolBtn, ...s.toolBtnDefault }} onClick={() => handleZoom(0.2)} title="放大"><ZoomIn size={16} /><span style={{ fontSize: 11 }}>放大</span></button>
          <button style={{ ...s.toolBtn, ...s.toolBtnDefault }} onClick={() => handleZoom(-0.2)} title="缩小"><ZoomOut size={16} /><span style={{ fontSize: 11 }}>缩小</span></button>
          <button style={{ ...s.toolBtn, ...s.toolBtnDefault }} onClick={handleReset} title="重置"><RotateCcw size={16} /><span style={{ fontSize: 11 }}>重置</span></button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: '#8b949e' }}>检查号：{selectedImage.id} | 患者：{selectedImage.patientName} | {selectedImage.studyDate}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3' }}><Save size={14} />保存标注</button>
            <button style={{ ...s.actionBtn, backgroundColor: '#238636', color: '#fff' }}><Download size={14} />导出图像</button>
          </div>
        </div>

        {/* 影像区域 */}
        <div style={s.viewerContainer}>
          <div style={s.viewer}>
            <div style={s.dicomDisplay}>
              {/* 模拟DICOM影像 - 灰度显示 */}
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg,
                  rgb(${Math.round(ww/4)},${Math.round(ww/4)},${Math.round(ww/4)}) 0%,
                  rgb(${Math.round(ww/2)},${Math.round(ww/2)},${Math.round(ww/2)}) 40%,
                  rgb(${ww},${ww},${ww}) 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                filter: `contrast(1.1) brightness(${wc/50})`
              }}>
                <div style={{ textAlign: 'center', color: '#8b949e' }}>
                  <Monitor size={64} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div style={{ fontSize: 13 }}>DICOM 影像区域</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>{selectedImage.modality} · {selectedImage.bodyPart}</div>
                  <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>WW: {ww} | WC: {wc} | Zoom: {zoom.toFixed(1)}x</div>
                </div>
              </div>
              {/* 标注 */}
              {annotations.map(a => (
                <div key={a.id} style={{ ...s.annotationLabel, left: a.x, top: a.y }}>{a.text}</div>
              ))}
            </div>
          </div>

          {/* 右侧参数面板 */}
          <div style={s.rightPanel}>
            <div style={s.panelSection}>
              <div style={s.panelTitle}>窗宽窗位调节</div>
              <div style={s.rangeRow}>
                <span style={s.rangeLabel}>窗宽(WW)</span>
                <input type="range" min={50} max={800} value={ww} onChange={e => setWw(Number(e.target.value))} style={s.slider} />
                <span style={{ ...s.paramValue, width: 45, textAlign: 'right' }}>{ww}</span>
              </div>
              <div style={s.rangeRow}>
                <span style={s.rangeLabel}>窗位(WC)</span>
                <input type="range" min={-100} max={300} value={wc} onChange={e => setWc(Number(e.target.value))} style={s.slider} />
                <span style={{ ...s.paramValue, width: 45, textAlign: 'right' }}>{wc}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, mt: 8 }}>
                <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3', flex: 1, fontSize: 11, padding: '6px' }} onClick={() => { setWw(400); setWc(40) }}>软组织</button>
                <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3', flex: 1, fontSize: 11, padding: '6px' }} onClick={() => { setWw(1500); setWc(-600) }}>肺窗</button>
                <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3', flex: 1, fontSize: 11, padding: '6px' }} onClick={() => { setWw(200); setWc(80) }}>骨窗</button>
              </div>
            </div>

            <div style={s.panelSection}>
              <div style={s.panelTitle}>标注管理</div>
              {annotations.length === 0 ? (
                <div style={{ color: '#6e7681', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>暂无标注</div>
              ) : (
                annotations.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, padding: '6px 8px', backgroundColor: '#21262d', borderRadius: 4 }}>
                    <span style={{ fontSize: 12, color: '#e6edf3' }}>{a.text}</span>
                    <button style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', padding: 2 }} onClick={() => setAnnotations(ann => ann.filter(x => x.id !== a.id))}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
              {showAnnotate ? (
                <div style={{ display: 'flex', gap: 6, mt: 6 }}>
                  <input
                    style={{ flex: 1, padding: '6px 8px', backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', fontSize: 12, outline: 'none' }}
                    placeholder="输入标注文字..."
                    value={annotationText}
                    onChange={e => setAnnotationText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddAnnotation()}
                  />
                  <button style={{ ...s.actionBtn, backgroundColor: '#1f6feb', color: '#fff', flex: 1, fontSize: 11, padding: '6px' }} onClick={handleAddAnnotation}>添加</button>
                </div>
              ) : (
                <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3', mt: 6 }} onClick={() => setShowAnnotate(true)}>
                  <Pen size={13} />添加标注
                </button>
              )}
            </div>

            <div style={s.panelSection}>
              <div style={s.panelTitle}>影像信息</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['患者ID', selectedImage.patientId],
                  ['姓名', selectedImage.patientName],
                  ['检查日期', selectedImage.studyDate],
                  ['检查类型', selectedImage.modality],
                  ['部位', selectedImage.bodyPart],
                  ['窗口', `${ww}/${wc}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '6px 8px', backgroundColor: '#21262d', borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: '#8b949e' }}>{k}</div>
                    <div style={{ fontSize: 12, color: '#e6edf3', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 14, flex: 1 }}>
              <div style={s.panelTitle}>快捷操作</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3' }}><ChevronLeft size={14} />上一张</button>
                <button style={{ ...s.actionBtn, backgroundColor: '#21262d', color: '#e6edf3' }}>下一张<ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
