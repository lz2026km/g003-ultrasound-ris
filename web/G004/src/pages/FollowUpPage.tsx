// @ts-nocheck
import { useState } from 'react';
import {
  Phone, Calendar, Clock, User, FileText, Bell, BarChart3,
  CheckCircle, XCircle, AlertCircle, Search, Plus, Send,
  ChevronDown, Activity, TrendingUp, TrendingDown, Minus,
  PhoneCall, Mail, MessageSquare, X, Filter, UserCheck,
  ClipboardList, PhoneIncoming, CalendarDays
} from 'lucide-react';
import { initialFollowUps } from '../data/initialData';
import type { FollowUp, FollowUpStatus, FollowUpType, FollowUpMethod, FollowUpConclusion, FollowUpReminder } from '../types';

// 15条模拟数据
const followUps: FollowUp[] = initialFollowUps;

const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  tabBar: { display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tab: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b', border: 'none', background: 'none', transition: 'all 0.15s' },
  tabActive: { background: '#1a3a5c', color: '#fff' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  searchRow: { display: 'flex', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  filterBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, color: '#64748b' },
  tableWrap: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  statusCompleted: { background: '#dcfce7', color: '#16a34a' },
  statusPending: { background: '#fef3c7', color: '#d97706' },
  statusOverdue: { background: '#fee2e2', color: '#dc2626' },
  statusLost: { background: '#f1f5f9', color: '#64748b' },
  oncologyBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#fce7f3', color: '#be185d' },
  actionBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnWarning: { background: '#d97706', color: '#fff' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 12, width: 680, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  modalBody: { padding: 20 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #e2e8f0' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  formLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 },
  formInput: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  formSelect: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' },
  formTextarea: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60 },
  reminderCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12 },
  reminderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reminderPatient: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  reminderDate: { fontSize: 12, color: '#64748b' },
  reminderRow: { display: 'flex', gap: 8, marginTop: 8 },
  reminderChip: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, background: '#f1f5f9', color: '#475569' },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginBottom: 12, marginTop: 16 },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 },
  chartCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 },
  barRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { fontSize: 12, color: '#64748b', width: 60 },
  barBg: { flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4, transition: 'width 0.3s' },
  noData: { textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  noDataIcon: { opacity: 0.4 },
  noDataText: { fontSize: 14, color: '#64748b' },
  noDataHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
};

// 图标颜色映射
const statusColors: Record<FollowUpStatus, string> = {
  '已随访': '#16a34a', '待随访': '#d97706', '逾期未访': '#dc2626', '已失访': '#64748b'
};

const getStatusStyle = (status: FollowUpStatus) => {
  switch (status) {
    case '已随访': return styles.statusCompleted;
    case '待随访': return styles.statusPending;
    case '逾期未访': return styles.statusOverdue;
    case '已失访': return styles.statusLost;
  }
};

// 获取随访方式图标
const getMethodIcon = (method?: FollowUpMethod) => {
  switch (method) {
    case '电话随访': return <PhoneCall size={12} />;
    case '门诊随访': return <User size={12} />;
    case '在线随访': return <MessageSquare size={12} />;
    case '住院复查': return <Activity size={12} />;
    default: return null;
  }
};

