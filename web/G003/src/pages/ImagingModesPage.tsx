import React, { useState } from 'react'
import {
  Scan, Microscope, Camera, Eye, AlertTriangle,
  CheckCircle2, Image, Lightbulb, Info
} from 'lucide-react'

interface ModeInfo {
  id: string
  name: string
  fullName: string
  shortDesc: string
  color: string
  bgColor: string
  clinicalUse: string[]
  normalFindings: string
  abnormalFindings: string[]
  imageNote: string
}

const imagingModes: ModeInfo[] = [
  {
    id: 'WL', name: '白光成像', fullName: 'White Light Imaging', shortDesc: '标准超声检查模式，自然白光照明，显示组织真实颜色',
    color: '#e6edf3', bgColor: '#1a1a2e',
    clinicalUse: ['常规筛查', '病变大体形态观察', '初步评估', '治疗随访'],
    normalFindings: '黏膜呈淡粉红色，光滑，血管纹理清晰可见',
    abnormalFindings: ['黏膜充血/发红', '溃疡/糜烂', '肿块/新生物', '颜色改变', '血管消失'],
    imageNote: '白光模式：标准白光下观察，记录病变整体外观'
  },
  {
    id: 'NBI', name: '窄带成像', fullName: 'Narrow Band Imaging',
    shortDesc: '利用窄波蓝光（415nm）和绿光（540nm），强调黏膜表面微结构和浅层血管',
    color: '#58a6ff', bgColor: '#0d1b3e',
    clinicalUse: ['早期癌变诊断', ' Barrett食管评估', '结直肠息肉分类', '胃早癌筛查', '微血管观察'],
    normalFindings: '黏膜表面纹理清晰，IPCL（上皮内毛细血管袢）规则排列，呈褐色',
    abnormalFindings: ['IPCL不规则扩张', '血管密度增加', '病变边界清晰', 'brownish dots（茶褐色点）'],
    imageNote: 'NBI模式：清晰显示黏膜表面微结构和浅层血管，对比度增强'
  },
  {
    id: 'SFI', name: '智能光源成像', fullName: 'Smart Framework Imaging',
    shortDesc: '开立医疗专利技术，可变光谱成像，实现高亮度、高对比度成像',
    color: '#3fb950', bgColor: '#0d2616',
    clinicalUse: ['消化道早癌筛查', '精准定位', '边界界定', '微小病变发现'],
    normalFindings: '黏膜表面结构清晰，边界清楚，色彩层次分明',
    abnormalFindings: ['病变区域与正常组织边界更清晰', '表面结构不规则', '异常着色区域'],
    imageNote: 'SFI模式：宽光谱混合照明，实现高亮度、高对比度的临床成像'
  },
  {
    id: 'ISE', name: '可变硬度', fullName: 'Incremental Stiffness Enteroscopy',
    shortDesc: '调控镜身软硬度，改善插入性，便于完成复杂病变检查和治疗',
    color: '#a371f7', bgColor: '#1a0d2e',
    clinicalUse: ['浅表超声检查', '小肠检查', '复杂病变治疗', '术后粘连患者'],
    normalFindings: '镜身软硬度可调，插入顺畅，患者不适感降低',
    abnormalFindings: ['硬度不可调', '插入阻力增加'],
    imageNote: '可变硬度模式：非成像功能，为检查操作提供更好的镜身控制'
  },
  {
    id: 'BCE', name: '蓝光电子染色', fullName: 'Blue Coordinate Electronic',
    shortDesc: '电子染色技术，模拟色素超声探头效果，无需喷洒染色剂即可观察病变',
    color: '#f0b429', bgColor: '#2e1f0a',
    clinicalUse: ['早期食管癌筛查', '胃早癌评估', '幽门螺杆菌感染相关改变', '萎缩/肠上皮化生评估'],
    normalFindings: '食管鳞状上皮呈淡蓝色调，黏膜下血管网隐约可见',
    abnormalFindings: ['上皮内血管袢改变', '黏膜色调改变', '病灶边界突出'],
    imageNote: 'BCE模式：电子染色增强黏膜对比，减少色素超声探头的使用'
  },
  {
    id: 'AFI', name: '自动荧光成像', fullName: 'Autofluorescence Imaging',
    shortDesc: '利用组织自发荧光特性，正常组织发绿光，肿瘤组织发红色/紫色荧光',
    color: '#f85149', bgColor: '#2e0d0d',
    clinicalUse: ['早癌筛查', '病变定位', '手术边界评估'],
    normalFindings: '正常黏膜发淡绿色（绿荧光）',
    abnormalFindings: ['肿瘤/异型增生呈红紫色（异常荧光）', '边界不规则', 'AFI亮度减低区域'],
    imageNote: 'AFI模式：自发荧光成像，正常绿色/肿瘤紫红色，需结合NBI/白光鉴别'
  },
]

