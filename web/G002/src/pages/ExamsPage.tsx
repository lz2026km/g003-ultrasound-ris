import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Plus, Clock, CheckCircle, X, Bell, Mic } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card } from '../App';
import { initialExams, initialPatients, initialEquipment, initialExamItems } from '../data/initialData';
import type { Exam, ExamStatus, Priority, Patient, ExamItem, Equipment, Modality } from '../types';

const MODALITY_GROUPS: Record<string, string[]> = {
  'CT': ['CT'],
  'MR': ['MR'],
  'DR': ['DR'],
  '超声': ['超声'],
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [patients] = useState<Patient[]>(initialPatients);
  const [equipment] = useState<Equipment[]>(initialEquipment);
  const [examItems] = useState<ExamItem[]>(initialExamItems);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');

  // 预约状态管理（本地状态，不在 Exam 类型中）
  const [appointmentStatuses, setAppointmentStatuses] = useState<Record<string, string>>({});

  // P0-8: 叫号功能状态
  const [callQueue, setCallQueue] = useState<string[]>([]);
  const [currentCall, setCurrentCall] = useState<string>('');

  // 新增预约模态框
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    examItemId: '',
    equipmentId: '',
    scheduledDate: '',
    scheduledTime: '',
    requestingPhysician: '',
    clinicalDiagnosis: '',
  });
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const getPatient = (patientId: string) => patients.find(p => p.id === patientId);
  const getExamItem = (examItemId: string) => examItems.find(e => e.id === examItemId);
  const getEquipment = (equipmentId: string) => equipment.find(eq => eq.id === equipmentId);
  const getAppointmentStatus = (examId: string, examStatus: string) => {
    return appointmentStatuses[examId] ||
      (examStatus === '已完成' ? '已完成' :
        examStatus === '已取消' ? '已取消' :
          examStatus === '已登记' ? '已完成' :
            '待确认');
  };

  // 按模态分组获取检查项目
  const groupedExamItems = useMemo(() => {
    const groups: Record<string, ExamItem[]> = {};
    examItems.forEach(item => {
      const mod = item.modality;
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(item);
    });
    return groups;
  }, [examItems]);

  // 获取可用设备（按模态筛选）
  const getAvailableEquipment = (modality: string) => {
    return equipment.filter(eq => eq.modality === modality && eq.status === '正常') as Equipment[];
  };

  // 筛选检查列表
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const patient = getPatient(exam.patientId);
      const matchSearch =
        exam.accessionNumber.includes(searchTerm) ||
        patient?.name.includes(searchTerm) ||
        exam.examItemName.includes(searchTerm);
      const matchStatus = statusFilter === '全部' || exam.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [exams, patients, searchTerm, statusFilter]);

  // 处理新增预约
  const handleCreateAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.examItemId || !newAppointment.scheduledDate || !newAppointment.scheduledTime) {
      alert('请填写完整信息');
      return;
    }

    const examItem = getExamItem(newAppointment.examItemId);
    const newExam: Exam = {
      id: `exam${Date.now()}`,
      patientId: newAppointment.patientId,
      accessionNumber: `ACC${Date.now()}`,
      examItemId: newAppointment.examItemId,
      examItemName: examItem?.name || '',
      modality: (examItem?.modality || 'CT') as Modality,
      bodyPart: examItem?.bodyPart || '',
      scheduledDate: newAppointment.scheduledDate,
      scheduledTime: newAppointment.scheduledTime,
      clinicalDiagnosis: newAppointment.clinicalDiagnosis,
      requestingPhysician: newAppointment.requestingPhysician,
      status: '已预约',
      priority: '普通',
      studyInstanceUID: `1.2.840.113619.2.${Date.now()}`,
      charge: examItem?.price || 0,
    };

    setExams(prev => [...prev, newExam]);
    setAppointmentStatuses(prev => ({ ...prev, [newExam.id]: '待确认' }));
    setShowNewAppointmentModal(false);
    setNewAppointment({
      patientId: '',
      examItemId: '',
      equipmentId: '',
      scheduledDate: '',
      scheduledTime: '',
      requestingPhysician: '',
      clinicalDiagnosis: '',
    });
    setPatientSearchTerm('');
    alert('预约成功！');
  };

  // 处理预约状态变更
  const handleUpdateStatus = (examId: string, newStatus: ExamStatus) => {
    setExams(prev => prev.map(exam =>
      exam.id === examId ? { ...exam, status: newStatus } : exam
    ));
    // 同步更新本地预约状态
    const statusMap: Record<string, string> = {
      '已预约': '已确认',
      '已登记': '已完成',
      '已完成': '已完成',
      '待确认': '待确认',
      '已取消': '已取消',
    };
    if (statusMap[newStatus]) {
      setAppointmentStatuses(prev => ({ ...prev, [examId]: statusMap[newStatus] }));
    }
  };

  // P0-8: 叫号功能（从 alert 升级为状态条显示）
  const handleCall = (exam: Exam) => {
    const patient = getPatient(exam.patientId);
    const eq = equipment.find(e => e.modality === exam.modality && e.status === '正常');
    const msg = `请 [${patient?.name || '未知'}] 到 [${eq?.name || exam.modality}] 检查`;
    setCurrentCall(msg);
    setCallQueue(prev => [...prev.filter(m => m !== msg), msg]);
    // 3秒后自动清除
    setTimeout(() => setCurrentCall(''), 3000);
  };

  // 根据状态获取操作按钮
  const getActionButtons = (exam: Exam, appointmentStatus: string) => {
    const buttons: React.ReactNode[] = [];

    if (appointmentStatus === '待确认') {
      buttons.push(
        <button
          key="confirm"
          onClick={() => handleUpdateStatus(exam.id, '已预约')}
          style={{ ...{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' } }}
        >
          确认
        </button>
      );
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleUpdateStatus(exam.id, '已取消')}
          style={{ ...{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' } }}
        >
          取消
        </button>
      );
    }

    if (appointmentStatus === '已确认') {
      buttons.push(
        <button
          key="register"
          onClick={() => handleUpdateStatus(exam.id, '已登记')}
          style={{ ...{ backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' } }}
        >
          登记
        </button>
      );
      buttons.push(
        <button
          key="call"
          onClick={() => handleCall(exam)}
          style={{ ...{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' } }}
        >
          <Mic size={14} />
          叫号
        </button>
      );
    }

    return buttons;
  };

  // 过滤患者列表（用于下拉搜索）
  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm) return patients.slice(0, 10);
    const term = patientSearchTerm.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.phone.includes(term)
    ).slice(0, 10);
  }, [patients, patientSearchTerm]);

  // 状态徽章颜色映射
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '已确认': return <Badge type="green"><CheckCircle size={12} />{status}</Badge>;
      case '已登记': return <Badge type="blue">{status}</Badge>;
      case '待确认': return <Badge type="yellow">{status}</Badge>;
      case '已取消': return <Badge type="red">{status}</Badge>;
      case '已完成': return <Badge type="purple">{status}</Badge>;
      default: return <Badge type="gray">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageTitle>
        <Calendar size={26} />
        检查预约
      </PageTitle>

      {/* 工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        {/* 左侧：搜索框 + 状态下拉 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="搜索预约号、患者姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 14px 9px 36px',
                fontSize: '14px',
                width: '240px',
                outline: 'none',
                color: '#1e293b',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '14px',
              color: '#1e293b',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            <option value="全部">全部状态</option>
            <option value="已确认">已确认</option>
            <option value="待确认">待确认</option>
            <option value="已取消">已取消</option>
            <option value="已完成">已完成</option>
          </select>
        </div>

        {/* 右侧：新增按钮 */}
        <PrimaryBtn onClick={() => setShowNewAppointmentModal(true)}>
          <Plus size={16} />
          新增检查预约
        </PrimaryBtn>
      </div>

      {/* 表格卡片 */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ maxWidth: '1600px', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            color: '#1e293b',
          }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>预约号</th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>患者姓名</th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>检查项目</th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>设备</th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>日期时间</th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>状态</th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => {
                const patient = getPatient(exam.patientId);
                const examItem = getExamItem(exam.examItemId);
                const appointmentStatus = getAppointmentStatus(exam.id, exam.status);
                // TODO: Exam缺少equipmentId字段，无法精确匹配设备。当前按模态+状态模糊查找，可能选错设备
                const availableEq = equipment.find(e => e.modality === exam.modality && e.status === '正常');

                return (
                  <tr key={exam.id} style={{ cursor: 'pointer' }}>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    }}>
                      {exam.accessionNumber}
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      fontWeight: 600,
                    }}>
                      {patient?.name || '未知'}
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                    }}>
                      <div>{exam.examItemName}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{exam.modality}</div>
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                    }}>
                      {availableEq?.name || examItem?.modality || '-'}
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                    }}>
                      <div>{exam.scheduledDate}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{exam.scheduledTime}</div>
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                    }}>
                      {getStatusBadge(appointmentStatus)}
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                    }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {getActionButtons(exam, appointmentStatus)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 空状态 */}
        {filteredExams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            暂无检查记录
          </div>
        )}

        {/* 记录数 */}
        <div style={{ padding: '16px', fontSize: '14px', color: '#64748b', borderTop: '1px solid #f1f5f9' }}>
          共 {filteredExams.length} 条记录
        </div>
      </Card>

      {/* 新增预约模态框 */}
      {showNewAppointmentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setShowNewAppointmentModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '28px',
              minWidth: '560px',
              maxWidth: '720px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框标题 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                新增检查预约
              </h2>
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#475569',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 患者选择 */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                患者选择 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="搜索患者姓名、ID或电话..."
                  value={patientSearchTerm || (newAppointment.patientId ? getPatient(newAppointment.patientId)?.name : '')}
                  onChange={(e) => {
                    setPatientSearchTerm(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#1e293b',
                  }}
                />
                {showPatientDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    maxHeight: '200px',
                    overflow: 'auto',
                    zIndex: 100,
                  }}>
                    {filteredPatients.length === 0 ? (
                      <div style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '14px' }}>未找到患者</div>
                    ) : (
                      filteredPatients.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setNewAppointment(prev => ({ ...prev, patientId: p.id }));
                            setPatientSearchTerm(p.name);
                            setShowPatientDropdown(false);
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                        >
                          {p.name} - {p.id} - {p.phone}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 检查项目（按模态分组） */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                检查项目 *
              </label>
              <select
                value={newAppointment.examItemId}
                onChange={(e) => {
                  setNewAppointment(prev => ({
                    ...prev,
                    examItemId: e.target.value,
                    equipmentId: '',
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  color: '#1e293b',
                  cursor: 'pointer',
                }}
              >
                <option value="">请选择检查项目</option>
                {Object.entries(MODALITY_GROUPS).map(([mod, _]) => (
                  <optgroup key={mod} label={mod}>
                    {groupedExamItems[mod]?.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.duration}分钟)
                      </option>
                    ))}
                  </optgroup>
                ))}
                {Object.entries(groupedExamItems)
                  .filter(([mod]) => !MODALITY_GROUPS[mod])
                  .map(([mod, items]) => (
                    <optgroup key={mod} label={mod}>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.duration}分钟)
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </div>

            {/* 设备选择 */}
            {newAppointment.examItemId && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  设备选择
                </label>
                <select
                  value={newAppointment.equipmentId}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, equipmentId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    color: '#1e293b',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">请选择设备</option>
                  {getAvailableEquipment(examItems.find(i => i.id === newAppointment.examItemId)?.modality || '').map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.modality})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 日期时间 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  预约日期 *
                </label>
                <input
                  type="date"
                  value={newAppointment.scheduledDate}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#1e293b',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  预约时间 *
                </label>
                <input
                  type="time"
                  value={newAppointment.scheduledTime}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#1e293b',
                  }}
                />
              </div>
            </div>

            {/* 申请医生 */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                申请医生
              </label>
              <input
                type="text"
                placeholder="请输入申请医生姓名"
                value={newAppointment.requestingPhysician}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, requestingPhysician: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#1e293b',
                }}
              />
            </div>

            {/* 临床诊断 */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                临床诊断
              </label>
              <input
                type="text"
                placeholder="请输入临床诊断"
                value={newAppointment.clinicalDiagnosis}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, clinicalDiagnosis: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#1e293b',
                }}
              />
            </div>

            {/* 底部按钮 */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #f1f5f9',
            }}>
              <SecondaryBtn onClick={() => setShowNewAppointmentModal(false)}>
                取消
              </SecondaryBtn>
              <PrimaryBtn onClick={handleCreateAppointment}>
                确认预约
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {/* P0-8: 叫号通知条（固定底部中央） */}
      {currentCall && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1677ff',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 18,
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          📢 {currentCall}
        </div>
      )}
    </div>
  );
}
