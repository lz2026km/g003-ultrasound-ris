// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 报告模板页面
// 模板管理 / 模板编辑 / 标准化模板 / 科室模板
// ============================================================
import { useState } from 'react'
import {
  FileText, Folder, Plus, Search, Filter, Edit, Trash2,
  Copy, Download, Upload, Eye, MoreHorizontal, ChevronRight,
  Stethoscope, Heart, Activity, Users, Clock, Star,
  Settings, RefreshCw, CheckCircle, AlertCircle, File
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
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16,
  },
  statIconWrap: {
    width: 52, height: 52, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  // 主布局
  mainContent: {
    display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16,
  },
  // 左侧分类
  categoryPanel: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  categoryItem: {
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
    transition: 'all 0.2s', fontSize: 13,
  },
  categoryItemActive: {
    background: '#eff6ff', color: '#3b82f6', fontWeight: 600,
  },
  categoryCount: {
    marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 10,
    background: '#f1f5f9', color: '#64748b',
  },
  // 右侧模板列表
  templateList: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  listHeader: {
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  searchInput: {
    flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, outline: 'none',
  },
  // 模板卡片网格
  templateGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20,
  },
  templateCard: {
    border: '1px solid #f1f5f9', borderRadius: 12, padding: 16,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  templateCardHover: {
    borderColor: '#3b82f6', boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
  },
  templateHeader: {
    display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12,
  },
  templateIcon: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  templateType: { fontSize: 11, color: '#94a3b8' },
  templateDesc: {
    fontSize: 12, color: '#64748b', lineHeight: 1.5,
    marginBottom: 12, minHeight: 36,
  },
  templateFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTop: '1px solid #f1f5f9',
  },
  templateMeta: { fontSize: 11, color: '#94a3b8' },
  templateActions: { display: 'flex', gap: 4 },
  // 标签
  tag: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    fontSize: 10, fontWeight: 600, marginRight: 4,
  },
  // 模态框
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#fff', borderRadius: 16, padding: 24, width: 600,
    maxHeight: '80vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  textarea: {
    width: '100%', minHeight: 200, padding: 12, borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'monospace',
    resize: 'vertical', outline: 'none', lineHeight: 1.6,
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
const TEMPLATE_STATS = [
  { label: '模板总数', value: 86, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
  { label: '系统模板', value: 42, icon: Settings, color: '#22c55e', bg: '#f0fdf4' },
  { label: '科室模板', value: 38, icon: Users, color: '#f97316', bg: '#fff7ed' },
  { label: '个人模板', value: 6, icon: Star, color: '#8b5cf6', bg: '#f5f3ff' },
]

const CATEGORIES = [
  { id: 'all', name: '全部模板', icon: FileText, count: 86 },
  { id: 'cardiac', name: '心脏彩超', icon: Heart, count: 18 },
  { id: 'abdominal', name: '腹部彩超', icon: Stethoscope, count: 22 },
  { id: 'vascular', name: '血管彩超', icon: Activity, count: 15 },
  { id: 'thyroid', name: '甲状腺', icon: Activity, count: 12 },
  { id: 'breast', name: '乳腺', icon: Users, count: 10 },
  { id: 'custom', name: '自定义', icon: File, count: 9 },
]

const TEMPLATES = [
  {
    id: 'T001',
    name: '心脏彩超标准报告',
    type: '系统模板',
    category: 'cardiac',
    desc: '标准心脏彩超检查报告模板，包含M型、二维、多普勒等完整结构',
    author: '系统管理员',
    updateTime: '2026-04-20',
    usageCount: 1256,
    tags: ['标准', '常用'],
    icon: Heart,
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    id: 'T002',
    name: '腹部彩超检查模板',
    type: '系统模板',
    category: 'abdominal',
    desc: '适用于肝胆脾胰肾等腹部脏器常规检查',
    author: '系统管理员',
    updateTime: '2026-04-18',
    usageCount: 2341,
    tags: ['标准', '常用'],
    icon: Stethoscope,
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    id: 'T003',
    name: '颈动脉狭窄评估',
    type: '科室模板',
    category: 'vascular',
    desc: '颈动脉内中膜厚度及狭窄率评估专用模板',
    author: '超声科',
    updateTime: '2026-04-15',
    usageCount: 876,
    tags: ['评估'],
    icon: Activity,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    id: 'T004',
    name: '甲状腺结节TI-RADS',
    type: '科室模板',
    category: 'thyroid',
    desc: '甲状腺结节TI-RADS分级评估报告模板',
    author: '超声科',
    updateTime: '2026-04-22',
    usageCount: 1542,
    tags: ['分级'],
    icon: Activity,
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    id: 'T005',
    name: '乳腺BI-RADS评估',
    type: '系统模板',
    category: 'breast',
    desc: '乳腺超声BI-RADS分类标准报告模板',
    author: '系统管理员',
    updateTime: '2026-04-10',
    usageCount: 1893,
    tags: ['标准', '分级'],
    icon: Users,
    color: '#f97316',
    bg: '#fff7ed',
  },
  {
    id: 'T006',
    name: '下肢静脉曲张评估',
    type: '个人模板',
    category: 'vascular',
    desc: '下肢深浅静脉瓣膜功能评估（个人定制）',
    author: '王医生',
    updateTime: '2026-04-25',
    usageCount: 234,
    tags: ['个人'],
    icon: Activity,
    color: '#14b8a6',
    bg: '#f0fdfa',
  },
]

const TEMPLATE_CONTENT = `【检查部位】
心脏

【检查方法】
M型超声、二维超声、彩色多普勒、频谱多普勒

【检查所见】
1. 心脏位置、形态：正常
2. 各房室大小：左房{}mm，左室{}mm，室间隔{}mm，左室后壁{}mm
3. 主动脉根部：内径{}mm
4. 肺动脉：内径{}mm
5. 房间隔、室间隔：连续完整
6. 各瓣膜形态、结构：未见异常
7. 彩色多普勒：各瓣口未见明显反流信号
8. 心包腔：未见积液

【检查结论】
1. 心脏结构及功能未见明显异常
2. 建议：定期复查

【备注】
报告医师：__________ 审核医师：__________ 日期：__________`

// ---------- 组件 ----------
export default function TemplatePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchCategory = activeCategory === 'all' || t.category === activeCategory
    const matchSearch = t.name.includes(searchTerm) || t.desc.includes(searchTerm)
    return matchCategory && matchSearch
  })

  const handleEdit = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setShowEditor(true)
  }

  const getTypeBadgeStyle = (type: string) => {
    if (type === '系统模板') return { background: '#eff6ff', color: '#3b82f6' }
    if (type === '科室模板') return { background: '#fff7ed', color: '#f97316' }
    return { background: '#f5f3ff', color: '#8b5cf6' }
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>报告模板</h1>
          <p style={s.subtitle}>
            标准化报告模板 · 科室模板管理 · 模板编辑与维护
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnSecondary}>
            <Upload size={14} color="#64748b" /> 导入模板
          </button>
          <button style={s.btnSecondary}>
            <Download size={14} color="#64748b" /> 导出
          </button>
          <button style={s.btnPrimary}>
            <Plus size={14} /> 新建模板
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        {TEMPLATE_STATS.map((item) => (
          <div key={item.label} style={s.statCard}>
            <div style={{ ...s.statIconWrap, background: item.bg }}>
              <item.icon size={24} color={item.color} />
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
        {/* 左侧分类 */}
        <div style={s.categoryPanel}>
          <div style={s.categoryTitle}>
            <Folder size={14} color="#64748b" /> 模板分类
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              style={{
                ...s.categoryItem,
                ...(activeCategory === cat.id ? s.categoryItemActive : {}),
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon size={14} />
              {cat.name}
              <span style={s.categoryCount}>{cat.count}</span>
            </div>
          ))}
        </div>

        {/* 右侧模板列表 */}
        <div style={s.templateList}>
          <div style={s.listHeader}>
            <input
              type="text"
              placeholder="搜索模板名称或描述..."
              style={s.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button style={s.btnSecondary}>
              <Filter size={14} color="#64748b" /> 筛选
            </button>
          </div>

          <div style={s.templateGrid}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  ...s.templateCard,
                  ...(hoveredCard === template.id ? s.templateCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(template.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={s.templateHeader}>
                  <div style={{ ...s.templateIcon, background: template.bg }}>
                    <template.icon size={20} color={template.color} />
                  </div>
                  <div style={s.templateInfo}>
                    <div style={s.templateName}>{template.name}</div>
                    <div style={s.templateType}>{template.type}</div>
                  </div>
                </div>
                <div style={s.templateDesc}>{template.desc}</div>
                <div style={{ marginBottom: 12 }}>
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        ...s.tag,
                        background: tag === '标准' ? '#eff6ff' : tag === '常用' ? '#f0fdf4' : '#f5f3ff',
                        color: tag === '标准' ? '#3b82f6' : tag === '常用' ? '#22c55e' : '#8b5cf6',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={s.templateFooter}>
                  <div style={s.templateMeta}>
                    使用 {template.usageCount} 次 · {template.updateTime}
                  </div>
                  <div style={s.templateActions}>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Eye size={14} color="#64748b" />
                    </button>
                    <button
                      style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); handleEdit(template) }}
                    >
                      <Edit size={14} color="#3b82f6" />
                    </button>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Copy size={14} color="#64748b" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 模板编辑器模态框 */}
      {showEditor && selectedTemplate && (
        <div style={s.modal} onClick={() => setShowEditor(false)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>编辑模板：{selectedTemplate.name}</div>
              <button
                style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}
                onClick={() => setShowEditor(false)}
              >
                <AlertCircle size={20} color="#64748b" />
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 8, display: 'block' }}>
                模板内容
              </label>
              <textarea
                style={s.textarea}
                defaultValue={TEMPLATE_CONTENT}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={s.btnSecondary} onClick={() => setShowEditor(false)}>取消</button>
              <button style={s.btnPrimary}>
                <CheckCircle size={14} /> 保存模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
