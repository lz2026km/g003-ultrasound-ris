import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Image, Search, Grid, List, Play, Pause, RotateCw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Move, Ruler, Activity, Circle, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, RefreshCw, Layers, Info, Settings, Download, Printer,
  MousePointer, Type, PenTool
} from 'lucide-react';
import { initialExams, initialPatients } from '../data/initialData';
import type { Exam } from '../types';

// ============== Types ==============
interface SeriesImage {
  id: string;
  imageNumber: number;
  huValue?: number;
}

interface Series {
  id: string;
  seriesNumber: number;
  seriesName: string;
  images: SeriesImage[];
  description: string;
  sliceThickness?: string;
  tr?: string;
  te?: string;
  acquisitionTime?: string;
}

interface Measurement {
  id: string;
  type: 'length' | 'angle' | 'text';
  points: { x: number; y: number }[];
  value: number;
  unit: string;
  text?: string;
}

type ToolType = 'pan' | 'length' | 'angle' | 'text';

// ============== Constants ==============
const modalityColors: Record<string, string> = {
  'CT': '#2563eb', 'MR': '#7c3aed', 'DR': '#10b981',
  '超声': '#0891b2', '乳腺钼靶': '#db2777',
};

const thumbnailGradients: Record<string, string> = {
  'CT': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'MR': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'DR': 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  '超声': 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
};

const windowPresets = [
  { name: '骨窗', ww: 400, wl: 1500, desc: 'C:1500 W:400' },
  { name: '软组织', ww: 50, wl: 250, desc: 'C:250 W:50' },
  { name: '肺窗', ww: 1500, wl: -600, desc: 'C:-600 W:1500' },
  { name: '纵隔窗', ww: 350, wl: 50, desc: 'C:50 W:350' },
];

const zoomPresets = [
  { label: 'fit', value: 0 },
  { label: '50%', value: 50 },
  { label: '100%', value: 100 },
  { label: '200%', value: 200 },
  { label: '400%', value: 400 },
];

// ============== Helper Functions ==============
const generateSeries = (exam: Exam): Series[] => {
  const modalitySeriesConfig: Record<string, { count: number; names: string[]; hasTRTE?: boolean }> = {
    'CT': { count: 4, names: ['平扫', '动脉期', '静脉期', '延迟期'] },
    'MR': { count: 6, names: ['T1WI', 'T2WI', 'FLAIR', 'DWI', 'T1WI+C', 'ADC'], hasTRTE: true },
    'DR': { count: 2, names: ['正位', '侧位'] },
    '超声': { count: 3, names: ['灰阶', '彩色多普勒', '弹性成像'] },
  };

  const config = modalitySeriesConfig[exam.modality] || { count: 2, names: ['序列1', '序列2'] };

  return Array.from({ length: config.count }, (_, i) => {
    const imageCount = exam.modality === 'CT' || exam.modality === 'MR'
      ? Math.floor(Math.random() * 80) + 40
      : Math.floor(Math.random() * 6) + 1;

    return {
      id: `${exam.id}-series-${i + 1}`,
      seriesNumber: i + 1,
      seriesName: config.names[i] || `序列${i + 1}`,
      sliceThickness: exam.modality === 'CT' ? '5mm' : exam.modality === 'MR' ? '4mm' : undefined,
      tr: config.hasTRTE ? `${1500 + Math.floor(Math.random() * 2000)}ms` : undefined,
      te: config.hasTRTE ? `${80 + Math.floor(Math.random() * 200)}ms` : undefined,
      acquisitionTime: '2024-01-15 10:30:00',
      images: Array.from({ length: imageCount }, (_, j) => ({
        id: `${exam.id}-img-${i}-${j}`,
        imageNumber: j + 1,
        huValue: exam.modality === 'CT' ? Math.floor(Math.random() * 400) - 100 : undefined,
      })),
      description: exam.modality === 'CT'
        ? '层厚5mm，层距5mm'
        : exam.modality === 'MR'
        ? '层厚4mm，层距1mm'
        : '标准摄影',
    };
  });
};

