// @ts-nocheck
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Image, Calendar, Clock, User, Search, Filter, Star, Edit3,
  ChevronDown, X, ChevronLeft, ChevronRight, Eye, Download,
  FileImage, Monitor, Camera, Activity, CheckCircle, MessageSquare,
  ArrowRight, Type, Trash2, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  BarChart3, PieChart, TrendingUp, GitCompare, Layers, Copy,
  Square, Circle, Minus, Undo, Redo, Eraser, Ruler, Save,
  Package, CheckSquare, ImageIcon, Gauge
} from 'lucide-react';

// ============ Types ============
interface ImageAnnotation {
  id: string;
  type: 'arrow' | 'text' | 'rect' | 'circle' | 'line' | 'distance';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  text?: string;
  color: string;
  createdBy: string;
  createdAt: string;
  measurement?: { value: number; unit: string };
}

interface ImageRecord {
  id: string;
  patientId: string;
  patientName: string;
  examId: string;
  examType: string;
  thumbnail: string;
  imageUrl: string;
  captureTime: string;
  deviceModel: string;
  deviceManufacturer: string;
  doctorName: string;
  doctorId: string;
  room: string;
  quality: number;
  findings?: string;
  annotations: ImageAnnotation[];
  annotationHistory: { action: string; user: string; time: string }[];
  bodyPart: string;
  modality: string;
  seriesNumber: number;
  frameNumber: number;
  brightness?: number;
  clarity?: number;
  artifacts?: number;
}

interface QualityBreakdown { clarity: number; brightness: number; artifacts: number }

