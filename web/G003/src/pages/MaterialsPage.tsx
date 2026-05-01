// @ts-nocheck
import { useState, useMemo } from 'react';
import {
  Package, Plus, Search, AlertTriangle, Clock, TrendingUp,
  BarChart3, Calendar, CheckCircle, XCircle, Edit2, Trash2,
  ArrowDownUp, Filter, RefreshCw, Printer, Download, X,
  AlertCircle, TrendingDown, Pill, Wrench, Droplets, Tag,
  Microscope, ScanBarcode, Link2, Users, FileText, ShoppingCart,
  ClipboardList, Approval, CheckSquare, Square, ArrowRight,
  Inbox, Outbound, Warehouse, History, Bell, ChevronRight,
  FileCheck, UserCheck, AlertOctagon
} from 'lucide-react';

// ============ 类型定义 ============
interface Material {
  id: string;
  code: string;
  name: string;
  category: '配件类' | '药品类' | '清洁类' | '包装类';
  spec: string;
  unit: string;
  stock: number;
  alertLine: number;
  expiryDate: string;
  supplier: string;
  status: '正常' | '偏低' | '告急' | '过期';
  price: number;
  lastRestockDate: string;
}

interface MaterialUsage {
  id: string;
  materialId: string;
  materialName: string;
  endoscopeId?: string;
  endoscopeName?: string;
  patientId: string;
  patientName: string;
  examId: string;
  examType: string;
  usageDate: string;
  usageTime: string;
  quantity: number;
  operator: string;
  notes?: string;
}

interface PurchaseOrder {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  purchaseDate: string;
  purchaser: string;
  status: '待采购' | '已采购' | '已入库';
  notes?: string;
}

interface ExpiryWarning {
  materialId: string;
  materialName: string;
  category: string;
  expiryDate: string;
  daysLeft: number;
  severity: '7天' | '30天' | '已过期';
  stock: number;
}

// 申领单类型
interface Requisition {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  spec: string;
  unit: string;
  quantity: number;
  applicant: string;
  applicantDept: string;
  applyDate: string;
  reason: string;
  status: '待审批' | '已通过' | '已拒绝' | '已入库';
  approver?: string;
  approveDate?: string;
  approveNote?: string;
  warehouseOps?: {
    operator: string;
    inDate: string;
    actualQty: number;
  };
}

// 入库记录
interface InboundRecord {
  id: string;
  materialId: string;
  materialName: string;
  batchNo: string;
  quantity: number;
  expiryDate: string;
  inDate: string;
  operator: string;
  supplier: string;
  status: '已入库' | '部分入库' | '已退回';
}

// ============ 样式 (G004规范：大字体) ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 32 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32, flexWrap: 'wrap', gap: 16
  },
  title: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 12 },
  headerActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  tabBar: {
    display: 'flex', gap: 8, marginBottom: 28, background: '#f1f5f9',
    padding: 6, borderRadius: 12, flexWrap: 'wrap'
  },
  tab: {
    padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 15,
    fontWeight: 600, transition: 'all 0.2s', border: 'none', background: 'transparent', color: '#64748b'
  },
  tabActive: { background: '#fff', color: '#1a3a5c', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
  searchBar: {
    display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center'
  },
  searchInput: {
    flex: 1, minWidth: 240, padding: '12px 16px', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 15, outline: 'none'
  },
  select: {
    padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 15, background: '#fff', outline: 'none', cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20, marginBottom: 32
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  statLabel: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  statWarning: { background: '#fef2f2' },
  statDanger: { background: '#fef2f2', border: '1px solid #fecaca' },
  statSuccess: { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: {
    padding: '16px 12px', textAlign: 'left', fontSize: 14, fontWeight: 600,
    color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'
  },
  td: { padding: '14px 12px', fontSize: 15, borderBottom: '1px solid #f1f5f9', color: '#334155' },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
    borderRadius: 14, fontSize: 13, fontWeight: 600
  },
  badgeGreen: { background: '#dcfce7', color: '#166534' },
  badgeYellow: { background: '#fef9c3', color: '#854d0e' },
  badgeRed: { background: '#fee2e2', color: '#991b1b' },
  badgeGray: { background: '#f1f5f9', color: '#475569', textDecoration: 'line-through' },
  badgeBlue: { background: '#dbeafe', color: '#1e40af' },
  badgePurple: { background: '#ede9fe', color: '#6d28d9' },
  btn: {
    padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all 0.15s', minHeight: 44,
  },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSecondary: { background: '#f1f5f9', color: '#334155' },
  btnDanger: { background: '#fee2e2', color: '#991b1b' },
  btnSuccess: { background: '#dcfce7', color: '#166534' },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  modalContent: {
    background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 700,
    maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1a3a5c' },
  formGroup: { marginBottom: 20 },
  formLabel: { display: 'block', fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 6 },
  formInput: {
    width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box'
  },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  chartContainer: {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24
  },
  chartTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c', marginBottom: 20 },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 },
  alertCard: {
    padding: 16, borderRadius: 10, marginBottom: 10, display: 'flex',
    alignItems: 'center', gap: 12
  },
  alertUrgent: { background: '#fee2e2', border: '1px solid #fecaca' },
  alertWarning: { background: '#fef9c3', border: '1px solid #fde68a' },
  alertExpired: { background: '#f1f5f9', border: '1px solid #cbd5e1' },
  emptyState: {
    textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 16,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 16, background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
    borderRadius: 6, fontSize: 13, fontWeight: 600
  },
  tagAccessory: { background: '#ede9fe', color: '#6d28d9' },
  tagDrug: { background: '#dbeafe', color: '#1e40af' },
  tagClean: { background: '#d1fae5', color: '#065f46' },
  tagPack: { background: '#fef3c7', color: '#92400e' },
  // 审批流程专用
  approvalCard: {
    background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12,
    border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
  },
  approvalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12
  },
  approvalTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c' },
  approvalMeta: { display: 'flex', gap: 16, fontSize: 14, color: '#64748b' },
  approvalBody: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12, padding: '12px 0', borderTop: '1px solid #f1f5f9'
  },
  approvalItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  approvalItemLabel: { fontSize: 12, color: '#94a3b8' },
  approvalItemValue: { fontSize: 14, fontWeight: 500, color: '#334155' },
  stepIndicator: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 },
  stepDot: { width: 10, height: 10, borderRadius: '50%' },
  stepLine: { flex: 1, height: 2, background: '#e2e8f0' },
  // 入库记录
  inboundCard: {
    background: '#fff', borderRadius: 10, padding: 16, marginBottom: 10,
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8
  },
  actionBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20
  },
  filterTags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterTag: {
    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
    border: '1px solid #e2e8f0', background: '#fff', color: '#64748b'
  },
  filterTagActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c'
  }
};

// ============ 颜色映射 ============
const categoryColors: Record<string, { bg: string; color: string }> = {
  '配件类': { bg: '#ede9fe', color: '#6d28d9' },
  '药品类': { bg: '#dbeafe', color: '#1e40af' },
  '清洁类': { bg: '#d1fae5', color: '#065f46' },
  '包装类': { bg: '#fef3c7', color: '#92400e' },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  '正常': { bg: '#dcfce7', color: '#166534' },
  '偏低': { bg: '#fef9c3', color: '#854d0e' },
  '告急': { bg: '#fee2e2', color: '#991b1b' },
  '过期': { bg: '#f1f5f9', color: '#475569' },
  '待审批': { bg: '#fef9c3', color: '#854d0e' },
  '已通过': { bg: '#dcfce7', color: '#166534' },
  '已拒绝': { bg: '#fee2e2', color: '#991b1b' },
  '已入库': { bg: '#dbeafe', color: '#1e40af' },
};

