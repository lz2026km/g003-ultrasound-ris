// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 超声成像模式页面
// 成像模式管理 / 模式设置 / 图像参数 / 模式对比
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, Plus, Settings, Eye,
  Activity, Radio, Waves, BarChart3, Sliders,
  ChevronRight, ChevronLeft, RefreshCw, CheckCircle,
  Monitor, Camera, Layers, Zap
} from 'lucide-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 模式卡片
  modeCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
    transition: 'all 0.2s', border: '2px solid transparent',
  },
  modeCardActive: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
    transition: 'all 0.2s', border: '2px solid #3b82f6',
  },
  modeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modeIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modeTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  modeDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.5 },
  modeTag: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8 },
  modeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  // 参数设置
  paramSection: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 },
  paramHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  paramTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  paramRow: { display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16 },
  paramLabel: { width: 120, fontSize: 13, color: '#64748b', flexShrink: 0 },
  paramValue: { flex: 1 },
  paramSlider: { width: '100%', height: 6, borderRadius: 3, background: '#e2e8f0', appearance: 'none', cursor: 'pointer' },
  paramValueNum: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginLeft: 12, minWidth: 40 },
  // 图像预览
  previewPanel: { background: '#1a1a2e', borderRadius: 12, padding: 24, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 },
  previewImage: { width: '100%', maxWidth: 400, height: 300, background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 },
  previewLabel: { color: '#fff', fontSize: 16, fontWeight: 600 },
  previewMeta: { display: 'flex', gap: 24, color: '#94a3b8', fontSize: 12 },
  // 模式对比
  comparisonGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  comparisonCard: { background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  comparisonImage: { width: '100%', height: 100, background: '#f8fafc', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#94a3b8' },
  comparisonTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  // 按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// 超声模式数据
const ULTRASOUND_MODES = [
  { id: 1, name: 'B模式', shortName: 'B-Mode', icon: Monitor, color: '#3b82f6', bg: '#eff6ff', desc: '二维灰阶成像，最基础的超声显像模式，用于显示组织结构', frequency: '2-12', depth: '2-20', gain: 50, settings: { frequency: 5, depth: 10, gain: 50, tint: 0, dynamic: 70 } },
  { id: 2, name: 'M模式', shortName: 'M-Mode', icon: Activity, color: '#22c55e', bg: '#f0fdf4', desc: '运动模式，用于显示心脏或胎儿运动的时间-运动曲线', frequency: '2-7', depth: '5-15', gain: 45, settings: { frequency: 3, depth: 8, gain: 45, sweep: 50, tint: 0 } },
  { id: 3, name: '彩色多普勒', shortName: 'Color', icon: Waves, color: '#ef4444', bg: '#fef2f2', desc: '彩色血流显像，显示血流方向和速度，用红蓝颜色编码', frequency: '2-8', depth: '3-15', gain: 55, settings: { frequency: 5, depth: 10, gain: 55, scale: 50, baseline: 50 } },
  { id: 4, name: '频谱多普勒', shortName: 'PW/CW', icon: Radio, color: '#f97316', bg: '#fff7ed', desc: '脉冲波和连续波多普勒，用于测量血流速度和阻力指数', frequency: '2-5', depth: '3-20', gain: 40, settings: { frequency: 4, depth: 12, gain: 40, angle: 60, gate: 3 } },
  { id: 5, name: '弹性成像', shortName: 'Elasto', icon: Layers, color: '#8b5cf6', bg: '#f5f3ff', desc: '组织弹性成像，通过评估组织硬度辅助诊断病变', frequency: '3-9', depth: '2-10', gain: 50, settings: { frequency: 6, depth: 6, gain: 50, elasticity: 50, strain: 40 } },
  { id: 6, name: '造影增强', shortName: 'CEUS', icon: Zap, color: '#14b8a6', bg: '#f0fdfa', desc: '超声造影增强显像，使用微泡造影剂增强血流信号', frequency: '1-6', depth: '5-20', gain: 60, settings: { frequency: 3, depth: 12, gain: 60, mi: 30, ci: 50 } },
]

export default function UltrasoundModesPage() {
  const [activeMode, setActiveMode] = useState(ULTRASOUND_MODES[0])
  const [settings, setSettings] = useState(activeMode.settings)
  const [compareMode, setCompareMode] = useState(false)

  const handleModeChange = (mode) => {
    setActiveMode(mode)
    setSettings(mode.settings)
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>超声成像模式</h1>
            <p style={s.subtitle}>成像模式管理 · 模式设置 · 图像参数 · 模式对比</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline} onClick={() => setCompareMode(!compareMode)}>
              <BarChart3 size={14} /> {compareMode ? '关闭对比' : '模式对比'}
            </button>
            <button style={s.btnOutline}><Download size={14} /> 导出参数</button>
            <button style={{ ...s.btn, ...s.btnPrimary }}><Settings size={14} /> 保存设置</button>
          </div>
        </div>
      </div>

      {/* 模式选择卡片 */}
      <div style={s.modeGrid}>
        {ULTRASOUND_MODES.map((mode) => (
          <div
            key={mode.id}
            style={activeMode.id === mode.id ? s.modeCardActive : s.modeCard}
            onClick={() => handleModeChange(mode)}
          >
            <div style={s.modeHeader}>
              <div style={{ ...s.modeIcon, background: mode.bg }}>
                <mode.icon size={22} color={mode.color} />
              </div>
              {activeMode.id === mode.id && (
                <span style={{ ...s.modeTag, background: '#3b82f6', color: '#fff' }}>
                  <CheckCircle size={10} style={{ marginRight: 4 }} /> 已选中
                </span>
              )}
            </div>
            <div style={s.modeTitle}>{mode.name}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>{mode.shortName}</div>
            <div style={s.modeDesc}>{mode.desc}</div>
          </div>
        ))}
      </div>

      {/* 模式对比 */}
      {compareMode && (
        <div style={s.paramSection}>
          <div style={s.paramHeader}>
            <div style={s.paramTitle}><Layers size={16} /> 模式对比</div>
          </div>
          <div style={s.comparisonGrid}>
            {ULTRASOUND_MODES.slice(0, 4).map((mode) => (
              <div key={mode.id} style={s.comparisonCard}>
                <div style={{ ...s.comparisonImage, borderBottom: `3px solid ${mode.color}` }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{mode.shortName}</div>
                  </div>
                </div>
                <div style={s.comparisonTitle}>{mode.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* 左侧：参数设置 */}
        <div>
          <div style={s.paramSection}>
            <div style={s.paramHeader}>
              <div style={s.paramTitle}><Settings size={16} /> 参数设置 - {activeMode.name}</div>
              <button style={s.btnOutline}><RefreshCw size={14} /> 恢复默认</button>
            </div>

            {/* 频率 */}
            <div style={s.paramRow}>
              <div style={s.paramLabel}>频率 (MHz)</div>
              <div style={s.paramValue}>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={settings.frequency}
                  onChange={(e) => updateSetting('frequency', Number(e.target.value))}
                  style={s.paramSlider}
                />
              </div>
              <div style={s.paramValueNum}>{settings.frequency} MHz</div>
            </div>

            {/* 深度 */}
            <div style={s.paramRow}>
              <div style={s.paramLabel}>深度 (cm)</div>
              <div style={s.paramValue}>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={settings.depth}
                  onChange={(e) => updateSetting('depth', Number(e.target.value))}
                  style={s.paramSlider}
                />
              </div>
              <div style={s.paramValueNum}>{settings.depth} cm</div>
            </div>

            {/* 增益 */}
            <div style={s.paramRow}>
              <div style={s.paramLabel}>增益 (dB)</div>
              <div style={s.paramValue}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.gain}
                  onChange={(e) => updateSetting('gain', Number(e.target.value))}
                  style={s.paramSlider}
                />
              </div>
              <div style={s.paramValueNum}>{settings.gain} dB</div>
            </div>

            {/* 谐波 */}
            {settings.tint !== undefined && (
              <div style={s.paramRow}>
                <div style={s.paramLabel}>组织谐波</div>
                <div style={s.paramValue}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.tint}
                    onChange={(e) => updateSetting('tint', Number(e.target.value))}
                    style={s.paramSlider}
                  />
                </div>
                <div style={s.paramValueNum}>{settings.tint}%</div>
              </div>
            )}

            {/* 动态范围 */}
            {settings.dynamic !== undefined && (
              <div style={s.paramRow}>
                <div style={s.paramLabel}>动态范围</div>
                <div style={s.paramValue}>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={settings.dynamic}
                    onChange={(e) => updateSetting('dynamic', Number(e.target.value))}
                    style={s.paramSlider}
                  />
                </div>
                <div style={s.paramValueNum}>{settings.dynamic} dB</div>
              </div>
            )}
          </div>

          {/* 模式说明 */}
          <div style={s.paramSection}>
            <div style={s.paramHeader}>
              <div style={s.paramTitle}><Eye size={16} /> 模式说明</div>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
              <p><strong>{activeMode.name}（{activeMode.shortName}）</strong></p>
              <p>{activeMode.desc}</p>
              <p style={{ marginTop: 12 }}>推荐参数：频率 {activeMode.frequency} MHz，深度 {activeMode.depth} cm</p>
            </div>
          </div>
        </div>

        {/* 右侧：图像预览 */}
        <div>
          <div style={s.paramSection}>
            <div style={s.paramHeader}>
              <div style={s.paramTitle}><Monitor size={16} /> 实时预览</div>
              <button style={s.btnOutline}><Camera size={14} /> 截图</button>
            </div>
            <div style={s.previewPanel}>
              <div style={s.previewImage}>
                <div style={{ textAlign: 'center' }}>
                  <Activity size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <div>实时超声图像</div>
                </div>
              </div>
              <div style={s.previewLabel}>{activeMode.name} 成像</div>
              <div style={s.previewMeta}>
                <span>频率: {settings.frequency} MHz</span>
                <span>深度: {settings.depth} cm</span>
                <span>增益: {settings.gain} dB</span>
              </div>
            </div>
          </div>

          {/* 当前模式信息 */}
          <div style={s.paramSection}>
            <div style={s.paramHeader}>
              <div style={s.paramTitle}><Sliders size={16} /> 当前模式信息</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>频率范围</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{activeMode.frequency} MHz</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>深度范围</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{activeMode.depth} cm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