const s: Record<string, React.CSSProperties> = {
  root: { padding: 32, minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8b949e', marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 20 },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' },
  cardHeader: { padding: '14px 20px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 10 },
  cardBody: { padding: 20 },
  modeTag: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' },
  modeName: { fontSize: 16, fontWeight: 700, color: '#e6edf3' },
  modeFullName: { fontSize: 12, color: '#8b949e' },
  desc: { fontSize: 13, color: '#8b949e', lineHeight: 1.6, marginBottom: 14 },
  sectionTitle: { fontSize: 12, color: '#8b949e', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: { padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  findingsList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 },
  findingItem: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 },
  alertBox: { padding: '10px 14px', borderRadius: 8, marginTop: 12, display: 'flex', gap: 10, alignItems: 'flex-start' },
  note: { padding: '10px 14px', background: '#21262d', borderRadius: 8, fontSize: 12, color: '#8b949e', lineHeight: 1.6, marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-start' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#8b949e' },
}

export default function ImagingModesPage() {
  const [selected, setSelected] = useState(imagingModes[0])
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = selected.id === '' ? imagingModes : imagingModes.filter(m =>
    m.name.includes(searchTerm) || m.fullName.includes(searchTerm) || m.id.includes(searchTerm)
  )

  return (
    <div style={s.root}>
      <div style={s.title}>🔬 超声探头成像模式介绍</div>
      <div style={s.subtitle}>了解各种成像技术的原理、临床应用和图像特征，辅助精准诊断</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {imagingModes.map(m => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid', cursor: 'pointer',
              minHeight: 44, display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              borderColor: selected.id === m.id ? m.color : '#30363d',
              background: selected.id === m.id ? `${m.color}22` : '#161b22',
              color: selected.id === m.id ? m.color : '#8b949e',
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{m.id}</span>
            {m.name}
          </button>
        ))}
      </div>

      <div style={s.grid}>
        {/* 选中模式详情 */}
        <div style={s.card}>
          <div style={{ ...s.cardHeader, borderLeft: `4px solid ${selected.color}`, background: selected.bgColor }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ ...s.modeTag, background: `${selected.color}22`, color: selected.color }}>{selected.id}</span>
                <span style={s.modeName}>{selected.name}</span>
              </div>
              <div style={s.modeFullName}>{selected.fullName}</div>
            </div>
          </div>
          <div style={s.cardBody}>
            <div style={s.desc}>{selected.shortDesc}</div>

            <div style={s.sectionTitle}>🔍 临床应用</div>
            <div style={s.tagRow}>
              {selected.clinicalUse.map(use => (
                <span key={use} style={{ ...s.tag, background: `${selected.color}18`, color: selected.color, border: `1px solid ${selected.color}44` }}>
                  {use}
                </span>
              ))}
            </div>

            <div style={s.sectionTitle}>✅ 正常表现</div>
            <div style={{ ...s.alertBox, background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.3)' }}>
              <CheckCircle2 size={15} color="#3fb950" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6 }}>{selected.normalFindings}</span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={s.sectionTitle}>⚠️ 异常表现</div>
              <ul style={s.findingsList}>
                {selected.abnormalFindings.map(f => (
                  <li key={f} style={s.findingItem}>
                    <AlertTriangle size={13} color="#f0b429" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: '#8b949e' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={s.note}>
              <Info size={13} color="#58a6ff" style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{selected.imageNote}</span>
            </div>
          </div>
        </div>

        {/* 成像模式对比 */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <Lightbulb size={16} color="#f0b429" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>各模式快速对比</span>
          </div>
          <div style={s.cardBody}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['模式', '成像原理', '主要用途'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: '#8b949e', fontWeight: 500, borderBottom: '1px solid #30363d' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {imagingModes.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #21262d', background: selected.id === m.id ? `${m.color}11` : 'transparent' }}>
                    <td style={{ padding: '8px 6px', fontSize: 12 }}>
                      <span style={{ fontFamily: 'monospace', color: m.color, fontWeight: 700 }}>{m.id}</span>
                    </td>
                    <td style={{ padding: '8px 6px', fontSize: 12, color: '#8b949e' }}>{m.shortDesc.slice(0, 25)}...</td>
                    <td style={{ padding: '8px 6px', fontSize: 12, color: '#8b949e' }}>{m.clinicalUse[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 临床应用流程 */}
      <div style={{ marginTop: 24, background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Camera size={16} color="#58a6ff" /> 标准检查流程（推荐）
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            ['1', '白光 WL', '常规筛查，整体观察', '#58a6ff'],
            ['2', 'NBI/AFI', '可疑区域进一步观察', '#3fb950'],
            ['3', '染色/放大', '精确评估病变边界和微血管', '#a371f7'],
            ['4', '活检/治疗', '取样或超声探头下治疗', '#f85149'],
          ].map(([step, mode, desc, color]) => (
            <React.Fragment key={step}>
              <div style={{ padding: '12px 16px', background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 10, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0d1117' }}>{step}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color }}>{mode}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>{desc}</div>
              </div>
              {step !== '4' && <div style={{ color: '#30363d', fontSize: 18 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