// ============ 50+ 耗材数据 ============
const mockMaterials: Material[] = [
  { id: 'M001', code: 'BJ-001', name: '活检钳', category: '配件类', spec: 'FB-24CR-1', unit: '把', stock: 15, alertLine: 20, expiryDate: '2027-06-15', supplier: 'Olympus医疗', status: '偏低', price: 680, lastRestockDate: '2026-03-10' },
  { id: 'M002', code: 'BJ-002', name: '圈套器', category: '配件类', spec: 'SD-210U-1', unit: '个', stock: 8, alertLine: 15, expiryDate: '2027-03-20', supplier: 'Olympus医疗', status: '偏低', price: 420, lastRestockDate: '2026-02-28' },
  { id: 'M003', code: 'BJ-003', name: '注射针', category: '配件类', spec: 'NM-201L-1', unit: '支', stock: 45, alertLine: 30, expiryDate: '2026-12-31', supplier: 'Boston科学', status: '正常', price: 85, lastRestockDate: '2026-04-01' },
  { id: 'M004', code: 'BJ-004', name: '止血夹', category: '配件类', spec: 'HX-610-090', unit: '枚', stock: 3, alertLine: 10, expiryDate: '2026-05-10', supplier: 'Olympus医疗', status: '告急', price: 560, lastRestockDate: '2026-01-15' },
  { id: 'M005', code: 'BJ-005', name: '导丝', category: '配件类', spec: 'M00526720', unit: '根', stock: 22, alertLine: 15, expiryDate: '2028-01-01', supplier: 'Cook医疗', status: '正常', price: 280, lastRestockDate: '2026-03-20' },
  { id: 'M006', code: 'YP-001', name: '利多卡因胶浆', category: '药品类', spec: '10g:0.2g', unit: '支', stock: 120, alertLine: 50, expiryDate: '2026-06-30', supplier: '华润紫竹药业', status: '正常', price: 12, lastRestockDate: '2026-04-10' },
  { id: 'M007', code: 'YP-002', name: '丙泊酚注射液', category: '药品类', spec: '20ml:0.2g', unit: '支', stock: 35, alertLine: 40, expiryDate: '2026-08-15', supplier: 'Aspen制药', status: '偏低', price: 68, lastRestockDate: '2026-03-25' },
  { id: 'M008', code: 'YP-003', name: '生理盐水', category: '药品类', spec: '250ml:2.25g', unit: '瓶', stock: 200, alertLine: 100, expiryDate: '2027-12-31', supplier: '科伦药业', status: '正常', price: 3.5, lastRestockDate: '2026-04-15' },
  { id: 'M009', code: 'YP-004', name: '碘伏消毒液', category: '药品类', spec: '500ml', unit: '瓶', stock: 8, alertLine: 20, expiryDate: '2026-04-25', supplier: '山东利尔康', status: '告急', price: 15, lastRestockDate: '2026-02-01' },
  { id: 'M010', code: 'QJ-001', name: '酶清洗剂', category: '清洁类', spec: '5L/桶', unit: '桶', stock: 12, alertLine: 8, expiryDate: '2026-10-30', supplier: '3M中国', status: '正常', price: 180, lastRestockDate: '2026-03-30' },
  { id: 'M011', code: 'QJ-002', name: '邻苯二甲醛消毒剂', category: '清洁类', spec: '5L/桶', unit: '桶', stock: 5, alertLine: 10, expiryDate: '2026-07-20', supplier: '山东利尔康', status: '偏低', price: 220, lastRestockDate: '2026-02-20' },
  { id: 'M012', code: 'QJ-003', name: '干燥剂', category: '清洁类', spec: '500g/罐', unit: '罐', stock: 30, alertLine: 20, expiryDate: '2028-06-30', supplier: '国产通用', status: '正常', price: 25, lastRestockDate: '2026-04-05' },
  { id: 'M013', code: 'BZ-001', name: '无菌包装袋', category: '包装类', spec: '100×150mm', unit: '个', stock: 500, alertLine: 200, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 2, lastRestockDate: '2026-04-20' },
  { id: 'M014', code: 'BZ-002', name: '无菌包装袋', category: '包装类', spec: '150×250mm', unit: '个', stock: 180, alertLine: 150, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 3, lastRestockDate: '2026-04-20' },
  { id: 'M015', code: 'BZ-003', name: '标签纸', category: '包装类', spec: '50×30mm', unit: '张', stock: 25, alertLine: 500, expiryDate: '2027-06-30', supplier: '得力集团', status: '告急', price: 0.5, lastRestockDate: '2026-01-10' },
  { id: 'M016', code: 'BJ-006', name: '异物网篮', category: '配件类', spec: 'FG-222Q-1', unit: '个', stock: 10, alertLine: 8, expiryDate: '2027-09-30', supplier: 'Olympus医疗', status: '正常', price: 380, lastRestockDate: '2026-03-15' },
  { id: 'M017', code: 'BJ-007', name: '球囊扩张导管', category: '配件类', spec: 'CRE-5.5/6.0/6.5', unit: '根', stock: 6, alertLine: 5, expiryDate: '2027-04-15', supplier: 'Boston科学', status: '正常', price: 1200, lastRestockDate: '2026-04-02' },
  { id: 'M018', code: 'YP-005', name: '二甲硅油', category: '药品类', spec: '10ml:40mg', unit: '支', stock: 60, alertLine: 30, expiryDate: '2026-09-30', supplier: '自贡鸿鹤', status: '正常', price: 8, lastRestockDate: '2026-03-28' },
  { id: 'M019', code: 'QJ-004', name: '75%酒精', category: '清洁类', spec: '500ml/瓶', unit: '瓶', stock: 40, alertLine: 30, expiryDate: '2026-11-30', supplier: '国产通用', status: '正常', price: 6, lastRestockDate: '2026-04-18' },
  { id: 'M020', code: 'YP-006', name: '祛泡剂', category: '药品类', spec: '10ml:20mg', unit: '支', stock: 2, alertLine: 30, expiryDate: '2026-05-05', supplier: '自贡鸿鹤', status: '过期', price: 9, lastRestockDate: '2025-12-01' },
  { id: 'M021', code: 'BJ-008', name: '高频电刀头', category: '配件类', spec: 'KD-620Q', unit: '个', stock: 18, alertLine: 12, expiryDate: '2027-02-28', supplier: 'Olympus医疗', status: '正常', price: 320, lastRestockDate: '2026-04-08' },
  { id: 'M022', code: 'BJ-009', name: '喷嘴', category: '配件类', spec: 'PW-6C-1', unit: '个', stock: 35, alertLine: 20, expiryDate: '2028-06-30', supplier: 'Olympus医疗', status: '正常', price: 45, lastRestockDate: '2026-03-22' },
  { id: 'M023', code: 'YP-007', name: '去甲肾上腺素', category: '药品类', spec: '1ml:2mg', unit: '支', stock: 50, alertLine: 30, expiryDate: '2026-12-31', supplier: '上海禾丰', status: '正常', price: 5, lastRestockDate: '2026-04-12' },
  { id: 'M024', code: 'QJ-005', name: '过氧乙酸消毒剂', category: '清洁类', spec: '5L/桶', unit: '桶', stock: 8, alertLine: 6, expiryDate: '2026-08-15', supplier: '山东利尔康', status: '正常', price: 150, lastRestockDate: '2026-04-01' },
  { id: 'M025', code: 'BZ-004', name: '一次性手套', category: '包装类', spec: 'M码/100只', unit: '盒', stock: 45, alertLine: 30, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 28, lastRestockDate: '2026-04-15' },
  { id: 'M026', code: 'BJ-010', name: '扩张球囊', category: '配件类', spec: 'B5-2C-4.0', unit: '个', stock: 7, alertLine: 8, expiryDate: '2027-01-15', supplier: 'Boston科学', status: '正常', price: 850, lastRestockDate: '2026-03-28' },
  { id: 'M027', code: 'YP-008', name: '阿托品注射液', category: '药品类', spec: '1ml:0.5mg', unit: '支', stock: 80, alertLine: 40, expiryDate: '2027-06-30', supplier: '天津金耀', status: '正常', price: 3.8, lastRestockDate: '2026-04-10' },
  { id: 'M028', code: 'QJ-006', name: '超声探头专用刷', category: '清洁类', spec: 'SB-1型', unit: '个', stock: 60, alertLine: 30, expiryDate: '2028-12-31', supplier: '3M中国', status: '正常', price: 12, lastRestockDate: '2026-04-05' },
  { id: 'M029', code: 'BZ-005', name: '纱布', category: '包装类', spec: '10×10cm/10片', unit: '包', stock: 120, alertLine: 50, expiryDate: '2028-06-30', supplier: '国产通用', status: '正常', price: 5, lastRestockDate: '2026-04-18' },
  { id: 'M030', code: 'BJ-011', name: '取石球囊', category: '配件类', spec: 'B5-2Q-3.0', unit: '个', stock: 4, alertLine: 6, expiryDate: '2027-03-10', supplier: 'Boston科学', status: '偏低', price: 720, lastRestockDate: '2026-03-01' },
  { id: 'M031', code: 'YP-009', name: '地西泮注射液', category: '药品类', spec: '2ml:10mg', unit: '支', stock: 40, alertLine: 25, expiryDate: '2026-10-31', supplier: '天津力生', status: '正常', price: 4.5, lastRestockDate: '2026-04-08' },
  { id: 'M032', code: 'QJ-007', name: '84消毒液', category: '清洁类', spec: '500ml/瓶', unit: '瓶', stock: 55, alertLine: 30, expiryDate: '2026-07-31', supplier: '国产通用', status: '正常', price: 4, lastRestockDate: '2026-04-12' },
  { id: 'M033', code: 'BZ-006', name: '棉签', category: '包装类', spec: '10cm/50支', unit: '包', stock: 200, alertLine: 100, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 3, lastRestockDate: '2026-04-20' },
  { id: 'M034', code: 'BJ-012', name: '一次性电刀片', category: '配件类', spec: 'KD-211Q', unit: '个', stock: 25, alertLine: 15, expiryDate: '2027-08-31', supplier: 'Olympus医疗', status: '正常', price: 180, lastRestockDate: '2026-03-25' },
  { id: 'M035', code: 'YP-010', name: '咪达唑仑注射液', category: '药品类', spec: '2ml:10mg', unit: '支', stock: 28, alertLine: 30, expiryDate: '2026-11-30', supplier: '江苏恩华', status: '偏低', price: 38, lastRestockDate: '2026-03-15' },
  { id: 'M036', code: 'QJ-008', name: '戊二醛消毒液', category: '清洁类', spec: '5L/桶', unit: '桶', stock: 6, alertLine: 8, expiryDate: '2026-06-30', supplier: '山东利尔康', status: '偏低', price: 200, lastRestockDate: '2026-02-15' },
  { id: 'M037', code: 'BZ-007', name: 'PE手套', category: '包装类', spec: '100只/盒', unit: '盒', stock: 80, alertLine: 40, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 15, lastRestockDate: '2026-04-10' },
  { id: 'M038', code: 'BJ-013', name: '切开刀', category: '配件类', spec: 'KD-10Q-1', unit: '个', stock: 12, alertLine: 8, expiryDate: '2027-05-31', supplier: 'Olympus医疗', status: '正常', price: 450, lastRestockDate: '2026-04-02' },
  { id: 'M039', code: 'YP-011', name: '肾上腺素', category: '药品类', spec: '1ml:1mg', unit: '支', stock: 65, alertLine: 40, expiryDate: '2027-01-31', supplier: '天津金耀', status: '正常', price: 4.2, lastRestockDate: '2026-04-15' },
  { id: 'M040', code: 'QJ-009', name: '多酶清洗液', category: '清洁类', spec: '1L/瓶', unit: '瓶', stock: 20, alertLine: 12, expiryDate: '2026-09-30', supplier: '3M中国', status: '正常', price: 85, lastRestockDate: '2026-04-08' },
  { id: 'M041', code: 'BZ-008', name: '医用胶带', category: '包装类', spec: '1.25cm×10m', unit: '卷', stock: 35, alertLine: 20, expiryDate: '2028-06-30', supplier: '国产通用', status: '正常', price: 8, lastRestockDate: '2026-04-12' },
  { id: 'M042', code: 'BJ-014', name: '套扎器', category: '配件类', spec: 'MH-463', unit: '个', stock: 9, alertLine: 6, expiryDate: '2027-04-30', supplier: 'Olympus医疗', status: '正常', price: 580, lastRestockDate: '2026-04-05' },
  { id: 'M043', code: 'YP-012', name: '氟马西尼注射液', category: '药品类', spec: '5ml:0.5mg', unit: '支', stock: 22, alertLine: 15, expiryDate: '2026-12-31', supplier: '江苏恩华', status: '正常', price: 65, lastRestockDate: '2026-03-28' },
  { id: 'M044', code: 'QJ-010', name: '75%酒精棉球', category: '清洁类', spec: '100g/罐', unit: '罐', stock: 30, alertLine: 20, expiryDate: '2026-08-31', supplier: '国产通用', status: '正常', price: 10, lastRestockDate: '2026-04-15' },
  { id: 'M045', code: 'BZ-009', name: '一次性帽子', category: '包装类', spec: '10个/包', unit: '包', stock: 100, alertLine: 50, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 6, lastRestockDate: '2026-04-18' },
  { id: 'M046', code: 'BJ-015', name: '黄斑马导丝', category: '配件类', spec: 'M0052820', unit: '根', stock: 5, alertLine: 8, expiryDate: '2028-01-01', supplier: 'Boston科学', status: '偏低', price: 520, lastRestockDate: '2026-03-10' },
  { id: 'M047', code: 'YP-013', name: '甲氧氯普胺', category: '药品类', spec: '1ml:10mg', unit: '支', stock: 70, alertLine: 40, expiryDate: '2027-03-31', supplier: '天津力生', status: '正常', price: 3.2, lastRestockDate: '2026-04-12' },
  { id: 'M048', code: 'QJ-011', name: '含氯消毒片', category: '清洁类', spec: '500片/瓶', unit: '瓶', stock: 15, alertLine: 10, expiryDate: '2027-06-30', supplier: '山东利尔康', status: '正常', price: 45, lastRestockDate: '2026-04-05' },
  { id: 'M049', code: 'BZ-010', name: '一次性口罩', category: '包装类', spec: '10个/包', unit: '包', stock: 150, alertLine: 80, expiryDate: '2028-12-31', supplier: '国产通用', status: '正常', price: 8, lastRestockDate: '2026-04-20' },
  { id: 'M050', code: 'BJ-016', name: '硬化剂注射针', category: '配件类', spec: 'NM-200L-1', unit: '支', stock: 14, alertLine: 10, expiryDate: '2027-02-28', supplier: 'Olympus医疗', status: '正常', price: 290, lastRestockDate: '2026-04-08' },
  { id: 'M051', code: 'YP-014', name: '山莨菪碱注射液', category: '药品类', spec: '1ml:10mg', unit: '支', stock: 55, alertLine: 30, expiryDate: '2027-05-31', supplier: '杭州民生', status: '正常', price: 4.8, lastRestockDate: '2026-04-10' },
  { id: 'M052', code: 'QJ-012', name: '季铵盐消毒液', category: '清洁类', spec: '5L/桶', unit: '桶', stock: 9, alertLine: 6, expiryDate: '2026-11-30', supplier: '3M中国', status: '正常', price: 175, lastRestockDate: '2026-03-30' },
  { id: 'M053', code: 'YP-015', name: '凝血酶冻干粉', category: '药品类', spec: '500单位', unit: '支', stock: 18, alertLine: 15, expiryDate: '2026-10-15', supplier: '上海莱士', status: '正常', price: 85, lastRestockDate: '2026-04-02' },
  { id: 'M054', code: 'BJ-017', name: '一次性乳头切开刀', category: '配件类', spec: 'KD-10Q-2', unit: '个', stock: 8, alertLine: 10, expiryDate: '2027-06-30', supplier: 'Olympus医疗', status: '偏低', price: 420, lastRestockDate: '2026-03-15' },
];

