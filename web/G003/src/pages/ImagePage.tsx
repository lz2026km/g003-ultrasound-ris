// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 影像管理页面
// 图像查看 / 采集管理 / 图像存储 / 后期处理
// ============================================================
import { useState } from 'react'
import {
  Image, Camera, Film, HardDrive, Search, Filter, Download,
  Trash2, Eye, ZoomIn, ZoomOut, RotateCw, FlipHorizontal,
  Sun, Contrast, Crop, Maximize2, Heart, Activity, Monitor,
  Play, Pause, SkipBack, SkipForward, Volume2, Settings,
  RefreshCw, Grid, List, ChevronLeft, ChevronRight, Star,
  Bookmark, Share2, Printer, Edit, MoreHorizontal
} from 'lucide-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8, marginTop: 8 },
  // 操作按钮
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: '#3b82f6', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  },
  btnSecondary: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex',
    alignItems: 'center', gap: 6,
  },
  // 统计卡片
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 12,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  // 主布局 - 左侧列表 + 右侧预览
  mainContent: {
    display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16,
  },
  // 左侧图像列表
  imageList: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', height: 'calc(100vh - 320px)',
  },
  listHeader: {
    padding: '16px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  listSearch: {
    flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, outline: 'none',
  },
  listBody: { flex: 1, overflowY: 'auto', padding: 8 },
  thumbnailItem: {
    display: 'flex', gap: 10, padding: 10, borderRadius: 10, cursor: 'pointer',
    transition: 'all 0.2s', marginBottom: 4,
  },
  thumbnailItemActive: {
    background: '#eff6ff', border: '2px solid #3b82f6',
  },
  thumbnail: {
    width: 80, height: 60, borderRadius: 8, background: '#f8fafc',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden',
  },
  thumbnailInfo: { flex: 1, minWidth: 0 },
  thumbnailTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  thumbnailMeta: { fontSize: 11, color: '#94a3b8' },
  // 右侧预览区
  previewPanel: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
  },
  previewHeader: {
    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  previewTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  previewTools: { display: 'flex', gap: 4 },
  toolBtn: {
    padding: 6, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  toolBtnActive: {
    padding: 6, borderRadius: 6, border: 'none', background: '#eff6ff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#3b82f6',
  },
  // 图像查看区
  viewerArea: {
    flex: 1, background: '#1a1a2e', display: 'flex', alignItems: 'center',
    justifyContent: 'center', position: 'relative', minHeight: 400,
  },
  viewerPlaceholder: {
    color: '#4a4a6a', textAlign: 'center',
  },
  // 图像控制栏
  controlBar: {
    padding: '12px 16px', borderTop: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#fafbfc',
  },
  controlGroup: { display: 'flex', alignItems: 'center', gap: 8 },
  slider: {
    width: 100, height: 4, borderRadius: 2, appearance: 'none',
    background: '#e2e8f0', cursor: 'pointer',
  },
  // 缩略图网格
  thumbnailGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: 8,
  },
  gridItem: {
    aspectRatio: '4/3', borderRadius: 8, background: '#f8fafc',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// ---------- 常量数据 ----------
const IMAGE_STATS = [
  { label: '总图像数', value: '12,456', icon: Image, color: '#3b82f6', bg: '#eff6ff' },
  { label: '今日采集', value: '128', icon: Camera, color: '#22c55e', bg: '#f0fdf4' },
  { label: '存储用量', value: '2.8 TB', icon: HardDrive, color: '#f97316', bg: '#fff7ed' },
  { label: '待审核', value: '34', icon: Film, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: '已归档', value: '9,872', icon: HardDrive, color: '#14b8a6', bg: '#f0fdfa' },
]

const IMAGE_LIST = [
  { id: 'IMG001', patientName: '张三', examType: '心脏彩超', studyDate: '2026-04-30', series: 3, images: 24, size: '1.2 GB', status: 'completed' },
  { id: 'IMG002', patientName: '李四', examType: '腹部彩超', studyDate: '2026-04-30', series: 2, images: 16, size: '856 MB', status: 'completed' },
  { id: 'IMG003', patientName: '王五', examType: '甲状腺', studyDate: '2026-04-29', series: 1, images: 8, size: '420 MB', status: 'pending' },
  { id: 'IMG004', patientName: '赵六', examType: '乳腺彩超', studyDate: '2026-04-29', series: 2, images: 12, size: '640 MB', status: 'completed' },
  { id: 'IMG005', patientName: '钱七', examType: '血管彩超', studyDate: '2026-04-28', series: 3, images: 20, size: '1.0 GB', status: 'completed' },
]

const TOOL_BUTTONS = [
  { icon: ZoomIn, label: '放大' },
  { icon: ZoomOut, label: '缩小' },
  { icon: RotateCw, label: '旋转' },
  { icon: FlipHorizontal, label: '镜像' },
  { icon: Sun, label: '亮度' },
  { icon: Contrast, label: '对比度' },
  { icon: Crop, label: '裁剪' },
  { icon: Maximize2, label: '全屏' },
]

const SERIES_THUMBNAILS = [
  { id: 1, label: '舒张期', icon: Heart },
  { id: 2, label: '收缩期', icon: Activity },
  { id: 3, label: '彩色血流', icon: Monitor },
]

// ---------- 组件 ----------
export default function ImagePage() {
  const [selectedImage, setSelectedImage] = useState(IMAGE_LIST[0])
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>影像管理</h1>
          <p style={s.subtitle}>
            图像采集 · 查看与分析 · 存储管理 · 后期处理
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnSecondary}>
            <RefreshCw size={14} color="#64748b" /> 刷新
          </button>
          <button style={s.btnSecondary}>
            <Download size={14} color="#64748b" /> 批量导出
          </button>
          <button style={s.btnPrimary}>
            <Camera size={14} /> 快速采集
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        {IMAGE_STATS.map((item) => (
          <div key={item.label} style={s.statCard}>
            <div style={{ ...s.statIconWrap, background: item.bg }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div style={s.statInfo}>
              <div style={s.statValue}>{item.value}</div>
              <div style={s.statLabel}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 主内容区 */}
      <div style={s.mainContent}>
        {/* 左侧列表 */}
        <div style={s.imageList}>
          <div style={s.listHeader}>
            <input type="text" placeholder="搜索患者或检查..." style={s.listSearch} />
            <button style={{ ...s.toolBtn, padding: 8 }}>
              <Grid size={14} color="#64748b" />
            </button>
          </div>
          <div style={s.listBody}>
            {IMAGE_LIST.map((img) => (
              <div
                key={img.id}
                style={{
                  ...s.thumbnailItem,
                  ...(selectedImage?.id === img.id ? s.thumbnailItemActive : {}),
                }}
                onClick={() => setSelectedImage(img)}
              >
                <div style={s.thumbnail}>
                  <Image size={24} color="#94a3b8" />
                </div>
                <div style={s.thumbnailInfo}>
                  <div style={s.thumbnailTitle}>{img.patientName}</div>
                  <div style={s.thumbnailMeta}>
                    {img.examType} · {img.images}张
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    {img.studyDate} · {img.size}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧预览 */}
        <div style={s.previewPanel}>
          {/* 预览头部 */}
          <div style={s.previewHeader}>
            <div style={s.previewTitle}>
              {selectedImage?.patientName} - {selectedImage?.examType}
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                {selectedImage?.series} 个序列 · {selectedImage?.images} 张图像
              </span>
            </div>
            <div style={s.previewTools}>
              <button style={s.toolBtn}>
                <Bookmark size={14} color="#64748b" />
              </button>
              <button style={s.toolBtn}>
                <Share2 size={14} color="#64748b" />
              </button>
              <button style={s.toolBtn}>
                <Printer size={14} color="#64748b" />
              </button>
              <button style={s.toolBtn}>
                <MoreHorizontal size={14} color="#64748b" />
              </button>
            </div>
          </div>

          {/* 工具栏 */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 4 }}>
            {TOOL_BUTTONS.map((btn) => (
              <button
                key={btn.label}
                style={s.toolBtn}
                title={btn.label}
              >
                <btn.icon size={14} color="#64748b" />
              </button>
            ))}
          </div>

          {/* 查看区 */}
          <div style={s.viewerArea}>
            <div style={s.viewerPlaceholder}>
              <Image size={64} color="#4a4a6a" style={{ marginBottom: 16 }} />
              <div style={{ fontSize: 14, color: '#6a6a8a' }}>超声图像预览区域</div>
              <div style={{ fontSize: 12, color: '#5a5a7a', marginTop: 8 }}>
                双击图像进入全屏查看模式
              </div>
            </div>
          </div>

          {/* 序列选择 */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>图像序列</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {SERIES_THUMBNAILS.map((series) => (
                <div
                  key={series.id}
                  style={{
                    width: 80, height: 60, borderRadius: 8,
                    background: '#f8fafc', border: '2px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <series.icon size={18} color="#64748b" />
                  <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{series.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 控制栏 */}
          <div style={s.controlBar}>
            <div style={s.controlGroup}>
              <Sun size={14} color="#64748b" />
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                style={s.slider}
              />
              <span style={{ fontSize: 11, color: '#94a3b8', width: 32 }}>{brightness}%</span>
            </div>
            <div style={s.controlGroup}>
              <Contrast size={14} color="#64748b" />
              <input
                type="range"
                min="0"
                max="100"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                style={s.slider}
              />
              <span style={{ fontSize: 11, color: '#94a3b8', width: 32 }}>{contrast}%</span>
            </div>
            <div style={{ ...s.controlGroup, gap: 12 }}>
              <button style={{ ...s.toolBtn, padding: '6px 12px' }}>
                <SkipBack size={14} color="#64748b" />
              </button>
              <button style={{ ...s.toolBtnActive, padding: '6px 12px' }}>
                <Play size={14} />
              </button>
              <button style={{ ...s.toolBtn, padding: '6px 12px' }}>
                <SkipForward size={14} color="#64748b" />
              </button>
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>1 / {selectedImage?.images}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