// ============== Main Component ==============
export default function ImagingPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // View state
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowLevel, setWindowLevel] = useState(40);

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>('pan');
  const [isPlaying, setIsPlaying] = useState(false);

  // Measurement state
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [rightDragStart, setRightDragStart] = useState({ x: 0, y: 0, ww: 0, wl: 0 });
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data
  const exams = initialExams.filter(e => e.status === '已完成');
  const patients = initialPatients;

  const filteredExams = useMemo(() => {
    const imagingModalities = ['CT', 'MR', 'DR', '超声'];
    return exams.filter(exam => {
      const patient = patients.find(p => p.id === exam.patientId);
      const matchSearch =
        exam.accessionNumber.includes(searchTerm) ||
        patient?.name.includes(searchTerm) ||
        exam.examItemName.includes(searchTerm);
      const matchModality = modalityFilter === '全部' || exam.modality === modalityFilter;
      const isImaging = imagingModalities.includes(exam.modality);
      return matchSearch && matchModality && isImaging;
    });
  }, [exams, patients, searchTerm, modalityFilter]);

  const seriesData = useMemo(() => {
    if (!selectedExam) return [];
    return generateSeries(selectedExam);
  }, [selectedExam]);

  const currentSeries = selectedSeries || seriesData[0];
  const images = currentSeries?.images || [];
  const patient = selectedExam ? patients.find(p => p.id === selectedExam.patientId) : null;

  // Auto-select first series when exam changes
  useEffect(() => {
    if (seriesData.length > 0 && !selectedSeries) {
      setSelectedSeries(seriesData[0]);
      setCurrentImageIndex(0);
    }
  }, [seriesData, selectedSeries]);

  // Playback logic
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      playIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 150);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, images.length]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedExam) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate effective zoom for fit mode
    const effectiveZoom = zoom === 0 ? Math.min(width / 220, height / 220) * 100 : zoom;
    const scale = effectiveZoom / 100;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Save context for transformations
    ctx.save();
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.scale(scale * (flipH ? -1 : 1), scale * (flipV ? -1 : 1));
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw simulated DICOM image
    const imgSize = 200;

    // Background gradient (simulating tissue)
    const bgGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, imgSize);
    bgGradient.addColorStop(0, '#4a4a5e');
    bgGradient.addColorStop(1, '#2a2a3e');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.fillStyle = '#3a3a4e';
    ctx.beginPath();
    ctx.ellipse(0, -15, 65, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skull
    ctx.fillStyle = '#5a5a6e';
    ctx.beginPath();
    ctx.ellipse(0, -40, 45, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brain tissue
    ctx.fillStyle = '#6a6a7e';
    ctx.beginPath();
    ctx.ellipse(0, -45, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(-15, -35, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, -35, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Simulate different window settings with colors
    const ww = windowWidth;
    const wl = windowLevel;
    const minVal = wl - ww / 2;
    const maxVal = wl + ww / 2;

    // Normalize window values to 0-1 range for visualization
    const windowNorm = (val: number) => Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));

    // Lungs - darker in soft tissue window, visible in lung window
    const lungBrightness = windowNorm(-400);
    const lungR = Math.floor(42 + lungBrightness * 30);
    const lungG = Math.floor(42 + lungBrightness * 30);
    const lungB = Math.floor(62 + lungBrightness * 30);
    ctx.fillStyle = `rgb(${lungR}, ${lungG}, ${lungB})`;
    ctx.beginPath();
    ctx.ellipse(-32, -5, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(32, -5, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heart - visible in mediastinal window
    const heartBrightness = windowNorm(200);
    const heartR = Math.floor(106 + heartBrightness * 40);
    const heartG = Math.floor(74 + heartBrightness * 30);
    const heartB = Math.floor(94 + heartBrightness * 30);
    ctx.fillStyle = `rgb(${heartR}, ${heartG}, ${heartB})`;
    ctx.beginPath();
    ctx.ellipse(0, 5, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spine
    const spineBrightness = windowNorm(300);
    ctx.fillStyle = `rgb(${90 + spineBrightness * 20}, ${90 + spineBrightness * 20}, ${110 + spineBrightness * 20})`;
    ctx.beginPath();
    ctx.ellipse(0, 30, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ribs
    ctx.strokeStyle = `rgba(74, 74, 94, ${0.5 + windowNorm(800) * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, -10);
    ctx.quadraticCurveTo(0, -30, 50, -10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-55, 5);
    ctx.quadraticCurveTo(0, -15, 55, 5);
    ctx.stroke();

    // Bone - bright in bone window
    const boneBrightness = windowNorm(1500);
    if (boneBrightness > 0.3) {
      ctx.fillStyle = `rgba(180, 180, 200, ${boneBrightness})`;
      // Simulated bone lesions
      ctx.beginPath();
      ctx.arc(-40, 20, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(25, -25, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lesion highlight (simulated tumor)
    const lesionBrightness = windowNorm(100);
    if (lesionBrightness > 0.2) {
      ctx.fillStyle = `rgba(255, 100, 100, ${lesionBrightness * 0.8})`;
      ctx.beginPath();
      ctx.arc(15, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slice position indicator (based on currentImageIndex)
    const sliceRatio = images.length > 1 ? currentImageIndex / (images.length - 1) : 0;
    const indicatorY = -60 + sliceRatio * 120;
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(-70, indicatorY);
    ctx.lineTo(-60, indicatorY - 5);
    ctx.lineTo(-60, indicatorY + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Draw measurements overlay
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for overlay
    measurements.forEach(m => {
      if (m.type === 'length' && m.points.length === 2) {
        const p1 = m.points[0];
        const p2 = m.points[1];
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw endpoints
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw value
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(midX - 25, midY - 10, 50, 16);
        ctx.fillStyle = '#00ff00';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${m.value.toFixed(1)} ${m.unit}`, midX, midY + 4);
      } else if (m.type === 'angle' && m.points.length === 3) {
        const [p1, p2, p3] = m.points;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        // Draw arc for angle
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 20, Math.atan2(v1.y, v1.x), Math.atan2(v2.y, v2.x), angle < 0);
        ctx.stroke();

        // Draw value
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(p2.x - 25, p2.y - 25, 50, 16);
        ctx.fillStyle = '#ffff00';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${m.value.toFixed(1)}°`, p2.x, p2.y - 12);
      } else if (m.type === 'text' && m.points.length === 1 && m.text) {
        const p = m.points[0];
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(p.x - 5, p.y - 14, ctx.measureText(m.text).width + 10, 18);
        ctx.fillStyle = '#00ffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(m.text, p.x, p.y);
      }
    });

    // Current measurement being drawn
    if (currentMeasurement) {
      if (currentMeasurement.type === 'length' && currentMeasurement.points.length === 1) {
        const p = currentMeasurement.points[0];
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentMeasurement.type === 'angle' && currentMeasurement.points.length < 3) {
        currentMeasurement.points.forEach(p => {
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        if (currentMeasurement.points.length === 2) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(currentMeasurement.points[0].x, currentMeasurement.points[0].y);
          ctx.lineTo(currentMeasurement.points[1].x, currentMeasurement.points[1].y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();

  }, [selectedExam, currentImageIndex, images.length, zoom, pan, rotation, flipH, flipV, windowWidth, windowLevel, measurements, currentMeasurement]);

  // Handlers
  const handleExamSelect = (exam: Exam) => {
    setSelectedExam(exam);
    const series = generateSeries(exam);
    setSelectedSeries(series[0]);
    setCurrentImageIndex(0);
    resetView();
    setMeasurements([]);
  };

  const resetView = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setWindowWidth(400);
    setWindowLevel(40);
    setActiveTool('pan');
    setMeasureTool(null);
  };

  const setMeasureTool = (tool: ToolType | null) => {
    if (tool === 'pan') {
      setActiveTool('pan');
    } else if (tool) {
      setActiveTool(tool);
    }
  };

  const handleWindowPreset = (ww: number, wl: number) => {
    setWindowWidth(ww);
    setWindowLevel(wl);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(10, Math.min(800, newZoom)));
  };

  const handleZoomPreset = (preset: number) => {
    setZoom(preset === 0 ? 100 : preset); // fit defaults to 100 for simplicity
  };

  const getCanvasPoint = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.ctrlKey) {
      const point = getCanvasPoint(e);
      if (!point) return;

      if (activeTool === 'pan') {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else if (activeTool === 'length') {
        if (!currentMeasurement) {
          setCurrentMeasurement({
            id: `m-${Date.now()}`,
            type: 'length',
            points: [point],
            value: 0,
            unit: 'mm',
          });
        } else if (currentMeasurement.points.length === 1) {
          const dx = point.x - currentMeasurement.points[0].x;
          const dy = point.y - currentMeasurement.points[0].y;
          const length = Math.sqrt(dx * dx + dy * dy) * 0.5;
          setMeasurements(prev => [...prev, { ...currentMeasurement, points: [...currentMeasurement.points, point], value: length }]);
          setCurrentMeasurement(null);
        }
      } else if (activeTool === 'angle') {
        if (!currentMeasurement) {
          setCurrentMeasurement({
            id: `m-${Date.now()}`,
            type: 'angle',
            points: [point],
            value: 0,
            unit: '°',
          });
        } else if (currentMeasurement.points.length < 3) {
          const newPoints = [...currentMeasurement.points, point];
          setCurrentMeasurement({ ...currentMeasurement, points: newPoints });
          if (newPoints.length === 3) {
            const v1 = { x: newPoints[1].x - newPoints[0].x, y: newPoints[1].y - newPoints[0].y };
            const v2 = { x: newPoints[2].x - newPoints[1].x, y: newPoints[2].y - newPoints[1].y };
            const angle = Math.abs(Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x)) * (180 / Math.PI);
            setMeasurements(prev => [...prev, { ...currentMeasurement, points: newPoints, value: Math.min(angle, 360 - angle) }]);
            setCurrentMeasurement(null);
          }
        }
      } else if (activeTool === 'text') {
        setTextPosition(point);
        setTextInput('');
      }
    } else if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
      setIsRightDragging(true);
      setRightDragStart({ x: e.clientX, y: e.clientY, ww: windowWidth, wl: windowLevel });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (isRightDragging) {
      const dx = e.clientX - rightDragStart.x;
      const dy = e.clientY - rightDragStart.y;
      setWindowWidth(Math.max(1, rightDragStart.ww + dx * 2));
      setWindowLevel(Math.max(-500, Math.min(500, rightDragStart.wl - dy * 2)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsRightDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      const delta = e.deltaY > 0 ? -10 : 10;
      handleZoomChange(zoom + delta);
    } else {
      if (e.deltaY > 0) {
        setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
      } else {
        setCurrentImageIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleDoubleClick = () => {
    resetView();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleTextSubmit = () => {
    if (textPosition && textInput.trim()) {
      setMeasurements(prev => [...prev, {
        id: `m-${Date.now()}`,
        type: 'text',
        points: [textPosition],
        value: 0,
        unit: '',
        text: textInput.trim(),
      }]);
    }
    setTextPosition(null);
    setTextInput('');
  };

  const currentHu = images[currentImageIndex]?.huValue ?? windowLevel;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .playing-indicator { animation: pulse 1s infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <h1 style={{
          fontSize: '24px', fontWeight: 600, color: '#1e293b', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <Image size={28} />
          影像查看器
        </h1>

        {/* Three Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 220px', gap: '16px', alignItems: 'start' }}>
          {/* ============== LEFT COLUMN: Series List ============== */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
              检查列表
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px 8px 32px', border: '1px solid #e5e7eb',
                  borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Modality Filter */}
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb',
                borderRadius: '6px', fontSize: '12px', outline: 'none', marginBottom: '12px',
                backgroundColor: 'white', boxSizing: 'border-box',
              }}
            >
              <option value="全部">全部模态</option>
              <option value="CT">CT</option>
              <option value="MR">MR</option>
              <option value="DR">DR</option>
              <option value="超声">超声</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  flex: 1, padding: '6px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? '#2563eb' : '#f1f5f9', color: viewMode === 'grid' ? 'white' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  flex: 1, padding: '6px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  backgroundColor: viewMode === 'list' ? '#2563eb' : '#f1f5f9', color: viewMode === 'list' ? 'white' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <List size={14} />
              </button>
            </div>

            {/* Exam List */}
            <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
              {viewMode === 'grid' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredExams.map(exam => {
                    const pat = patients.find(p => p.id === exam.patientId);
                    const isSelected = selectedExam?.id === exam.id;
                    const gradient = thumbnailGradients[exam.modality] || '#64748b';

                    return (
                      <div
                        key={exam.id}
                        onClick={() => handleExamSelect(exam)}
                        style={{
                          borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                          transition: 'all 0.2s', border: isSelected ? '2px solid #2563eb' : '2px solid transparent',
                          boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{
                          height: '80px', background: gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column',
                        }}>
                          <Image size={24} color="rgba(255,255,255,0.9)" />
                          <span style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginTop: '4px' }}>
                            {exam.modality}
                          </span>
                        </div>
                        <div style={{ padding: '8px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>
                            {pat?.name || '未知'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {exam.examItemName}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{
                              padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 600,
                              color: 'white', backgroundColor: modalityColors[exam.modality] || '#6b7280',
                            }}>
                              {exam.modality}
                            </span>
                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>{exam.scheduledDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  {filteredExams.map(exam => {
                    const pat = patients.find(p => p.id === exam.patientId);
                    const isSelected = selectedExam?.id === exam.id;

                    return (
                      <div
                        key={exam.id}
                        onClick={() => handleExamSelect(exam)}
                        style={{
                          padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px',
                          marginBottom: '6px', cursor: 'pointer', backgroundColor: isSelected ? '#eff6ff' : 'white',
                          borderColor: isSelected ? '#2563eb' : '#e5e7eb', display: 'flex', gap: '8px', alignItems: 'center',
                        }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          background: thumbnailGradients[exam.modality] || '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Image size={14} color="rgba(255,255,255,0.9)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '11px' }}>{pat?.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {exam.examItemName}
                          </div>
                        </div>
                        <span style={{
                          padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 600,
                          color: 'white', backgroundColor: modalityColors[exam.modality] || '#6b7280',
                        }}>
                          {exam.modality}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
              共 {filteredExams.length} 条记录
            </div>
          </div>

          {/* ============== CENTER COLUMN: Main Viewer ============== */}
          <div>
            <div style={{
              backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
            }}>
              {/* Top Info Bar */}
              <div style={{
                backgroundColor: '#1e293b', padding: '8px 16px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>
                    {patient?.name || '未选择患者'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {selectedExam?.examItemName || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Printer size={16} />
                  </button>
                  <button style={{
                    padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Main Viewer Area */}
              {selectedExam ? (
                <>
                  <div
                    ref={viewerRef}
                    style={{
                      backgroundColor: '#0a0a0f', height: '450px', position: 'relative',
                      overflow: 'hidden', cursor: activeTool === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair',
                      userSelect: 'none',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onDoubleClick={handleDoubleClick}
                    onContextMenu={handleContextMenu}
                  >
                    {/* Canvas Image */}
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={450}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      }}
                    />

                    {/* Overlay: Top Left - Image Info */}
                    <div style={{
                      position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'white',
                      top: '8px', left: '8px',
                    }}>
                      <div>第 {currentImageIndex + 1} / {images.length} 层</div>
                      <div style={{ color: '#60a5fa' }}>W: {windowWidth} L: {windowLevel}</div>
                    </div>

                    {/* Overlay: Top Right - Zoom */}
                    <div style={{
                      position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'white',
                      top: '8px', right: '8px',
                    }}>
                      <div>缩放: {zoom}%</div>
                    </div>

                    {/* Overlay: Bottom Left - Series Info */}
                    <div style={{
                      position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'white',
                      bottom: '8px', left: '8px',
                    }}>
                      <div>{currentSeries?.seriesName}</div>
                      <div style={{ color: '#94a3b8' }}>HU: {currentHu}</div>
                    </div>

                    {/* Overlay: Bottom Right - Tool indicator */}
                    <div style={{
                      position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'white',
                      bottom: '8px', right: '8px',
                    }}>
                      {activeTool === 'pan' && '平移'}
                      {activeTool === 'length' && '长度测量'}
                      {activeTool === 'angle' && '角度测量'}
                      {activeTool === 'text' && '标注文字'}
                    </div>

                    {/* Frame Navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                          style={{
                            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                            borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                          style={{
                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                            borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Playing Indicator */}
                    {isPlaying && (
                      <div style={{
                        position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
                        backgroundColor: '#2563eb', color: 'white', padding: '4px 12px',
                        borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      }}
                        className="playing-indicator"
                      >
                        ▶ 播放中
                      </div>
                    )}

                    {/* Text Input Modal */}
                    {textPosition && (
                      <div style={{
                        position: 'absolute', left: textPosition.x, top: textPosition.y,
                        backgroundColor: 'white', borderRadius: '4px', padding: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTextSubmit();
                            if (e.key === 'Escape') setTextPosition(null);
                          }}
                          autoFocus
                          style={{
                            border: 'none', outline: 'none', fontSize: '12px', padding: '2px 4px', width: '120px',
                          }}
                          placeholder="输入标注..."
                        />
                        <button
                          onClick={handleTextSubmit}
                          style={{
                            border: 'none', backgroundColor: '#2563eb', color: 'white',
                            borderRadius: '2px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer', marginLeft: '4px',
                          }}
                        >
                          确定
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ============== TOOLBAR ============== */}
                  <div style={{ backgroundColor: '#1e293b', padding: '12px' }}>
                    {/* Window Presets */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '6px' }}>窗宽窗位预设</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {windowPresets.map(preset => (
                          <button
                            key={preset.name}
                            onClick={() => handleWindowPreset(preset.ww, preset.wl)}
                            style={{
                              padding: '4px 10px', borderRadius: '4px', border: '1px solid #d1d5db',
                              cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                              backgroundColor: windowWidth === preset.ww && windowLevel === preset.wl ? '#2563eb' : 'white',
                              color: windowWidth === preset.ww && windowLevel === preset.wl ? 'white' : '#475569',
                            }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* WW/WL Sliders */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>窗宽 (WW)</span>
                          <input
                            type="number"
                            value={windowWidth}
                            onChange={(e) => setWindowWidth(Number(e.target.value))}
                            style={{
                              width: '60px', padding: '2px 4px', fontSize: '11px',
                              border: '1px solid #475569', borderRadius: '4px',
                              backgroundColor: '#0f172a', color: 'white', textAlign: 'center',
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min="-1024"
                          max="3072"
                          value={windowWidth}
                          onChange={(e) => setWindowWidth(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#2563eb' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>窗位 (WL)</span>
                          <input
                            type="number"
                            value={windowLevel}
                            onChange={(e) => setWindowLevel(Number(e.target.value))}
                            style={{
                              width: '60px', padding: '2px 4px', fontSize: '11px',
                              border: '1px solid #475569', borderRadius: '4px',
                              backgroundColor: '#0f172a', color: 'white', textAlign: 'center',
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min="-1000"
                          max="1000"
                          value={windowLevel}
                          onChange={(e) => setWindowLevel(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#2563eb' }}
                        />
                      </div>
                    </div>

                    {/* Zoom & Tools Row */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Zoom Presets */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleZoomChange(zoom - 25)}
                          style={{
                            padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <ZoomOut size={14} />
                        </button>
                        {zoomPresets.map(z => (
                          <button
                            key={z.label}
                            onClick={() => handleZoomPreset(z.value)}
                            style={{
                              padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                              fontSize: '10px', fontWeight: 500,
                              backgroundColor: zoom === z.value || (z.value === 0 && zoom === 100) ? '#2563eb' : 'rgba(255,255,255,0.1)',
                              color: zoom === z.value || (z.value === 0 && zoom === 100) ? 'white' : '#94a3b8',
                            }}
                          >
                            {z.label}
                          </button>
                        ))}
                        <button
                          onClick={() => handleZoomChange(zoom + 25)}
                          style={{
                            padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <ZoomIn size={14} />
                        </button>
                      </div>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#475569' }} />

                      {/* Rotation */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 90, 180, 270].map(r => (
                          <button
                            key={r}
                            onClick={() => setRotation(r)}
                            style={{
                              padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                              fontSize: '10px', fontWeight: 500,
                              backgroundColor: rotation === r ? '#2563eb' : 'rgba(255,255,255,0.1)',
                              color: rotation === r ? 'white' : '#94a3b8',
                            }}
                          >
                            {r}°
                          </button>
                        ))}
                      </div>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#475569' }} />

                      {/* Flip */}
                      <button
                        onClick={() => setFlipH(!flipH)}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: flipH ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: flipH ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <FlipHorizontal size={14} />
                      </button>
                      <button
                        onClick={() => setFlipV(!flipV)}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: flipV ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: flipV ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <FlipVertical size={14} />
                      </button>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#475569' }} />

                      {/* Tools */}
                      <button
                        onClick={() => { setActiveTool('pan'); }}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: activeTool === 'pan' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: activeTool === 'pan' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Move size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTool('length')}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: activeTool === 'length' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: activeTool === 'length' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Ruler size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTool('angle')}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: activeTool === 'angle' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: activeTool === 'angle' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Activity size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTool('text')}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: activeTool === 'text' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: activeTool === 'text' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Type size={14} />
                      </button>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#475569' }} />

                      {/* Reset */}
                      <button
                        onClick={resetView}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: 'rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <RefreshCw size={14} />
                      </button>

                      <div style={{ flex: 1 }} />

                      {/* Play/Pause */}
                      {images.length > 1 && (
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          style={{
                            padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            backgroundColor: isPlaying ? '#2563eb' : 'rgba(255,255,255,0.1)',
                            color: isPlaying ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  height: '550px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', color: '#94a3b8',
                }}>
                  <Image size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>请从左侧选择检查</div>
                  <div style={{ fontSize: '13px', opacity: 0.7 }}>选择后可查看DICOM影像</div>
                </div>
              )}
            </div>
          </div>

          {/* ============== RIGHT COLUMN: Exam Info ============== */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
          }}>
            {/* Series List */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Layers size={14} />
                序列列表 ({seriesData.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {seriesData.map((series) => (
                  <div
                    key={series.id}
                    onClick={() => { setSelectedSeries(series); setCurrentImageIndex(0); }}
                    style={{
                      padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px',
                      cursor: 'pointer', backgroundColor: currentSeries?.id === series.id ? '#eff6ff' : 'white',
                      borderColor: currentSeries?.id === series.id ? '#2563eb' : '#e5e7eb',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '12px', color: '#1e293b' }}>
                        {series.seriesName}
                      </span>
                      <span style={{
                        padding: '1px 5px', borderRadius: '3px', fontSize: '9px',
                        backgroundColor: '#f1f5f9', color: '#64748b',
                      }}>
                        {series.images.length}层
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {series.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Info */}
            {selectedExam && patient && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Info size={14} />
                    检查信息
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>患者姓名</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{patient.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>检查名称</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedExam.examItemName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>检查日期</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedExam.scheduledDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>影像数量</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{images.length}层</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>检查号</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedExam.accessionNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>模态</span>
                      <span style={{
                        padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600,
                        color: 'white', backgroundColor: modalityColors[selectedExam.modality] || '#6b7280',
                      }}>
                        {selectedExam.modality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DICOM Tags */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Settings size={14} />
                    DICOM Tags
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>患者ID</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{patient.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>患者姓名</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{patient.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>检查号</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{selectedExam.accessionNumber}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>序列号</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{currentSeries?.seriesNumber || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>图像号</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{currentImageIndex + 1}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>窗宽</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{windowWidth}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                      <span style={{ color: '#64748b', minWidth: '60px' }}>窗位</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{windowLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Current View */}
                <div>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Activity size={14} />
                    当前视图
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>缩放</span>
                      <span>{zoom}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>旋转</span>
                      <span>{rotation}°</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>翻转</span>
                      <span>{flipH ? 'H ' : ''}{flipV ? 'V' : ''}{!flipH && !flipV ? '无' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>测量数</span>
                      <span>{measurements.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
