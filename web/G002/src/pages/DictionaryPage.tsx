import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, X, Search, Edit2, Trash2 } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn } from '../App';
import type { DictionaryEntry, Modality } from '../types';

// ===== S 样式系统 =====
const S: Record<string, React.CSSProperties> = {
  pageTitle: {
    fontSize: '22px', fontWeight: 700, color: '#0f172a',
    marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px',
    letterSpacing: '0.2px',
  },
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px', gap: '16px',
  },
  toolbarLeft: { display: 'flex', gap: '10px', alignItems: 'center', flex: 1 },
  toolbarRight: { display: 'flex', gap: '10px', alignItems: 'center' },
  searchInput: {
    backgroundColor: 'white', border: '1px solid #cbd5e1',
    borderRadius: '8px', padding: '9px 14px 9px 38px',
    fontSize: '14px', width: '280px', outline: 'none',
    color: '#1e293b', transition: 'border-color 0.15s',
  },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' as const },
  filterTag: {
    padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: '1px solid #e2e8f0',
    backgroundColor: 'white', color: '#475569',
    transition: 'all 0.15s',
  },
  filterTagActive: {
    backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8',
    boxShadow: '0 1px 4px rgba(29,78,216,0.3)',
  },
  btnPrimary: {
    backgroundColor: '#1d4ed8', color: 'white',
    border: 'none', borderRadius: '8px',
    padding: '9px 18px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 1px 4px rgba(29,78,216,0.3)',
    transition: 'all 0.15s',
  },
  btnSecondary: {
    backgroundColor: 'white', color: '#475569',
    border: '1px solid #cbd5e1', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf2',
  },
  tabBar: {
    display: 'flex', gap: '4px', borderBottom: '2px solid #f1f5f9',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 18px', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', borderBottom: '2px solid transparent',
    marginBottom: '-2px', color: '#64748b',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#1d4ed8', borderBottomColor: '#1d4ed8', fontWeight: 600,
  },
  table: {
    width: '100%', borderCollapse: 'collapse',
    fontSize: '14px', color: '#1e293b',
  },
  th: {
    textAlign: 'left', padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '13px', fontWeight: 700, color: '#475569',
    letterSpacing: '0.3px', whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  trHover: { backgroundColor: '#f8fafc' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 600,
  },
  badgeGreen: { backgroundColor: '#f0fdf4', color: '#16a34a' },
  badgeGray: { backgroundColor: '#f1f5f9', color: '#475569' },
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '28px', minWidth: '520px', maxWidth: '640px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: '18px', fontWeight: 700, color: '#0f172a',
    marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  formGroup: { marginBottom: '18px' },
  formLabel: {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: '#374151', marginBottom: '6px',
  },
  input: {
    backgroundColor: 'white', border: '1px solid #cbd5e1',
    borderRadius: '8px', padding: '9px 14px',
    fontSize: '14px', color: '#1e293b', outline: 'none',
    transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
  },
  select: {
    backgroundColor: 'white', border: '1px solid #cbd5e1',
    borderRadius: '8px', padding: '9px 14px',
    fontSize: '14px', color: '#1e293b', outline: 'none',
    cursor: 'pointer', width: '100%', boxSizing: 'border-box',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9',
  },
  actionBtn: {
    padding: '5px 8px', borderRadius: '4px', cursor: 'pointer',
    background: 'none', border: '1px solid #e2e8f0',
    display: 'inline-flex', alignItems: 'center',
    transition: 'all 0.15s',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    color: '#94a3b8', fontSize: '14px',
  },
};

// ===== 字典类型 =====
type DictCategory = '检查项目' | '检查分组' | '检查部位' | '术语对照' | '收费项目';
const CATEGORIES: DictCategory[] = ['检查项目', '检查分组', '检查部位', '术语对照', '收费项目'];

