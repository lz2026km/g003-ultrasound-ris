import React, { useState, useMemo } from 'react';
import { Shield, CheckCircle, AlertTriangle, Clock, TrendingUp, Filter } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card } from '../App';
import { qcStandards, initialReportAuditRecords } from '../data/initialData';

const S: Record<string, React.CSSProperties> = {
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '16px' },
  filterTag: { padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569' },
  filterTagActive: { backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px', color: '#1e293b' },
  th: { textAlign: 'left' as const, padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#475569' },
  td: { padding: '13px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const },
  trHover: { backgroundColor: '#f8fafc' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' },
  toolbarLeft: { display: 'flex', gap: '10px', alignItems: 'center', flex: 1 },
  progressBar: { height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' },
  passRateGreen: { color: '#10b981', fontWeight: 600 },
  passRateYellow: { color: '#d97706', fontWeight: 600 },
  passRateRed: { color: '#dc2626', fontWeight: 600 },
};

const categories = ['全部', '报告质控', '图像质控', '设备质控', '流程质控', '其他'];

export default function QCPage() {
  const [activeCategory, setActiveCategory] = useState('全部');

  // 模拟实际值
  const standardsWithValues = useMemo(() => {
    return qcStandards.map((s, idx) => {
      const values = [97, 92, 88, 91, 3.2, 100, 45, 1.5, 88, 100, 98, 6, 100, 92, 96, 92, 97, 100, 0.3, 0];
      const actual = values[idx];
      return { ...s, actual };
    });
  }, []);

  const filteredStandards = useMemo(() => {
    if (activeCategory === '全部') return standardsWithValues;
    return standardsWithValues.filter(s => s.category === activeCategory);
  }, [activeCategory, standardsWithValues]);

  // 报告审核记录统计
  const auditStats = useMemo(() => {
    const total = initialReportAuditRecords.length;
    const passed = initialReportAuditRecords.filter(r => r.auditResult === '通过').length;
    const modified = initialReportAuditRecords.filter(r => r.auditResult === '修改').length;
    const rejected = initialReportAuditRecords.filter(r => r.auditResult === '驳回').length;
    const passRate = total > 0 ? Math.round(((passed + modified) / total) * 100) : 0;
    return { total, passed, modified, rejected, passRate };
  }, []);

  // 按模态统计通过率
  const modalityStats = useMemo(() => {
    const map: Record<string, { total: number; passed: number; modified: number }> = {};
    initialReportAuditRecords.forEach(r => {
      if (!map[r.modality]) map[r.modality] = { total: 0, passed: 0, modified: 0 };
      map[r.modality].total++;
      if (r.auditResult === '通过') map[r.modality].passed++;
      if (r.auditResult === '修改') map[r.modality].modified++;
    });
    return Object.entries(map).map(([modality, data]) => ({
      modality,
      ...data,
      passRate: data.total > 0 ? Math.round(((data.passed + data.modified) / data.total) * 100) : 0,
    }));
  }, []);

  const getPassRateStyle = (actual: number, target: string) => {
    const targetNum = parseInt(target.replace(/[^0-9]/g, ''));
    const percentage = actual;
    if (percentage >= targetNum) return S.passRateGreen;
    if (percentage >= targetNum - 5) return S.passRateYellow;
    return S.passRateRed;
  };

  const getPassRateColor = (actual: number, target: string) => {
    const targetNum = parseInt(target.replace(/[^0-9]/g, ''));
    if (actual >= targetNum) return '#10b981';
    if (actual >= targetNum - 5) return '#d97706';
    return '#dc2626';
  };

  return (
    <div>
      <PageTitle>
        <Shield size={28} />
        质控中心
        <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
          2025-04-28
        </span>
      </PageTitle>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <CheckCircle size={22} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>总审核数</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{auditStats.total}</div>
            </div>
          </div>
        </Card>
        <Card style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
              <CheckCircle size={22} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>通过数</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{auditStats.passed}</div>
            </div>
          </div>
        </Card>
        <Card style={{ borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <TrendingUp size={22} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>修改数</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{auditStats.modified}</div>
            </div>
          </div>
        </Card>
        <Card style={{ borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
              <AlertTriangle size={22} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>总体通过率</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{auditStats.passRate}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 模态通过率 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>各模态审核通过率</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {modalityStats.map(s => (
            <div key={s.modality} style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{s.modality}</span>
                <Badge type={s.passRate >= 90 ? 'green' : s.passRate >= 75 ? 'yellow' : 'red'}>{s.passRate}%</Badge>
              </div>
              <div style={S.progressBar}>
                <div style={{ width: `${s.passRate}%`, height: '100%', backgroundColor: getPassRateColor(s.passRate, '90'), borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{s.passed + s.modified}/{s.total} 份</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 质控标准表 */}
      <Card>
        <div style={S.toolbar}>
          <div style={S.toolbarLeft}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="#64748b" />
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>分类筛选</span>
            </div>
            <div style={S.filterGroup}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...S.filterTag,
                    ...(activeCategory === cat ? S.filterTagActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <SecondaryBtn>导出报表</SecondaryBtn>
            <PrimaryBtn>新建质控标准</PrimaryBtn>
          </div>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '120px' }}>分类</th>
              <th style={S.th}>质控点</th>
              <th style={{ ...S.th, width: '280px' }}>标准</th>
              <th style={{ ...S.th, width: '100px', textAlign: 'right' }}>目标值</th>
              <th style={{ ...S.th, width: '100px', textAlign: 'right' }}>实际值</th>
              <th style={{ ...S.th, width: '200px' }}>达标情况</th>
            </tr>
          </thead>
          <tbody>
            {filteredStandards.map(std => {
              const targetNum = parseInt(std.target.replace(/[^0-9]/g, ''));
              const actualNum = typeof std.actual === 'number' ? std.actual : parseFloat(std.actual);
              const is达标 = actualNum >= targetNum;
              const barColor = getPassRateColor(actualNum, std.target);
              const barPct = std.target.includes('%') ? Math.min(actualNum, 100) : Math.min((actualNum / targetNum) * 100, 100);

              return (
                <tr key={std.id}>
                  <td style={S.td}>
                    <Badge type={
                      std.category === '报告质控' ? 'blue' :
                      std.category === '图像质控' ? 'purple' :
                      std.category === '设备质控' ? 'yellow' :
                      std.category === '流程质控' ? 'green' : 'gray'
                    }>
                      {std.category}
                    </Badge>
                  </td>
                  <td style={{ ...S.td, fontWeight: 500, color: '#1e293b' }}>{std.checkPoint}</td>
                  <td style={{ ...S.td, color: '#64748b', fontSize: '13px' }}>{std.standard}</td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, color: '#475569' }}>{std.target}</td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{std.actual}{std.target.includes('%') ? '%' : ''}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                        <div style={{ width: `${barPct}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px', transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ ...getPassRateStyle(actualNum, std.target), fontSize: '12px', minWidth: '36px', textAlign: 'right' }}>
                        {is达标 ? '✓ 达标' : '✗ 未达标'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
