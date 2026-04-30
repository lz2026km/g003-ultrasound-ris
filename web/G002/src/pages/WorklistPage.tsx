import React, { useState, useMemo } from 'react';
import { ClipboardList, Search, Calendar, Filter, CheckCircle, X, Download, Upload } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn } from '../App';
import type { MWLItem, Priority } from '../types';

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
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const },
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
    padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  trHover: { backgroundColor: '#f8fafc' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 600,
  },
  badgeBlue: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
  badgeGreen: { backgroundColor: '#f0fdf4', color: '#16a34a' },
  badgeYellow: { backgroundColor: '#fffbeb', color: '#d97706' },
  badgeRed: { backgroundColor: '#fef2f2', color: '#dc2626' },
  badgeGray: { backgroundColor: '#f1f5f9', color: '#475569' },
  badgePurple: { backgroundColor: '#f5f3ff', color: '#7c3aed' },
  checkbox: {
    width: '16px', height: '16px', cursor: 'pointer',
    accentColor: '#1d4ed8',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    color: '#94a3b8', fontSize: '14px',
  },
  selectedBar: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', backgroundColor: '#eff6ff',
    borderRadius: '8px', marginBottom: '16px',
    fontSize: '14px', color: '#1d4ed8',
  },
};

// ===== 模拟MWL数据 =====
const initialMWLItems: MWLItem[] = [
  {
    id: 'mwl001', patientId: 'pat001', patientName: '王建国', patientGender: '男', patientAge: 69,
    patientBirthDate: '1956-03-15', patientPhone: '13800138001',
    accessionNumber: 'MWL20250428001', examItemId: 'ei011', examItemName: '头颅CT平扫',
    modality: 'CT', bodyPart: '头颅', scheduledDate: '2025-04-28', scheduledTime: '09:00',
    clinicalDiagnosis: '头晕伴右侧肢体无力2小时', requestingPhysician: '张神经',
    status: '已预约', priority: '急诊',
    studyInstanceUID: '1.2.840.113619.2.55.3.2025042801', referringPhysicianName: '张神经',
  },
  {
    id: 'mwl002', patientId: 'pat002', patientName: '张美玲', patientGender: '女', patientAge: 42,
    patientBirthDate: '1983-03-22', patientPhone: '13900139002',
    accessionNumber: 'MWL20250428002', examItemId: 'ei012', examItemName: '胸部CT平扫',
    modality: 'CT', bodyPart: '胸部', scheduledDate: '2025-04-28', scheduledTime: '10:00',
    clinicalDiagnosis: '咳嗽伴痰中带血2周', requestingPhysician: '赵呼吸',
    status: '已预约', priority: '普通',
    studyInstanceUID: '1.2.840.113619.2.55.3.2025042802', referringPhysicianName: '赵呼吸',
  },
  {
    id: 'mwl003', patientId: 'pat003', patientName: '王大军', patientGender: '男', patientAge: 65,
    patientBirthDate: '1960-11-08', patientPhone: '13700137003',
    accessionNumber: 'MWL20250428003', examItemId: 'ei024', examItemName: '腰椎MRI平扫',
    modality: 'MR', bodyPart: '腰椎', scheduledDate: '2025-04-28', scheduledTime: '09:30',
    clinicalDiagnosis: '腰痛3月，加重1周', requestingPhysician: '孙骨科',
    status: '已登记', priority: '普通',
    studyInstanceUID: '1.2.840.113619.2.55.3.2025042803', referringPhysicianName: '孙骨科',
  },
  {
    id: 'mwl004', patientId: 'pat004', patientName: '陈晓燕', patientGender: '女', patientAge: 35,
    patientBirthDate: '1990-07-14', patientPhone: '13600136004',
    accessionNumber: 'MWL20250428004', examItemId: 'ei001', examItemName: '胸部正位片（DR）',
    modality: 'DR', bodyPart: '胸部', scheduledDate: '2025-04-28', scheduledTime: '08:30',
    clinicalDiagnosis: '常规体检', requestingPhysician: '王全科',
    status: '已预约', priority: '普通',
    studyInstanceUID: '1.2.840.113619.2.55.3.2025042804', referringPhysicianName: '王全科',
  },
  {
    id: 'mwl005', patientId: 'pat005', patientName: '刘国强', patientGender: '男', patientAge: 72,
    patientBirthDate: '1953-01-30', patientPhone: '13500135005',
    accessionNumber: 'MWL20250429001', examItemId: 'ei021', examItemName: '头颅MRI平扫',
    modality: 'MR', bodyPart: '头颅', scheduledDate: '2025-04-29', scheduledTime: '10:00',
    clinicalDiagnosis: '反复头痛2月余', requestingPhysician: '张神经',
    status: '已预约', priority: '优先',
    studyInstanceUID: '1.2.840.113619.2.55.3.2025042901', referringPhysicianName: '张神经',
  },
  {
    id: 'mwl006', patientId: 'pat006', patientName: '李小红', patientGender: '女', patientAge: 37,
    patientBirthDate: '1988-05-20', patientPhone: '13800138006',
    accessionNumber: 'MWL20250429002', examItemId: 'ei010', examItemName: '乳腺钼靶摄影',
    modality: '乳腺钼靶', bodyPart: '乳腺', scheduledDate: '2025-04-29', scheduledTime: '14:00',
    clinicalDiagnosis: '乳腺体检筛查', requestingPhysician: '李乳腺',
    status: '已预约', priority: '普通',
    studyInstanceUID: '1.2.840.113619.2.55.3.2025042902', referringPhysicianName: '李乳腺',
  },
];

