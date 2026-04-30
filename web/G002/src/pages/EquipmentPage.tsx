import React, { useState, useMemo } from 'react';
import { Settings, Wrench, Power, Activity, X, Clock, AlertCircle } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card } from '../App';
import { initialEquipment, initialEquipmentUtilization } from '../data/initialData';

const S: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf2',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  cardHover: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a' },
  cardSubtitle: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: '13px', color: '#64748b' },
  statValue: { fontSize: '14px', fontWeight: 600, color: '#1e293b' },
  progressBar: { height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  drawerOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)',
    display: 'flex', justifyContent: 'flex-end', zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  drawer: {
    backgroundColor: 'white', width: '480px', height: '100%',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.2)', overflowY: 'auto' as const,
  },
  drawerHeader: {
    padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  drawerTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a' },
  drawerBody: { padding: '24px' },
  drawerSection: { marginBottom: '24px' },
  drawerSectionTitle: { fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' },
  infoLabel: { fontSize: '13px', color: '#64748b' },
  infoValue: { fontSize: '13px', fontWeight: 600, color: '#1e293b' },
  badgeGreen: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  badgeYellow: { backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  badgeRed: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  badgeBlue: { backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
};

const statusConfig = {
  '正常': { color: '#10b981', bg: '#f0fdf4', icon: <Power size={16} /> },
  '维护中': { color: '#d97706', bg: '#fffbeb', icon: <Wrench size={16} /> },
  '故障': { color: '#dc2626', bg: '#fef2f2', icon: <AlertCircle size={16} /> },
};

const modalityColors: Record<string, string> = {
  'DR': '#10b981', 'CT': '#2563eb', 'MR': '#7c3aed',
  '乳腺钼靶': '#db2777', '骨密度': '#6b7280', '超声': '#0891b2',
};

export default function EquipmentPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const equipmentWithUtil = useMemo(() => {
    return initialEquipment.map(eq => {
      const util = initialEquipmentUtilization.find(u => u.equipmentId === eq.id);
      return { ...eq, utilization: util };
    });
  }, []);

  const stats = useMemo(() => {
    const total = equipmentWithUtil.length;
    const running = equipmentWithUtil.filter(e => e.status === '正常').length;
    const maintenance = equipmentWithUtil.filter(e => e.status === '维护中').length;
    const fault = equipmentWithUtil.filter(e => e.status === '故障').length;
    const avgUtil = total > 0 ? Math.round(equipmentWithUtil.reduce((sum, e) => sum + (e.utilization?.utilizationRate || 0), 0) / total) : 0;
    return { total, running, maintenance, fault, avgUtil };
  }, [equipmentWithUtil]);

  const selected = equipmentWithUtil.find(e => e.id === selectedEquipment);

  return (
    <div>
      <PageTitle>
        <Settings size={28} />
        设备管理
        <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
          共 {stats.total} 台设备
        </span>
      </PageTitle>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '设备总数', value: stats.total, color: '#2563eb', bg: '#dbeafe' },
          { label: '运行中', value: stats.running, color: '#10b981', bg: '#d1fae5' },
          { label: '维护中', value: stats.maintenance, color: '#d97706', bg: '#fef3c7' },
          { label: '故障停机', value: stats.fault, color: '#dc2626', bg: '#fef2f2' },
          { label: '平均利用率', value: `${stats.avgUtil}%`, color: '#7c3aed', bg: '#f5f3ff' },
        ].map(stat => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: stat.bg, borderRadius: '8px' }}>
                <Activity size={20} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 设备卡片网格 */}
      <div style={S.grid}>
        {equipmentWithUtil.map(eq => {
          const status = statusConfig[eq.status] || statusConfig['正常'];
          const modColor = modalityColors[eq.modality] || '#6b7280';
          const utilRate = eq.utilization?.utilizationRate || 0;
          const isHovered = hoveredId === eq.id;

          return (
            <div
              key={eq.id}
              style={{ ...S.card, ...(isHovered ? S.cardHover : {}) }}
              onClick={() => setSelectedEquipment(eq.id)}
              onMouseEnter={() => setHoveredId(eq.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={S.cardHeader}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'white', backgroundColor: modColor }}>
                      {eq.modality}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{eq.manufacturer}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{eq.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{eq.model}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', backgroundColor: status.bg, color: status.color, fontSize: '12px', fontWeight: 600 }}>
                    {status.icon}
                    {eq.status}
                  </div>
                </div>
              </div>

              <div style={S.cardBody}>
                <div style={S.statRow}>
                  <span style={S.statLabel}>今日检查量</span>
                  <span style={S.statValue}>{eq.utilization?.examCount || 0} 例</span>
                </div>
                <div style={S.statRow}>
                  <span style={S.statLabel}>运行时长</span>
                  <span style={S.statValue}>{eq.utilization?.totalHours || 0} h</span>
                </div>

                {/* 使用率条 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>设备使用率</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: utilRate >= 80 ? '#10b981' : utilRate >= 50 ? '#d97706' : '#dc2626' }}>
                      {utilRate}%
                    </span>
                  </div>
                  <div style={S.progressBar}>
                    <div
                      style={{
                        width: `${utilRate}%`,
                        height: '100%',
                        backgroundColor: utilRate >= 80 ? '#10b981' : utilRate >= 50 ? '#d97706' : '#dc2626',
                        borderRadius: '4px',
                        transition: 'width 0.5s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={11} />
                    上次维护: {eq.lastMaintenance}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 设备详情抽屉 */}
      {selectedEquipment && selected && (
        <div style={S.drawerOverlay} onClick={() => setSelectedEquipment(null)}>
          <div style={S.drawer} onClick={e => e.stopPropagation()}>
            <div style={S.drawerHeader}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>设备详情</div>
                <div style={S.drawerTitle}>{selected.name}</div>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={S.drawerBody}>
              {/* 基本信息 */}
              <div style={S.drawerSection}>
                <div style={S.drawerSectionTitle}>
                  <Settings size={15} />
                  基本信息
                </div>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '4px 0' }}>
                  {[
                    ['设备型号', selected.model],
                    ['生产厂商', selected.manufacturer],
                    ['模态类型', selected.modality],
                    ['安装日期', selected.installDate],
                    ['当前状态', selected.status],
                  ].map(([label, value]) => (
                    <div key={label} style={S.infoRow}>
                      <span style={S.infoLabel}>{label}</span>
                      <span style={S.infoValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 维护信息 */}
              <div style={S.drawerSection}>
                <div style={S.drawerSectionTitle}>
                  <Wrench size={15} />
                  维护信息
                </div>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '4px 0' }}>
                  {[
                    ['上次维护', selected.lastMaintenance],
                    ['下次维护', selected.nextMaintenance],
                  ].map(([label, value]) => (
                    <div key={label} style={S.infoRow}>
                      <span style={S.infoLabel}>{label}</span>
                      <span style={S.infoValue}>{value}</span>
                    </div>
                  ))}
                </div>
                {selected.note && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1d4ed8' }}>
                    {selected.note}
                  </div>
                )}
              </div>

              {/* 今日运行数据 */}
              <div style={S.drawerSection}>
                <div style={S.drawerSectionTitle}>
                  <Activity size={15} />
                  今日运行数据
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{selected.utilization?.examCount || 0}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>今日检查量</div>
                  </div>
                  <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{selected.utilization?.totalHours || 0}h</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>运行时长</div>
                  </div>
                </div>

                {/* 使用率 */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>设备使用率</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{selected.utilization?.utilizationRate || 0}%</span>
                  </div>
                  <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${selected.utilization?.utilizationRate || 0}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>基于8小时工作制计算</div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <PrimaryBtn style={{ flex: 1 }}>发起维护</PrimaryBtn>
                <SecondaryBtn style={{ flex: 1 }}>查看历史</SecondaryBtn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
