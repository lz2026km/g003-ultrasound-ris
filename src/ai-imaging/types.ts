/**
 * 影像AI - 核心类型
 * @version v0.8.0
 * @description 对标联影智能分割、数坤数字医生、推想InferRead
 */

export type LesionType =
  | 'thyroid_nodule'         // 甲状腺结节
  | 'thyroid_cyst'           // 甲状腺囊肿
  | 'breast_mass'            // 乳腺肿块
  | 'breast_cyst'            // 乳腺囊肿
  | 'carotid_plaque'         // 颈动脉斑块
  | 'liver_lesion'           // 肝占位
  | 'liver_cyst'             // 肝囊肿
  | 'kidney_lesion'          // 肾占位
  | 'kidney_cyst'            // 肾囊肿
  | 'fetal_head'             // 胎头
  | 'fetal_abdomen'          // 胎儿腹围
  | 'fetal_femur'            // 胎儿股骨
  | 'unknown';

export type LesionMalignancy = 'benign' | 'suspicious' | 'malignant' | 'unknown';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  type: LesionType;
  confidence: number;         // 0-1
  bbox: BoundingBox;
  malignancy?: LesionMalignancy;
  size?: {
    diameter1: number;        // mm
    diameter2?: number;
    diameter3?: number;
  };
  biRads?: string;            // BI-RADS 1-6
  tirads?: string;            // TI-RADS 1-6
  measurements?: Array<{ name: string; value: number; unit: string }>;
  description?: string;
}

export interface SegmentationMask {
  type: LesionType;
  mask: string;               // base64 mask image
  boundingBox: BoundingBox;
  area: number;               // mm²
  volume?: number;            // mm³
  confidence: number;
}

export interface DICOMSEGInfo {
  studyUID: string;
  seriesUID: string;
  sopInstanceUID: string;
  segments: Array<{
    segmentNumber: number;
    segmentLabel: string;
    algorithmType: string;
  }>;
  referencedImage: string;
}
