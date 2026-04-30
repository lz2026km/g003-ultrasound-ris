import React, { useState, useMemo } from 'react';
import { Calendar, Plus, X, Users, Clock } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn } from '../App';
import type { WorkShift, UserRole } from '../types';

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
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf2',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '28px', minWidth: '480px', maxWidth: '560px',
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
};

// ===== 人员列表 =====
const PEOPLE = [
  { id: 'u001', name: '王主任', role: '医师' as UserRole, title: '主任医师' },
  { id: 'u002', name: '李主任', role: '医师' as UserRole, title: '主任医师' },
  { id: 'u003', name: '张主任', role: '医师' as UserRole, title: '副主任医师' },
  { id: 'u004', name: '李技师', role: '技师' as UserRole, title: '主管技师' },
  { id: 'u005', name: '王技师', role: '技师' as UserRole, title: '技师' },
  { id: 'u006', name: '赵技师', role: '技师' as UserRole, title: '技师' },
];

// ===== 班次颜色 =====
const SHIFT_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  '早班': { bg: '#dbeafe', border: '#3b82f6', label: '白' },
  '中班': { bg: '#fef3c7', border: '#f59e0b', label: '中' },
  '夜班': { bg: '#ede9fe', border: '#7c3aed', label: '夜' },
  '加班': { bg: '#fef2f2', border: '#ef4444', label: '加' },
  '休息': { bg: '#f1f5f9', border: '#94a3b8', label: '休' },
};

// ===== 模拟排班数据 =====
const generateInitialShifts = (): WorkShift[] => {
  const shifts: WorkShift[] = [];
  const people = PEOPLE;
  const shiftTypes: Array<'早班' | '中班' | '夜班' | '加班' | '休息'> = ['早班', '中班', '夜班', '加班', '休息'];
  
  // 生成一周的排班
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    people.forEach((person, idx) => {
      // 简单轮转排班
      const shiftIdx = (dayOffset + idx) % 5;
      const shiftType = shiftTypes[shiftIdx];
      
      if (shiftType !== '休息') {
        shifts.push({
          id: `shift_${dateStr}_${person.id}`,
          userId: person.id,
          userName: person.name,
          role: person.role,
          modality: person.role === '技师' ? 'CT' : '混合',
          shiftDate: dateStr,
          shiftType,
          startTime: shiftType === '早班' ? '08:00' : shiftType === '中班' ? '14:00' : '20:00',
          endTime: shiftType === '早班' ? '16:00' : shiftType === '中班' ? '22:00' : '08:00',
          note: '',
        });
      }
    });
  }
  
  return shifts;
};

// ===== 工具函数 =====
function getShiftStyle(shiftType: string) {
  return SHIFT_COLORS[shiftType] || SHIFT_COLORS['休息'];
}