// ===== 模拟字典数据 =====
const initialDictionaryEntries: DictionaryEntry[] = [
  // 检查项目
  { id: 'd001', category: '检查项目', code: 'CT_HEAD', name: '头颅CT平扫', pinyin: 'touyingCTpingsao', modality: 'CT', isActive: true, sortOrder: 1 },
  { id: 'd002', category: '检查项目', code: 'CT_CHEST', name: '胸部CT平扫', pinyin: 'xiongbuCTpingsao', modality: 'CT', isActive: true, sortOrder: 2 },
  { id: 'd003', category: '检查项目', code: 'MR_HEAD', name: '头颅MRI平扫', pinyin: 'touyingMRpingsao', modality: 'MR', isActive: true, sortOrder: 3 },
  { id: 'd004', category: '检查项目', code: 'DR_CHEST', name: '胸部正位片（DR）', pinyin: 'xiongbuzhengweipian', modality: 'DR', isActive: true, sortOrder: 4 },
  { id: 'd005', category: '检查项目', code: 'US_ABD', name: '腹部超声', pinyin: 'fubuChaosheng', modality: '超声', isActive: true, sortOrder: 5 },
  
  // 检查分组
  { id: 'd006', category: '检查分组', code: 'GRP_CT', name: 'CT检查组', pinyin: 'CTjainchazu', modality: 'CT', isActive: true, sortOrder: 1 },
  { id: 'd007', category: '检查分组', code: 'GRP_MR', name: 'MRI检查组', pinyin: 'MRIjainchazu', modality: 'MR', isActive: true, sortOrder: 2 },
  { id: 'd008', category: '检查分组', code: 'GRP_DR', name: 'X线检查组', pinyin: 'Xxianjainchazu', modality: 'DR', isActive: true, sortOrder: 3 },
  
  // 检查部位
  { id: 'd009', category: '检查部位', code: 'BP_HEAD', name: '头颅', pinyin: 'touying', isActive: true, sortOrder: 1 },
  { id: 'd010', category: '检查部位', code: 'BP_CHEST', name: '胸部', pinyin: 'xiongbu', isActive: true, sortOrder: 2 },
  { id: 'd011', category: '检查部位', code: 'BP_ABD', name: '腹部', pinyin: 'fubu', isActive: true, sortOrder: 3 },
  { id: 'd012', category: '检查部位', code: 'BP_SPINE', name: '脊柱', pinyin: 'jizhu', isActive: true, sortOrder: 4 },
  { id: 'd013', category: '检查部位', code: 'BP_LIMB', name: '四肢', pinyin: 'sizhi', isActive: true, sortOrder: 5 },
  
  // 术语对照
  { id: 'd014', category: '术语对照', code: 'TERM_001', name: '肺占位', alias: '肺部肿块', pinyin: 'feizhanwei', standardCode: 'R91', isActive: true, sortOrder: 1 },
  { id: 'd015', category: '术语对照', code: 'TERM_002', name: '脑梗塞', alias: '脑梗死', pinyin: 'naogengsai', standardCode: 'I63.9', isActive: true, sortOrder: 2 },
  { id: 'd016', category: '术语对照', code: 'TERM_003', name: '胆囊结石', alias: '胆石症', pinyin: 'dannangjieshi', standardCode: 'K80.2', isActive: true, sortOrder: 3 },
  
  // 收费项目
  { id: 'd017', category: '收费项目', code: 'CHG_001', name: 'CT平扫（次）', pinyin: 'CTpingsao', modality: '通用', isActive: true, sortOrder: 1 },
  { id: 'd018', category: '收费项目', code: 'CHG_002', name: 'MRI平扫（次）', pinyin: 'MRIpingsao', modality: '通用', isActive: true, sortOrder: 2 },
  { id: 'd019', category: '收费项目', code: 'CHG_003', name: 'DR摄影（部位）', pinyin: 'DRsheying', modality: '通用', isActive: true, sortOrder: 3 },
  { id: 'd020', category: '收费项目', code: 'CHG_004', name: '超声检查（部位）', pinyin: 'chaoshengjiance', modality: '通用', isActive: true, sortOrder: 4 },
];

