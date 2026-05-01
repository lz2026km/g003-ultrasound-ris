// ============================================================
// G004 超声管理系统 - 危机预警看板
// 四级预警：红色(Ⅰ级)/橙色(Ⅱ级)/黄色(Ⅲ级)/蓝色(Ⅳ级）
// 超时预警 + 实时响应监控
// ============================================================
import { useState } from 'react'
import {
  AlertTriangle, Activity, Clock, Phone, CheckCircle, XCircle,
  Search, Filter, TrendingUp, User, FileText, Bell, Zap,
  ChevronDown, ArrowUp, ArrowDown, Minus, AlertCircle
} from 'lucide-react'

// ---------- 预警级别 ----------
type AlertLevel = '红色(Ⅰ级)' | '橙色(Ⅱ级)' | '黄色(Ⅲ级)' | '蓝色(Ⅳ级)';
type AlertType = '设备故障' | '患者安全' | '感染暴发' | '信息系统' | '药品耗材';
type ProcessStatus = '待处置' | '处置中' | '已化解' | '升级处理';

// ---------- 预警记录 ----------
interface AlertRecord {
  id: string;
  level: AlertLevel;
  type: AlertType;
  title: string;
  department: string;
  reporter: string;
  occurTime: string;
  responseTime: number; // 分钟
  status: ProcessStatus;
  description: string;
}