const mockUsageRecords: MaterialUsage[] = [
  { id: 'UR001', materialId: 'M001', materialName: '活检钳', endoscopeId: 'EN001', endoscopeName: 'Olympus电子腹部超声', patientId: 'P001', patientName: '王建国', examId: 'EX001', examType: '电子腹部超声检查', usageDate: '2026-04-29', usageTime: '09:05', quantity: 1, operator: '赵晓敏', notes: '胃窦活检' },
  { id: 'UR002', materialId: 'M001', materialName: '活检钳', endoscopeId: 'EN001', endoscopeName: 'Olympus电子腹部超声', patientId: 'P002', patientName: '李秀芳', examId: 'EX002', examType: '电子腹部超声检查', usageDate: '2026-04-29', usageTime: '09:35', quantity: 1, operator: '赵晓敏', notes: '胃体活检' },
  { id: 'UR003', materialId: 'M003', materialName: '注射针', endoscopeId: 'EN001', endoscopeName: 'Olympus电子腹部超声', patientId: 'P003', patientName: '张德明', examId: 'EX003', examType: '食管静脉曲张治疗', usageDate: '2026-04-29', usageTime: '10:30', quantity: 1, operator: '赵晓敏', notes: '静脉曲张注射' },
  { id: 'UR004', materialId: 'M004', materialName: '止血夹', endoscopeId: 'EN001', endoscopeName: 'Olympus电子腹部超声', patientId: 'P003', patientName: '张德明', examId: 'EX003', examType: '食管静脉曲张治疗', usageDate: '2026-04-29', usageTime: '10:45', quantity: 2, operator: '赵晓敏', notes: '止血夹闭' },
  { id: 'UR005', materialId: 'M006', materialName: '利多卡因胶浆', endoscopeId: 'EN001', endoscopeName: 'Olympus电子腹部超声', patientId: 'P004', patientName: '周丽娟', examId: 'EX004', examType: '电子腹部超声检查', usageDate: '2026-04-28', usageTime: '14:00', quantity: 1, operator: '赵晓敏', notes: '术前局麻' },
];