// ===== 工具函数 =====
function getCategoryBadgeType(category: DictCategory): 'blue' | 'purple' | 'green' | 'yellow' | 'gray' {
  switch (category) {
    case '检查项目': return 'blue';
    case '检查分组': return 'purple';
    case '检查部位': return 'green';
    case '术语对照': return 'yellow';
    case '收费项目': return 'gray';
    default: return 'gray';
  }
}

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>(initialDictionaryEntries);
  const [activeTab, setActiveTab] = useState<DictCategory>('检查项目');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    category: '检查项目' as DictCategory,
    code: '',
    name: '',
    alias: '',
    pinyin: '',
    standardCode: '',
    modality: '通用' as Modality | '通用',
    isActive: true,
  });

  // 筛选
  const filteredEntries = useMemo(() => {
    return entries
      .filter(e => e.category === activeTab)
      .filter(e => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          e.name.toLowerCase().includes(term) ||
          e.code.toLowerCase().includes(term) ||
          e.pinyin?.toLowerCase().includes(term) ||
          e.alias?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [entries, activeTab, searchTerm]);

  // 每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [entries]);

  // 添加字典项
  const handleAdd = () => {
    if (!newEntry.code || !newEntry.name) {
      alert('请填写代码和名称');
      return;
    }
    if (entries.some(item => item.code === newEntry.code)) {
      alert(`编码 [${newEntry.code}] 已存在，请使用其他编码`);
      return;
    }
    const entry: DictionaryEntry = {
      id: `dict_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category: newEntry.category,
      code: newEntry.code,
      name: newEntry.name,
      alias: newEntry.alias || undefined,
      pinyin: newEntry.pinyin || undefined,
      standardCode: newEntry.standardCode || undefined,
      modality: newEntry.modality,
      isActive: newEntry.isActive,
      sortOrder: entries.filter(e => e.category === newEntry.category).length + 1,
    };
    setEntries(prev => [...prev, entry]);
    setShowAddModal(false);
    setNewEntry({ category: '检查项目', code: '', name: '', alias: '', pinyin: '', standardCode: '', modality: '通用', isActive: true });
  };

  // 删除字典项
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条字典记录吗？')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  // 编辑字典项
  const handleEdit = (entry: DictionaryEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      category: entry.category,
      code: entry.code,
      name: entry.name,
      alias: entry.alias || '',
      pinyin: entry.pinyin || '',
      standardCode: entry.standardCode || '',
      modality: entry.modality || '通用',
      isActive: entry.isActive,
    });
    setShowAddModal(true);
  };

  // 更新字典项
  const handleUpdate = () => {
    if (!editingEntry || !newEntry.code || !newEntry.name) {
      alert('请填写代码和名称');
      return;
    }
    setEntries(prev => prev.map(e =>
      e.id === editingEntry.id
        ? {
            ...e,
            code: newEntry.code,
            name: newEntry.name,
            alias: newEntry.alias || undefined,
            pinyin: newEntry.pinyin || undefined,
            standardCode: newEntry.standardCode || undefined,
            modality: newEntry.modality,
            isActive: newEntry.isActive,
          }
        : e
    ));
    setShowAddModal(false);
    setEditingEntry(null);
    setNewEntry({ category: '检查项目', code: '', name: '', alias: '', pinyin: '', standardCode: '', modality: '通用', isActive: true });
  };

  return (
    <div>
      {/* 页面标题 */}
      <h1 style={S.pageTitle}>
        <BookOpen size={24} />
        数据字典
      </h1>

      {/* 工具栏 */}
      <div style={S.toolbar}>
        <div style={S.toolbarLeft}>
          {/* 搜索 */}
          <div style={S.searchWrap}>
            <Search size={16} style={S.searchIcon} />
            <input
              style={S.searchInput}
              placeholder="搜索代码/名称/拼音/别名..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={S.toolbarRight}>
          <PrimaryBtn style={{ gap: '6px' }} onClick={() => {
            setEditingEntry(null);
            setNewEntry({ category: activeTab, code: '', name: '', alias: '', pinyin: '', standardCode: '', modality: '通用', isActive: true });
            setShowAddModal(true);
          }}>
            <Plus size={16} />
            添加条目
          </PrimaryBtn>
        </div>
      </div>

      {/* 分类标签页 */}
      <div style={S.card}>
        <div style={S.tabBar}>
          {CATEGORIES.map(cat => (
            <span
              key={cat}
              style={{
                ...S.tab,
                ...(activeTab === cat ? S.tabActive : {}),
              }}
              onClick={() => {
                setActiveTab(cat);
                setSearchTerm('');
              }}
            >
              {cat}
              <span style={{
                marginLeft: '6px',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: activeTab === cat ? '#1d4ed8' : '#f1f5f9',
                color: activeTab === cat ? 'white' : '#64748b',
              }}>
                {categoryCounts[cat] || 0}
              </span>
            </span>
          ))}
        </div>

        {/* 表格 */}
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>代码</th>
              <th>名称</th>
              <th>别名</th>
              <th>拼音</th>
              <th>标准码</th>
              <th>模态</th>
              <th>状态</th>
              <th style={{ width: '100px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} style={S.emptyState}>
                  暂无数据
                </td>
              </tr>
            ) : (
              filteredEntries.map(entry => (
                <tr
                  key={entry.id}
                  style={{
                    ...S.trHover,
                    backgroundColor: hoveredRow === entry.id ? '#f8fafc' : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredRow(entry.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>
                    {entry.code}
                  </td>
                  <td style={{ fontWeight: 600 }}>{entry.name}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{entry.alias || '-'}</td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>{entry.pinyin || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{entry.standardCode || '-'}</td>
                  <td>
                    <Badge type="blue">{entry.modality || '通用'}</Badge>
                  </td>
                  <td>
                    <Badge type={entry.isActive ? 'green' : 'gray'}>
                      {entry.isActive ? '启用' : '停用'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      style={{ ...S.actionBtn, marginRight: '6px' }}
                      onClick={() => handleEdit(entry)}
                      title="编辑"
                    >
                      <Edit2 size={14} style={{ color: '#64748b' }} />
                    </button>
                    <button
                      style={{ ...S.actionBtn }}
                      onClick={() => handleDelete(entry.id)}
                      title="删除"
                    >
                      <Trash2 size={14} style={{ color: '#dc2626' }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <div style={S.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <BookOpen size={20} />
              {editingEntry ? '编辑字典条目' : '添加字典条目'}
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                }}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '4px', display: 'flex',
                }}
              >
                <X size={20} style={{ color: '#64748b' }} />
              </button>
            </div>

            {!editingEntry && (
              <div style={S.formGroup}>
                <label style={S.formLabel}>字典分类</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                  {CATEGORIES.map(cat => (
                    <span
                      key={cat}
                      onClick={() => setNewEntry(s => ({ ...s, category: cat }))}
                      style={{
                        padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 500,
                        backgroundColor: newEntry.category === cat ? '#eff6ff' : '#f1f5f9',
                        border: `1px solid ${newEntry.category === cat ? '#3b82f6' : '#e2e8f0'}`,
                        color: newEntry.category === cat ? '#1d4ed8' : '#475569',
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>代码 *</label>
                <input
                  type="text"
                  style={S.input}
                  placeholder="如: CT_HEAD"
                  value={newEntry.code}
                  onChange={e => setNewEntry(s => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>名称 *</label>
                <input
                  type="text"
                  style={S.input}
                  placeholder="如: 头颅CT平扫"
                  value={newEntry.name}
                  onChange={e => setNewEntry(s => ({ ...s, name: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>别名</label>
                <input
                  type="text"
                  style={S.input}
                  placeholder="如: 肺部肿块"
                  value={newEntry.alias}
                  onChange={e => setNewEntry(s => ({ ...s, alias: e.target.value }))}
                />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>拼音</label>
                <input
                  type="text"
                  style={S.input}
                  placeholder="如: touyingCTpingsao"
                  value={newEntry.pinyin}
                  onChange={e => setNewEntry(s => ({ ...s, pinyin: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>标准码</label>
                <input
                  type="text"
                  style={S.input}
                  placeholder="如: ICD-10编码"
                  value={newEntry.standardCode}
                  onChange={e => setNewEntry(s => ({ ...s, standardCode: e.target.value }))}
                />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>适用模态</label>
                <select
                  style={S.select}
                  value={newEntry.modality}
                  onChange={e => setNewEntry(s => ({ ...s, modality: e.target.value as Modality | '通用' }))}
                >
                  <option value="通用">通用</option>
                  <option value="CT">CT</option>
                  <option value="MR">MR</option>
                  <option value="DR">DR</option>
                  <option value="超声">超声</option>
                  <option value="乳腺钼靶">乳腺钼靶</option>
                  <option value="胃肠造影">胃肠造影</option>
                </select>
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={{ ...S.formLabel, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={newEntry.isActive}
                  onChange={e => setNewEntry(s => ({ ...s, isActive: e.target.checked }))}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                启用此条目
              </label>
            </div>

            <div style={S.modalFooter}>
              <SecondaryBtn onClick={() => {
                setShowAddModal(false);
                setEditingEntry(null);
              }}>
                取消
              </SecondaryBtn>
              <PrimaryBtn onClick={editingEntry ? handleUpdate : handleAdd}>
                {editingEntry ? '保存修改' : '确认添加'}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