const alertColors: Record<AlertLevel, { bg: string; text: string; border: string; dot: string }> = {
  '红色(Ⅰ级)': { bg: '#fee2e2', text: '#dc2626', border: '#fecaca', dot: '#dc2626' },
  '橙色(Ⅱ级)': { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', dot: '#ea580c' },
  '黄色(Ⅲ级)': { bg: '#fefce8', text: '#ca8a04', border: '#fef08a', dot: '#ca8a04' },
  '蓝色(Ⅳ级)': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#2563eb' },
};

const typeColors: Record<AlertType, string> = {
  '设备故障': '#8b5cf6',
  '患者安全': '#dc2626',
  '感染暴发': '#ea580c',
  '信息系统': '#2563eb',
  '药品耗材': '#16a34a',
};

// 35条预警记录
const alertRecords: AlertRecord[] = [
  { id: 'CA001', level: '红色(Ⅰ级)', type: '患者安全', title: '术中出血量超过1500ml', department: '消化内科', reporter: '李明', occurTime: '2026-04-30 07:15', responseTime: 3, status: '处置中', description: '结肠镜手术中突发大出血，已启动紧急输血' },
  { id: 'CA002', level: '红色(Ⅰ级)', type: '患者安全', title: '麻醉后呼吸抑制', department: '麻醉科', reporter: '王芳', occurTime: '2026-04-30 06:42', responseTime: 2, status: '已化解', description: '全麻后出现短暂呼吸抑制，已气管插管处理' },
  { id: 'CA003', level: '红色(Ⅰ级)', type: '感染暴发', title: '疑似院内感染聚集', department: '感染科', reporter: '张伟', occurTime: '2026-04-30 05:30', responseTime: 5, status: '升级处理', description: 'ICU 3天内出现5例耐药菌感染' },
  { id: 'CA004', level: '红色(Ⅰ级)', type: '设备故障', title: 'DSA设备突然宕机', department: '放射科', reporter: '赵军', occurTime: '2026-04-29 22:10', responseTime: 8, status: '已化解', description: '数字减影血管机故障无法曝光，已切换备用设备' },
  { id: 'CA005', level: '红色(Ⅰ级)', type: '患者安全', title: '超声检查中患者心脏骤停', department: '心内科', reporter: '陈静', occurTime: '2026-04-29 18:55', responseTime: 1, status: '处置中', description: '胃超声检查中突发室颤，已电除颤心肺复苏' },
  { id: 'CA006', level: '橙色(Ⅱ级)', type: '信息系统', title: 'PACS影像存储系统故障', department: '信息中心', reporter: '刘强', occurTime: '2026-04-30 08:20', responseTime: 12, status: '处置中', description: 'PACS服务器存储阵列降级，部分影像无法调取' },
  { id: 'CA007', level: '橙色(Ⅱ级)', type: '药品耗材', title: '急救药品阿托品库存为零', department: '药剂科', reporter: '周敏', occurTime: '2026-04-30 08:05', responseTime: 15, status: '已化解', description: '急诊药房阿托品已用完，已紧急调配' },
  { id: 'CA008', level: '橙色(Ⅱ级)', type: '设备故障', title: '超声清洗消毒机故障', department: '供应室', reporter: '吴磊', occurTime: '2026-04-30 07:50', responseTime: 20, status: '处置中', description: '清洗机无法升温，200条内镜积压待清洗' },
  { id: 'CA009', level: '橙色(Ⅱ级)', type: '患者安全', title: '患者跌倒导致股骨骨折', department: '骨科', reporter: '孙丽', occurTime: '2026-04-30 07:30', responseTime: 10, status: '已化解', description: '老年患者如厕时跌倒，已行急诊手术' },
  { id: 'CA010', level: '橙色(Ⅱ级)', type: '信息系统', title: 'His系统全面卡顿', department: '信息中心', reporter: '郑浩', occurTime: '2026-04-30 07:15', responseTime: 25, status: '已化解', description: '医生站、护士站系统响应超时超过5分钟' },
  { id: 'CA011', level: '橙色(Ⅱ级)', type: '感染暴发', title: '胃镜室幽门螺杆菌聚集性感染', department: '消化内科', reporter: '马琳', occurTime: '2026-04-29 16:00', responseTime: 30, status: '升级处理', description: '1周内3例患者胃镜后出现HP感染' },
  { id: 'CA012', level: '橙色(Ⅱ级)', type: '药品耗材', title: '麻醉用药丙泊酚告急', department: '麻醉科', reporter: '黄蓉', occurTime: '2026-04-29 14:20', responseTime: 18, status: '已化解', description: '手术室丙泊酚剩余不足2日用量' },
  { id: 'CA013', level: '黄色(Ⅲ级)', type: '设备故障', title: '电子肠镜图像偏暗', department: '消化内科', reporter: '杨洋', occurTime: '2026-04-30 09:10', responseTime: 35, status: '处置中', description: '奥林巴斯CF-HQ290肠镜光源衰减' },
  { id: 'CA014', level: '黄色(Ⅲ级)', type: '信息系统', title: '叫号系统无法正常运行', department: '门诊部', reporter: '徐鹏', occurTime: '2026-04-30 08:45', responseTime: 40, status: '已化解', description: '超声中心叫号屏全黑，已重启服务器' },
  { id: 'CA015', level: '黄色(Ⅲ级)', type: '患者安全', title: '门诊患者错过检查预约', department: '超声中心', reporter: '高峰', occurTime: '2026-04-30 08:30', responseTime: 22, status: '已化解', description: '患者因短信未收到而错过胃超声检查' },
  { id: 'CA016', level: '黄色(Ⅲ级)', type: '药品耗材', title: '检查试剂lugol碘液即将过期', department: '超声中心', reporter: '何雪', occurTime: '2026-04-30 08:15', responseTime: 45, status: '已化解', description: '现有lugol碘液效期至2026-05-05' },
  { id: 'CA017', level: '黄色(Ⅲ级)', type: '设备故障', title: '超声追溯系统读取器故障', department: '信息科', reporter: '林青', occurTime: '2026-04-30 07:55', responseTime: 50, status: '处置中', description: '追溯系统RFID读取成功率低于60%' },
  { id: 'CA018', level: '黄色(Ⅲ级)', type: '信息系统', title: '电子病历加载缓慢', department: '医务科', reporter: '邓超', occurTime: '2026-04-30 07:40', responseTime: 28, status: '已化解', description: 'EMR系统部分模块响应超过10秒' },
  { id: 'CA019', level: '黄色(Ⅲ级)', type: '患者安全', title: '老年患者留置针滑脱', department: '消化内科', reporter: '方芳', occurTime: '2026-04-30 07:25', responseTime: 15, status: '已化解', description: '86岁患者自行拔除静脉留置针' },
  { id: 'CA020', level: '黄色(Ⅲ级)', type: '感染暴发', title: '支气管镜检查后发热患者增多', department: '呼吸科', reporter: '曹文', occurTime: '2026-04-29 15:00', responseTime: 55, status: '待处置', description: '1周内支气管镜检查后发热患者增加40%' },
  { id: 'CA021', level: '黄色(Ⅲ级)', type: '设备故障', title: '超声送气泵异响', department: '超声中心', reporter: '田雨', occurTime: '2026-04-29 14:30', responseTime: 60, status: '待处置', description: '气泵运行时噪音超过65分贝' },
  { id: 'CA022', level: '蓝色(Ⅳ级)', type: '信息系统', title: '科室电脑系统时间偏差', department: '超声中心', reporter: '贺敏', occurTime: '2026-04-30 09:30', responseTime: 70, status: '已化解', description: '3台电脑时间偏差超过2分钟' },
  { id: 'CA023', level: '蓝色(Ⅳ级)', type: '药品耗材', title: '耦合剂库存不足预警', department: '超声中心', reporter: '秦浩', occurTime: '2026-04-30 09:15', responseTime: 80, status: '已化解', description: 'B超耦合剂剩余不足1周用量' },
  { id: 'CA024', level: '蓝色(Ⅳ级)', type: '设备故障', title: '候诊区空调出风不均', department: '后勤部', reporter: '蒋琳', occurTime: '2026-04-30 08:50', responseTime: 90, status: '处置中', description: '超声中心候诊区3个出风口堵塞' },
  { id: 'CA025', level: '蓝色(Ⅳ级)', type: '信息系统', title: '预约平台短信模板异常', department: '信息中心', reporter: '沈娟', occurTime: '2026-04-30 08:35', responseTime: 65, status: '已化解', description: '患者收到预约确认短信内容显示乱码' },
  { id: 'CA026', level: '蓝色(Ⅳ级)', type: '药品耗材', title: '检查床单库存偏低', department: '超声中心', reporter: '许刚', occurTime: '2026-04-30 08:20', responseTime: 100, status: '已化解', description: '一次性床单剩余不足200张' },
  { id: 'CA027', level: '蓝色(Ⅳ级)', type: '设备故障', title: '空气净化器滤网需更换', department: '后勤部', reporter: '章武', occurTime: '2026-04-30 07:45', responseTime: 120, status: '待处置', description: '超声室2台净化器滤网堵塞报警' },
  { id: 'CA028', level: '蓝色(Ⅳ级)', type: '患者安全', title: '患者隐私信息在屏幕上泄露', department: '信息科', reporter: '梁文', occurTime: '2026-04-29 17:00', responseTime: 45, status: '已化解', description: '候诊屏显示患者全名及检查项目' },
  { id: 'CA029', level: '蓝色(Ⅳ级)', type: '信息系统', title: '移动查房系统网络延迟', department: '护理部', reporter: '杜梅', occurTime: '2026-04-29 16:30', responseTime: 85, status: '已化解', description: '平板电脑连接内网延迟超过3秒' },
  { id: 'CA030', level: '蓝色(Ⅳ级)', type: '药品耗材', title: '手消毒液即将到期', department: '院感科', reporter: '钱伟', occurTime: '2026-04-29 15:45', responseTime: 110, status: '已化解', description: '多款手消毒液效期在2周内到期' },
  { id: 'CA031', level: '红色(Ⅰ级)', type: '患者安全', title: '超声逆行胰胆管造影术后胰腺炎', department: '消化内科', reporter: '姜涛', occurTime: '2026-04-28 20:00', responseTime: 4, status: '处置中', description: 'ERCP术后患者出现重症胰腺炎' },
  { id: 'CA032', level: '橙色(Ⅱ级)', type: '设备故障', title: '超声室UPS供电切换报警', department: '后勤部', reporter: '汤丽', occurTime: '2026-04-28 19:15', responseTime: 18, status: '已化解', description: '市电中断后UPS切换延迟超过预期' },
  { id: 'CA033', level: '黄色(Ⅲ级)', type: '感染暴发', title: '软式超声戊二醛浓度监测异常', department: '院感科', reporter: '龙飞', occurTime: '2026-04-28 14:00', responseTime: 48, status: '待处置', description: '2批次超声消毒液浓度低于标准值' },
  { id: 'CA034', level: '蓝色(Ⅳ级)', type: '信息系统', title: '科研数据备份延迟', department: '信息中心', reporter: '石磊', occurTime: '2026-04-28 10:00', responseTime: 150, status: '已化解', description: '备份任务执行时间超过24小时未完成' },
  { id: 'CA035', level: '橙色(Ⅱ级)', type: '患者安全', title: '门急诊患者药物过敏性休克', department: '急诊科', reporter: '万鹏', occurTime: '2026-04-27 22:30', responseTime: 6, status: '已化解', description: '患者输注头孢时出现过敏性休克' },
];

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 10 },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 4 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 14, minHeight: 80 },
  statIconWrap: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  alertItem: { border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s', minHeight: 44 },
  alertItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  alertItemLeft: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  alertBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 14, fontSize: 13, fontWeight: 700 },
  typeBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 14, fontSize: 13, fontWeight: 600 },
  alertTitle: { fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 6 },
  alertMeta: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  searchRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchBox: { flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0', minHeight: 44 },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 15 },
  selectBox: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 15, background: '#fff', outline: 'none', minHeight: 44, cursor: 'pointer' },
  tabBar: { display: 'flex', gap: 6, background: '#fff', padding: 6, borderRadius: 10, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  tab: { padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#64748b', border: 'none', background: 'none', transition: 'all 0.15s', minHeight: 44 },
  tabActive: { background: '#1a3a5c', color: '#fff' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  pieChartWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  legendRow: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' },
  legendDot: { width: 10, height: 10, borderRadius: '50%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 13, color: '#64748b', fontWeight: 700, background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px 14px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  levelDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  noData: { textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 15 },
  // 大按钮 44px+
  btnLarge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', minHeight: 44 },
  btnPrimary: { background: '#dc2626', color: '#fff' },
  btnSecondary: { background: '#f1f5f9', color: '#475569' },
  // 超时预警样式
  timeoutBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700 },
  timeoutWarning: { background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d' },
  timeoutDanger: { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' },
};

// 处置状态样式
const statusStyles: Record<ProcessStatus, { bg: string; color: string }> = {
  '待处置': { bg: '#fef3c7', color: '#d97706' },
  '处置中': { bg: '#dbeafe', color: '#2563eb' },
  '已化解': { bg: '#dcfce7', color: '#16a34a' },
  '升级处理': { bg: '#fee2e2', color: '#dc2626' },
};

// SVG饼图组件
const PieChart = ({ data, size = 160 }: { data: { label: string; value: number; color: string }[], size?: number }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div style={{ color: '#94a3b8', fontSize: 12 }}>暂无数据</div>;
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  let startAngle = 0;
  const paths = data.map(d => {
    const angle = (d.value / total) * 360;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = cy + r * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = cx + r * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = cy + r * Math.sin((endAngle - 90) * Math.PI / 180);
    const largeArc = angle > 180 ? 1 : 0;
    const path = angle === 360
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const result = { path, color: d.color, label: d.label, value: d.value, percent: Math.round(d.value / total * 100) };
    startAngle = endAngle;
    return result;
  });
  return (
    <div style={s.pieChartWrap}>
      <svg width={size} height={size}>
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} stroke="#fff" strokeWidth={2} />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.5} fill="#fff" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill="#1a3a5c">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fill="#94a3b8">条预警</text>
      </svg>
      <div style={s.legendRow}>
        {data.map(d => (
          <div key={d.label} style={s.legendItem}>
            <div style={{ ...s.legendDot, background: d.color }} />
            <span>{d.label} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 柱状条组件
const BarItem = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
    <div style={{ fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>{label}</div>
    <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 5 }}>
      <div style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, height: 10, borderRadius: 5, background: color, transition: 'width 0.3s' }} />
    </div>
    <div style={{ fontSize: 11, color: '#475569', width: 30, textAlign: 'right' }}>{value}</div>
  </div>
);

export default function CriticalAlertPage() {
  const [tab, setTab] = useState<'overview' | 'list' | 'stats'>('overview');
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('全部');
  const [filterType, setFilterType] = useState<string>('全部');
  const [filterStatus, setFilterStatus] = useState<string>('全部');

  // 统计数据
  const total = alertRecords.length;
  const redCount = alertRecords.filter(a => a.level === '红色(Ⅰ级)').length;
  const orangeCount = alertRecords.filter(a => a.level === '橙色(Ⅱ级)').length;
  const yellowCount = alertRecords.filter(a => a.level === '黄色(Ⅲ级)').length;
  const blueCount = alertRecords.filter(a => a.level === '蓝色(Ⅳ级)').length;

  const pendingCount = alertRecords.filter(a => a.status === '待处置').length;
  const processingCount = alertRecords.filter(a => a.status === '处置中').length;
  const resolvedCount = alertRecords.filter(a => a.status === '已化解').length;
  const escalatedCount = alertRecords.filter(a => a.status === '升级处理').length;

  const avgResponseTime = alertRecords.length > 0
    ? Math.round(alertRecords.reduce((sum, a) => sum + a.responseTime, 0) / alertRecords.length)
    : 0;

  // 超时统计数据
  const timeoutCount = alertRecords.filter(a => a.responseTime > 60).length;
  const warningCount = alertRecords.filter(a => a.responseTime > 30 && a.responseTime <= 60).length;
  const normalCount = alertRecords.filter(a => a.responseTime <= 30).length;

  // 过滤
  const filtered = alertRecords.filter(a => {
    const matchSearch = a.title.includes(search) || a.department.includes(search) || a.reporter.includes(search);
    const matchLevel = filterLevel === '全部' || a.level === filterLevel;
    const matchType = filterType === '全部' || a.type === filterType;
    const matchStatus = filterStatus === '全部' || a.status === filterStatus;
    return matchSearch && matchLevel && matchType && matchStatus;
  });

  // 响应时间排行（取前10）
  const responseRanking = [...alertRecords]
    .sort((a, b) => a.responseTime - b.responseTime)
    .slice(0, 10);

  // 饼图数据
  const levelPieData = [
    { label: '红色', value: redCount, color: '#dc2626' },
    { label: '橙色', value: orangeCount, color: '#ea580c' },
    { label: '黄色', value: yellowCount, color: '#ca8a04' },
    { label: '蓝色', value: blueCount, color: '#2563eb' },
  ];

  const statusPieData = [
    { label: '待处置', value: pendingCount, color: '#d97706' },
    { label: '处置中', value: processingCount, color: '#2563eb' },
    { label: '已化解', value: resolvedCount, color: '#16a34a' },
    { label: '升级处理', value: escalatedCount, color: '#dc2626' },
  ];

  const typePieData = [
    { label: '设备故障', value: alertRecords.filter(a => a.type === '设备故障').length, color: '#8b5cf6' },
    { label: '患者安全', value: alertRecords.filter(a => a.type === '患者安全').length, color: '#dc2626' },
    { label: '感染暴发', value: alertRecords.filter(a => a.type === '感染暴发').length, color: '#ea580c' },
    { label: '信息系统', value: alertRecords.filter(a => a.type === '信息系统').length, color: '#2563eb' },
    { label: '药品耗材', value: alertRecords.filter(a => a.type === '药品耗材').length, color: '#16a34a' },
  ];

  // 统计卡片
  const renderStatCard = (label: string, value: number | string, sub: string, iconBg: string, icon: React.ReactNode) => (
    <div style={s.statCard}>
      <div style={{ ...s.statIconWrap, background: iconBg }}>{icon}</div>
      <div style={s.statInfo}>
        <div style={s.statValue}>{value}</div>
        <div style={s.statLabel}>{label}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );

  const renderTab = (key: typeof tab, label: string) => (
    <button key={key} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }} onClick={() => setTab(key)}>{label}</button>
  );

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <div style={s.title}><AlertTriangle size={22} color="#dc2626" />危机预警看板</div>
          <div style={s.subtitle}>实时监测 · 四级预警 · 快速响应</div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={s.tabBar}>
        {renderTab('overview', '总览看板')}
        {renderTab('list', '预警列表')}
        {renderTab('stats', '统计分析')}
      </div>

      {/* ========== 总览看板 ========== */}
      {tab === 'overview' && (
        <>
          <div style={s.statRow}>
            {renderStatCard('今日新增', alertRecords.filter(a => a.occurTime.startsWith('2026-04-30')).length, '较昨日+2', '#fee2e2', <AlertTriangle size={20} color="#dc2626" />)}
            {renderStatCard('红色(Ⅰ级)', redCount, '需立即处置', '#fee2e2', <Zap size={20} color="#dc2626" />)}
            {renderStatCard('橙色(Ⅱ级)', orangeCount, '需优先处置', '#fff7ed', <AlertCircle size={20} color="#ea580c" />)}
            {renderStatCard('平均响应时间', avgResponseTime, '分钟', '#eff6ff', <Clock size={20} color="#2563eb" />)}
          </div>

          {/* 超时预警横幅 */}
          {(timeoutCount > 0 || warningCount > 0) && (
            <div style={{ ...s.card, background: timeoutCount > 0 ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: timeoutCount > 0 ? '1px solid #fca5a5' : '1px solid #fcd34d', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={20} color={timeoutCount > 0 ? '#dc2626' : '#d97706'} />
                <span style={{ fontSize: 15, fontWeight: 600, color: timeoutCount > 0 ? '#991b1b' : '#92400e' }}>
                  {timeoutCount > 0 ? `⚠ 超时预警：${timeoutCount}条预警响应时间超过60分钟，请立即处理！` : ''}
                  {warningCount > 0 && timeoutCount === 0 ? `⚠ 时间预警：${warningCount}条预警响应时间超过30分钟` : ''}
                </span>
              </div>
            </div>
          )}

          <div style={s.grid3}>
            {/* 预警级别分布 */}
            <div style={s.card}>
              <div style={s.cardTitle}><TrendingUp size={14} color="#64748b" />预警级别分布</div>
              <PieChart data={levelPieData} />
              <div style={{ marginTop: 12 }}>
                <BarItem label="红色(Ⅰ级)" value={redCount} max={total} color="#dc2626" />
                <BarItem label="橙色(Ⅱ级)" value={orangeCount} max={total} color="#ea580c" />
                <BarItem label="黄色(Ⅲ级)" value={yellowCount} max={total} color="#ca8a04" />
                <BarItem label="蓝色(Ⅳ级)" value={blueCount} max={total} color="#2563eb" />
              </div>
            </div>

            {/* 处置状态分布 */}
            <div style={s.card}>
              <div style={s.cardTitle}><Activity size={14} color="#64748b" />处置状态分布</div>
              <PieChart data={statusPieData} />
              <div style={{ marginTop: 12 }}>
                <BarItem label="待处置" value={pendingCount} max={total} color="#d97706" />
                <BarItem label="处置中" value={processingCount} max={total} color="#2563eb" />
                <BarItem label="已化解" value={resolvedCount} max={total} color="#16a34a" />
                <BarItem label="升级处理" value={escalatedCount} max={total} color="#dc2626" />
              </div>
            </div>

            {/* 预警类型分布 */}
            <div style={s.card}>
              <div style={s.cardTitle}><Bell size={14} color="#64748b" />预警类型分布</div>
              <PieChart data={typePieData} />
              <div style={{ marginTop: 12 }}>
                {typePieData.map(d => (
                  <BarItem key={d.label} label={d.label} value={d.value} max={total} color={d.color} />
                ))}
              </div>
            </div>
          </div>

          {/* 响应时间排行 TOP10 */}
          <div style={s.card}>
            <div style={s.cardTitle}><Clock size={14} color="#64748b" />响应时间排行 TOP10（分钟）</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>排名</th>
                  <th style={s.th}>预警标题</th>
                  <th style={s.th}>级别</th>
                  <th style={s.th}>部门</th>
                  <th style={s.th}>发生时间</th>
                  <th style={s.th}>响应时间</th>
                  <th style={s.th}>状态</th>
                </tr>
              </thead>
              <tbody>
                {responseRanking.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ ...s.td, fontWeight: 700, color: i < 3 ? '#dc2626' : '#64748b' }}>#{i + 1}</td>
                    <td style={s.td}>{a.title}</td>
                    <td>
                      <span style={{ ...s.alertBadge, background: alertColors[a.level].bg, color: alertColors[a.level].text }}>
                        {a.level}
                      </span>
                    </td>
                    <td style={s.td}>{a.department}</td>
                    <td style={s.td}>{a.occurTime}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: a.responseTime <= 10 ? '#16a34a' : a.responseTime <= 30 ? '#d97706' : '#dc2626' }}>
                      {a.responseTime}分钟
                    </td>
                    <td>
                      <span style={{ ...s.statusBadge, background: statusStyles[a.status].bg, color: statusStyles[a.status].color }}>
                        {a.status === '待处置' && <Clock size={10} />}
                        {a.status === '处置中' && <Activity size={10} />}
                        {a.status === '已化解' && <CheckCircle size={10} />}
                        {a.status === '升级处理' && <AlertCircle size={10} />}
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== 预警列表 ========== */}
      {tab === 'list' && (
        <>
          <div style={s.searchRow}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索预警标题/部门/报告人..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={s.selectBox} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
              <option value="全部">全部级别</option>
              <option>红色(Ⅰ级)</option>
              <option>橙色(Ⅱ级)</option>
              <option>黄色(Ⅲ级)</option>
              <option>蓝色(Ⅳ级)</option>
            </select>
            <select style={s.selectBox} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="全部">全部类型</option>
              <option>设备故障</option>
              <option>患者安全</option>
              <option>感染暴发</option>
              <option>信息系统</option>
              <option>药品耗材</option>
            </select>
            <select style={s.selectBox} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="全部">全部状态</option>
              <option>待处置</option>
              <option>处置中</option>
              <option>已化解</option>
              <option>升级处理</option>
            </select>
          </div>

          <div style={s.card}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>共 {filtered.length} 条预警记录</div>
            {filtered.length === 0 ? (
              <div style={s.noData}>暂无数据</div>
            ) : filtered.map(a => {
              // 超时预警：红色≤10分钟 橙色≤30分钟 黄色≤60分钟
              const isTimeout = a.responseTime > 60;
              const isWarning = a.responseTime > 30 && a.responseTime <= 60;
              return (
              <div key={a.id} style={{ ...s.alertItem, borderLeft: `4px solid ${alertColors[a.level].dot}` }}>
                <div style={s.alertItemHeader}>
                  <div style={s.alertItemLeft}>
                    <div style={s.levelDot} className={`level-dot`} />
                    <div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ ...s.alertBadge, background: alertColors[a.level].bg, color: alertColors[a.level].text }}>
                          {a.level}
                        </span>
                        <span style={{ ...s.typeBadge, background: typeColors[a.type] + '20', color: typeColors[a.type] }}>
                          {a.type}
                        </span>
                        {isTimeout && (
                          <span style={{ ...s.timeoutBadge, ...s.timeoutDanger }}>
                            <Clock size={11} /> 超时 {a.responseTime}分钟
                          </span>
                        )}
                        {isWarning && (
                          <span style={{ ...s.timeoutBadge, ...s.timeoutWarning }}>
                            <Clock size={11} /> 预警 {a.responseTime}分钟
                          </span>
                        )}
                        <span style={{ ...s.statusBadge, background: statusStyles[a.status].bg, color: statusStyles[a.status].color }}>
                          {a.status === '待处置' && <Clock size={11} />}
                          {a.status === '处置中' && <Activity size={11} />}
                          {a.status === '已化解' && <CheckCircle size={11} />}
                          {a.status === '升级处理' && <AlertCircle size={11} />}
                          {a.status}
                        </span>
                      </div>
                      <div style={s.alertTitle}>{a.title}</div>
                      <div style={s.alertMeta}>
                        {a.department} · {a.reporter} · {a.occurTime}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{a.description}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{a.id}</div>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========== 统计分析 ========== */}
      {tab === 'stats' && (
        <>
          <div style={s.statRow}>
            {renderStatCard('预警总数', total, '当前有效预警', '#f1f5f9', <Bell size={20} color="#64748b" />)}
            {renderStatCard('已化解', resolvedCount, `化解率 ${Math.round(resolvedCount / total * 100)}%`, '#dcfce7', <CheckCircle size={20} color="#16a34a" />)}
            {renderStatCard('待处置', pendingCount, '需关注', '#fef3c7', <Clock size={20} color="#d97706" />)}
            {renderStatCard('升级处理', escalatedCount, '需协助', '#fee2e2', <AlertCircle size={20} color="#dc2626" />)}
          </div>

          <div style={s.grid2}>
            {/* 各部门预警数量 */}
            <div style={s.card}>
              <div style={s.cardTitle}><FileText size={14} color="#64748b" />各部门预警数量</div>
              {(['消化内科', '信息中心', '麻醉科', '超声中心', '感染科', '急诊科', '骨科', '呼吸科', '药剂科', '后勤部'] as const).map(dept => {
                const count = alertRecords.filter(a => a.department === dept).length;
                return <BarItem key={dept} label={dept} value={count} max={Math.max(...[5, 4, 3, 3, 2, 2, 1, 1, 1, 1])} color="#1a3a5c" />;
              })}
            </div>

            {/* 各类型化解情况 */}
            <div style={s.card}>
              <div style={s.cardTitle}><CheckCircle size={14} color="#64748b" />各类型化解情况</div>
              {typePieData.map(d => {
                const resolved = alertRecords.filter(a => a.type === d.label && a.status === '已化解').length;
                const totalType = d.value;
                return (
                  <div key={d.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                      <span>{d.label}</span>
                      <span style={{ color: '#475569' }}>{resolved}/{totalType} 已化解</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
                      <div style={{ width: `${totalType > 0 ? (resolved / totalType) * 100 : 0}%`, height: 8, borderRadius: 4, background: d.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 响应时间分布 */}
            <div style={s.card}>
              <div style={s.cardTitle}><Clock size={14} color="#64748b" />响应时间分布（分钟）</div>
              <BarItem label="≤5分钟" value={alertRecords.filter(a => a.responseTime <= 5).length} max={total} color="#16a34a" />
              <BarItem label="6-15分钟" value={alertRecords.filter(a => a.responseTime > 5 && a.responseTime <= 15).length} max={total} color="#3b82f6" />
              <BarItem label="16-30分钟" value={alertRecords.filter(a => a.responseTime > 15 && a.responseTime <= 30).length} max={total} color="#d97706" />
              <BarItem label="31-60分钟" value={alertRecords.filter(a => a.responseTime > 30 && a.responseTime <= 60).length} max={total} color="#ea580c" />
              <BarItem label=">60分钟" value={alertRecords.filter(a => a.responseTime > 60).length} max={total} color="#dc2626" />
            </div>

            {/* 预警级别化解率 */}
            <div style={s.card}>
              <div style={s.cardTitle}><TrendingUp size={14} color="#64748b" />各级别化解率</div>
              {levelPieData.map(d => {
                const resolved = alertRecords.filter(a => a.level === d.label + '(Ⅰ级)' || a.level === d.label + '(Ⅱ级)' || a.level === d.label + '(Ⅲ级)' || a.level === d.label + '(Ⅳ级)').filter(a => a.status === '已化解').length;
                const totalLevel = d.value;
                return (
                  <div key={d.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: d.color, fontWeight: 600 }}>{d.label}({d.label === '红色' ? 'Ⅰ级' : d.label === '橙色' ? 'Ⅱ级' : d.label === '黄色' ? 'Ⅲ级' : 'Ⅳ级'})</span>
                      <span style={{ color: '#475569' }}>{totalLevel > 0 ? Math.round(resolved / totalLevel * 100) : 0}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
                      <div style={{ width: `${totalLevel > 0 ? (resolved / totalLevel) * 100 : 0}%`, height: 8, borderRadius: 4, background: d.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
