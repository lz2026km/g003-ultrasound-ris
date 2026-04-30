// @ts-nocheck
// G003 超声RIS - 报告撰写页面
import { useState } from 'react'
import { Save, Send, Printer, ArrowLeft, Image, FileText, Clock } from 'lucide-react'

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 40,
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 },
  card: {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', margin: '0 0 16px 0' },
  label: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', minHeight: 120, padding: '10px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#f8fafc', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  formRow: { marginBottom: 16 },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  imageGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16,
  },
  imageThumb: {
    aspectRatio: '4/3', background: '#f1f5f9', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: '2px solid transparent',
  },
  templateBtn: {
    display: 'block', width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
    fontSize: 13, color: '#475569', marginBottom: 8, textAlign: 'left' as const,
  },
}

export default function ReportWritePage() {
  const [report, setReport] = useState({
    finding: '',
    impression: '',
    diagnosis: '',
    suggestions: '',
  })

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 12px' }}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={s.title}>撰写检查报告</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Printer size={14} /> 打印模板
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}>
            <Save size={14} /> 保存
          </button>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Send size={14} /> 提交审核
          </button>
        </div>
      </div>

      <div style={s.layout}>
        <div>
          <div style={s.card}>
            <h2 style={s.cardTitle}>报告信息</h2>
            <div style={s.formRow}>
              <div style={s.label}>检查所见</div>
              <textarea
                style={{ ...s.textarea, minHeight: 180 }}
                placeholder="描述检查所见..."
                value={report.finding}
                onChange={e => setReport({ ...report, finding: e.target.value })}
              />
            </div>
            <div style={s.formRow}>
              <div style={s.label}>超声提示</div>
              <textarea
                style={s.textarea}
                placeholder="描述超声提示..."
                value={report.impression}
                onChange={e => setReport({ ...report, impression: e.target.value })}
              />
            </div>
            <div style={s.formRow}>
              <div style={s.label}>诊断意见</div>
              <textarea
                style={s.textarea}
                placeholder="输入诊断意见..."
                value={report.diagnosis}
                onChange={e => setReport({ ...report, diagnosis: e.target.value })}
              />
            </div>
            <div style={s.formRow}>
              <div style={s.label}>建议</div>
              <textarea
                style={s.textarea}
                placeholder="输入建议..."
                value={report.suggestions}
                onChange={e => setReport({ ...report, suggestions: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <div style={s.card}>
            <h2 style={s.cardTitle}>患者信息</h2>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>患者姓名</span>
              <span style={s.infoValue}>张伟</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>患者ID</span>
              <span style={s.infoValue}>P10001</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查类型</span>
              <span style={s.infoValue}>腹部超声</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查部位</span>
              <span style={s.infoValue}>肝胆脾胰</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查医生</span>
              <span style={s.infoValue}>李医生</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>检查设备</span>
              <span style={s.infoValue}>彩超仪 A</span>
            </div>
            <div style={{ ...s.infoRow, borderBottom: 'none' }}>
              <span style={s.infoLabel}>检查时间</span>
              <span style={s.infoValue}>2024-01-15 09:30</span>
            </div>
          </div>

          <div style={{ ...s.card, marginTop: 24 }}>
            <h2 style={s.cardTitle}>检查图像</h2>
            <div style={s.imageGrid}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={s.imageThumb}>
                  <Image size={24} color="#94a3b8" />
                </div>
              ))}
            </div>
            <button style={{ ...s.templateBtn, marginTop: 12, textAlign: 'center', color: '#3b82f6' }}>
              + 添加图像
            </button>
          </div>

          <div style={{ ...s.card, marginTop: 24 }}>
            <h2 style={s.cardTitle}>常用模板</h2>
            <button style={s.templateBtn}>腹部超声常规模板</button>
            <button style={s.templateBtn}>肝胆超声模板</button>
            <button style={s.templateBtn}>泌尿系统模板</button>
            <button style={s.templateBtn}>甲状腺模板</button>
          </div>
        </div>
      </div>
    </div>
  )
}