export default function SchedulePage() {
  const [shifts, setShifts] = useState<WorkShift[]>(generateInitialShifts());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ date: string; userId: string } | null>(null);
  const [newShift, setNewShift] = useState({
    userId: '',
    shiftType: '早班' as WorkShift['shiftType'],
    shiftDate: '',
    startTime: '08:00',
    endTime: '16:00',
    note: '',
  });

  // 计算当前显示的7天
  const weekDays = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() + weekOffset * 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, [weekOffset]);

  // 星期几标签
  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `周${days[d.getDay()]}`;
  };

  // 获取指定日期指定人员的班次
  const getShiftForCell = (date: string, userId: string) => {
    return shifts.find(s => s.shiftDate === date && s.userId === userId);
  };

  // 添加排班
  const handleAddShift = () => {
    if (!newShift.userId || !newShift.shiftDate) {
      alert('请选择人员和日期');
      return;
    }
    const person = PEOPLE.find(p => p.id === newShift.userId);
    const newEntry: WorkShift = {
      id: `shift_${newShift.shiftDate}_${newShift.userId}_${Date.now()}`,
      userId: newShift.userId,
      userName: person?.name || '',
      role: person?.role || '医师',
      modality: person?.role === '技师' ? 'CT' : '混合',
      shiftDate: newShift.shiftDate,
      shiftType: newShift.shiftType,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      note: newShift.note,
    };
    
    // 如果已有班次则替换
    setShifts(prev => [
      ...prev.filter(s => !(s.shiftDate === newShift.shiftDate && s.userId === newShift.userId)),
      newEntry,
    ]);
    
    setShowAddModal(false);
    setNewShift({ userId: '', shiftType: '早班', shiftDate: '', startTime: '08:00', endTime: '16:00', note: '' });
  };

  // 点击格子打开添加弹窗
  const handleCellClick = (date: string, userId: string) => {
    const existing = getShiftForCell(date, userId);
    if (existing) {
      const person = PEOPLE.find(p => p.id === userId);
      const ok = window.confirm(`确定删除该班次（${person?.name || ''}）吗？`);
      if (!ok) return;
      setShifts(prev => prev.filter(s => s.id !== existing.id));
    } else {
      setSelectedCell({ date, userId });
      setNewShift(prev => ({ ...prev, shiftDate: date, userId }));
      setShowAddModal(true);
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <h1 style={S.pageTitle}>
        <Calendar size={24} />
        排班管理
      </h1>

      {/* 工具栏 */}
      <div style={S.toolbar}>
        <div style={S.toolbarLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{ ...S.btnSecondary, padding: '8px 12px' }}
              onClick={() => setWeekOffset(w => w - 1)}
            >
              ←
            </button>
            <span style={{ fontWeight: 600, color: '#1e293b', minWidth: '200px', textAlign: 'center' }}>
              {weekDays[0]} ~ {weekDays[6]}
            </span>
            <button
              style={{ ...S.btnSecondary, padding: '8px 12px' }}
              onClick={() => setWeekOffset(w => w + 1)}
            >
              →
            </button>
            <button
              style={{ ...S.btnSecondary, fontSize: '12px' }}
              onClick={() => setWeekOffset(0)}
            >
              今天
            </button>
          </div>

          {/* 图例 */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>图例：</span>
            {Object.entries(SHIFT_COLORS).map(([type, style]) => (
              <span
                key={type}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 8px', borderRadius: '4px',
                  backgroundColor: style.bg, border: `1px solid ${style.border}`,
                  fontSize: '12px', fontWeight: 500,
                }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div style={S.toolbarRight}>
          <SecondaryBtn style={{ gap: '6px' }}>
            <Users size={15} /> 人员管理
          </SecondaryBtn>
          <PrimaryBtn style={{ gap: '6px' }} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            添加排班
          </PrimaryBtn>
        </div>
      </div>

      {/* 日历网格 */}
      <div style={S.card}>
        {/* 表头 */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)', gap: '1px', marginBottom: '8px' }}>
          <div style={{ padding: '8px 12px', fontWeight: 700, fontSize: '13px', color: '#475569' }}>
            人员
          </div>
          {weekDays.map(date => (
            <div
              key={date}
              style={{
                padding: '8px 4px', textAlign: 'center',
                fontSize: '13px', fontWeight: 600, color: '#475569',
              }}
            >
              <div>{getDayLabel(date)}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{date}</div>
            </div>
          ))}
        </div>

        {/* 人员行 */}
        {PEOPLE.map(person => (
          <div
            key={person.id}
            style={{
              display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)',
              gap: '1px', marginBottom: '1px',
            }}
          >
            {/* 人员名称 */}
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, color: '#1e293b',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div>{person.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{person.title}</div>
            </div>

            {/* 日期格子 */}
            {weekDays.map(date => {
              const shift = getShiftForCell(date, person.id);
              
              return (
                <div
                  key={date}
                  onClick={() => handleCellClick(date, person.id)}
                  style={{
                    padding: '8px 4px',
                    minHeight: '60px',
                    backgroundColor: shift ? getShiftStyle(shift.shiftType).bg : 'white',
                    border: `1px solid ${shift ? getShiftStyle(shift.shiftType).border : '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                    gap: '2px',
                  }}
                >
                  {shift ? (() => {
                      const shiftStyle = getShiftStyle(shift.shiftType);
                      return (
                        <>
                          <span style={{
                            fontSize: '11px', fontWeight: 700,
                            color: shiftStyle.border,
                          }}>
                            {shiftStyle.label}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>
                            {shift.startTime}-{shift.endTime}
                          </span>
                        </>
                      );
                    })() : (
                    <Plus size={14} style={{ color: '#cbd5e1' }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 添加排班弹窗 */}
      {showAddModal && (
        <div style={S.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <Calendar size={20} />
              添加排班
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '4px', display: 'flex',
                }}
              >
                <X size={20} style={{ color: '#64748b' }} />
              </button>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>选择人员</label>
              <select
                style={S.select}
                value={newShift.userId}
                onChange={e => setNewShift(s => ({ ...s, userId: e.target.value }))}
              >
                <option value="">请选择人员</option>
                {PEOPLE.map(p => (
                  <option key={p.id} value={p.id}>{p.name}（{p.title}）</option>
                ))}
              </select>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>班次类型</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['早班', '中班', '夜班', '加班', '休息'] as const).map(type => (
                  <span
                    key={type}
                    onClick={() => setNewShift(s => ({ ...s, shiftType: type }))}
                    style={{
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 500,
                      backgroundColor: newShift.shiftType === type ? SHIFT_COLORS[type].bg : '#f1f5f9',
                      border: `1px solid ${newShift.shiftType === type ? SHIFT_COLORS[type].border : '#e2e8f0'}`,
                      color: newShift.shiftType === type ? SHIFT_COLORS[type].border : '#475569',
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>日期</label>
              <input
                type="date"
                style={S.input}
                value={newShift.shiftDate}
                onChange={e => setNewShift(s => ({ ...s, shiftDate: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>开始时间</label>
                <input
                  type="time"
                  style={S.input}
                  value={newShift.startTime}
                  onChange={e => setNewShift(s => ({ ...s, startTime: e.target.value }))}
                />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>结束时间</label>
                <input
                  type="time"
                  style={S.input}
                  value={newShift.endTime}
                  onChange={e => setNewShift(s => ({ ...s, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>备注（可选）</label>
              <input
                type="text"
                style={S.input}
                placeholder="备注信息"
                value={newShift.note}
                onChange={e => setNewShift(s => ({ ...s, note: e.target.value }))}
              />
            </div>

            <div style={S.modalFooter}>
              <SecondaryBtn onClick={() => setShowAddModal(false)}>取消</SecondaryBtn>
              <PrimaryBtn onClick={handleAddShift}>确认添加</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