// 申领单数据
const mockRequisitions: Requisition[] = [
  { id: 'REQ001', materialId: 'M004', materialName: '止血夹', category: '配件类', spec: 'HX-610-090', unit: '枚', quantity: 10, applicant: '张护士', applicantDept: '超声中心', applyDate: '2026-04-28', reason: '库存告急，急需补充', status: '待审批' },
  { id: 'REQ002', materialId: 'M002', materialName: '圈套器', category: '配件类', spec: 'SD-210U-1', unit: '个', quantity: 20, applicant: '李护士', applicantDept: '超声中心', applyDate: '2026-04-27', reason: '库存偏低，需补充', status: '已通过' },
  { id: 'REQ003', materialId: 'M015', materialName: '标签纸', category: '包装类', spec: '50×30mm', unit: '张', quantity: 2000, applicant: '王护士', applicantDept: '超声中心', applyDate: '2026-04-26', reason: '库存告急，标签即将用完', status: '已入库', approver: '刘主任', approveDate: '2026-04-27', warehouseOps: { operator: '仓管员小张', inDate: '2026-04-28', actualQty: 2000 } },
  { id: 'REQ004', materialId: 'M007', materialName: '丙泊酚注射液', category: '药品类', spec: '20ml:0.2g', unit: '支', quantity: 50, applicant: '赵医生', applicantDept: '麻醉科', applyDate: '2026-04-29', reason: '麻醉用药库存不足', status: '待审批' },
  { id: 'REQ005', materialId: 'M011', materialName: '邻苯二甲醛消毒剂', category: '清洁类', spec: '5L/桶', unit: '桶', quantity: 10, applicant: '孙护士', applicantDept: '超声中心', applyDate: '2026-04-25', reason: '消毒剂库存偏低', status: '已拒绝', approver: '刘主任', approveDate: '2026-04-26', approveNote: '库存尚可，暂不采购' },
];

// 入库记录数据
const mockInboundRecords: InboundRecord[] = [
  { id: 'IN001', materialId: 'M001', materialName: '活检钳', batchNo: 'BJ20260401', quantity: 20, expiryDate: '2028-04-01', inDate: '2026-04-10', operator: '仓管员小张', supplier: 'Olympus医疗', status: '已入库' },
  { id: 'IN002', materialId: 'M008', materialName: '生理盐水', batchNo: 'KL20260415', quantity: 100, expiryDate: '2028-04-15', inDate: '2026-04-15', operator: '仓管员小张', supplier: '科伦药业', status: '已入库' },
  { id: 'IN003', materialId: 'M006', materialName: '利多卡因胶浆', batchNo: 'ZXZ20260408', quantity: 50, expiryDate: '2027-04-08', inDate: '2026-04-10', operator: '仓管员小王', supplier: '华润紫竹药业', status: '已入库' },
  { id: 'IN004', materialId: 'M010', materialName: '酶清洗剂', batchNo: '3M20260325', quantity: 8, expiryDate: '2027-03-25', inDate: '2026-03-30', operator: '仓管员小张', supplier: '3M中国', status: '已入库' },
];

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO001', materialId: 'M001', materialName: '活检钳', category: '配件类', supplier: 'Olympus医疗', quantity: 50, unitPrice: 680, totalAmount: 34000, purchaseDate: '2026-04-28', purchaser: '刘伟东', status: '待采购' },
  { id: 'PO002', materialId: 'M004', materialName: '止血夹', category: '配件类', supplier: 'Olympus医疗', quantity: 30, unitPrice: 560, totalAmount: 16800, purchaseDate: '2026-04-28', purchaser: '刘伟东', status: '待采购' },
  { id: 'PO003', materialId: 'M009', materialName: '碘伏消毒液', category: '药品类', supplier: '山东利尔康', quantity: 20, unitPrice: 15, totalAmount: 300, purchaseDate: '2026-04-27', purchaser: '刘伟东', status: '已采购' },
  { id: 'PO004', materialId: 'M015', materialName: '标签纸', category: '包装类', supplier: '得力集团', quantity: 2000, unitPrice: 0.5, totalAmount: 1000, purchaseDate: '2026-04-25', purchaser: '刘伟东', status: '已入库' },
];

// ============ 工具函数 ============
const getStatusBadge = (status: string) => {
  const colors = statusColors[status] || { bg: '#f1f5f9', color: '#475569' };
  return <span style={{ ...s.badge, background: colors.bg, color: colors.color }}>{status}</span>;
};

const getCategoryTag = (category: string) => {
  const color = categoryColors[category] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ ...s.tag, background: color.bg, color: color.color }}>
      {category}
    </span>
  );
};

const getExpiryDaysLeft = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getExpirySeverity = (daysLeft: number): '7天' | '30天' | '已过期' | null => {
  if (daysLeft < 0) return '已过期';
  if (daysLeft <= 7) return '7天';
  if (daysLeft <= 30) return '30天';
  return null;
};

