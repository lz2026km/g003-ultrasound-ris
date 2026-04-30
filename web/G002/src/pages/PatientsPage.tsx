import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Clock, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card, SectionTitle } from '../App';
import { initialPatients, initialExams, initialReports, initialEquipment, initialExamItems } from '../data/initialData';
import type { Patient, Exam, Report } from '../types';

// ===== S 是从 App.tsx 导入的全局样式系统 =====
// 已通过 import { Badge, PrimaryBtn, ... } from '../App' 获取

const statusColors: Record<string, { bg: string; color: string }> = {
  '已完成': { bg: '#d1fae5', color: '#065f46' },
  '检查中': { bg: '#fef3c7', color: '#92400e' },
  '已预约': { bg: '#dbeafe', color: '#1e40af' },
  '已登记': { bg: '#ede9fe', color: '#5b21b6' },
};

export default function PatientsPage() {
  const [patients] = useState<Patient[]>(initialPatients);
  const [localAdditionalPatients, setLocalAdditionalPatients] = useState<Patient[]>([]);
  const allPatients = [...patients, ...localAdditionalPatients];
  const [exams] = useState<Exam[]>(initialExams);
  const [reports] = useState<Report[]>(initialReports);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'male' | 'female' | 'thisWeek' | 'critical'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // CRUD 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const emptyPatient: Patient = {
    id: '',
    name: '',
    gender: '男',
    birthDate: '',
    idCard: '',
    phone: '',
    address: '',
    medicalRecordNo: '',
    age: 0,
  };
  const [formData, setFormData] = useState<Patient>(emptyPatient);

  // 计算年龄
  const calcAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // 打开新增模态框
  const openAddModal = () => {
    setFormData(emptyPatient);
    setEditingPatient(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (patient: Patient) => {
    setFormData({ ...patient });
    setEditingPatient(patient);
    setModalVisible(true);
  };

  // 新增患者
  const handleAddPatient = (data: Patient) => {
    const age = calcAge(data.birthDate);
    const newPatient: Patient = {
      ...data,
      id: `local_${Date.now()}`,
      registrationDate: new Date().toISOString().split('T')[0],
      age,
    };
    setLocalAdditionalPatients(prev => [...prev, newPatient]);
    setModalVisible(false);
    setFormData(emptyPatient);
    alert(`患者 [${data.name}] 添加成功`);
  };

  // 编辑患者
  const handleEditPatient = (data: Patient) => {
    if (!editingPatient) return;
    if (!editingPatient.id.startsWith('local_')) {
      alert('演示模式下，初始患者记录不可编辑（正式系统应调用API修改）');
      return;
    }
    const age = calcAge(data.birthDate);
    const updated = { ...data, age };
    setLocalAdditionalPatients(prev => prev.map(p => p.id === editingPatient.id ? updated : p));
    setModalVisible(false);
    setEditingPatient(null);
    alert(`患者 [${data.name}] 信息已更新`);
  };

  // 删除患者
  const handleDeletePatient = (patientId: string) => {
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) return;
    if (!patientId.startsWith('local_')) {
      alert('演示模式下，初始患者记录不可删除（正式系统应调用API删除）');
      return;
    }
    const ok = window.confirm(`确定删除患者 [${patient.name}] 吗？此操作不可恢复。`);
    if (!ok) return;
    setLocalAdditionalPatients(prev => prev.filter(p => p.id !== patientId));
    alert(`患者 [${patient.name}] 已删除`);
  };

  const PAGE_SIZE = 12;

  // 获取患者检查历史
  const getPatientExams = (patientId: string) => {
    return exams
      .filter(e => e.patientId === patientId)
      .sort((a, b) => {
        const dateA = `${a.scheduledDate} ${a.scheduledTime}`;
        const dateB = `${b.scheduledDate} ${b.scheduledTime}`;
        return dateB.localeCompare(dateA);
      });
  };

  // 获取患者报告
  const getPatientReports = (patientId: string) => {
    return reports
      .filter(r => r.patientId === patientId)
      .sort((a, b) => b.reportTime.localeCompare(a.reportTime));
  };

  // 获取患者最近检查日期
  const getLastExamDate = (patientId: string) => {
    const patientExams = getPatientExams(patientId);
    return patientExams.length > 0 ? patientExams[0].scheduledDate : '-';
  };

  // 获取患者首次检查日期
  const getFirstExamDate = (patientId: string) => {
    const patientExams = getPatientExams(patientId);
    return patientExams.length > 0 ? patientExams[patientExams.length - 1].scheduledDate : '-';
  };

  // 检查患者是否有危急值报告
  const hasCriticalValue = (patientId: string) => {
    return reports.some(r => r.patientId === patientId && r.isUrgent);
  };

  // 筛选患者
  const filteredPatients = useMemo(() => {
    let result = allPatients.filter(patient => {
      // 关键词搜索（姓名/ID/电话/身份证）
      const matchSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.idCard.includes(searchTerm);

      if (!matchSearch) return false;

      // 筛选标签
      switch (filterTab) {
        case 'male':
          return patient.gender === '男';
        case 'female':
          return patient.gender === '女';
        case 'thisWeek': {
          const today = new Date();
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          // P0-6: 使用 registrationDate 而非 birthDate 来筛选本周新增患者
          const regDateStr = patient.registrationDate || patient.birthDate;
          const patientDate = new Date(regDateStr);
          return patientDate >= weekAgo;
        }
        case 'critical':
          return hasCriticalValue(patient.id);
        default:
          return true;
      }
    });
    return result;
  }, [allPatients, exams, reports, searchTerm, filterTab]);

  // 分页
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPatients.slice(start, start + PAGE_SIZE);
  }, [filteredPatients, currentPage]);

  // 重置页码当筛选变化时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTab]);

  return (
    <div>
      <PageTitle>
        <Users size={26} />
        患者管理
      </PageTitle>

      {/* 工具栏：搜索 + 筛选标签 + 新增按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        {/* 左侧：搜索框 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none', fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              placeholder="搜索患者姓名、ID、电话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 14px 9px 38px',
                fontSize: '14px',
                width: '280px',
                outline: 'none',
                color: '#1e293b',
                transition: 'border-color 0.15s',
              }}
            />
          </div>
        </div>

        {/* 中间：筛选标签组 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `全部 (${allPatients.length})` },
            { key: 'male', label: `男 (${allPatients.filter(p => p.gender === '男').length})` },
            { key: 'female', label: `女 (${allPatients.filter(p => p.gender === '女').length})` },
            { key: 'thisWeek', label: '本周新增' },
            { key: 'critical', label: `有危急值 (${reports.filter(r => r.isUrgent).length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterTab(key as any)}
              style={{
                ...(filterTab === key
                  ? { backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8', boxShadow: '0 1px 4px rgba(29,78,216,0.3)' }
                  : { backgroundColor: 'white', color: '#475569', borderColor: '#e2e8f0' }),
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 右侧：新增按钮 */}
        <PrimaryBtn onClick={openAddModal}>+ 新增患者</PrimaryBtn>
      </div>

      {/* 患者卡片网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '20px' }}>
        {paginatedPatients.map((patient) => (
          <div
            key={patient.id}
            onMouseEnter={() => setHoveredCard(patient.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setSelectedPatient(patient)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e8edf2',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: hoveredCard === patient.id ? '0 4px 16px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
              transform: hoveredCard === patient.id ? 'translateY(-2px)' : 'none',
            }}
          >
            {/* 顶部：姓名 + 性别/年龄徽章 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{patient.name}</span>
              <Badge type={patient.gender === '男' ? 'blue' : 'purple'}>
                {patient.gender} · {patient.age}岁
              </Badge>
            </div>

            {/* 中部：ID、电话、最近检查日期 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>ID</span>
                <span style={{ color: '#1e293b', fontFamily: 'monospace', fontSize: '12px' }}>{patient.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>电话</span>
                <span style={{ color: '#1e293b' }}>{patient.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>最近检查</span>
                <span style={{ color: '#1e293b' }}>{getLastExamDate(patient.id)}</span>
              </div>
            </div>

            {/* 危急值提示 */}
            {hasCriticalValue(patient.id) && (
              <div style={{ marginBottom: '8px' }}>
                <Badge type="red">
                  <AlertTriangle size={12} />
                  危急值
                </Badge>
              </div>
            )}

            {/* 底部：操作按钮 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <SecondaryBtn
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setSelectedPatient(patient); }}
              >
                查看详情
              </SecondaryBtn>
              {patient.id.startsWith('local_') && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(patient); }}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: '6px',
                      border: '1px solid #e2e8f0', backgroundColor: 'white',
                      fontSize: '13px', cursor: 'pointer', color: '#2563eb',
                    }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id); }}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: '6px',
                      border: '1px solid #fecaca', backgroundColor: 'white',
                      fontSize: '13px', cursor: 'pointer', color: '#dc2626',
                    }}
                  >
                    删除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {paginatedPatients.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
            暂无符合条件的患者
          </div>
        </Card>
      )}

      {/* 分页器 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '16px 0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            第 {currentPage} / {totalPages} 页，共 {filteredPatients.length} 名患者
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '7px 13px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '13px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#94a3b8' : '#475569',
                opacity: currentPage === 1 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} />
              上一页
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                ...(currentPage === totalPages
                  ? { backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8' }
                  : { backgroundColor: 'white', color: '#475569', borderColor: '#e2e8f0' }),
                padding: '7px 13px',
                borderRadius: '6px',
                border: '1px solid',
                fontSize: '13px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              下一页
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 患者详情抽屉 */}
      {selectedPatient && (
        <>
          {/* 遮罩层 */}
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 1000 }}
            onClick={() => setSelectedPatient(null)}
          />
          {/* 抽屉 */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '480px',
            backgroundColor: 'white',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            zIndex: 1001,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* 抽屉头部 */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1,
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '4px' }}>
                  {selectedPatient.name}
                </h2>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  就诊卡号：{selectedPatient.medicalRecordNo}
                </span>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px',
                  color: '#475569',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 抽屉内容 */}
            <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
              {/* 基本信息卡片 */}
              <Card style={{ marginBottom: '20px' }}>
                <SectionTitle>
                  <Users size={16} color="#2563eb" />
                  基本信息
                </SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>姓名</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedPatient.name}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>性别</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedPatient.gender}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>年龄</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedPatient.age}岁</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>电话</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedPatient.phone}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>身份证</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedPatient.idCard}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, fontFamily: 'monospace' }}>{selectedPatient.id}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>地址</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedPatient.address}</span>
                  </div>
                </div>
              </Card>

              {/* 过敏史 */}
              <Card style={{ marginBottom: '20px' }}>
                <SectionTitle>
                  <AlertTriangle size={16} color="#dc2626" />
                  过敏史
                </SectionTitle>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  无
                </div>
              </Card>

              {/* 统计卡片 */}
              <Card style={{ marginBottom: '20px' }}>
                <SectionTitle>
                  <FileText size={16} color="#2563eb" />
                  检查统计
                </SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                      {getPatientExams(selectedPatient.id).length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>总检查次数</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                      {getPatientReports(selectedPatient.id).filter(r => r.status === '已完成').length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>总报告数</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed' }}>
                      {getFirstExamDate(selectedPatient.id) === '-' ? '-' : getFirstExamDate(selectedPatient.id).slice(0, 7)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>首次检查</div>
                  </div>
                </div>
              </Card>

              {/* 检查历史时间线 */}
              <Card style={{ marginBottom: '20px' }}>
                <SectionTitle>
                  <Clock size={16} color="#2563eb" />
                  检查历史
                </SectionTitle>
                {getPatientExams(selectedPatient.id).length === 0 ? (
                  <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                    暂无检查记录
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    {getPatientExams(selectedPatient.id).map((exam, idx) => {
                      const examReports = reports.filter(r => r.examId === exam.id);
                      const stableCount = (exam.id.charCodeAt(exam.id.length - 1) % 6) + 1;
                      const imageCount = examReports.length > 0 ? stableCount : 0;
                      return (
                        <div key={exam.id} style={{ position: 'relative', paddingBottom: '20px', paddingLeft: '20px', borderLeft: '2px solid #e5e7eb' }}>
                          <div style={{
                            position: 'absolute',
                            left: '-7px',
                            top: '4px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: exam.status === '已完成' ? '#10b981' : exam.status === '检查中' ? '#f59e0b' : '#2563eb',
                            border: '2px solid white',
                          }} />
                          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                            {exam.examItemName}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                            {exam.scheduledDate} {exam.scheduledTime}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Badge type={exam.status === '已完成' ? 'green' : exam.status === '检查中' ? 'yellow' : 'blue'}>
                              {exam.status}
                            </Badge>
                            <Badge type="gray">
                              影像数: {imageCount}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* CRUD 模态框 */}
      {modalVisible && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 1100 }}
            onClick={() => setModalVisible(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '520px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 1101,
            overflow: 'hidden',
          }}>
            {/* 头部 */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {editingPatient ? '编辑患者' : '新增患者'}
              </h2>
              <button
                onClick={() => setModalVisible(false)}
                style={{
                  padding: '6px 10px', borderRadius: '6px',
                  border: '1px solid #e2e8f0', backgroundColor: 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
            {/* 表单 */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>性别 *</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as '男' | '女' })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>出生日期 *</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>联系电话 *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="请输入电话"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>病历号 *</label>
                  <input
                    type="text"
                    value={formData.medicalRecordNo}
                    onChange={e => setFormData({ ...formData, medicalRecordNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="请输入病历号"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>身份证号</label>
                  <input
                    type="text"
                    value={formData.idCard}
                    onChange={e => setFormData({ ...formData, idCard: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="请输入身份证号"
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="请输入地址"
                />
              </div>
            </div>
            {/* 底部按钮 */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setModalVisible(false)}
                style={{
                  padding: '9px 20px', borderRadius: '6px',
                  border: '1px solid #e2e8f0', backgroundColor: 'white',
                  fontSize: '14px', cursor: 'pointer', color: '#475569',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!formData.name || !formData.phone || !formData.medicalRecordNo || !formData.birthDate) {
                    alert('请填写必填项（姓名、电话、病历号、出生日期）');
                    return;
                  }
                  if (editingPatient) {
                    handleEditPatient(formData);
                  } else {
                    handleAddPatient(formData);
                  }
                }}
                style={{
                  padding: '9px 20px', borderRadius: '6px',
                  border: 'none', backgroundColor: '#1d4ed8',
                  fontSize: '14px', cursor: 'pointer', color: 'white',
                  fontWeight: 500,
                }}
              >
                {editingPatient ? '保存修改' : '确认添加'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