// ============ Mock Data ============
const mockImages: ImageRecord[] = [
  { id: 'IMG001', patientId: 'P001', patientName: '王建国', examId: 'EX001', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g001/200/150', imageUrl: 'https://picsum.photos/seed/g001/800/600', captureTime: '2026-04-29 09:05:23', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '胃角可见陈旧性溃疡瘢痕，周围黏膜纠集', annotations: [{ id: 'A001', type: 'arrow', x: 120, y: 80, x2: 200, y2: 150, color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-29 09:15:00' }, { id: 'A002', type: 'text', x: 80, y: 60, text: '溃疡瘢痕', color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-29 09:15:30' }], annotationHistory: [{ action: '添加箭头标注', user: '张建国', time: '2026-04-29 09:15:00' }, { action: '添加文字标注', user: '张建国', time: '2026-04-29 09:15:30' }], bodyPart: '胃角', modality: '电子胃镜', seriesNumber: 1, frameNumber: 5, brightness: 4.2, clarity: 4.8, artifacts: 1 },
  { id: 'IMG002', patientId: 'P001', patientName: '王建国', examId: 'EX001', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g002/200/150', imageUrl: 'https://picsum.photos/seed/g002/800/600', captureTime: '2026-04-29 09:08:11', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃窦黏膜红白相间，以红为主', annotations: [], annotationHistory: [], bodyPart: '胃窦', modality: '电子胃镜', seriesNumber: 1, frameNumber: 8, brightness: 3.8, clarity: 4.2, artifacts: 2 },
  { id: 'IMG003', patientId: 'P002', patientName: '李秀芳', examId: 'EX002', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g003/200/150', imageUrl: 'https://picsum.photos/seed/g003/800/600', captureTime: '2026-04-29 09:35:07', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '食道黏膜光滑，血管纹理清晰', annotations: [{ id: 'A003', type: 'text', x: 150, y: 100, text: '正常黏膜', color: '#16a34a', createdBy: '张建国', createdAt: '2026-04-29 09:40:00' }], annotationHistory: [{ action: '添加文字标注', user: '张建国', time: '2026-04-29 09:40:00' }], bodyPart: '食道', modality: '电子胃镜', seriesNumber: 2, frameNumber: 3, brightness: 4.5, clarity: 4.9, artifacts: 1 },
  { id: 'IMG004', patientId: 'P002', patientName: '李秀芳', examId: 'EX002', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g004/200/150', imageUrl: 'https://picsum.photos/seed/g004/800/600', captureTime: '2026-04-29 09:38:42', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 3, findings: '胃体黏膜充血水肿', annotations: [], annotationHistory: [], bodyPart: '胃体', modality: '电子胃镜', seriesNumber: 2, frameNumber: 6, brightness: 3.2, clarity: 2.8, artifacts: 3 },
  { id: 'IMG005', patientId: 'P003', patientName: '张德明', examId: 'EX003', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c001/200/150', imageUrl: 'https://picsum.photos/seed/c001/800/600', captureTime: '2026-04-29 10:15:33', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '升结肠可见3枚息肉已切除，创面愈合良好', annotations: [{ id: 'A004', type: 'arrow', x: 100, y: 120, x2: 180, y2: 200, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-29 10:25:00' }, { id: 'A005', type: 'text', x: 60, y: 90, text: '息肉切除后瘢痕', color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-29 10:25:30' }], annotationHistory: [{ action: '添加箭头标注', user: '李秀英', time: '2026-04-29 10:25:00' }, { action: '添加文字标注', user: '李秀英', time: '2026-04-29 10:25:30' }], bodyPart: '升结肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 12, brightness: 4.3, clarity: 4.7, artifacts: 1 },
  { id: 'IMG006', patientId: 'P003', patientName: '张德明', examId: 'EX003', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c002/200/150', imageUrl: 'https://picsum.photos/seed/c002/800/600', captureTime: '2026-04-29 10:22:18', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '横结肠黏膜光滑，血管网清晰', annotations: [], annotationHistory: [], bodyPart: '横结肠', modality: '电子结肠镜', seriesNumber: 2, frameNumber: 5, brightness: 4.0, clarity: 4.1, artifacts: 2 },
  { id: 'IMG007', patientId: 'P004', patientName: '周丽娟', examId: 'EX004', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g005/200/150', imageUrl: 'https://picsum.photos/seed/g005/800/600', captureTime: '2026-04-29 10:45:09', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃底黏膜光滑，黏液湖清', annotations: [], annotationHistory: [], bodyPart: '胃底', modality: '电子胃镜', seriesNumber: 1, frameNumber: 2, brightness: 3.9, clarity: 4.0, artifacts: 2 },
  { id: 'IMG008', patientId: 'P005', patientName: '陈伟强', examId: 'EX005', examType: '胃镜下活检', thumbnail: 'https://picsum.photos/seed/g006/200/150', imageUrl: 'https://picsum.photos/seed/g006/800/600', captureTime: '2026-04-29 11:08:55', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 5, findings: '幽门前区取活检2块', annotations: [{ id: 'A006', type: 'rect', x: 140, y: 100, x2: 220, y2: 180, color: '#d97706', createdBy: '李秀英', createdAt: '2026-04-29 11:15:00' }], annotationHistory: [{ action: '标记活检区域', user: '李秀英', time: '2026-04-29 11:15:00' }], bodyPart: '幽门前区', modality: '电子胃镜', seriesNumber: 1, frameNumber: 15, brightness: 4.4, clarity: 4.8, artifacts: 1 },
  { id: 'IMG009', patientId: 'P006', patientName: '吴美珍', examId: 'EX006', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c003/200/150', imageUrl: 'https://picsum.photos/seed/c003/800/600', captureTime: '2026-04-29 14:20:44', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 3, findings: '直肠黏膜正常，血管纹理清晰', annotations: [], annotationHistory: [], bodyPart: '直肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 8, brightness: 3.5, clarity: 3.0, artifacts: 3 },
  { id: 'IMG010', patientId: 'P007', patientName: '黄大军', examId: 'EX007', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g007/200/150', imageUrl: 'https://picsum.photos/seed/g007/800/600', captureTime: '2026-04-29 14:38:21', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '十二指肠球部黏膜光滑，未见溃疡', annotations: [], annotationHistory: [], bodyPart: '十二指肠球部', modality: '电子胃镜', seriesNumber: 1, frameNumber: 20, brightness: 4.6, clarity: 4.9, artifacts: 1 },
  { id: 'IMG011', patientId: 'P008', patientName: '孙红梅', examId: 'EX008', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g008/200/150', imageUrl: 'https://picsum.photos/seed/g008/800/600', captureTime: '2026-04-29 15:35:17', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '食道下段黏膜可见条状糜烂，提示反流性食管炎', annotations: [{ id: 'A007', type: 'arrow', x: 90, y: 140, x2: 170, y2: 210, color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-29 15:45:00' }, { id: 'A008', type: 'text', x: 50, y: 110, text: '黏膜糜烂', color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-29 15:45:20' }], annotationHistory: [{ action: '添加箭头标注', user: '张建国', time: '2026-04-29 15:45:00' }, { action: '添加文字标注', user: '张建国', time: '2026-04-29 15:45:20' }], bodyPart: '食道下段', modality: '电子胃镜', seriesNumber: 1, frameNumber: 7, brightness: 3.7, clarity: 4.0, artifacts: 2 },
  { id: 'IMG012', patientId: 'P009', patientName: '赵小龙', examId: 'EX009', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c004/200/150', imageUrl: 'https://picsum.photos/seed/c004/800/600', captureTime: '2026-04-30 09:12:05', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '盲肠黏膜正常，回盲瓣开闭良好', annotations: [], annotationHistory: [], bodyPart: '盲肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 3, brightness: 4.1, clarity: 4.2, artifacts: 2 },
  { id: 'IMG013', patientId: 'P010', patientName: '周玉芬', examId: 'EX010', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c005/200/150', imageUrl: 'https://picsum.photos/seed/c005/800/600', captureTime: '2026-04-30 10:08:33', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '直肠癌术后吻合口愈合良好，未见复发', annotations: [{ id: 'A009', type: 'text', x: 120, y: 80, text: '吻合口', color: '#16a34a', createdBy: '李秀英', createdAt: '2026-04-30 10:20:00' }], annotationHistory: [{ action: '标注吻合口位置', user: '李秀英', time: '2026-04-30 10:20:00' }], bodyPart: '直肠吻合口', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 10, brightness: 4.4, clarity: 4.8, artifacts: 1 },
  { id: 'IMG014', patientId: 'P001', patientName: '王建国', examId: 'EX001', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g009/200/150', imageUrl: 'https://picsum.photos/seed/g009/800/600', captureTime: '2026-04-29 09:12:47', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃体小弯可见0.3cm息肉', annotations: [{ id: 'A010', type: 'rect', x: 150, y: 130, x2: 250, y2: 220, color: '#dc2626', createdBy: '张建国', createdAt: '2026-04-29 09:20:00' }, { id: 'A011', type: 'text', x: 110, y: 100, text: '小息肉', color: '#dc2626', createdBy: '张建国', createdAt: '2026-04-29 09:20:30' }], annotationHistory: [{ action: '圈选息肉区域', user: '张建国', time: '2026-04-29 09:20:00' }, { action: '添加文字', user: '张建国', time: '2026-04-29 09:20:30' }], bodyPart: '胃体小弯', modality: '电子胃镜', seriesNumber: 1, frameNumber: 10, brightness: 4.0, clarity: 4.3, artifacts: 2 },
  { id: 'IMG015', patientId: 'P002', patientName: '李秀芳', examId: 'EX002', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g010/200/150', imageUrl: 'https://picsum.photos/seed/g010/800/600', captureTime: '2026-04-29 09:42:33', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '幽门口圆形，开闭良好', annotations: [], annotationHistory: [], bodyPart: '幽门', modality: '电子胃镜', seriesNumber: 2, frameNumber: 12, brightness: 3.8, clarity: 4.1, artifacts: 2 },
  { id: 'IMG016', patientId: 'P003', patientName: '张德明', examId: 'EX003', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c006/200/150', imageUrl: 'https://picsum.photos/seed/c006/800/600', captureTime: '2026-04-29 10:35:22', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 3, findings: '降结肠可见多发憩室', annotations: [{ id: 'A012', type: 'text', x: 180, y: 150, text: '憩室', color: '#d97706', createdBy: '李秀英', createdAt: '2026-04-29 10:40:00' }], annotationHistory: [{ action: '标注憩室位置', user: '李秀英', time: '2026-04-29 10:40:00' }], bodyPart: '降结肠', modality: '电子结肠镜', seriesNumber: 3, frameNumber: 8, brightness: 3.3, clarity: 2.9, artifacts: 3 },
  { id: 'IMG017', patientId: 'P004', patientName: '周丽娟', examId: 'EX004', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g011/200/150', imageUrl: 'https://picsum.photos/seed/g011/800/600', captureTime: '2026-04-29 10:52:18', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '胃角弧度存在，黏膜光滑', annotations: [], annotationHistory: [], bodyPart: '胃角', modality: '电子胃镜', seriesNumber: 2, frameNumber: 4, brightness: 4.5, clarity: 4.9, artifacts: 1 },
  { id: 'IMG018', patientId: 'P005', patientName: '陈伟强', examId: 'EX005', examType: '胃镜下活检', thumbnail: 'https://picsum.photos/seed/g012/200/150', imageUrl: 'https://picsum.photos/seed/g012/800/600', captureTime: '2026-04-29 11:15:02', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 4, findings: '胃窦可见散在点状糜烂，活检2块', annotations: [{ id: 'A013', type: 'arrow', x: 200, y: 180, x2: 300, y2: 250, color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-29 11:20:00' }], annotationHistory: [{ action: '标注糜烂区域', user: '李秀英', time: '2026-04-29 11:20:00' }], bodyPart: '胃窦', modality: '电子胃镜', seriesNumber: 2, frameNumber: 18, brightness: 3.6, clarity: 4.0, artifacts: 3 },
  { id: 'IMG019', patientId: 'P006', patientName: '吴美珍', examId: 'EX006', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c007/200/150', imageUrl: 'https://picsum.photos/seed/c007/800/600', captureTime: '2026-04-29 14:28:55', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '乙状结肠黏膜正常', annotations: [], annotationHistory: [], bodyPart: '乙状结肠', modality: '电子结肠镜', seriesNumber: 2, frameNumber: 6, brightness: 4.0, clarity: 4.1, artifacts: 2 },
  { id: 'IMG020', patientId: 'P007', patientName: '黄大军', examId: 'EX007', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g013/200/150', imageUrl: 'https://picsum.photos/seed/g013/800/600', captureTime: '2026-04-29 14:45:09', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '胃体黏膜皱襞规则，蠕动良好', annotations: [], annotationHistory: [], bodyPart: '胃体', modality: '电子胃镜', seriesNumber: 2, frameNumber: 7, brightness: 4.5, clarity: 4.8, artifacts: 1 },
  { id: 'IMG021', patientId: 'P008', patientName: '孙红梅', examId: 'EX008', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g014/200/150', imageUrl: 'https://picsum.photos/seed/g014/800/600', captureTime: '2026-04-29 15:42:38', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃底黏膜可见少量陈旧性出血点', annotations: [{ id: 'A014', type: 'arrow', x: 130, y: 110, x2: 200, y2: 160, color: '#dc2626', createdBy: '张建国', createdAt: '2026-04-29 15:50:00' }], annotationHistory: [{ action: '标注出血点', user: '张建国', time: '2026-04-29 15:50:00' }], bodyPart: '胃底', modality: '电子胃镜', seriesNumber: 2, frameNumber: 10, brightness: 3.7, clarity: 4.0, artifacts: 3 },
  { id: 'IMG022', patientId: 'P009', patientName: '赵小龙', examId: 'EX009', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c008/200/150', imageUrl: 'https://picsum.photos/seed/c008/800/600', captureTime: '2026-04-30 09:25:47', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '升结肠可见2枚带蒂息肉，约0.5-0.8cm', annotations: [{ id: 'A015', type: 'rect', x: 120, y: 100, x2: 220, y2: 200, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 09:35:00' }, { id: 'A016', type: 'text', x: 80, y: 70, text: '带蒂息肉', color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 09:35:30' }], annotationHistory: [{ action: '圈选息肉', user: '李秀英', time: '2026-04-30 09:35:00' }, { action: '添加描述', user: '李秀英', time: '2026-04-30 09:35:30' }], bodyPart: '升结肠', modality: '电子结肠镜', seriesNumber: 2, frameNumber: 15, brightness: 4.3, clarity: 4.7, artifacts: 1 },
  { id: 'IMG023', patientId: 'P010', patientName: '周玉芬', examId: 'EX010', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c009/200/150', imageUrl: 'https://picsum.photos/seed/c009/800/600', captureTime: '2026-04-30 10:18:22', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '结肠肝曲黏膜正常', annotations: [], annotationHistory: [], bodyPart: '结肠肝曲', modality: '电子结肠镜', seriesNumber: 2, frameNumber: 5, brightness: 4.1, clarity: 4.2, artifacts: 2 },
  { id: 'IMG024', patientId: 'P001', patientName: '王建国', examId: 'EX001', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g015/200/150', imageUrl: 'https://picsum.photos/seed/g015/800/600', captureTime: '2026-04-29 09:16:33', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 3, findings: '齿状线清晰，无反流表现', annotations: [], annotationHistory: [], bodyPart: '齿状线', modality: '电子胃镜', seriesNumber: 1, frameNumber: 6, brightness: 3.4, clarity: 2.9, artifacts: 3 },
  { id: 'IMG025', patientId: 'P003', patientName: '张德明', examId: 'EX003', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c010/200/150', imageUrl: 'https://picsum.photos/seed/c010/800/600', captureTime: '2026-04-29 10:45:11', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '回肠末端黏膜绒毛萎缩，提示炎症', annotations: [{ id: 'A017', type: 'text', x: 100, y: 120, text: '绒毛萎缩', color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-29 10:55:00' }], annotationHistory: [{ action: '标注炎症区域', user: '李秀英', time: '2026-04-29 10:55:00' }], bodyPart: '回肠末端', modality: '电子结肠镜', seriesNumber: 4, frameNumber: 3, brightness: 3.6, clarity: 3.8, artifacts: 3 },
  { id: 'IMG026', patientId: 'P005', patientName: '陈伟强', examId: 'EX005', examType: '胃镜下活检', thumbnail: 'https://picsum.photos/seed/g016/200/150', imageUrl: 'https://picsum.photos/seed/g016/800/600', captureTime: '2026-04-29 11:22:44', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 5, findings: '十二指肠降部黏膜光滑，无溃疡', annotations: [], annotationHistory: [], bodyPart: '十二指肠降部', modality: '电子胃镜', seriesNumber: 3, frameNumber: 22, brightness: 4.5, clarity: 4.9, artifacts: 1 },
  { id: 'IMG027', patientId: 'P007', patientName: '黄大军', examId: 'EX007', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g017/200/150', imageUrl: 'https://picsum.photos/seed/g017/800/600', captureTime: '2026-04-29 14:52:07', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '食道上段黏膜光滑，血管纹理清晰', annotations: [], annotationHistory: [], bodyPart: '食道上段', modality: '电子胃镜', seriesNumber: 3, frameNumber: 2, brightness: 4.2, clarity: 4.3, artifacts: 2 },
  { id: 'IMG028', patientId: 'P008', patientName: '孙红梅', examId: 'EX008', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g018/200/150', imageUrl: 'https://picsum.photos/seed/g018/800/600', captureTime: '2026-04-29 15:55:29', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 3, findings: '胃体大弯黏膜可见陈旧性出血斑', annotations: [{ id: 'A018', type: 'arrow', x: 160, y: 140, x2: 240, y2: 200, color: '#dc2626', createdBy: '张建国', createdAt: '2026-04-29 16:00:00' }], annotationHistory: [{ action: '标注出血斑', user: '张建国', time: '2026-04-29 16:00:00' }], bodyPart: '胃体大弯', modality: '电子胃镜', seriesNumber: 3, frameNumber: 14, brightness: 3.3, clarity: 3.0, artifacts: 4 },
  { id: 'IMG029', patientId: 'P010', patientName: '周玉芬', examId: 'EX010', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c011/200/150', imageUrl: 'https://picsum.photos/seed/c011/800/600', captureTime: '2026-04-30 10:35:48', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '结肠脾曲以远黏膜光滑，未见肿物', annotations: [], annotationHistory: [], bodyPart: '结肠脾曲', modality: '电子结肠镜', seriesNumber: 3, frameNumber: 9, brightness: 4.4, clarity: 4.8, artifacts: 1 },
  { id: 'IMG030', patientId: 'P009', patientName: '赵小龙', examId: 'EX009', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c012/200/150', imageUrl: 'https://picsum.photos/seed/c012/800/600', captureTime: '2026-04-30 09:42:15', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '横结肠中段可见浅表溃疡，边缘规整', annotations: [{ id: 'A019', type: 'rect', x: 140, y: 120, x2: 260, y2: 220, color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 09:50:00' }, { id: 'A020', type: 'text', x: 100, y: 90, text: '浅表溃疡', color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 09:50:30' }], annotationHistory: [{ action: '圈选溃疡区域', user: '李秀英', time: '2026-04-30 09:50:00' }, { action: '添加描述文字', user: '李秀英', time: '2026-04-30 09:50:30' }], bodyPart: '横结肠中段', modality: '电子结肠镜', seriesNumber: 3, frameNumber: 18, brightness: 3.8, clarity: 4.1, artifacts: 2 },
  { id: 'IMG031', patientId: 'P011', patientName: '刘建平', examId: 'EX011', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g019/200/150', imageUrl: 'https://picsum.photos/seed/g019/800/600', captureTime: '2026-04-30 11:05:33', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '胃体中段可见1.2cm黏膜下肿瘤，表面光滑', annotations: [{ id: 'A021', type: 'rect', x: 130, y: 110, x2: 250, y2: 200, color: '#dc2626', createdBy: '张建国', createdAt: '2026-04-30 11:15:00' }, { id: 'A022', type: 'text', x: 90, y: 80, text: 'SMT', color: '#dc2626', createdBy: '张建国', createdAt: '2026-04-30 11:15:30' }], annotationHistory: [{ action: '圈选病变区域', user: '张建国', time: '2026-04-30 11:15:00' }, { action: '标注SMT', user: '张建国', time: '2026-04-30 11:15:30' }], bodyPart: '胃体中段', modality: '电子胃镜', seriesNumber: 1, frameNumber: 14, brightness: 4.4, clarity: 4.8, artifacts: 1 },
  { id: 'IMG032', patientId: 'P012', patientName: '马晓燕', examId: 'EX012', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c013/200/150', imageUrl: 'https://picsum.photos/seed/c013/800/600', captureTime: '2026-04-30 13:22:18', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '盲肠可见0.6cm山田Ⅰ型息肉', annotations: [{ id: 'A023', type: 'arrow', x: 160, y: 140, x2: 240, y2: 200, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 13:30:00' }], annotationHistory: [{ action: '标注息肉位置', user: '李秀英', time: '2026-04-30 13:30:00' }], bodyPart: '盲肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 6, brightness: 4.1, clarity: 4.3, artifacts: 2 },
  { id: 'IMG033', patientId: 'P013', patientName: '赵文强', examId: 'EX013', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g020/200/150', imageUrl: 'https://picsum.photos/seed/g020/800/600', captureTime: '2026-04-30 14:08:42', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 3, findings: '食道中段可见白斑，疑为角化过度', annotations: [{ id: 'A024', type: 'text', x: 120, y: 100, text: '白斑', color: '#d97706', createdBy: '张建国', createdAt: '2026-04-30 14:15:00' }], annotationHistory: [{ action: '标注白斑区域', user: '张建国', time: '2026-04-30 14:15:00' }], bodyPart: '食道中段', modality: '电子胃镜', seriesNumber: 1, frameNumber: 9, brightness: 3.4, clarity: 2.9, artifacts: 3 },
  { id: 'IMG034', patientId: 'P014', patientName: '吴小兰', examId: 'EX014', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g021/200/150', imageUrl: 'https://picsum.photos/seed/g021/800/600', captureTime: '2026-04-30 14:35:17', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 5, findings: '十二指肠球部可见0.3cm霜斑样溃疡', annotations: [{ id: 'A025', type: 'rect', x: 150, y: 130, x2: 230, y2: 200, color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 14:40:00' }, { id: 'A026', type: 'text', x: 110, y: 100, text: '霜斑溃疡', color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 14:40:30' }], annotationHistory: [{ action: '圈选溃疡', user: '李秀英', time: '2026-04-30 14:40:00' }, { action: '添加描述', user: '李秀英', time: '2026-04-30 14:40:30' }], bodyPart: '十二指肠球部', modality: '电子胃镜', seriesNumber: 1, frameNumber: 11, brightness: 4.5, clarity: 4.9, artifacts: 1 },
  { id: 'IMG035', patientId: 'P015', patientName: '郑海洋', examId: 'EX015', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c014/200/150', imageUrl: 'https://picsum.photos/seed/c014/800/600', captureTime: '2026-04-30 15:12:55', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '降结肠黏膜光滑，血管网清晰可见', annotations: [], annotationHistory: [], bodyPart: '降结肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 7, brightness: 4.2, clarity: 4.1, artifacts: 2 },
  { id: 'IMG036', patientId: 'P016', patientName: '孙桂芳', examId: 'EX016', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g022/200/150', imageUrl: 'https://picsum.photos/seed/g022/800/600', captureTime: '2026-04-30 15:48:23', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃角可见0.5cm凹陷性病变，边界不清', annotations: [{ id: 'A027', type: 'arrow', x: 140, y: 120, x2: 220, y2: 180, color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-30 15:55:00' }, { id: 'A028', type: 'text', x: 100, y: 90, text: '凹陷病变', color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-30 15:55:30' }], annotationHistory: [{ action: '标注病变', user: '张建国', time: '2026-04-30 15:55:00' }, { action: '添加描述', user: '张建国', time: '2026-04-30 15:55:30' }], bodyPart: '胃角', modality: '电子胃镜', seriesNumber: 1, frameNumber: 16, brightness: 3.9, clarity: 4.0, artifacts: 2 },
  { id: 'IMG037', patientId: 'P017', patientName: '杨志刚', examId: 'EX017', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c015/200/150', imageUrl: 'https://picsum.photos/seed/c015/800/600', captureTime: '2026-04-30 16:05:44', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '横结肠可见2枚0.4-0.6cm息肉，表面光滑', annotations: [{ id: 'A029', type: 'circle', x: 180, y: 150, x2: 40, y2: 30, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 16:15:00' }], annotationHistory: [{ action: '圈选息肉', user: '李秀英', time: '2026-04-30 16:15:00' }], bodyPart: '横结肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 12, brightness: 4.4, clarity: 4.8, artifacts: 1 },
  { id: 'IMG038', patientId: 'P018', patientName: '陈淑珍', examId: 'EX018', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g023/200/150', imageUrl: 'https://picsum.photos/seed/g023/800/600', captureTime: '2026-04-30 16:28:11', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 3, findings: '食道下段可见曲张静脉，红色征阴性', annotations: [{ id: 'A030', type: 'text', x: 140, y: 110, text: '曲张静脉', color: '#d97706', createdBy: '张建国', createdAt: '2026-04-30 16:35:00' }], annotationHistory: [{ action: '标注静脉曲张', user: '张建国', time: '2026-04-30 16:35:00' }], bodyPart: '食道下段', modality: '电子胃镜', seriesNumber: 1, frameNumber: 5, brightness: 3.3, clarity: 3.0, artifacts: 3 },
  { id: 'IMG039', patientId: 'P019', patientName: '黄永强', examId: 'EX019', examType: '胃镜下活检', thumbnail: 'https://picsum.photos/seed/g024/200/150', imageUrl: 'https://picsum.photos/seed/g024/800/600', captureTime: '2026-04-30 17:02:38', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 5, findings: '胃窦大弯取活检1块，质硬', annotations: [{ id: 'A031', type: 'rect', x: 130, y: 120, x2: 210, y2: 190, color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 17:10:00' }], annotationHistory: [{ action: '标记活检部位', user: '李秀英', time: '2026-04-30 17:10:00' }], bodyPart: '胃窦大弯', modality: '电子胃镜', seriesNumber: 1, frameNumber: 20, brightness: 4.5, clarity: 4.8, artifacts: 1 },
  { id: 'IMG040', patientId: 'P020', patientName: '周雪梅', examId: 'EX020', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c016/200/150', imageUrl: 'https://picsum.photos/seed/c016/800/600', captureTime: '2026-04-30 17:25:52', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '直肠可见黏膜下隆起，疑为神经内分泌瘤', annotations: [{ id: 'A032', type: 'arrow', x: 160, y: 140, x2: 250, y2: 200, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 17:35:00' }, { id: 'A033', type: 'text', x: 120, y: 110, text: 'NET?', color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 17:35:30' }], annotationHistory: [{ action: '标注可疑病变', user: '李秀英', time: '2026-04-30 17:35:00' }, { action: '添加疑问标注', user: '李秀英', time: '2026-04-30 17:35:30' }], bodyPart: '直肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 8, brightness: 4.0, clarity: 4.2, artifacts: 2 },
  { id: 'IMG041', patientId: 'P021', patientName: '林国华', examId: 'EX021', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g025/200/150', imageUrl: 'https://picsum.photos/seed/g025/800/600', captureTime: '2026-04-30 18:15:07', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃底可见0.8cm半球形息肉', annotations: [], annotationHistory: [], bodyPart: '胃底', modality: '电子胃镜', seriesNumber: 1, frameNumber: 3, brightness: 4.1, clarity: 4.2, artifacts: 2 },
  { id: 'IMG042', patientId: 'P022', patientName: '李凤英', examId: 'EX022', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g026/200/150', imageUrl: 'https://picsum.photos/seed/g026/800/600', captureTime: '2026-04-30 18:42:33', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '食道黏膜完整，血管纹理清晰，呈放射状', annotations: [], annotationHistory: [], bodyPart: '食道', modality: '电子胃镜', seriesNumber: 1, frameNumber: 4, brightness: 4.6, clarity: 4.9, artifacts: 1 },
  { id: 'IMG043', patientId: 'P023', patientName: '徐海军', examId: 'EX023', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c017/200/150', imageUrl: 'https://picsum.photos/seed/c017/800/600', captureTime: '2026-04-30 19:08:19', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 3, findings: '升结肠可见节段性黏膜充血水肿，提示炎症', annotations: [{ id: 'A034', type: 'text', x: 150, y: 120, text: '炎症区域', color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 19:15:00' }], annotationHistory: [{ action: '标注炎症区域', user: '李秀英', time: '2026-04-30 19:15:00' }], bodyPart: '升结肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 10, brightness: 3.4, clarity: 2.8, artifacts: 4 },
  { id: 'IMG044', patientId: 'P024', patientName: '王秀英', examId: 'EX024', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g027/200/150', imageUrl: 'https://picsum.photos/seed/g027/800/600', captureTime: '2026-04-30 19:35:44', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '幽门管可见0.2cm息肉，表面光滑', annotations: [], annotationHistory: [], bodyPart: '幽门管', modality: '电子胃镜', seriesNumber: 1, frameNumber: 18, brightness: 4.0, clarity: 4.1, artifacts: 2 },
  { id: 'IMG045', patientId: 'P025', patientName: '张丽娟', examId: 'EX025', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c018/200/150', imageUrl: 'https://picsum.photos/seed/c018/800/600', captureTime: '2026-04-30 20:02:28', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '结肠脾曲黏膜光滑，无溃疡无肿物', annotations: [], annotationHistory: [], bodyPart: '结肠脾曲', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 6, brightness: 4.5, clarity: 4.8, artifacts: 1 },
  { id: 'IMG046', patientId: 'P026', patientName: '曹德明', examId: 'EX026', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g028/200/150', imageUrl: 'https://picsum.photos/seed/g028/800/600', captureTime: '2026-04-30 20:28:15', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃体小弯可见1.5cm盘状隆起，中心凹陷', annotations: [{ id: 'A035', type: 'rect', x: 120, y: 110, x2: 240, y2: 210, color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-30 20:35:00' }, { id: 'A036', type: 'text', x: 80, y: 80, text: '溃疡性病变', color: '#ff4444', createdBy: '张建国', createdAt: '2026-04-30 20:35:30' }], annotationHistory: [{ action: '圈选病变区域', user: '张建国', time: '2026-04-30 20:35:00' }, { action: '添加描述', user: '张建国', time: '2026-04-30 20:35:30' }], bodyPart: '胃体小弯', modality: '电子胃镜', seriesNumber: 1, frameNumber: 13, brightness: 3.9, clarity: 4.0, artifacts: 2 },
  { id: 'IMG047', patientId: 'P027', patientName: '田秀兰', examId: 'EX027', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c019/200/150', imageUrl: 'https://picsum.photos/seed/c019/800/600', captureTime: '2026-04-30 21:05:42', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '盲肠回盲瓣开闭正常，黏膜光滑', annotations: [], annotationHistory: [], bodyPart: '回盲瓣', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 4, brightness: 4.1, clarity: 4.2, artifacts: 2 },
  { id: 'IMG048', patientId: 'P028', patientName: '韩志远', examId: 'EX028', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g029/200/150', imageUrl: 'https://picsum.photos/seed/g029/800/600', captureTime: '2026-04-30 21:32:19', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 3, findings: '十二指肠降部可见脓性分泌物附着', annotations: [{ id: 'A037', type: 'arrow', x: 150, y: 130, x2: 230, y2: 190, color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 21:40:00' }, { id: 'A038', type: 'text', x: 110, y: 100, text: '脓性分泌物', color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 21:40:30' }], annotationHistory: [{ action: '标注分泌物', user: '李秀英', time: '2026-04-30 21:40:00' }, { action: '添加描述', user: '李秀英', time: '2026-04-30 21:40:30' }], bodyPart: '十二指肠降部', modality: '电子胃镜', seriesNumber: 1, frameNumber: 25, brightness: 3.2, clarity: 2.9, artifacts: 4 },
  { id: 'IMG049', patientId: 'P029', patientName: '冯桂英', examId: 'EX029', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g030/200/150', imageUrl: 'https://picsum.photos/seed/g030/800/600', captureTime: '2026-04-30 22:08:56', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '胃角弧度存在，黏膜呈胃泌酸上皮形态', annotations: [], annotationHistory: [], bodyPart: '胃角', modality: '电子胃镜', seriesNumber: 2, frameNumber: 7, brightness: 4.5, clarity: 4.9, artifacts: 1 },
  { id: 'IMG050', patientId: 'P030', patientName: '蒋志强', examId: 'EX030', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c020/200/150', imageUrl: 'https://picsum.photos/seed/c020/800/600', captureTime: '2026-04-30 22:45:33', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '横结肠可见1.0cm广基息肉，表面分叶状', annotations: [{ id: 'A039', type: 'circle', x: 200, y: 160, x2: 50, y2: 40, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 22:55:00' }, { id: 'A040', type: 'text', x: 150, y: 120, text: '广基息肉', color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-30 22:55:30' }], annotationHistory: [{ action: '圈选息肉', user: '李秀英', time: '2026-04-30 22:55:00' }, { action: '添加描述', user: '李秀英', time: '2026-04-30 22:55:30' }], bodyPart: '横结肠', modality: '电子结肠镜', seriesNumber: 2, frameNumber: 15, brightness: 4.0, clarity: 4.2, artifacts: 2 },
  { id: 'IMG051', patientId: 'P031', patientName: '沈晓东', examId: 'EX031', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g031/200/150', imageUrl: 'https://picsum.photos/seed/g031/800/600', captureTime: '2026-04-30 23:12:08', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '食道上段可见0.4cm黏膜下肿瘤，向腔内突出', annotations: [{ id: 'A041', type: 'arrow', x: 140, y: 120, x2: 220, y2: 180, color: '#d97706', createdBy: '张建国', createdAt: '2026-04-30 23:20:00' }], annotationHistory: [{ action: '标注SMT位置', user: '张建国', time: '2026-04-30 23:20:00' }], bodyPart: '食道上段', modality: '电子胃镜', seriesNumber: 1, frameNumber: 6, brightness: 4.1, clarity: 4.3, artifacts: 2 },
  { id: 'IMG052', patientId: 'P032', patientName: '邓桂香', examId: 'EX032', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c021/200/150', imageUrl: 'https://picsum.photos/seed/c021/800/600', captureTime: '2026-04-30 23:38:44', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 3, findings: '降结肠可见陈旧性出血斑，黏膜苍白', annotations: [], annotationHistory: [], bodyPart: '降结肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 9, brightness: 3.3, clarity: 2.9, artifacts: 3 },
  { id: 'IMG053', patientId: 'P033', patientName: '高建伟', examId: 'EX033', examType: '胃镜下活检', thumbnail: 'https://picsum.photos/seed/g032/200/150', imageUrl: 'https://picsum.photos/seed/g032/800/600', captureTime: '2026-04-30 23:55:27', deviceModel: 'EVIS EXERA III GIF-H260', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室1', quality: 5, findings: '胃体后壁可见1.5cm溃疡性病变，边缘不规则，质脆易出血，活检3块', annotations: [{ id: 'A042', type: 'rect', x: 110, y: 100, x2: 250, y2: 220, color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 24:05:00' }, { id: 'A043', type: 'text', x: 70, y: 70, text: '溃疡性胃癌?', color: '#ff4444', createdBy: '李秀英', createdAt: '2026-04-30 24:05:30' }], annotationHistory: [{ action: '圈选溃疡区域', user: '李秀英', time: '2026-04-30 24:05:00' }, { action: '添加高度怀疑标注', user: '李秀英', time: '2026-04-30 24:05:30' }], bodyPart: '胃体后壁', modality: '电子胃镜', seriesNumber: 1, frameNumber: 18, brightness: 4.4, clarity: 4.7, artifacts: 2 },
  { id: 'IMG054', patientId: 'P034', patientName: '任凤云', examId: 'EX034', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g033/200/150', imageUrl: 'https://picsum.photos/seed/g033/800/600', captureTime: '2026-04-29 08:15:33', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '胃底黏膜光滑，黏液湖清亮，量中等', annotations: [], annotationHistory: [], bodyPart: '胃底', modality: '电子胃镜', seriesNumber: 1, frameNumber: 3, brightness: 4.0, clarity: 4.1, artifacts: 2 },
  { id: 'IMG055', patientId: 'P035', patientName: '唐胜利', examId: 'EX035', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c022/200/150', imageUrl: 'https://picsum.photos/seed/c022/800/600', captureTime: '2026-04-29 08:42:19', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 5, findings: '盲肠黏膜淋巴滤泡增生，表面颗粒样', annotations: [], annotationHistory: [], bodyPart: '盲肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 8, brightness: 4.5, clarity: 4.8, artifacts: 1 },
  { id: 'IMG056', patientId: 'P036', patientName: '汪秀梅', examId: 'EX036', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g034/200/150', imageUrl: 'https://picsum.photos/seed/g034/800/600', captureTime: '2026-04-29 09:28:45', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 3, findings: '胃窦黏膜花斑样改变，提示HP感染可能', annotations: [{ id: 'A044', type: 'text', x: 130, y: 110, text: 'HP感染?', color: '#d97706', createdBy: '张建国', createdAt: '2026-04-29 09:35:00' }], annotationHistory: [{ action: '标注可疑感染', user: '张建国', time: '2026-04-29 09:35:00' }], bodyPart: '胃窦', modality: '电子胃镜', seriesNumber: 1, frameNumber: 11, brightness: 3.5, clarity: 3.0, artifacts: 3 },
  { id: 'IMG057', patientId: 'P037', patientName: '卢志强', examId: 'EX037', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g035/200/150', imageUrl: 'https://picsum.photos/seed/g035/800/600', captureTime: '2026-04-29 10:15:22', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 4, findings: '十二指肠球部可见陈旧性溃疡瘢痕，黏膜纠集', annotations: [], annotationHistory: [], bodyPart: '十二指肠球部', modality: '电子胃镜', seriesNumber: 1, frameNumber: 15, brightness: 4.0, clarity: 4.1, artifacts: 2 },
  { id: 'IMG058', patientId: 'P038', patientName: '武惠芳', examId: 'EX038', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c023/200/150', imageUrl: 'https://picsum.photos/seed/c023/800/600', captureTime: '2026-04-29 11:05:38', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '横结肠中段可见0.8cm山田Ⅱ型息肉', annotations: [{ id: 'A045', type: 'circle', x: 180, y: 150, x2: 35, y2: 28, color: '#dc2626', createdBy: '李秀英', createdAt: '2026-04-29 11:15:00' }], annotationHistory: [{ action: '圈选息肉', user: '李秀英', time: '2026-04-29 11:15:00' }], bodyPart: '横结肠中段', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 12, brightness: 4.1, clarity: 4.3, artifacts: 2 },
  { id: 'IMG059', patientId: 'P039', patientName: '谭明远', examId: 'EX039', examType: '电子胃镜', thumbnail: 'https://picsum.photos/seed/g036/200/150', imageUrl: 'https://picsum.photos/seed/g036/800/600', captureTime: '2026-04-29 14:32:16', deviceModel: 'EVIS EXERA III GIF-H290', deviceManufacturer: 'Olympus', doctorName: '张建国', doctorId: 'U001', room: '内镜室1', quality: 5, findings: '食道全段黏膜光滑，血管纹理清晰可见', annotations: [], annotationHistory: [], bodyPart: '食道全段', modality: '电子胃镜', seriesNumber: 1, frameNumber: 5, brightness: 4.6, clarity: 4.9, artifacts: 1 },
  { id: 'IMG060', patientId: 'P040', patientName: '薛丽萍', examId: 'EX040', examType: '电子结肠镜', thumbnail: 'https://picsum.photos/seed/c024/200/150', imageUrl: 'https://picsum.photos/seed/c024/800/600', captureTime: '2026-04-29 15:18:55', deviceModel: 'EVIS EXERA III CF-H290I', deviceManufacturer: 'Olympus', doctorName: '李秀英', doctorId: 'U002', room: '内镜室2', quality: 4, findings: '乙状结肠可见2枚0.3-0.5cm息肉，予氩气刀灼除', annotations: [{ id: 'A046', type: 'arrow', x: 140, y: 120, x2: 220, y2: 180, color: '#16a34a', createdBy: '李秀英', createdAt: '2026-04-29 15:25:00' }, { id: 'A047', type: 'text', x: 100, y: 90, text: '已灼除', color: '#16a34a', createdBy: '李秀英', createdAt: '2026-04-29 15:25:30' }], annotationHistory: [{ action: '标注息肉位置', user: '李秀英', time: '2026-04-29 15:25:00' }, { action: '标注已处理', user: '李秀英', time: '2026-04-29 15:25:30' }], bodyPart: '乙状结肠', modality: '电子结肠镜', seriesNumber: 1, frameNumber: 14, brightness: 4.2, clarity: 4.4, artifacts: 1 },
];

// ============ Styles ============
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  searchRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0', minWidth: 200 },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  filterSelect: { padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', minWidth: 140, cursor: 'pointer' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  imageCard: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative' as const },
  thumbnail: { width: '100%', height: 150, objectFit: 'cover', background: '#f1f5f9' },
  cardBody: { padding: 12 },
  cardPatient: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  cardMeta: { fontSize: 11, color: '#64748b', display: 'flex', flexWrap: 'wrap' as const, gap: 4 },
  qualityRow: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 },
  qualityStar: { width: 12, height: 12 },
  annotationBadge: { display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: '#fef3c7', color: '#d97706' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 12, width: '95vw', maxWidth: 1400, height: '90vh', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  modalBody: { flex: 1, display: 'flex', overflow: 'hidden' },
  imageArea: { flex: 1, display: 'flex', flexDirection: 'column' as const, background: '#1a1a2e', position: 'relative' },
  svgOverlay: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  toolBar: { display: 'flex', gap: 8, padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', alignItems: 'center', flexWrap: 'wrap' as const },
  toolBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' },
  toolBtnActive: { background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c' },
  toolBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  infoPanel: { width: 340, borderLeft: '1px solid #e2e8f0', overflow: 'auto', background: '#fff' },
  infoSection: { padding: 16, borderBottom: '1px solid #f1f5f9' },
  infoTitle: { fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', marginBottom: 6 },
  infoLabel: { color: '#64748b' },
  historyItem: { display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  historyDot: { width: 8, height: 8, borderRadius: '50%', background: '#16a34a', marginTop: 4, flexShrink: 0 },
  historyText: { flex: 1, fontSize: 12 },
  historyTime: { fontSize: 10, color: '#94a3b8' },
  noData: { textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 },
  closeBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: 12 },
  inputRow: { display: 'flex', gap: 8, marginTop: 8 },
  textInput: { flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, outline: 'none' },
  navBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 },
  colorPicker: { display: 'flex', gap: 4 },
  colorDot: { width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent', transition: 'transform 0.1s' },
  // Comparison mode
  compareContainer: { flex: 1, display: 'flex', gap: 2, background: '#1a1a2e' },
  comparePane: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  compareOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' as const },
  compareDivider: { width: 4, background: '#fff', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  // Batch export
  checkbox: { position: 'absolute', top: 8, left: 8, width: 20, height: 20, cursor: 'pointer', zIndex: 5 },
  batchBar: { display: 'flex', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', alignItems: 'center', flexWrap: 'wrap' as const },
  batchInfo: { fontSize: 13, color: '#64748b' },
  // Stats panel
  statsPanel: { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statsTabs: { display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 },
  statsTab: { padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', color: '#64748b', transition: 'all 0.15s' },
  statsTabActive: { background: '#1a3a5c', color: '#fff' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  chartCard: { padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' },
  chartTitle: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  chartValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  chartSub: { fontSize: 11, color: '#94a3b8' },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 },
  bar: { flex: 1, borderRadius: '4px 4px 0 0', minWidth: 20, transition: 'height 0.3s' },
  pieChart: { width: 120, height: 120, borderRadius: '50%', position: 'relative' as const },
  legendList: { display: 'flex', flexDirection: 'column' as const, gap: 8, marginTop: 12 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 },
  legendColor: { width: 12, height: 12, borderRadius: 2 },
  // Quality rating
  qualityBreakdown: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  qualityItem: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  qualityLabel: { fontSize: 11, color: '#64748b', display: 'flex', justifyContent: 'space-between' },
  qualityBar: { height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  qualityFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  starInteractive: { cursor: 'pointer', transition: 'transform 0.1s' },
  // Tab content
  tabContent: { padding: 16 },
  doctorStats: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  doctorRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  doctorAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  doctorMeta: { fontSize: 11, color: '#94a3b8' },
  doctorStatsRow: { display: 'flex', gap: 16, fontSize: 12 },
  doctorStat: { textAlign: 'right' as const },
  doctorStatVal: { fontWeight: 600, color: '#1a3a5c' },
};

// ============ Helper Components ============
const qualityColors: Record<number, string> = { 1: '#dc2626', 2: '#d97706', 3: '#d97706', 4: '#16a34a', 5: '#16a34a' };
const qualityLabels: Record<number, string> = { 1: '差', 2: '较差', 3: '中等', 4: '良好', 5: '优秀' };

function QualityStars({ quality, size = 12, interactive = false, onChange }: { quality: number; size?: number; interactive?: boolean; onChange?: (q: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={interactive ? 'star-interactive' : ''}
          style={interactive ? styles.starInteractive as React.CSSProperties : undefined}
          fill={i <= quality ? '#fbbf24' : 'none'}
          color={i <= quality ? '#fbbf24' : '#e2e8f0'}
          onClick={interactive && onChange ? () => onChange(i) : undefined}
        />
      ))}
    </div>
  );
}

function QualityBreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={styles.qualityItem}>
      <div style={styles.qualityLabel}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{value.toFixed(1)}</span>
      </div>
      <div style={styles.qualityBar}>
        <div style={{ ...styles.qualityFill, width: `${value * 20}%`, background: color }} />
      </div>
    </div>
  );
}

function MiniBarChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={styles.barChart}>
      {data.map((d, i) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ height: `${(d.value / max) * 60}px`, width: '100%', background: colors[i % colors.length], borderRadius: '4px 4px 0 0', minHeight: 4 }} />
          <span style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function SimplePieChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const start = cumulative;
    cumulative += d.value / total;
    return { ...d, start, end: cumulative, color: colors[i % colors.length] };
  });
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ ...styles.pieChart, background: `conic-gradient(${segments.map((s, i) => `${s.color} ${s.start * 360}deg ${s.end * 360}deg`).join(', ')})` }} />
      <div style={styles.legendList}>
        {segments.map(s => (
          <div key={s.label} style={styles.legendItem}>
            <div style={{ ...styles.legendColor, background: s.color }} />
            <span style={{ color: '#475569' }}>{s.label}</span>
            <span style={{ color: '#94a3b8', marginLeft: 'auto' }}>{Math.round(s.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Annotation SVG Component ============
function AnnotationSVG({ annotations, activeTool, activeColor, onAdd, scale = 1 }: {
  annotations: ImageAnnotation[];
  activeTool: string;
  activeColor: string;
  onAdd: (ann: ImageAnnotation) => void;
  scale?: number;
}) {
  const [drawing, setDrawing] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getPos(e);
    if (activeTool === 'text') {
      setTextPos({ x, y });
    } else if (activeTool === 'arrow' || activeTool === 'rect' || activeTool === 'line' || activeTool === 'circle' || activeTool === 'distance') {
      setDrawing({ startX: x, startY: y, currentX: x, currentY: y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    setDrawing(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    const { startX, startY, currentX, currentY } = drawing;
    const user = '张建国';
    const now = new Date().toLocaleString();
    if (activeTool === 'arrow') {
      onAdd({ id: `A${Date.now()}`, type: 'arrow', x: startX, y: startY, x2: currentX, y2: currentY, color: activeColor, createdBy: user, createdAt: now });
    } else if (activeTool === 'rect') {
      onAdd({ id: `A${Date.now()}`, type: 'rect', x: Math.min(startX, currentX), y: Math.min(startY, currentY), x2: Math.max(startX, currentX), y2: Math.max(startY, currentY), color: activeColor, createdBy: user, createdAt: now });
    } else if (activeTool === 'line') {
      onAdd({ id: `A${Date.now()}`, type: 'line', x: startX, y: startY, x2: currentX, y2: currentY, color: activeColor, createdBy: user, createdAt: now });
    } else if (activeTool === 'circle') {
      const rx = Math.abs(currentX - startX);
      const ry = Math.abs(currentY - startY);
      onAdd({ id: `A${Date.now()}`, type: 'circle', x: startX, y: startY, x2: rx, y2: ry, color: activeColor, createdBy: user, createdAt: now });
    } else if (activeTool === 'distance') {
      const dist = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
      onAdd({ id: `A${Date.now()}`, type: 'distance', x: startX, y: startY, x2: currentX, y2: currentY, color: activeColor, createdBy: user, createdAt: now, measurement: { value: Math.round(dist * 10) / 10, unit: 'px' } });
    }
    setDrawing(null);
  };

  const handleTextSubmit = () => {
    if (textPos && textInput.trim()) {
      onAdd({ id: `A${Date.now()}`, type: 'text', x: textPos.x, y: textPos.y, text: textInput.trim(), color: activeColor, createdBy: '张建国', createdAt: new Date().toLocaleString() });
      setTextInput('');
      setTextPos(null);
    }
  };

  const renderAnnotation = (ann: ImageAnnotation) => {
    switch (ann.type) {
      case 'arrow': {
        const angle = Math.atan2(ann.y2 - ann.y, ann.x2 - ann.x);
        const headLen = 12;
        return (
          <g key={ann.id}>
            <defs>
              <marker id={`arrowhead-${ann.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={ann.color} />
              </marker>
            </defs>
            <line x1={ann.x} y1={ann.y} x2={ann.x2} y2={ann.y2} stroke={ann.color} strokeWidth={2.5} markerEnd={`url(#arrowhead-${ann.id})`} />
          </g>
        );
      }
      case 'line':
        return <line key={ann.id} x1={ann.x} y1={ann.y} x2={ann.x2} y2={ann.y2} stroke={ann.color} strokeWidth={2.5} />;
      case 'rect':
        return <rect key={ann.id} x={Math.min(ann.x, ann.x2)} y={Math.min(ann.y, ann.y2)} width={Math.abs(ann.x2 - ann.x)} height={Math.abs(ann.y2 - ann.y)} stroke={ann.color} strokeWidth={2.5} fill="none" strokeDasharray="5,5" />;
      case 'circle':
        return <ellipse key={ann.id} cx={ann.x} cy={ann.y} rx={ann.x2} ry={ann.y2} stroke={ann.color} strokeWidth={2.5} fill="none" />;
      case 'distance': {
        const dist = ann.measurement?.value || 0;
        const midX = (ann.x + ann.x2) / 2;
        const midY = (ann.y + ann.y2) / 2;
        return (
          <g key={ann.id}>
            <line x1={ann.x} y1={ann.y} x2={ann.x2} y2={ann.y2} stroke={ann.color} strokeWidth={2.5} />
            <rect x={midX - 25} y={midY - 10} width={50} height={20} fill={ann.color} rx={4} />
            <text x={midX} y={midY + 4} fill="#fff" fontSize={11} fontWeight={600} textAnchor="middle">{dist}px</text>
          </g>
        );
      }
      case 'text':
        if (!ann.text) return null;
        return (
          <g key={ann.id}>
            <rect x={ann.x - 4} y={ann.y - 16} width={ann.text.length * 14 + 8} height={22} fill={ann.color} rx={4} />
            <text x={ann.x} y={ann.y} fill="#fff" fontSize={12} fontWeight={600}>{ann.text}</text>
          </g>
        );
      default:
        return null;
    }
  };

  const renderDrawing = () => {
    if (!drawing) return null;
    const { startX, startY, currentX, currentY } = drawing;
    if (startX === currentX && startY === currentY) return null;
    switch (activeTool) {
      case 'arrow':
        return <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke={activeColor} strokeWidth={2.5} strokeDasharray="5,5" />;
      case 'rect':
        return <rect x={Math.min(startX, currentX)} y={Math.min(startY, currentY)} width={Math.abs(currentX - startX)} height={Math.abs(currentY - startY)} stroke={activeColor} strokeWidth={2.5} fill="none" strokeDasharray="5,5" />;
      case 'line':
        return <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke={activeColor} strokeWidth={2.5} strokeDasharray="5,5" />;
      case 'circle':
        return <ellipse cx={startX} cy={startY} rx={Math.abs(currentX - startX)} ry={Math.abs(currentY - startY)} stroke={activeColor} strokeWidth={2.5} fill="none" strokeDasharray="5,5" />;
      case 'distance': {
        const dist = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        const midX = (startX + currentX) / 2;
        const midY = (startY + currentY) / 2;
        return (
          <g>
            <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke={activeColor} strokeWidth={2.5} strokeDasharray="5,5" />
            <rect x={midX - 25} y={midY - 10} width={50} height={20} fill={activeColor} rx={4} />
            <text x={midX} y={midY + 4} fill="#fff" fontSize={11} fontWeight={600} textAnchor="middle">{Math.round(dist * 10) / 10}px</text>
          </g>
        );
      }
      default:
        return null;
    }
  };

  return (
    <svg style={styles.svgOverlay} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {annotations.map(renderAnnotation)}
      {renderDrawing()}
      {textPos && (
        <foreignObject x={textPos.x - 50} y={textPos.y - 20} width={200} height={40}>
          <input
            autoFocus
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') setTextPos(null); }}
            onBlur={handleTextSubmit}
            style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: `2px solid ${activeColor}`, fontSize: 12, outline: 'none' }}
            placeholder="输入文字按Enter确认"
          />
        </foreignObject>
      )}
    </svg>
  );
}

// ============ Main Component ============
export default function ImagePage() {
  const [images] = useState<ImageRecord[]>(mockImages);
  const [search, setSearch] = useState('');
  const [filterModality, setFilterModality] = useState('全部');
  const [filterDoctor, setFilterDoctor] = useState('全部');
  const [filterQuality, setFilterQuality] = useState('全部');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<string>('arrow');
  const [activeColor, setActiveColor] = useState('#dc2626');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set());
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [statsTab, setStatsTab] = useState<'overview' | 'quality' | 'doctor'>('overview');
  const [compareMode, setCompareMode] = useState(false);
  const [compareImage, setCompareImage] = useState<ImageRecord | null>(null);
  const [annotationStack, setAnnotationStack] = useState<ImageAnnotation[][]>([]);
  const [redoStack, setRedoStack] = useState<ImageAnnotation[][]>([]);
  const [imageZoom, setImageZoom] = useState(1);
  const [localQuality, setLocalQuality] = useState<QualityBreakdown | null>(null);

  // Statistics
  const totalImages = images.length;
  const avgQuality = Math.round(images.reduce((sum, i) => sum + i.quality, 0) / totalImages * 10) / 10;
  const annotatedCount = images.filter(i => i.annotations.length > 0).length;
  const todayCount = images.filter(i => i.captureTime.startsWith('2026-04-30')).length;
  const 胃镜Count = images.filter(i => i.examType.includes('胃镜')).length;
  const 结肠镜Count = images.filter(i => i.examType.includes('结肠镜')).length;
  const avgClarity = Math.round(images.reduce((s, i) => s + (i.clarity || 0), 0) / totalImages * 10) / 10;
  const avgBrightness = Math.round(images.reduce((s, i) => s + (i.brightness || 0), 0) / totalImages * 10) / 10;
  const avgArtifacts = Math.round(images.reduce((s, i) => s + (i.artifacts || 0), 0) / totalImages * 10) / 10;

  // Quality distribution
  const qualityDist = [1, 2, 3, 4, 5].map(q => images.filter(i => i.quality === q).length);
  const qualityDistData = qualityDist.map((v, i) => ({ label: `${i + 1}星`, value: v }));
  const qualityColors2 = ['#dc2626', '#d97706', '#d97706', '#16a34a', '#16a34a'];

  // Doctor stats
  const doctorStats = Array.from(new Set(images.map(i => i.doctorName))).map(name => {
    const docs = images.filter(i => i.doctorName === name);
    return {
      name,
      count: docs.length,
      avgQuality: Math.round(docs.reduce((s, i) => s + i.quality, 0) / docs.length * 10) / 10,
      annotated: docs.filter(i => i.annotations.length > 0).length,
    };
  });

  // Modality distribution
  const modalityDist = ['电子胃镜', '电子结肠镜', '胃镜下活检'].map(m => ({
    label: m,
    value: images.filter(i => i.modality === m || i.examType.includes(m.split('镜')[0])).length,
  })).filter(d => d.value > 0);

  // Filtered images
  const filteredImages = images.filter(img => {
    const matchSearch = img.patientName.includes(search) || img.patientId.includes(search) || img.findings?.includes(search) || img.bodyPart.includes(search);
    const matchModality = filterModality === '全部' || img.modality.includes(filterModality) || img.examType.includes(filterModality);
    const matchDoctor = filterDoctor === '全部' || img.doctorName === filterDoctor;
    const matchQuality = filterQuality === '全部' || img.quality >= parseInt(filterQuality);
    return matchSearch && matchModality && matchDoctor && matchQuality;
  });

  // Open image
  const openImage = (img: ImageRecord) => {
    if (compareMode && selectedImage) {
      setCompareImage(img);
    } else {
      setSelectedImage(img);
      setAnnotations([...img.annotations]);
      setAnnotationStack([]);
      setRedoStack([]);
      if (img.clarity !== undefined && img.brightness !== undefined && img.artifacts !== undefined) {
        setLocalQuality({ clarity: img.clarity, brightness: img.brightness, artifacts: img.artifacts });
      }
    }
  };

  // Add annotation with undo support
  const handleAddAnnotation = (ann: ImageAnnotation) => {
    setAnnotationStack(prev => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations(prev => [...prev, ann]);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (annotationStack.length === 0) return;
    const prev = annotationStack[annotationStack.length - 1];
    setRedoStack(r => [...r, annotations]);
    setAnnotationStack(s => s.slice(0, -1));
    setAnnotations(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setAnnotationStack(a => [...a, annotations]);
    setRedoStack(r => r.slice(0, -1));
    setAnnotations(next);
  };

  // Delete annotation
  const handleDeleteAnnotation = (id: string) => {
    setAnnotationStack(prev => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  // Clear all annotations
  const handleClearAnnotations = () => {
    setAnnotationStack(prev => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations([]);
  };

  // Batch selection
  const toggleSelectForExport = (id: string) => {
    setSelectedForExport(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedForExport(new Set(filteredImages.map(i => i.id)));
  };

  const clearSelection = () => {
    setSelectedForExport(new Set());
  };

  // Export selected
  const handleBatchExport = () => {
    const selectedImgs = images.filter(i => selectedForExport.has(i.id));
    if (selectedImgs.length === 0) return;
    // Simulate batch export - in real app, would create ZIP
    const exportInfo = selectedImgs.map(img => ({
      id: img.id,
      patient: img.patientName,
      examType: img.examType,
      bodyPart: img.bodyPart,
      quality: img.quality,
      annotations: annotations.filter(a => a.id.startsWith('A')).length,
      downloadUrl: img.imageUrl,
    }));
    const blob = new Blob([JSON.stringify(exportInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`已导出 ${selectedImgs.length} 张影像的批量信息`);
  };

  // Export single image with annotations
  const handleExportWithAnnotations = () => {
    if (!selectedImage) return;
    const exportData = {
      ...selectedImage,
      annotations,
      exportTime: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedImage.id}_annotated.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Interactive quality change
  const handleQualityChange = (newQuality: number) => {
    if (!selectedImage) return;
    setAnnotations(prev => prev.map(a => ({ ...a }))); // trigger re-render
    setLocalQuality({ clarity: newQuality - 0.5, brightness: newQuality - 0.8, artifacts: 6 - newQuality });
  };

  // Render stat card
  const renderStatCard = (label: string, value: number | string, sub?: string, color?: string, icon?: React.ReactNode) => (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {icon && <span style={{ color: '#60a5fa' }}>{icon}</span>}
        <div style={styles.statLabel}>{label}</div>
      </div>
      <div style={{ ...styles.statValue, color: color || '#1a3a5c' }}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  // Toggle compare mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      setCompareImage(null);
    }
  };

  // Reset zoom
  const resetZoom = () => setImageZoom(1);
  const zoomIn = () => setImageZoom(z => Math.min(z + 0.25, 3));
  const zoomOut = () => setImageZoom(z => Math.max(z - 0.25, 0.5));

  const doctors = ['全部', ...Array.from(new Set(images.map(i => i.doctorName)))];

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <FileImage size={22} color="#60a5fa" />
          影像管理中心
          <button
            style={{ ...styles.toolBtn, marginLeft: 12, ...(showStatsPanel ? styles.toolBtnActive : {}) }}
            onClick={() => setShowStatsPanel(!showStatsPanel)}
          >
            <BarChart3 size={14} /> 统计面板
          </button>
          <button
            style={{ ...styles.toolBtn, ...(compareMode ? styles.toolBtnActive : {}) }}
            onClick={toggleCompareMode}
          >
            <GitCompare size={14} /> 图像对比
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...styles.toolBtn, ...(viewMode === 'grid' ? styles.toolBtnActive : {}) }} onClick={() => setViewMode('grid')}>
            <Image size={14} /> 网格
          </button>
          <button style={{ ...styles.toolBtn, ...(viewMode === 'list' ? styles.toolBtnActive : {}) }} onClick={() => setViewMode('list')}>
            <Activity size={14} /> 列表
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStatsPanel && (
        <div style={styles.statsPanel}>
          <div style={styles.statsTabs}>
            {(['overview', 'quality', 'doctor'] as const).map(tab => (
              <button
                key={tab}
                style={{ ...styles.statsTab, ...(statsTab === tab ? styles.statsTabActive : {}) }}
                onClick={() => setStatsTab(tab)}
              >
                {tab === 'overview' && <PieChart size={14} style={{ marginRight: 4 }} />}
                {tab === 'quality' && <Star size={14} style={{ marginRight: 4 }} />}
                {tab === 'doctor' && <User size={14} style={{ marginRight: 4 }} />}
                {tab === 'overview' ? '总览' : tab === 'quality' ? '质量分析' : '医生统计'}
              </button>
            ))}
          </div>

          {statsTab === 'overview' && (
            <>
              <div style={styles.chartGrid}>
                {renderStatCard('影像总数', totalImages, '张', '#1a3a5c', <ImageIcon size={16} />)}
                {renderStatCard('今日新增', todayCount, '张', '#16a34a', <TrendingUp size={16} />)}
                {renderStatCard('已标注', annotatedCount, `占比 ${Math.round(annotatedCount / totalImages * 100)}%`, '#d97706', <Edit3 size={16} />)}
                {renderStatCard('平均质量', avgQuality, '/ 5分', '#16a34a', <Star size={16} />)}
                {renderStatCard('胃镜/结肠镜', `${胃镜Count}/${结肠镜Count}`, '分类', '#3b82f6', <Activity size={16} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20 }}>
                <div style={styles.chartCard}>
                  <div style={styles.chartTitle}>质量分布</div>
                  <MiniBarChart data={qualityDistData} colors={qualityColors2} />
                </div>
                <div style={styles.chartCard}>
                  <div style={styles.chartTitle}>检查类型分布</div>
                  <SimplePieChart data={modalityDist} colors={['#3b82f6', '#16a34a', '#d97706']} />
                </div>
              </div>
            </>
          )}

          {statsTab === 'quality' && (
            <div style={styles.chartGrid}>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>平均清晰度</div>
                <div style={{ ...styles.chartValue, color: '#3b82f6' }}>{avgClarity}</div>
                <div style={styles.chartSub}>满分 5.0</div>
                <div style={{ marginTop: 12 }}>
                  <QualityBreakdownBar label="清晰度" value={avgClarity} color="#3b82f6" />
                  <QualityBreakdownBar label="亮度均衡" value={avgBrightness} color="#d97706" />
                  <QualityBreakdownBar label="伪影控制" value={6 - avgArtifacts} color="#16a34a" />
                </div>
              </div>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>质量评分构成</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {qualityDist.map((count, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#64748b', width: 40 }}>{idx + 1}星</span>
                      <div style={{ flex: 1, height: 20, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / totalImages) * 100}%`, background: qualityColors[idx + 1], borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#475569', width: 40, textAlign: 'right' }}>{count}张</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>优秀影像 (5星)</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#16a34a' }}>{qualityDist[4]}</div>
                <div style={styles.chartSub}>占比 {Math.round(qualityDist[4] / totalImages * 100)}%</div>
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {images.filter(i => i.quality === 5).slice(0, 4).map(img => (
                    <img key={img.id} src={img.thumbnail} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                  ))}
                </div>
              </div>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>需改进影像 (1-2星)</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#dc2626' }}>{qualityDist[0] + qualityDist[1]}</div>
                <div style={styles.chartSub}>占比 {Math.round((qualityDist[0] + qualityDist[1]) / totalImages * 100)}%</div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>建议复查或重新采集</div>
              </div>
            </div>
          )}

          {statsTab === 'doctor' && (
            <div style={styles.doctorStats}>
              {doctorStats.map(doc => (
                <div key={doc.name} style={styles.doctorRow}>
                  <div style={styles.doctorAvatar}>{doc.name.slice(0, 1)}</div>
                  <div style={styles.doctorInfo}>
                    <div style={styles.doctorName}>{doc.name}</div>
                    <div style={styles.doctorMeta}>检查 {doc.count} 张 · 标注 {doc.annotated} 张</div>
                  </div>
                  <div style={styles.doctorStats}>
                    <div style={styles.doctorStat}>
                      <div style={styles.doctorStatVal}>{doc.avgQuality}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>平均质量</div>
                    </div>
                    <div style={styles.doctorStat}>
                      <QualityStars quality={doc.avgQuality} size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Row */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input style={styles.searchInput} placeholder="搜索患者/部位/描述..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <select style={styles.filterSelect} value={filterModality} onChange={e => setFilterModality(e.target.value)}>
          <option>全部</option>
          <option>胃镜</option>
          <option>结肠镜</option>
        </select>
        <select style={styles.filterSelect} value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
          {doctors.map(d => <option key={d}>{d}</option>)}
        </select>
        <select style={styles.filterSelect} value={filterQuality} onChange={e => setFilterQuality(e.target.value)}>
          <option>全部</option>
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </div>

      {/* Batch Export Bar */}
      {selectedForExport.size > 0 && (
        <div style={styles.batchBar}>
          <div style={styles.batchInfo}>
            <CheckCircle size={14} color="#16a34a" style={{ marginRight: 6 }} />
            已选择 {selectedForExport.size} 张影像
          </div>
          <button style={styles.toolBtn} onClick={selectAll}>
            <CheckSquare size={14} /> 全选
          </button>
          <button style={styles.toolBtn} onClick={clearSelection}>
            <Square size={14} /> 取消
          </button>
          <button style={{ ...styles.toolBtn, ...styles.toolBtnActive }} onClick={handleBatchExport}>
            <Package size={14} /> 批量导出
          </button>
        </div>
      )}

      {/* Image Grid/List */}
      {viewMode === 'grid' ? (
        <div style={styles.gridContainer}>
          {filteredImages.length === 0 ? (
            <div style={{ ...styles.imageCard, gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#94a3b8' }}>暂无影像数据</div>
          ) : filteredImages.map(img => (
            <div
              key={img.id}
              style={styles.imageCard}
              onClick={() => openImage(img)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={selectedForExport.has(img.id)}
                onChange={e => { e.stopPropagation(); toggleSelectForExport(img.id); }}
                onClick={e => e.stopPropagation()}
              />
              <img src={img.thumbnail} alt={img.bodyPart} style={styles.thumbnail} />
              <div style={styles.cardBody}>
                <div style={styles.cardPatient}>{img.patientName}</div>
                <div style={styles.cardMeta}>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{img.examType}</span>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{img.bodyPart}</span>
                </div>
                <div style={{ ...styles.cardMeta, marginTop: 4 }}>
                  <Clock size={10} color="#94a3b8" /> <span>{img.captureTime.split(' ')[1]}</span>
                </div>
                <div style={styles.qualityRow}>
                  <QualityStars quality={img.quality} />
                  <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>{img.quality}分</span>
                  {img.annotations.length > 0 && (
                    <span style={{ ...styles.annotationBadge, marginLeft: 'auto' }}>
                      <Edit3 size={8} /> {img.annotations.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', width: 40 }}></th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>患者</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>检查类型</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>部位</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>采集时间</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>设备</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>医生</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>质量</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>标注</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.length === 0 ? (
                <tr><td colSpan={10} style={styles.noData}>暂无影像数据</td></tr>
              ) : filteredImages.map(img => (
                <tr key={img.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => openImage(img)}>
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedForExport.has(img.id)}
                      onChange={() => toggleSelectForExport(img.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{img.patientName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{img.patientId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{img.examType}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{img.bodyPart}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{img.captureTime}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b' }}>{img.deviceModel.split(' ').slice(2).join(' ')}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{img.doctorName}</td>
                  <td style={{ padding: '12px 16px' }}><QualityStars quality={img.quality} size={10} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    {img.annotations.length > 0 ? (
                      <span style={styles.annotationBadge}><Edit3 size={8} /> {img.annotations.length}条</span>
                    ) : <span style={{ fontSize: 11, color: '#94a3b8' }}>无</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ ...styles.toolBtn, padding: '4px 8px' }} onClick={e => { e.stopPropagation(); openImage(img); }}><Eye size={12} /> 查看</button>
                      {compareMode && (
                        <button style={{ ...styles.toolBtn, padding: '4px 8px' }} onClick={e => { e.stopPropagation(); openImage(img); }}><GitCompare size={12} /> 对比</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && !compareMode && (
        <div style={styles.modal} onClick={e => { if (e.target === e.currentTarget) setSelectedImage(null); }}>
          <div style={styles.modalContent}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <FileImage size={18} color="#60a5fa" />
                {selectedImage.patientName} - {selectedImage.examType} - {selectedImage.bodyPart}
                <button style={{ ...styles.toolBtn, ...(compareMode ? styles.toolBtnActive : {}), marginLeft: 8 }} onClick={toggleCompareMode}>
                  <GitCompare size={14} /> 对比模式
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>序列{selectedImage.seriesNumber} / 帧{selectedImage.frameNumber}</span>
                <button style={styles.closeBtn} onClick={() => setSelectedImage(null)}>
                  <X size={14} /> 关闭
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {/* Image Area */}
              <div style={styles.imageArea}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 16 }}>
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.bodyPart}
                    style={{ maxWidth: `${imageZoom * 100}%`, maxHeight: '100%', objectFit: 'contain', borderRadius: 8, transition: 'max-width 0.2s' }}
                  />
                  <AnnotationSVG
                    annotations={annotations}
                    activeTool={activeTool}
                    activeColor={activeColor}
                    onAdd={handleAddAnnotation}
                    scale={imageZoom}
                  />
                </div>

                {/* Tool Bar */}
                <div style={styles.toolBar}>
                  {/* Undo/Redo */}
                  <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
                    <button style={{ ...styles.toolBtn, padding: '6px 8px', ...(annotationStack.length === 0 ? styles.toolBtnDisabled : {}) }} onClick={handleUndo} disabled={annotationStack.length === 0}>
                      <Undo size={14} />
                    </button>
                    <button style={{ ...styles.toolBtn, padding: '6px 8px', ...(redoStack.length === 0 ? styles.toolBtnDisabled : {}) }} onClick={handleRedo} disabled={redoStack.length === 0}>
                      <Redo size={14} />
                    </button>
                  </div>

                  {/* Annotation Tools */}
                  <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
                    {[
                      { tool: 'arrow', icon: <ArrowRight size={14} />, label: '箭头' },
                      { tool: 'line', icon: <Minus size={14} />, label: '直线' },
                      { tool: 'rect', icon: <Square size={14} />, label: '矩形' },
                      { tool: 'circle', icon: <Circle size={14} />, label: '椭圆' },
                      { tool: 'distance', icon: <Ruler size={14} />, label: '测量' },
                      { tool: 'text', icon: <Type size={14} />, label: '文字' },
                      { tool: 'eraser', icon: <Eraser size={14} />, label: '删除' },
                    ].map(t => (
                      <button
                        key={t.tool}
                        style={{ ...styles.toolBtn, ...(activeTool === t.tool ? styles.toolBtnActive : {}) }}
                        onClick={() => setActiveTool(t.tool)}
                        title={t.label}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>

                  {/* Color Picker */}
                  <div style={styles.colorPicker}>
                    {['#dc2626', '#d97706', '#16a34a', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                      <div
                        key={c}
                        style={{ ...styles.colorDot, background: c, border: activeColor === c ? '3px solid #1a3a5c' : '2px solid transparent', transform: activeColor === c ? 'scale(1.15)' : 'scale(1)' }}
                        onClick={() => setActiveColor(c)}
                      />
                    ))}
                  </div>

                  {/* Zoom Controls */}
                  <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                    <button style={styles.toolBtn} onClick={zoomOut}><ZoomOut size={14} /></button>
                    <button style={{ ...styles.toolBtn, minWidth: 50 }} onClick={resetZoom}>{Math.round(imageZoom * 100)}%</button>
                    <button style={styles.toolBtn} onClick={zoomIn}><ZoomIn size={14} /></button>
                  </div>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button style={styles.toolBtn} onClick={handleClearAnnotations}>
                      <RotateCcw size={14} /> 清除
                    </button>
                    <button style={styles.toolBtn} onClick={handleExportWithAnnotations}>
                      <Save size={14} /> 导出
                    </button>
                    <button style={styles.toolBtn} onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.imageUrl;
                      link.download = `${selectedImage.id}.jpg`;
                      link.click();
                    }}>
                      <Download size={14} /> 下载原图
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div style={styles.infoPanel}>
                {/* Patient Info */}
                <div style={styles.infoSection}>
                  <div style={styles.infoTitle}><User size={14} />患者信息</div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>患者ID</span><span>{selectedImage.patientId}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>姓名</span><span>{selectedImage.patientName}</span></div>
                </div>

                {/* Exam Info */}
                <div style={styles.infoSection}>
                  <div style={styles.infoTitle}><FileImage size={14} />检查信息</div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>检查类型</span><span>{selectedImage.examType}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>检查部位</span><span>{selectedImage.bodyPart}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>检查ID</span><span>{selectedImage.examId}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>检查室</span><span>{selectedImage.room}</span></div>
                </div>

                {/* Image Info */}
                <div style={styles.infoSection}>
                  <div style={styles.infoTitle}><Camera size={14} />影像信息</div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>采集时间</span><span>{selectedImage.captureTime}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>设备型号</span><span style={{ fontSize: 11 }}>{selectedImage.deviceModel}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>生产厂商</span><span>{selectedImage.deviceManufacturer}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>检查医生</span><span>{selectedImage.doctorName}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>影像质量</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <QualityStars quality={selectedImage.quality} size={10} />
                      <span style={{ color: qualityColors[selectedImage.quality] }}>{selectedImage.quality}分</span>
                    </span>
                  </div>
                </div>

                {/* Interactive Quality Rating */}
                <div style={styles.infoSection}>
                  <div style={styles.infoTitle}><Gauge size={14} />质量评分 (点击修改)</div>
                  <div style={{ marginBottom: 12 }}>
                    <QualityStars quality={selectedImage.quality} size={18} interactive onChange={handleQualityChange} />
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{qualityLabels[selectedImage.quality]}</div>
                  </div>
                  {localQuality && (
                    <div style={styles.qualityBreakdown}>
                      <QualityBreakdownBar label="清晰度" value={localQuality.clarity} color="#3b82f6" />
                      <QualityBreakdownBar label="亮度" value={localQuality.brightness} color="#d97706" />
                      <QualityBreakdownBar label="伪影" value={6 - localQuality.artifacts} color="#16a34a" />
                    </div>
                  )}
                </div>

                {/* Findings */}
                {selectedImage.findings && (
                  <div style={styles.infoSection}>
                    <div style={styles.infoTitle}><Eye size={14} />镜下所见</div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{selectedImage.findings}</div>
                  </div>
                )}

                {/* Annotation List */}
                <div style={styles.infoSection}>
                  <div style={styles.infoTitle}><Edit3 size={14} />标注列表 ({annotations.length})</div>
                  {annotations.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>暂无标注 (点击图像添加)</div>
                  ) : annotations.map(ann => (
                    <div key={ann.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ann.color, marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                          {ann.type === 'arrow' ? '箭头标注' : ann.type === 'rect' ? '矩形标注' : ann.type === 'circle' ? '椭圆标注' : ann.type === 'line' ? '直线标注' : ann.type === 'distance' ? '距离测量' : '文字标注'}
                          {ann.text && <span style={{ fontWeight: 400, color: '#64748b' }}>：{ann.text}</span>}
                          {ann.measurement && <span style={{ fontWeight: 400, color: '#3b82f6' }}>：{ann.measurement.value}{ann.measurement.unit}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{ann.createdBy} · {ann.createdAt}</div>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} onClick={() => handleDeleteAnnotation(ann.id)}>
                        <Trash2 size={12} color="#dc2626" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Annotation History */}
                <div style={styles.infoSection}>
                  <div style={styles.infoTitle}><MessageSquare size={14} />标注历史</div>
                  {[...annotations, ...selectedImage.annotationHistory].length === 0 ? (
                    <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>暂无历史记录</div>
                  ) : (
                    [...annotations.map(a => ({ action: `添加${a.type === 'arrow' ? '箭头' : a.type === 'rect' ? '矩形' : a.type === 'circle' ? '椭圆' : a.type === 'line' ? '直线' : a.type === 'distance' ? '距离' : '文字'}标注${a.text ? ` "${a.text}"` : ''}`, user: a.createdBy, time: a.createdAt })),
                      ...selectedImage.annotationHistory
                    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10).map((h, idx) => (
                      <div key={idx} style={styles.historyItem}>
                        <div style={{ ...styles.historyDot, background: idx === 0 ? '#3b82f6' : '#16a34a' }} />
                        <div style={styles.historyText}>
                          <div>{h.action}</div>
                          <div style={{ color: '#64748b' }}>{h.user}</div>
                        </div>
                        <div style={styles.historyTime}>{h.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Mode */}
      {compareMode && selectedImage && (
        <div style={styles.modal} onClick={e => { if (e.target === e.currentTarget) { setSelectedImage(null); setCompareMode(false); } }}>
          <div style={{ ...styles.modalContent, maxWidth: 1600 }}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <GitCompare size={18} color="#60a5fa" />
                图像对比模式
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
                  {selectedImage.patientName} ({selectedImage.examType}) vs {compareImage ? `${compareImage.patientName} (${compareImage.examType})` : '请选择第二张图像'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={styles.closeBtn} onClick={() => { setSelectedImage(null); setCompareImage(null); setCompareMode(false); }}>
                  <X size={14} /> 关闭
                </button>
              </div>
            </div>
            <div style={styles.compareContainer}>
              {/* Left Image */}
              <div style={styles.comparePane}>
                <img src={selectedImage.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                  {selectedImage.patientName} · {selectedImage.bodyPart} · 质量: {selectedImage.quality}星
                </div>
              </div>

              {/* Divider / Right Image */}
              {compareImage ? (
                <div style={styles.comparePane}>
                  <img src={compareImage.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                    {compareImage.patientName} · {compareImage.bodyPart} · 质量: {compareImage.quality}星
                  </div>
                  <button
                    style={{ position: 'absolute', top: 8, right: 8, ...styles.closeBtn, background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setCompareImage(null)}
                  >
                    <X size={14} /> 更换
                  </button>
                </div>
              ) : (
                <div style={{ ...styles.comparePane, background: '#1a1a2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <GitCompare size={48} color="#60a5fa" />
                  <div style={{ marginTop: 16, fontSize: 14 }}>从列表中选择第二张图像</div>
                  <div style={{ marginTop: 8, fontSize: 12 }}>点击列表中的 <GitCompare size={12} style={{ verticalAlign: 'middle' }} /> 对比 按钮</div>
                </div>
              )}
            </div>

            {/* Comparison Info Bar */}
            {compareImage && (
              <div style={{ display: 'flex', gap: 24, padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>质量对比:</span>
                  <QualityStars quality={selectedImage.quality} size={14} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>vs</span>
                  <QualityStars quality={compareImage.quality} size={14} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  标注数量: {selectedImage.annotations.length} vs {compareImage.annotations.length}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  设备: {selectedImage.deviceModel.split(' ')[2]} vs {compareImage.deviceModel.split(' ')[2]}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  采集时间差: {Math.round((new Date(compareImage.captureTime).getTime() - new Date(selectedImage.captureTime).getTime()) / 60000)} 分钟
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
