/**
 * AIStream 智能工作流 - 核心类型定义
 * @version v0.8.0
 * @description 对标联影uSONIQUE AIStream
 */

export type PlaneType =
  | 'abdominal_liver'      // 肝脏标准切面
  | 'abdominal_gallbladder' // 胆囊
  | 'abdominal_kidney'     // 肾脏
  | 'abdominal_spleen'     // 脾脏
  | 'abdominal_pancreas'   // 胰腺
  | 'cardiac_plax'         // 胸骨旁长轴
  | 'cardiac_psax'         // 胸骨旁短轴
  | 'cardiac_apical_4ch'   // 心尖四腔
  | 'cardiac_apical_2ch'   // 心尖二腔
  | 'obstetric_head'       // 胎头
  | 'obstetric_abdomen'    // 胎儿腹围
  | 'obstetric_femur'      // 胎儿股骨
  | 'obstetric_spine'      // 胎儿脊柱
  | 'thyroid_lobe'         // 甲状腺
  | 'breast_mass'          // 乳腺
  | 'lymph_node'           // 淋巴结
  | 'carotid'              // 颈动脉
  | 'vascular_upper'       // 上肢血管
  | 'vascular_lower'       // 下肢血管
  | 'unknown';

export type ExamType =
  | 'abdominal'        // 腹部
  | 'cardiac'          // 心脏
  | 'obstetric'        // 妇产
  | 'gynecologic'      // 妇科
  | 'vascular'         // 血管
  | 'superficial'      // 浅表器官
  | 'urologic'         // 泌尿
  | 'msk'              // 肌骨
  | 'pediatric'        // 儿科
  | 'emergency'        // 急诊
  | 'interventional'   // 介入
  | 'contrast';        // 造影

export interface PlaneDetection {
  plane: PlaneType;
  confidence: number;        // 0-1 置信度
  bbox: [number, number, number, number];  // x, y, w, h
  qualityScore: number;      // 1-5 星
  timestamp: number;
  imageHash: string;
}

export interface MeasurementRecommendation {
  organ: string;
  measurements: Array<{
    name: string;            // 测量项名称
    unit: string;            // 单位
    normalRange: [number, number];  // 正常值范围
    priority: number;        // 优先级 1-5
    description?: string;
  }>;
}

export interface QualityEvaluation {
  imageQuality: {
    score: number;           // 1-5
    issues: string[];        // 质量问题
    suggestions: string[];   // 改进建议
  };
  reportQuality: {
    completeness: number;    // 0-100
    consistency: number;     // 0-100
    standardization: number; // 0-100
    issues: string[];
  };
  overall: number;           // 综合评分 0-100
}

export interface AIStreamContext {
  examType: ExamType;
  patientInfo: {
    id: string;
    age?: number;
    gender?: 'M' | 'F';
    indication: string;       // 检查指征
  };
  currentPlane?: PlaneType;
  measurements: Array<{
    name: string;
    value: number;
    unit: string;
    timestamp: number;
  }>;
  history?: Array<{
    timestamp: number;
    plane: PlaneType;
    image: string;           // base64
  }>;
}

export interface AIStreamStep {
  stepId: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime?: number;
  endTime?: number;
  result?: any;
  error?: string;
}

export interface AIStreamReport {
  reportId: string;
  timestamp: number;
  context: AIStreamContext;
  planesDetected: PlaneDetection[];
  measurements: AIStreamContext['measurements'];
  quality: QualityEvaluation;
  generatedText?: string;     // LLM流式输出
  suggestions?: string[];     // 诊断建议
  warnings?: string[];        // 警示
}

export interface AIStreamConfig {
  enablePlaneRecognition: boolean;
  enableAutoMeasure: boolean;
  enableLLMGeneration: boolean;
  enableQualityEval: boolean;
  llmModel: 'minimax/MiniMax-M3' | 'minimax/MiniMax-M2.7';
  confidenceThreshold: number;   // 切面识别置信度阈值
  qualityThreshold: number;      // 质量评价阈值
}