// ===== 工具函数 =====
function getStatusBadgeType(status: string): 'blue' | 'green' | 'yellow' | 'gray' {
  switch (status) {
    case '已预约': return 'blue';
    case '已登记': return 'yellow';
    case '已完成': return 'green';
    case '已取消': return 'gray';
    default: return 'gray';
  }
}

function getPriorityBadgeType(priority: string): 'red' | 'yellow' | 'gray' {
  switch (priority) {
    case '急诊': return 'red';
    case '优先': return 'yellow';
    default: return 'gray';
  }
}

export default function WorklistPage() {
  const [items, setItems] = useState<MWLItem[]>(initialMWLItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [priorityFilter, setPriorityFilter] = useState<string>('全部');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // 筛选
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch =
        item.patientName.includes(searchTerm) ||
        item.accessionNumber.includes(searchTerm) ||
        item.examItemName.includes(searchTerm);
      const matchDate = item.scheduledDate === dateFilter;
      const matchStatus = statusFilter === '全部' || item.status === statusFilter;
      const matchPriority = priorityFilter === '全部' || item.priority === priorityFilter;
      return matchSearch && matchDate && matchStatus && matchPriority;
    });
  }, [items, searchTerm, dateFilter, statusFilter, priorityFilter]);

  // 全选
  const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItems.has(i.id));
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  // 单选
  const handleSelect = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  // 批量登记
  const handleBatchRegister = () => {
    if (selectedItems.size === 0) {
      alert('请先选择要登记的检查项');
      return;
    }
    const ok = window.confirm(`确认批量登记 ${selectedItems.size} 项？`);
    if (!ok) return;
    setItems(prev => prev.map(item =>
      selectedItems.has(item.id)
        ? { ...item, status: '已登记' as const }
        : item
    ));
    setSelectedItems(new Set());
    alert(`已批量登记 ${selectedItems.size} 项`);
  };

  // 导出CSV
  const handleExport = () => {
    const headers = ['患者姓名', '检查项目', '模态', '预约日期', '预约时间', '状态'];
    const rows = filteredItems.map(item => [
      item.patientName, item.examItemName, item.modality,
      item.scheduledDate, item.scheduledTime, item.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worklist_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* 页面标题 */}
      <h1 style={S.pageTitle}>
        <ClipboardList size={24} />
        DICOM Worklist 工作列表
      </h1>

      {/* 工具栏 */}
      <div style={S.toolbar}>
        <div style={S.toolbarLeft}>
          {/* 搜索 */}
          <div style={S.searchWrap}>
            <Search size={16} style={S.searchIcon} />
            <input
              style={S.searchInput}
              placeholder="搜索患者姓名/登记号/检查项目..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 日期筛选 */}
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ ...S.searchInput, width: '160px', paddingLeft: '14px' }}
          />

          {/* 状态筛选 */}
          <div style={S.filterGroup}>
            {['全部', '已预约', '已登记', '已完成'].map(s => (
              <span
                key={s}
                style={{ ...S.filterTag, ...(statusFilter === s ? S.filterTagActive : {}) }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </span>
            ))}
          </div>

          {/* 优先级筛选 */}
          <div style={S.filterGroup}>
            {['全部', '急诊', '优先', '普通'].map(p => (
              <span
                key={p}
                style={{ ...S.filterTag, ...(priorityFilter === p ? S.filterTagActive : {}) }}
                onClick={() => setPriorityFilter(p)}
              >
                {p === '急诊' ? '🔴' : p === '优先' ? '🟡' : p === '普通' ? '⚪' : ''} {p}
              </span>
            ))}
          </div>
        </div>

        <div style={S.toolbarRight}>
          <SecondaryBtn style={{ gap: '6px' }} onClick={handleExport}>
            <Download size={15} /> 导出
          </SecondaryBtn>
          <SecondaryBtn style={{ gap: '6px' }}>
            <Upload size={15} /> 导入
          </SecondaryBtn>
          <PrimaryBtn
            onClick={handleBatchRegister}
            disabled={selectedItems.size === 0}
            style={{ gap: '6px' }}
          >
            <CheckCircle size={16} />
            批量登记 ({selectedItems.size})
          </PrimaryBtn>
        </div>
      </div>

      {/* 已选择提示条 */}
      {selectedItems.size > 0 && (
        <div style={S.selectedBar}>
          <CheckCircle size={18} />
          已选择 <strong>{selectedItems.size}</strong> 项 ·
          <span
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => setSelectedItems(new Set())}
          >
            清除选择
          </span>
        </div>
      )}

      {/* 表格 */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  style={S.checkbox}
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>登记号</th>
              <th>患者姓名</th>
              <th>性别</th>
              <th>年龄</th>
              <th>检查项目</th>
              <th>模态</th>
              <th>检查部位</th>
              <th>预约日期</th>
              <th>预约时间</th>
              <th>申请医生</th>
              <th>优先级</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={13} style={S.emptyState}>
                  暂无数据
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr
                  key={item.id}
                  style={{
                    ...S.trHover,
                    backgroundColor: selectedItems.has(item.id) ? '#eff6ff' : hoveredRow === item.id ? '#f8fafc' : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>
                    <input
                      type="checkbox"
                      style={S.checkbox}
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{item.accessionNumber}</td>
                  <td style={{ fontWeight: 600 }}>{item.patientName}</td>
                  <td>{item.patientGender}</td>
                  <td>{item.patientAge}</td>
                  <td>{item.examItemName}</td>
                  <td>
                    <Badge type="blue">{item.modality}</Badge>
                  </td>
                  <td>{item.bodyPart}</td>
                  <td>{item.scheduledDate}</td>
                  <td>{item.scheduledTime}</td>
                  <td>{item.requestingPhysician}</td>
                  <td>
                    <Badge type={getPriorityBadgeType(item.priority)}>
                      {item.priority === '急诊' ? '🔴' : item.priority === '优先' ? '🟡' : ''} {item.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge type={getStatusBadgeType(item.status)}>{item.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