export default function FollowUpPage() {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [filterType, setFilterType] = useState<string>('全部');
  const [showModal, setShowModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);
  const [reminderSentList, setReminderSentList] = useState<string[]>([]);

  // 统计数据
  const totalCount = followUps.length;
  const completedCount = followUps.filter(f => f.status === '已随访').length;
  const pendingCount = followUps.filter(f => f.status === '待随访').length;
  const overdueCount = followUps.filter(f => f.status === '逾期未访').length;
  const lostCount = followUps.filter(f => f.status === '已失访').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 肿瘤患者统计
  const oncologyPatients = followUps.filter(f => f.isOncologyPatient);
  const oncologySurvival = oncologyPatients.filter(f => f.survivalStatus === '生存').length;
  const oncologyLost = oncologyPatients.filter(f => f.survivalStatus === '失访').length;
  const oncologyDeath = oncologyPatients.filter(f => f.survivalStatus === '死亡').length;
  const survivalRate = oncologyPatients.length > 0 ? Math.round((oncologySurvival / oncologyPatients.length) * 100) : 0;

  // 失访原因分析
  const lostReasons = [
    { reason: '电话停机/无法联系', count: 1 },
    { reason: '患者主动放弃', count: 0 },
    { reason: '行动不便/长期卧床', count: 1 },
    { reason: '其他', count: 0 },
  ];

  // 过滤数据
  const filteredData = followUps.filter(item => {
    const matchSearch = item.patientName.includes(search) || item.patientId.includes(search) || item.phone.includes(search);
    const matchStatus = filterStatus === '全部' || item.status === filterStatus;
    const matchType = filterType === '全部' || item.followUpType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  // 复查提醒列表（今日/本周/本月到期）
  const today = '2026-04-29';
  const thisWeekStart = '2026-04-27';
  const thisWeekEnd = '2026-05-03';
  const thisMonth = '2026-04';

  const remindersToday = followUps.filter(f => f.status === '待随访' && f.scheduledDate === today);
  const remindersThisWeek = followUps.filter(f => f.status === '待随访' && f.scheduledDate >= thisWeekStart && f.scheduledDate <= thisWeekEnd);
  const remindersThisMonth = followUps.filter(f => f.status === '待随访' && f.scheduledDate.startsWith(thisMonth));

  // 发送提醒
  const handleSendReminder = (item: FollowUp) => {
    setReminderSentList(prev => [...prev, item.id]);
    alert(`已发送短信提醒给 ${item.patientName}，手机号: ${item.phone}`);
  };

  // 打开新增/编辑弹窗
  const openModal = (item?: FollowUp) => {
    setEditingItem(item || {
      id: `FU${String(followUps.length + 1).padStart(3, '0')}`,
      patientId: '', patientName: '', gender: '男', age: 0, phone: '',
      followUpType: '术后随访', followUpCycle: '90天', status: '待随访',
      scheduledDate: '', isOncologyPatient: false, doctorId: 'U001', doctorName: '张建国',
    });
    setShowModal(true);
  };

  // 渲染统计卡片
  const renderStatCard = (label: string, value: number, sub?: string, color?: string) => (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: color || '#1a3a5c' }}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  // 渲染列表标签页
  const renderTab = (key: string, label: string) => (
    <button
      key={key}
      style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
      onClick={() => setActiveTab(key)}
    >
      {label}
    </button>
  );

  return (
    <div style={styles.root}>
      {/* 标题 */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Activity size={22} color="#4ade80" />
          随访管理
        </div>
        <button style={{ ...styles.actionBtn, ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: 6, minHeight: 44 }} onClick={() => openModal()}>
          <Plus size={16} /> 新建随访记录
        </button>
      </div>

      {/* 标签页 */}
      <div style={styles.tabBar}>
        {renderTab('list', '随访列表')}
        {renderTab('reminder', '复查提醒')}
        {renderTab('stats', '统计分析')}
        {renderTab('oncology', '肿瘤专项')}
      </div>

      {/* ========== 随访列表 ========== */}
      {activeTab === 'list' && (
        <>
          {/* 统计卡片 */}
          <div style={styles.statRow}>
            {renderStatCard('总随访数', totalCount)}
            {renderStatCard('已完成', completedCount, `完成率 ${completionRate}%`, '#16a34a')}
            {renderStatCard('待随访', pendingCount, '计划中', '#d97706')}
            {renderStatCard('逾期/失访', overdueCount + lostCount, '需处理', '#dc2626')}
          </div>

          {/* 搜索筛选 */}
          <div style={styles.searchRow}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.searchInput}
                placeholder="搜索患者姓名/ID/电话..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select style={{ ...styles.formSelect, width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="全部">全部状态</option>
              <option>已随访</option>
              <option>待随访</option>
              <option>逾期未访</option>
              <option>已失访</option>
            </select>
            <select style={{ ...styles.formSelect, width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="全部">全部类型</option>
              <option>术后随访</option>
              <option>化疗后随访</option>
              <option>复查提醒</option>
              <option>不良反应追踪</option>
            </select>
          </div>

          {/* 表格 */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>患者</th>
                  <th style={styles.th}>随访类型</th>
                  <th style={styles.th}>周期</th>
                  <th style={styles.th}>状态</th>
                  <th style={styles.th}>计划日期</th>
                  <th style={styles.th}>随访方式</th>
                  <th style={styles.th}>KPS评分</th>
                  <th style={styles.th}>结论</th>
                  <th style={styles.th}>肿瘤</th>
                  <th style={styles.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr><td colSpan={10} style={styles.noData}>
                    <Activity size={48} style={styles.noDataIcon} />
                    <div style={styles.noDataText}>暂无随访记录</div>
                    <div style={styles.noDataHint}>点击右上角「新增随访」按钮添加记录</div>
                  </td></tr>
                ) : filteredData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{item.patientName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.patientId} · {item.gender} · {item.age}岁</div>
                    </td>
                    <td style={styles.td}>{item.followUpType}</td>
                    <td style={styles.td}>{item.followUpCycle}</td>
                    <td>
                      <span style={{ ...styles.statusBadge, ...getStatusStyle(item.status) }}>
                        {item.status === '已随访' && <CheckCircle size={10} />}
                        {item.status === '待随访' && <Clock size={10} />}
                        {item.status === '逾期未访' && <AlertCircle size={10} />}
                        {item.status === '已失访' && <XCircle size={10} />}
                        {item.status}
                      </span>
                    </td>
                    <td style={styles.td}>{item.scheduledDate}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 12 }}>
                        {getMethodIcon(item.followUpMethod)}
                        {item.followUpMethod || '-'}
                      </span>
                    </td>
                    <td style={styles.td}>{item.karnofskyScore ? `${item.karnofskyScore}分` : '-'}</td>
                    <td style={styles.td}>{item.conclusion || '-'}</td>
                    <td>
                      {item.isOncologyPatient ? (
                        <div>
                          <span style={styles.oncologyBadge}>肿瘤</span>
                          {item.tnmStage && <div style={{ fontSize: 10, color: '#be185d', marginTop: 2 }}>{item.tnmStage}</div>}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <button
                        style={{ ...styles.actionBtn, ...styles.btnPrimary, marginRight: 4, minHeight: 36, display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => openModal(item)}
                      >
                        {item.status === '已随访' ? '查看详情' : '编辑记录'}
                      </button>
                      {(item.status === '待随访' || item.status === '逾期未访') && !reminderSentList.includes(item.id) && (
                        <button
                          style={{ ...styles.actionBtn, ...styles.btnSuccess, minHeight: 36, display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => handleSendReminder(item)}
                        >
                          <Send size={12} /> 发送提醒
                        </button>
                      )}
                      {reminderSentList.includes(item.id) && (
                        <span style={{ fontSize: 11, color: '#16a34a' }}>已提醒</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== 复查提醒 ========== */}
      {activeTab === 'reminder' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('今日到期', remindersToday.length)}
            {renderStatCard('本周到期', remindersThisWeek.length)}
            {renderStatCard('本月到期', remindersThisMonth.length)}
            {renderStatCard('待随访总数', pendingCount)}
          </div>

          {/* 今日到期 */}
          <div style={styles.sectionTitle}>今日到期（{remindersToday.length}人）</div>
          {remindersToday.length === 0 ? (
            <div style={{ ...styles.reminderCard, textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>
              <CalendarDays size={40} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div style={{ fontSize: 14, color: '#64748b' }}>今日无到期随访</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>所有随访计划已安排妥当</div>
            </div>
          ) : remindersToday.map(item => (
            <div key={item.id} style={styles.reminderCard}>
              <div style={styles.reminderHeader}>
                <div>
                  <div style={styles.reminderPatient}>{item.patientName}</div>
                  <div style={styles.reminderDate}>{item.followUpType} · {item.followUpCycle}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={styles.oncologyBadge}>肿瘤</span>
                  <span style={{ ...styles.statusBadge, ...styles.statusPending }}><Clock size={10} /> 待随访</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>手机: {item.phone} · 计划: {item.scheduledDate}</div>
              <div style={styles.reminderRow}>
                <button
                  style={{ ...styles.actionBtn, ...styles.btnSuccess, minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => handleSendReminder(item)}
                >
                  <MessageSquare size={16} /> 发送短信提醒
                </button>
                <button style={{ ...styles.actionBtn, ...styles.btnWarning, minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PhoneCall size={16} /> 电话联系
                </button>
                <button style={{ ...styles.actionBtn, ...styles.btnPrimary, minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => openModal(item)}>
                  <FileText size={16} /> 登记随访结果
                </button>
              </div>
            </div>
          ))}

          {/* 本周到期待处理 */}
          <div style={styles.sectionTitle}>本周到期（{remindersThisWeek.filter(i => !remindersToday.includes(i)).length}人）</div>
          {remindersThisWeek.filter(i => !remindersToday.includes(i)).map(item => (
            <div key={item.id} style={styles.reminderCard}>
              <div style={styles.reminderHeader}>
                <div>
                  <div style={styles.reminderPatient}>{item.patientName}</div>
                  <div style={styles.reminderDate}>{item.followUpType} · {item.scheduledDate}</div>
                </div>
                <button
                  style={{ ...styles.actionBtn, ...styles.btnSuccess, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => handleSendReminder(item)}
                >
                  <MessageSquare size={12} /> 提醒
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>手机: {item.phone}</div>
            </div>
          ))}
        </>
      )}

      {/* ========== 统计分析 ========== */}
      {activeTab === 'stats' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('随访完成率', completionRate, '%', completionRate >= 80 ? '#16a34a' : '#dc2626')}
            {renderStatCard('总随访数', totalCount)}
            {renderStatCard('失访数', lostCount, '失访率 ' + Math.round((lostCount / totalCount) * 100) + '%')}
            {renderStatCard('肿瘤生存率', survivalRate, '%（肿瘤患者）', '#16a34a')}
          </div>

          <div style={styles.chartGrid}>
            {/* 随访状态分布 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>随访状态分布</div>
              {[
                { label: '已随访', value: completedCount, color: '#16a34a' },
                { label: '待随访', value: pendingCount, color: '#d97706' },
                { label: '逾期未访', value: overdueCount, color: '#dc2626' },
                { label: '已失访', value: lostCount, color: '#64748b' },
              ].map(item => (
                <div key={item.label} style={styles.barRow}>
                  <div style={styles.barLabel}>{item.label}</div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: totalCount > 0 ? `${(item.value / totalCount) * 100}%` : '0%', background: item.color }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 40, textAlign: 'right' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 失访原因分析 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>失访原因分析</div>
              {lostReasons.map(item => (
                <div key={item.reason} style={styles.barRow}>
                  <div style={{ ...styles.barLabel, width: 140, fontSize: 11 }}>{item.reason}</div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: '20%', background: '#94a3b8' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 30, textAlign: 'right' }}>{item.count}</div>
                </div>
              ))}
            </div>

            {/* 随访类型分布 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>随访类型分布</div>
              {[
                { label: '术后随访', value: followUps.filter(f => f.followUpType === '术后随访').length, color: '#1a3a5c' },
                { label: '化疗后随访', value: followUps.filter(f => f.followUpType === '化疗后随访').length, color: '#3b82f6' },
                { label: '复查提醒', value: followUps.filter(f => f.followUpType === '复查提醒').length, color: '#16a34a' },
                { label: '不良反应追踪', value: followUps.filter(f => f.followUpType === '不良反应追踪').length, color: '#d97706' },
              ].map(item => (
                <div key={item.label} style={styles.barRow}>
                  <div style={styles.barLabel}>{item.label}</div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: totalCount > 0 ? `${(item.value / totalCount) * 100}%` : '0%', background: item.color }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 40, textAlign: 'right' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 随访方式分布 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>随访方式分布</div>
              {[
                { label: '电话随访', value: followUps.filter(f => f.followUpMethod === '电话随访').length, color: '#8b5cf6' },
                { label: '门诊随访', value: followUps.filter(f => f.followUpMethod === '门诊随访').length, color: '#06b6d4' },
                { label: '在线随访', value: followUps.filter(f => f.followUpMethod === '在线随访').length, color: '#f97316' },
                { label: '住院复查', value: followUps.filter(f => f.followUpMethod === '住院复查').length, color: '#ec4899' },
              ].map(item => (
                <div key={item.label} style={styles.barRow}>
                  <div style={styles.barLabel}>{item.label}</div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: totalCount > 0 ? `${(item.value / totalCount) * 100}%` : '0%', background: item.color }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 40, textAlign: 'right' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========== 肿瘤专项 ========== */}
      {activeTab === 'oncology' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('肿瘤患者数', oncologyPatients.length)}
            {renderStatCard('生存', oncologySurvival, `生存率 ${survivalRate}%`, '#16a34a')}
            {renderStatCard('死亡', oncologyDeath, '已故')}
            {renderStatCard('失访', oncologyLost)}
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>患者</th>
                  <th style={styles.th}>TNM分期</th>
                  <th style={styles.th}>生存状态</th>
                  <th style={styles.th}>复发/转移监测</th>
                  <th style={styles.th}>KPS评分</th>
                  <th style={styles.th}>最近随访</th>
                  <th style={styles.th}>结论</th>
                  <th style={styles.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {oncologyPatients.length === 0 ? (
                  <tr><td colSpan={8} style={styles.noData}>
                    <UserCheck size={48} style={styles.noDataIcon} />
                    <div style={styles.noDataText}>暂无肿瘤患者随访记录</div>
                    <div style={styles.noDataHint}>在随访列表中标记肿瘤患者后可在此处查看</div>
                  </td></tr>
                ) : oncologyPatients.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{item.patientName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.gender} · {item.age}岁 · {item.phone}</div>
                    </td>
                    <td>
                      <span style={{ ...styles.oncologyBadge, fontSize: 12 }}>{item.tnmStage || '-'}</span>
                    </td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: item.survivalStatus === '生存' ? '#dcfce7' : item.survivalStatus === '死亡' ? '#fee2e2' : '#f1f5f9',
                        color: item.survivalStatus === '生存' ? '#16a34a' : item.survivalStatus === '死亡' ? '#dc2626' : '#64748b',
                      }}>
                        {item.survivalStatus === '生存' && <TrendingUp size={10} />}
                        {item.survivalStatus === '死亡' && <TrendingDown size={10} />}
                        {item.survivalStatus === '失访' && <Minus size={10} />}
                        {item.survivalStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>{item.recurrenceMonitor || '-'}</td>
                    <td style={styles.td}>{item.karnofskyScore ? `${item.karnofskyScore}分` : '-'}</td>
                    <td style={styles.td}>{item.followUpDate || item.scheduledDate}</td>
                    <td style={styles.td}>{item.conclusion || '-'}</td>
                    <td>
                      <button style={{ ...styles.actionBtn, ...styles.btnPrimary, minHeight: 36, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { setActiveTab('list'); openModal(item); }}>
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== 随访记录弹窗 ========== */}
      {showModal && editingItem && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {editingItem.status === '已随访' ? '随访记录详情' : '编辑随访计划'}
              </div>
              <X size={20} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <div style={styles.modalBody}>
              {/* 患者信息 */}
              <div style={styles.sectionTitle}>患者信息</div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>患者姓名 *</label>
                  <input style={styles.formInput} value={editingItem.patientName} onChange={e => setEditingItem({ ...editingItem, patientName: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>患者ID</label>
                  <input style={styles.formInput} value={editingItem.patientId} onChange={e => setEditingItem({ ...editingItem, patientId: e.target.value })} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>性别</label>
                  <select style={styles.formSelect} value={editingItem.gender} onChange={e => setEditingItem({ ...editingItem, gender: e.target.value as any })}>
                    <option>男</option><option>女</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>年龄</label>
                  <input style={styles.formInput} type="number" value={editingItem.age} onChange={e => setEditingItem({ ...editingItem, age: Number(e.target.value) })} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>联系电话</label>
                  <input style={styles.formInput} value={editingItem.phone} onChange={e => setEditingItem({ ...editingItem, phone: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>随访类型 *</label>
                  <select style={styles.formSelect} value={editingItem.followUpType} onChange={e => setEditingItem({ ...editingItem, followUpType: e.target.value as any })}>
                    <option>术后随访</option><option>化疗后随访</option><option>复查提醒</option><option>不良反应追踪</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>随访周期</label>
                  <select style={styles.formSelect} value={editingItem.followUpCycle} onChange={e => setEditingItem({ ...editingItem, followUpCycle: e.target.value as any })}>
                    <option>7天</option><option>30天</option><option>90天</option><option>180天</option><option>1年</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>计划日期</label>
                  <input style={styles.formInput} type="date" value={editingItem.scheduledDate} onChange={e => setEditingItem({ ...editingItem, scheduledDate: e.target.value })} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>随访状态</label>
                  <select style={styles.formSelect} value={editingItem.status} onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}>
                    <option>已随访</option><option>待随访</option><option>逾期未访</option><option>已失访</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>肿瘤患者</label>
                  <select style={styles.formSelect} value={editingItem.isOncologyPatient ? '是' : '否'} onChange={e => setEditingItem({ ...editingItem, isOncologyPatient: e.target.value === '是' })}>
                    <option>否</option><option>是</option>
                  </select>
                </div>
              </div>

              {/* 肿瘤专项 */}
              {editingItem.isOncologyPatient && (
                <>
                  <div style={styles.sectionTitle}>肿瘤专项信息</div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>TNM分期</label>
                      <input style={styles.formInput} placeholder="如 T2N0M0" value={editingItem.tnmStage || ''} onChange={e => setEditingItem({ ...editingItem, tnmStage: e.target.value })} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>生存状态</label>
                      <select style={styles.formSelect} value={editingItem.survivalStatus || '生存'} onChange={e => setEditingItem({ ...editingItem, survivalStatus: e.target.value as any })}>
                        <option>生存</option><option>死亡</option><option>失访</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>复发/转移监测</label>
                    <input style={styles.formInput} value={editingItem.recurrenceMonitor || ''} onChange={e => setEditingItem({ ...editingItem, recurrenceMonitor: e.target.value })} />
                  </div>
                </>
              )}

              {/* 随访内容（已随访时显示） */}
              {editingItem.status === '已随访' && (
                <>
                  <div style={styles.sectionTitle}>随访记录</div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>随访日期</label>
                      <input style={styles.formInput} type="date" value={editingItem.followUpDate || ''} onChange={e => setEditingItem({ ...editingItem, followUpDate: e.target.value })} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>随访方式</label>
                      <select style={styles.formSelect} value={editingItem.followUpMethod || '电话随访'} onChange={e => setEditingItem({ ...editingItem, followUpMethod: e.target.value as any })}>
                        <option>电话随访</option><option>门诊随访</option><option>在线随访</option><option>住院复查</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>症状询问</label>
                    <textarea style={styles.formTextarea} value={editingItem.symptoms || ''} onChange={e => setEditingItem({ ...editingItem, symptoms: e.target.value })} placeholder="询问患者主要症状变化..." />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>体征记录</label>
                    <input style={styles.formInput} value={editingItem.vitalSigns || ''} onChange={e => setEditingItem({ ...editingItem, vitalSigns: e.target.value })} placeholder="血压、心率等" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>检查结果</label>
                    <input style={styles.formInput} value={editingItem.examResults || ''} onChange={e => setEditingItem({ ...editingItem, examResults: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>用药情况</label>
                    <input style={styles.formInput} value={editingItem.medication || ''} onChange={e => setEditingItem({ ...editingItem, medication: e.target.value })} />
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Karnofsky评分 (0-100)</label>
                      <input style={styles.formInput} type="number" min="0" max="100" value={editingItem.karnofskyScore || ''} onChange={e => setEditingItem({ ...editingItem, karnofskyScore: Number(e.target.value) })} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>随访结论</label>
                      <select style={styles.formSelect} value={editingItem.conclusion || '稳定'} onChange={e => setEditingItem({ ...editingItem, conclusion: e.target.value as any })}>
                        <option>治愈</option><option>好转</option><option>稳定</option><option>恶化</option><option>失访</option><option>死亡</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* 备注 */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>备注</label>
                <textarea style={styles.formTextarea} value={editingItem.notes || ''} onChange={e => setEditingItem({ ...editingItem, notes: e.target.value })} />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.actionBtn, background: '#e2e8f0', color: '#475569', minHeight: 44, padding: '0 20px', fontSize: 14 }} onClick={() => setShowModal(false)}>取消</button>
              <button style={{ ...styles.actionBtn, ...styles.btnPrimary, minHeight: 44, padding: '0 24px', fontSize: 14 }} onClick={() => { setShowModal(false); alert('保存成功'); }}><CheckCircle size={16} /> 保存记录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