// ============ 组件 ============
export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'usage' | 'purchase' | 'statistics' | 'expiry' | 'requisition' | 'inbound'>('inventory');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [usageRecords] = useState<MaterialUsage[]>(mockUsageRecords);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [requisitions, setRequisitions] = useState<Requisition[]>(mockRequisitions);
  const [inboundRecords] = useState<InboundRecord[]>(mockInboundRecords);

  // 表单状态
  const [inForm, setInForm] = useState({ materialId: '', quantity: '', batchNo: '', expiryDate: '', operator: '' });
  const [outForm, setOutForm] = useState({ materialId: '', patientId: '', examId: '', quantity: '', operator: '' });
  const [purchaseForm, setPurchaseForm] = useState({ materialName: '', category: '配件类', supplier: '', quantity: '', unitPrice: '', purchaser: '' });
  const [requisitionForm, setRequisitionForm] = useState({ materialId: '', quantity: '', reason: '', applicant: '' });

  // 审批状态过滤
  const [approvalFilter, setApprovalFilter] = useState<string>('全部');

  // 计算统计数据
  const stats = useMemo(() => {
    const totalMaterials = materials.length;
    const lowStock = materials.filter(m => m.status === '偏低' || m.status === '告急').length;
    const expired = materials.filter(m => m.status === '过期').length;
    const nearExpiry = materials.filter(m => {
      const days = getExpiryDaysLeft(m.expiryDate);
      return days >= 0 && days <= 30;
    }).length;
    const totalValue = materials.reduce((sum, m) => sum + m.stock * m.price, 0);
    const urgentOrders = purchaseOrders.filter(p => p.status === '待采购').length;
    const pendingApprovals = requisitions.filter(r => r.status === '待审批').length;
    return { totalMaterials, lowStock, expired, nearExpiry, totalValue, urgentOrders, pendingApprovals };
  }, [materials, purchaseOrders, requisitions]);

  // 效期预警列表
  const expiryWarnings = useMemo<ExpiryWarning[]>(() => {
    return materials
      .map(m => {
        const daysLeft = getExpiryDaysLeft(m.expiryDate);
        const severity = getExpirySeverity(daysLeft);
        if (!severity) return null;
        return { materialId: m.id, materialName: m.name, category: m.category, expiryDate: m.expiryDate, daysLeft, severity: severity as '7天' | '30天' | '已过期', stock: m.stock };
      })
      .filter((w): w is ExpiryWarning => w !== null)
      .sort((a, b) => {
        if (a.severity === '已过期' && b.severity !== '已过期') return -1;
        if (b.severity === '已过期' && a.severity !== '已过期') return 1;
        return a.daysLeft - b.daysLeft;
      });
  }, [materials]);

  // 过滤后的耗材列表
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchKeyword = m.name.includes(searchKeyword) || m.code.includes(searchKeyword);
      const matchCategory = filterCategory === '全部' || m.category === filterCategory;
      const matchStatus = filterStatus === '全部' || m.status === filterStatus;
      return matchKeyword && matchCategory && matchStatus;
    });
  }, [materials, searchKeyword, filterCategory, filterStatus]);

  // 过滤后的申领列表
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      const matchFilter = approvalFilter === '全部' || r.status === approvalFilter;
      const matchKeyword = !searchKeyword || r.materialName.includes(searchKeyword) || r.applicant.includes(searchKeyword);
      return matchFilter && matchKeyword;
    });
  }, [requisitions, approvalFilter, searchKeyword]);

  // TOP5消耗统计
  const topConsumption = useMemo(() => {
    const usageCount: Record<string, { name: string; count: number }> = {};
    usageRecords.forEach(u => {
      if (!usageCount[u.materialId]) {
        usageCount[u.materialId] = { name: u.materialName, count: 0 };
      }
      usageCount[u.materialId].count += u.quantity;
    });
    return Object.values(usageCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [usageRecords]);

  // 检查类型分布
  const examTypeUsage = useMemo(() => {
    const typeCount: Record<string, number> = {};
    usageRecords.forEach(u => {
      if (!typeCount[u.examType]) typeCount[u.examType] = 0;
      typeCount[u.examType] += u.quantity;
    });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [usageRecords]);

  // 入库处理
  const handleInSubmit = () => {
    if (!inForm.materialId || !inForm.quantity) return;
    setMaterials(prev => prev.map(m => {
      if (m.id === inForm.materialId) {
        const newStock = m.stock + parseInt(inForm.quantity);
        let status: Material['status'] = '正常';
        if (newStock < m.alertLine) status = newStock < m.alertLine * 0.5 ? '告急' : '偏低';
        return { ...m, stock: newStock, status, lastRestockDate: new Date().toISOString().split('T')[0] };
      }
      return m;
    }));
    setShowInModal(false);
    setInForm({ materialId: '', quantity: '', batchNo: '', expiryDate: '', operator: '' });
  };

  // 出库处理
  const handleOutSubmit = () => {
    if (!outForm.materialId || !outForm.quantity) return;
    setMaterials(prev => prev.map(m => {
      if (m.id === outForm.materialId) {
        const newStock = Math.max(0, m.stock - parseInt(outForm.quantity));
        let status: Material['status'] = '正常';
        if (newStock < m.alertLine) status = newStock < m.alertLine * 0.5 ? '告急' : '偏低';
        return { ...m, stock: newStock, status };
      }
      return m;
    }));
    setShowOutModal(false);
    setOutForm({ materialId: '', patientId: '', examId: '', quantity: '', operator: '' });
  };

  // 采购处理
  const handlePurchaseSubmit = () => {
    if (!purchaseForm.materialName || !purchaseForm.quantity) return;
    const newOrder: PurchaseOrder = {
      id: `PO${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      materialId: '',
      materialName: purchaseForm.materialName,
      category: purchaseForm.category,
      supplier: purchaseForm.supplier,
      quantity: parseInt(purchaseForm.quantity),
      unitPrice: parseFloat(purchaseForm.unitPrice) || 0,
      totalAmount: (parseInt(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0),
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaser: purchaseForm.purchaser || '刘伟东',
      status: '待采购',
    };
    setPurchaseOrders(prev => [...prev, newOrder]);
    setShowPurchaseModal(false);
    setPurchaseForm({ materialName: '', category: '配件类', supplier: '', quantity: '', unitPrice: '', purchaser: '' });
  };

  // 申领处理
  const handleRequisitionSubmit = () => {
    if (!requisitionForm.materialId || !requisitionForm.quantity) return;
    const mat = materials.find(m => m.id === requisitionForm.materialId);
    const newReq: Requisition = {
      id: `REQ${String(requisitions.length + 1).padStart(3, '0')}`,
      materialId: requisitionForm.materialId,
      materialName: mat?.name || '',
      category: mat?.category || '配件类',
      spec: mat?.spec || '',
      unit: mat?.unit || '',
      quantity: parseInt(requisitionForm.quantity),
      applicant: requisitionForm.applicant || '张护士',
      applicantDept: '超声中心',
      applyDate: new Date().toISOString().split('T')[0],
      reason: requisitionForm.reason,
      status: '待审批',
    };
    setRequisitions(prev => [...prev, newReq]);
    setShowRequisitionModal(false);
    setRequisitionForm({ materialId: '', quantity: '', reason: '', applicant: '' });
  };

  // 审批申领
  const handleApprove = (reqId: string, approve: boolean, note?: string) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: approve ? '已通过' : '已拒绝',
          approver: '刘主任',
          approveDate: new Date().toISOString().split('T')[0],
          approveNote: note,
        };
      }
      return r;
    }));
  };

  // 确认入库（从审批通过到已入库）
  const handleConfirmInbound = (reqId: string) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === reqId && r.status === '已通过') {
        return {
          ...r,
          status: '已入库',
          warehouseOps: {
            operator: '仓管员小张',
            inDate: new Date().toISOString().split('T')[0],
            actualQty: r.quantity,
          },
        };
      }
      return r;
    }));
  };

  // 生成采购建议
  const generatePurchaseSuggestions = () => {
    const suggestions = materials
      .filter(m => m.stock < m.alertLine)
      .map(m => ({
        materialName: m.name,
        category: m.category,
        currentStock: m.stock,
        alertLine: m.alertLine,
        suggestedQty: m.alertLine * 2 - m.stock,
        supplier: m.supplier,
      }));
    return suggestions;
  };

  const purchaseSuggestions = generatePurchaseSuggestions();

  // 渲染库存管理
  const renderInventory = () => (
    <>
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="搜索耗材名称或编号..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
        />
        <select style={s.select} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="全部">全部分类</option>
          <option value="配件类">配件类</option>
          <option value="药品类">药品类</option>
          <option value="清洁类">清洁类</option>
          <option value="包装类">包装类</option>
        </select>
        <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="全部">全部状态</option>
          <option value="正常">正常</option>
          <option value="偏低">偏低</option>
          <option value="告急">告急</option>
          <option value="过期">过期</option>
        </select>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>编号</th>
            <th style={s.th}>名称</th>
            <th style={s.th}>分类</th>
            <th style={s.th}>规格</th>
            <th style={s.th}>单位</th>
            <th style={s.th}>库存量</th>
            <th style={s.th}>警戒线</th>
            <th style={s.th}>有效期</th>
            <th style={s.th}>供应商</th>
            <th style={s.th}>状态</th>
            <th style={s.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaterials.map(m => (
            <tr key={m.id} style={{ background: m.status === '过期' ? '#f8fafc' : undefined }}>
              <td style={s.td}>{m.code}</td>
              <td style={s.td}>{m.name}</td>
              <td style={s.td}>{getCategoryTag(m.category)}</td>
              <td style={s.td}>{m.spec}</td>
              <td style={s.td}>{m.unit}</td>
              <td style={s.td}>{m.stock}</td>
              <td style={s.td}>{m.alertLine}</td>
              <td style={s.td}>{m.expiryDate}</td>
              <td style={s.td}>{m.supplier}</td>
              <td style={s.td}>{getStatusBadge(m.status)}</td>
              <td style={s.td}>
                <button style={{ ...s.btn, ...s.btnSecondary, padding: '6px 12px', fontSize: 13 }} onClick={() => { setInForm({ ...inForm, materialId: m.id }); setShowInModal(true); }}>入库</button>
                <button style={{ ...s.btn, ...s.btnSecondary, padding: '6px 12px', fontSize: 13, marginLeft: 6 }} onClick={() => { setOutForm({ ...outForm, materialId: m.id }); setShowOutModal(true); }}>出库</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredMaterials.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <Package size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无耗材数据</div>
            <div style={s.emptyDesc}>没有找到符合条件的耗材记录，请调整筛选条件</div>
          </div>
        </div>
      )}
    </>
  );

  // 渲染使用追溯
  const renderUsage = () => (
    <>
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索患者姓名或耗材名称..." />
        <select style={s.select}>
          <option value="">全部检查类型</option>
          <option value="腹部超声">腹部超声</option>
          <option value="肠镜">肠镜</option>
          <option value="ERCP">ERCP</option>
          <option value="超声超声探头">超声超声探头</option>
        </select>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>日期时间</th>
            <th style={s.th}>耗材名称</th>
            <th style={s.th}>关联超声探头</th>
            <th style={s.th}>患者姓名</th>
            <th style={s.th}>检查类型</th>
            <th style={s.th}>数量</th>
            <th style={s.th}>经手人</th>
            <th style={s.th}>备注</th>
          </tr>
        </thead>
        <tbody>
          {usageRecords.map(r => (
            <tr key={r.id}>
              <td style={s.td}>{r.usageDate} {r.usageTime}</td>
              <td style={s.td}>{r.materialName}</td>
              <td style={s.td}>{r.endoscopeName || '-'}</td>
              <td style={s.td}>{r.patientName}</td>
              <td style={s.td}>{r.examType}</td>
              <td style={s.td}>{r.quantity}</td>
              <td style={s.td}>{r.operator}</td>
              <td style={s.td}>{r.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {usageRecords.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <ClipboardList size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无使用记录</div>
            <div style={s.emptyDesc}>当前没有耗材使用记录，请检查筛选条件</div>
          </div>
        </div>
      )}
    </>
  );

  // 渲染采购计划
  const renderPurchase = () => (
    <>
      <div style={s.actionBar}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a3a5c' }}>采购建议单（库存低于警戒线）</div>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowPurchaseModal(true)}>
          <Plus size={16} /> 新增采购
        </button>
      </div>

      {purchaseSuggestions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          {purchaseSuggestions.map((sug, i) => (
            <div key={i} style={{ ...s.alertCard, ...s.alertWarning }}>
              <AlertTriangle size={18} color="#d97706" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#92400e', fontSize: 15 }}>{sug.materialName}</div>
                <div style={{ fontSize: 13, color: '#78350f' }}>当前库存{sug.currentStock}，建议采购{sug.suggestedQty}{materials.find(m => m.name === sug.materialName)?.unit}</div>
              </div>
              <button style={{ ...s.btn, ...s.btnSecondary, padding: '8px 16px', fontSize: 14 }}>生成采购单</button>
            </div>
          ))}
        </div>
      )}

      <div style={s.sectionTitle}>采购记录</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>采购日期</th>
            <th style={s.th}>耗材名称</th>
            <th style={s.th}>分类</th>
            <th style={s.th}>供应商</th>
            <th style={s.th}>数量</th>
            <th style={s.th}>单价</th>
            <th style={s.th}>金额</th>
            <th style={s.th}>经手人</th>
            <th style={s.th}>状态</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map(p => (
            <tr key={p.id}>
              <td style={s.td}>{p.purchaseDate}</td>
              <td style={s.td}>{p.materialName}</td>
              <td style={s.td}>{getCategoryTag(p.category)}</td>
              <td style={s.td}>{p.supplier}</td>
              <td style={s.td}>{p.quantity}</td>
              <td style={s.td}>¥{p.unitPrice.toFixed(2)}</td>
              <td style={s.td}>¥{p.totalAmount.toFixed(2)}</td>
              <td style={s.td}>{p.purchaser}</td>
              <td style={s.td}>
                {p.status === '已入库' ? getStatusBadge('已入库') :
                 p.status === '已采购' ? getStatusBadge('已采购') :
                 getStatusBadge('待采购')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  // 渲染统计分析
  const renderStatistics = () => (
    <div style={s.chartGrid}>
      <div style={s.chartContainer}>
        <div style={s.chartTitle}>本月耗材消耗TOP5</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topConsumption.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 24, fontSize: 14, fontWeight: 600, color: '#64748b' }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 15, color: '#334155' }}>{item.name}</div>
              <div style={{ width: 140, height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${(item.count / topConsumption[0].count) * 100}%`, height: '100%', background: '#1a3a5c', borderRadius: 6 }} />
              </div>
              <div style={{ width: 50, fontSize: 14, fontWeight: 600, color: '#1a3a5c', textAlign: 'right' }}>{item.count}</div>
            </div>
          ))}
          {topConsumption.length === 0 && (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>
                <TrendingUp size={28} color="#94a3b8" />
              </div>
              <div style={s.emptyTitle}>暂无消耗数据</div>
            </div>
          )}
        </div>
      </div>

      <div style={s.chartContainer}>
        <div style={s.chartTitle}>各检查类型耗材消耗占比</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {examTypeUsage.map((item, i) => {
            const total = examTypeUsage.reduce((s, e) => s + e.value, 0);
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 100, fontSize: 14, color: '#334155' }}>{item.name}</div>
                <div style={{ flex: 1, height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: ['#1a3a5c', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5], borderRadius: 6 }} />
                </div>
                <div style={{ width: 60, fontSize: 14, color: '#64748b', textAlign: 'right' }}>{pct}%</div>
              </div>
            );
          })}
          {examTypeUsage.length === 0 && (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>
                <BarChart3 size={28} color="#94a3b8" />
              </div>
              <div style={s.emptyTitle}>暂无统计数据</div>
            </div>
          )}
        </div>
      </div>

      <div style={s.chartContainer}>
        <div style={s.chartTitle}>库存周转率概览</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1a3a5c' }}>12.5</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>平均周转次数/月</div>
          </div>
          <div style={{ textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1a3a5c' }}>6.2</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>平均库存天数</div>
          </div>
          <div style={{ textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1a3a5c' }}>¥{(stats.totalValue / 10000).toFixed(1)}w</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>库存总价值</div>
          </div>
          <div style={{ textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1a3a5c' }}>{stats.totalMaterials}</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>耗材品类数</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染效期管理
  const renderExpiry = () => (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div style={{ flex: 1, padding: 20, background: '#fee2e2', borderRadius: 12, border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <XCircle size={24} color="#dc2626" />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#991b1b' }}>已过期</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#991b1b' }}>{expiryWarnings.filter(w => w.severity === '已过期').length}</div>
          <div style={{ fontSize: 13, color: '#7f1d1d', marginTop: 6 }}>需要立即报废处理</div>
        </div>
        <div style={{ flex: 1, padding: 20, background: '#fef9c3', borderRadius: 12, border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <AlertTriangle size={24} color="#d97706" />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#92400e' }}>7天内到期</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#92400e' }}>{expiryWarnings.filter(w => w.severity === '7天').length}</div>
          <div style={{ fontSize: 13, color: '#78350f', marginTop: 6 }}>请优先使用</div>
        </div>
        <div style={{ flex: 1, padding: 20, background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Clock size={24} color="#ca8a04" />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#a16207' }}>30天内到期</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#a16207' }}>{expiryWarnings.filter(w => w.severity === '30天').length}</div>
          <div style={{ fontSize: 13, color: '#854d0e', marginTop: 6 }}>注意监控效期</div>
        </div>
      </div>

      <div style={s.sectionTitle}>效期预警明细</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>耗材名称</th>
            <th style={s.th}>分类</th>
            <th style={s.th}>有效期</th>
            <th style={s.th}>剩余天数</th>
            <th style={s.th}>预警级别</th>
            <th style={s.th}>当前库存</th>
            <th style={s.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {expiryWarnings.map(w => (
            <tr key={w.materialId + w.expiryDate}>
              <td style={s.td}>{w.materialName}</td>
              <td style={s.td}>{getCategoryTag(w.category)}</td>
              <td style={s.td}>{w.expiryDate}</td>
              <td style={s.td}>
                <span style={{ color: w.daysLeft < 0 ? '#991b1b' : w.daysLeft <= 7 ? '#92400e' : '#64748b', fontWeight: 600, fontSize: 15 }}>
                  {w.daysLeft < 0 ? `已过期${Math.abs(w.daysLeft)}天` : `${w.daysLeft}天`}
                </span>
              </td>
              <td style={s.td}>
                {w.severity === '已过期' ? getStatusBadge('过期') :
                 w.severity === '7天' ? getStatusBadge('告急') :
                 getStatusBadge('偏低')}
              </td>
              <td style={s.td}>{w.stock}</td>
              <td style={s.td}>
                {w.severity !== '已过期' && (
                  <button style={{ ...s.btn, ...s.btnSecondary, padding: '6px 12px', fontSize: 13 }}>优先使用</button>
                )}
                <button style={{ ...s.btn, ...s.btnDanger, padding: '6px 12px', fontSize: 13, marginLeft: 6 }}>报废</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {expiryWarnings.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <CheckCircle size={28} color="#22c55e" />
            </div>
            <div style={s.emptyTitle}>暂无效期预警</div>
            <div style={s.emptyDesc}>所有耗材效期正常，无需处理</div>
          </div>
        </div>
      )}
    </>
  );

  // 渲染申领审批
  const renderRequisition = () => (
    <>
      <div style={s.actionBar}>
        <div style={s.filterTags}>
          {['全部', '待审批', '已通过', '已拒绝', '已入库'].map(f => (
            <button
              key={f}
              style={{ ...s.filterTag, ...(approvalFilter === f ? s.filterTagActive : {}) }}
              onClick={() => setApprovalFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowRequisitionModal(true)}>
          <Plus size={16} /> 新增申领
        </button>
      </div>

      {/* 审批流程图例 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fef9c3' }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>待审批</span>
        </div>
        <ChevronRight size={16} color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dcfce7' }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>已通过</span>
        </div>
        <ChevronRight size={16} color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dbeafe' }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>已入库</span>
        </div>
        <ChevronRight size={16} color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fee2e2' }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>已拒绝</span>
        </div>
      </div>

      {/* 申领单列表 */}
      {filteredRequisitions.map(req => (
        <div key={req.id} style={s.approvalCard}>
          <div style={s.approvalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1a3a5c' }}>{req.materialName}</div>
              {getCategoryTag(req.category)}
              {getStatusBadge(req.status)}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>单号: {req.id}</div>
          </div>

          <div style={s.approvalMeta}>
            <span><UserCheck size={14} style={{ marginRight: 4 }} />申请人: {req.applicant}</span>
            <span><Users size={14} style={{ marginRight: 4 }} />部门: {req.applicantDept}</span>
            <span><Calendar size={14} style={{ marginRight: 4 }} />申请日期: {req.applyDate}</span>
          </div>

          <div style={s.approvalBody}>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>规格</span>
              <span style={s.approvalItemValue}>{req.spec}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>单位</span>
              <span style={s.approvalItemValue}>{req.unit}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>申领数量</span>
              <span style={{ ...s.approvalItemValue, color: '#1a3a5c', fontWeight: 700 }}>{req.quantity}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>申领原因</span>
              <span style={s.approvalItemValue}>{req.reason}</span>
            </div>
          </div>

          {/* 审批信息 */}
          {req.status !== '待审批' && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>
                  <CheckCircle size={14} style={{ marginRight: 4 }} />
                  审批人: {req.approver}
                </span>
                <span style={{ color: '#64748b' }}>审批日期: {req.approveDate}</span>
                {req.approveNote && <span style={{ color: req.status === '已拒绝' ? '#991b1b' : '#64748b' }}>备注: {req.approveNote}</span>}
              </div>
            </div>
          )}

          {/* 入库信息 */}
          {req.warehouseOps && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                <span style={{ color: '#1e40af' }}>
                  <Inbox size={14} style={{ marginRight: 4 }} />
                  入库人: {req.warehouseOps.operator}
                </span>
                <span style={{ color: '#1e40af' }}>入库日期: {req.warehouseOps.inDate}</span>
                <span style={{ color: '#1e40af' }}>实际入库: {req.warehouseOps.actualQty}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {req.status === '待审批' && (
              <>
                <button
                  style={{ ...s.btn, ...s.btnSuccess, padding: '8px 16px' }}
                  onClick={() => handleApprove(req.id, true)}
                >
                  <CheckSquare size={15} /> 批准
                </button>
                <button
                  style={{ ...s.btn, ...s.btnDanger, padding: '8px 16px' }}
                  onClick={() => handleApprove(req.id, false, '库存不足，暂不批准')}
                >
                  <XCircle size={15} /> 拒绝
                </button>
              </>
            )}
            {req.status === '已通过' && (
              <button
                style={{ ...s.btn, ...s.btnPrimary, padding: '8px 16px' }}
                onClick={() => handleConfirmInbound(req.id)}
              >
                <Warehouse size={15} /> 确认入库
              </button>
            )}
          </div>
        </div>
      ))}

      {filteredRequisitions.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <ClipboardList size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无申领记录</div>
            <div style={s.emptyDesc}>当前没有耗材申领记录，请检查筛选条件</div>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowRequisitionModal(true)}>
              <Plus size={16} /> 新增申领
            </button>
          </div>
        </div>
      )}
    </>
  );

  // 渲染入库管理
  const renderInbound = () => (
    <>
      <div style={s.actionBar}>
        <div style={s.sectionTitle}><Inbox size={20} /> 入库记录</div>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowInModal(true)}>
          <Plus size={16} /> 新加入库
        </button>
      </div>

      {/* 入库统计 */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>本月入库次数</div>
          <div style={s.statValue}>{inboundRecords.length}</div>
          <div style={s.statSub}>共 {inboundRecords.reduce((s, r) => s + r.quantity, 0)} 件</div>
        </div>
        <div style={{ ...s.statCard, ...s.statWarning }}>
          <div style={s.statLabel}>待入库</div>
          <div style={{ ...s.statValue, color: '#d97706' }}>{requisitions.filter(r => r.status === '已通过').length}</div>
          <div style={s.statSub}>审批通过待处理</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>供应商总数</div>
          <div style={s.statValue}>{new Set(materials.map(m => m.supplier)).size}</div>
          <div style={s.statSub}>合作供应商</div>
        </div>
      </div>

      {/* 入库记录列表 */}
      {inboundRecords.map(record => (
        <div key={record.id} style={s.inboundCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1a3a5c' }}>{record.materialName}</div>
              {getStatusBadge(record.status)}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>入库单号: {record.id}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>批号</span>
              <span style={s.approvalItemValue}>{record.batchNo}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>入库数量</span>
              <span style={{ ...s.approvalItemValue, color: '#1a3a5c', fontWeight: 700 }}>{record.quantity}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>有效期</span>
              <span style={s.approvalItemValue}>{record.expiryDate}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>入库日期</span>
              <span style={s.approvalItemValue}>{record.inDate}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>供应商</span>
              <span style={s.approvalItemValue}>{record.supplier}</span>
            </div>
            <div style={s.approvalItem}>
              <span style={s.approvalItemLabel}>操作员</span>
              <span style={s.approvalItemValue}>{record.operator}</span>
            </div>
          </div>
        </div>
      ))}

      {inboundRecords.length === 0 && (
        <div style={s.emptyState}>暂无入库记录</div>
      )}
    </>
  );

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div style={s.title}>
          <Package size={28} color="#1a3a5c" />
          耗材管理
        </div>
        <div style={s.headerActions}>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowInModal(true)}>
            <Plus size={16} /> 入库
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowOutModal(true)}>
            <ArrowDownUp size={16} /> 出库
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowRequisitionModal(true)}>
            <ClipboardList size={16} /> 申领
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Download size={16} /> 导出
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>耗材品类</div>
          <div style={s.statValue}>{stats.totalMaterials}</div>
          <div style={s.statSub}>个分类</div>
        </div>
        <div style={{ ...s.statCard, ...(stats.lowStock > 0 ? s.statWarning : {}) }}>
          <div style={s.statLabel}>库存不足</div>
          <div style={{ ...s.statValue, color: stats.lowStock > 0 ? '#d97706' : '#1a3a5c' }}>{stats.lowStock}</div>
          <div style={s.statSub}>低于警戒线</div>
        </div>
        <div style={{ ...s.statCard, ...(stats.expired > 0 ? s.statDanger : {}) }}>
          <div style={s.statLabel}>已过期</div>
          <div style={{ ...s.statValue, color: stats.expired > 0 ? '#ef4444' : '#1a3a5c' }}>{stats.expired}</div>
          <div style={s.statSub}>需报废处理</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>效期预警</div>
          <div style={{ ...s.statValue, color: stats.nearExpiry > 0 ? '#d97706' : '#1a3a5c' }}>{stats.nearExpiry}</div>
          <div style={s.statSub}>30天内到期</div>
        </div>
        <div style={{ ...s.statCard, ...(stats.pendingApprovals > 0 ? s.statWarning : {}) }}>
          <div style={s.statLabel}>待审批</div>
          <div style={{ ...s.statValue, color: stats.pendingApprovals > 0 ? '#d97706' : '#1a3a5c' }}>{stats.pendingApprovals}</div>
          <div style={s.statSub}>申领待审批</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>库存总价值</div>
          <div style={s.statValue}>¥{(stats.totalValue / 10000).toFixed(1)}w</div>
          <div style={s.statSub}>当前库存</div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={s.tabBar}>
        {[
          { key: 'inventory', label: '库存管理', icon: Package },
          { key: 'inbound', label: '入库管理', icon: Inbox },
          { key: 'requisition', label: '申领审批', icon: ClipboardList },
          { key: 'usage', label: '使用追溯', icon: ScanBarcode },
          { key: 'purchase', label: '采购计划', icon: ShoppingCart },
          { key: 'statistics', label: '统计分析', icon: BarChart3 },
          { key: 'expiry', label: '效期管理', icon: Clock },
        ].map(tab => (
          <button
            key={tab.key}
            style={{ ...s.tab, ...(activeTab === tab.key ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            <tab.icon size={16} style={{ marginRight: 6 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'usage' && renderUsage()}
      {activeTab === 'purchase' && renderPurchase()}
      {activeTab === 'statistics' && renderStatistics()}
      {activeTab === 'expiry' && renderExpiry()}
      {activeTab === 'requisition' && renderRequisition()}
      {activeTab === 'inbound' && renderInbound()}

      {/* 入库弹窗 */}
      {showInModal && (
        <div style={s.modal} onClick={() => setShowInModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>耗材入库</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowInModal(false)}>
                <X size={22} color="#64748b" />
              </button>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>选择耗材 *</label>
              <select style={s.formInput} value={inForm.materialId} onChange={e => setInForm({ ...inForm, materialId: e.target.value })}>
                <option value="">请选择耗材</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>入库数量 *</label>
                <input style={s.formInput} type="number" value={inForm.quantity} onChange={e => setInForm({ ...inForm, quantity: e.target.value })} placeholder="请输入数量" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>批号</label>
                <input style={s.formInput} value={inForm.batchNo} onChange={e => setInForm({ ...inForm, batchNo: e.target.value })} placeholder="请输入批号" />
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>有效期</label>
                <input style={s.formInput} type="date" value={inForm.expiryDate} onChange={e => setInForm({ ...inForm, expiryDate: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>经手人</label>
                <input style={s.formInput} value={inForm.operator} onChange={e => setInForm({ ...inForm, operator: e.target.value })} placeholder="请输入经手人" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowInModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleInSubmit}>确认入库</button>
            </div>
          </div>
        </div>
      )}

      {/* 出库弹窗 */}
      {showOutModal && (
        <div style={s.modal} onClick={() => setShowOutModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>耗材出库</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowOutModal(false)}>
                <X size={22} color="#64748b" />
              </button>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>选择耗材 *</label>
              <select style={s.formInput} value={outForm.materialId} onChange={e => setOutForm({ ...outForm, materialId: e.target.value })}>
                <option value="">请选择耗材</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code}) - 库存{m.stock}{m.unit}</option>)}
              </select>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>关联患者</label>
                <input style={s.formInput} value={outForm.patientId} onChange={e => setOutForm({ ...outForm, patientId: e.target.value })} placeholder="患者ID或姓名" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>检查单号</label>
                <input style={s.formInput} value={outForm.examId} onChange={e => setOutForm({ ...outForm, examId: e.target.value })} placeholder="检查申请单号" />
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>出库数量 *</label>
                <input style={s.formInput} type="number" value={outForm.quantity} onChange={e => setOutForm({ ...outForm, quantity: e.target.value })} placeholder="请输入数量" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>领用护士</label>
                <input style={s.formInput} value={outForm.operator} onChange={e => setOutForm({ ...outForm, operator: e.target.value })} placeholder="请输入领用人" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowOutModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleOutSubmit}>确认出库</button>
            </div>
          </div>
        </div>
      )}

      {/* 采购弹窗 */}
      {showPurchaseModal && (
        <div style={s.modal} onClick={() => setShowPurchaseModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>新增采购计划</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowPurchaseModal(false)}>
                <X size={22} color="#64748b" />
              </button>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>耗材名称 *</label>
              <input style={s.formInput} value={purchaseForm.materialName} onChange={e => setPurchaseForm({ ...purchaseForm, materialName: e.target.value })} placeholder="请输入耗材名称" />
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>分类</label>
                <select style={s.formInput} value={purchaseForm.category} onChange={e => setPurchaseForm({ ...purchaseForm, category: e.target.value })}>
                  <option value="配件类">配件类</option>
                  <option value="药品类">药品类</option>
                  <option value="清洁类">清洁类</option>
                  <option value="包装类">包装类</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>供应商</label>
                <input style={s.formInput} value={purchaseForm.supplier} onChange={e => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} placeholder="请输入供应商" />
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>采购数量 *</label>
                <input style={s.formInput} type="number" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} placeholder="请输入数量" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>单价(元)</label>
                <input style={s.formInput} type="number" value={purchaseForm.unitPrice} onChange={e => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })} placeholder="请输入单价" />
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>经手人</label>
              <input style={s.formInput} value={purchaseForm.purchaser} onChange={e => setPurchaseForm({ ...purchaseForm, purchaser: e.target.value })} placeholder="默认：刘伟东" />
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPurchaseModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handlePurchaseSubmit}>提交采购</button>
            </div>
          </div>
        </div>
      )}

      {/* 申领弹窗 */}
      {showRequisitionModal && (
        <div style={s.modal} onClick={() => setShowRequisitionModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>新增耗材申领</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowRequisitionModal(false)}>
                <X size={22} color="#64748b" />
              </button>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>选择耗材 *</label>
              <select style={s.formInput} value={requisitionForm.materialId} onChange={e => setRequisitionForm({ ...requisitionForm, materialId: e.target.value })}>
                <option value="">请选择耗材</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code}) - 库存{m.stock}{m.unit}</option>)}
              </select>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>申领数量 *</label>
                <input style={s.formInput} type="number" value={requisitionForm.quantity} onChange={e => setRequisitionForm({ ...requisitionForm, quantity: e.target.value })} placeholder="请输入数量" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>申请人</label>
                <input style={s.formInput} value={requisitionForm.applicant} onChange={e => setRequisitionForm({ ...requisitionForm, applicant: e.target.value })} placeholder="请输入申请人" />
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>申领原因 *</label>
              <textarea style={{ ...s.formInput, height: 100, resize: 'vertical' }} value={requisitionForm.reason} onChange={e => setRequisitionForm({ ...requisitionForm, reason: e.target.value })} placeholder="请输入申领原因" />
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowRequisitionModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleRequisitionSubmit}>提交申领</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
