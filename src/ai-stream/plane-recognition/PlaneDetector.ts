/**
 * 切面识别引擎 - 核心实现
 * @version v0.8.0
 * @description 基于TensorFlow.js的超声切面识别
 */

import { PlaneType, PlaneDetection, ExamType } from '../types';

/**
 * 切面特征库 - 20+ 标准切面
 * 对标联影 uSONIQUE、开立 SonoAssistant
 */
export const PLANE_LIBRARY: Record<PlaneType, {
  name: string;
  nameEn: string;
  examType: ExamType;
  description: string;
  features: string[];
  minQuality: number;
  // 训练样本特征向量（占位，实际应由训练得出）
  featureVector: number[];
}> = {
  // ===== 腹部 =====
  abdominal_liver: {
    name: '肝脏标准切面',
    nameEn: 'Liver Standard Plane',
    examType: 'abdominal',
    description: '显示肝左叶/右叶/门静脉的标准切面',
    features: ['楔形低回声区', '门静脉高回声管状结构', '边界清晰'],
    minQuality: 3.5,
    featureVector: [0.85, 0.72, 0.68, 0.45, 0.32]
  },
  abdominal_gallbladder: {
    name: '胆囊切面',
    nameEn: 'Gallbladder Plane',
    examType: 'abdominal',
    description: '胆囊长轴/短轴',
    features: ['梨形无回声区', '壁薄光滑', '后方回声增强'],
    minQuality: 3.5,
    featureVector: [0.78, 0.65, 0.55, 0.30, 0.25]
  },
  abdominal_kidney: {
    name: '肾脏切面',
    nameEn: 'Kidney Plane',
    examType: 'abdominal',
    description: '肾脏长轴/短轴',
    features: ['蚕豆形', '中央高回声集合系统', '实质低回声'],
    minQuality: 3.5,
    featureVector: [0.82, 0.70, 0.62, 0.40, 0.28]
  },
  abdominal_spleen: {
    name: '脾脏切面',
    nameEn: 'Spleen Plane',
    examType: 'abdominal',
    description: '脾脏长轴/短轴',
    features: ['半月形', '均匀低回声', '内可见血管'],
    minQuality: 3.5,
    featureVector: [0.75, 0.62, 0.58, 0.35, 0.22]
  },
  abdominal_pancreas: {
    name: '胰腺切面',
    nameEn: 'Pancreas Plane',
    examType: 'abdominal',
    description: '胰腺长轴',
    features: ['条带状', '回声接近肝脏', '脾静脉为界'],
    minQuality: 4.0,
    featureVector: [0.70, 0.60, 0.55, 0.32, 0.20]
  },

  // ===== 心脏 =====
  cardiac_plax: {
    name: '胸骨旁左室长轴',
    nameEn: 'Parasternal Long Axis',
    examType: 'cardiac',
    description: '显示左室/二尖瓣/主动脉',
    features: ['左室长轴', '二尖瓣开放', '主动脉根部'],
    minQuality: 4.0,
    featureVector: [0.88, 0.78, 0.72, 0.50, 0.35]
  },
  cardiac_psax: {
    name: '胸骨旁左室短轴',
    nameEn: 'Parasternal Short Axis',
    examType: 'cardiac',
    description: '二尖瓣/乳头肌/心尖水平短轴',
    features: ['左室短轴圆形', '室壁对称', '乳头肌可见'],
    minQuality: 4.0,
    featureVector: [0.86, 0.76, 0.70, 0.48, 0.32]
  },
  cardiac_apical_4ch: {
    name: '心尖四腔心',
    nameEn: 'Apical 4-Chamber',
    examType: 'cardiac',
    description: '左右心房/左右心室',
    features: ['十字交叉', '四个心腔', '二尖瓣/三尖瓣'],
    minQuality: 4.5,
    featureVector: [0.90, 0.80, 0.74, 0.52, 0.38]
  },
  cardiac_apical_2ch: {
    name: '心尖二腔心',
    nameEn: 'Apical 2-Chamber',
    examType: 'cardiac',
    description: '左房/左室',
    features: ['左心长轴', '二尖瓣', '左心耳'],
    minQuality: 4.0,
    featureVector: [0.84, 0.74, 0.68, 0.46, 0.30]
  },

  // ===== 妇产 =====
  obstetric_head: {
    name: '胎头标准切面',
    nameEn: 'Fetal Head BPD/HC',
    examType: 'obstetric',
    description: '丘脑/透明隔腔/侧脑室',
    features: ['椭圆形颅骨光环', '中线回声', '丘脑'],
    minQuality: 4.0,
    featureVector: [0.87, 0.75, 0.69, 0.47, 0.33]
  },
  obstetric_abdomen: {
    name: '胎儿腹围切面',
    nameEn: 'Fetal Abdomen AC',
    examType: 'obstetric',
    description: '胃泡/脐静脉/脊柱',
    features: ['圆形', '胃泡无回声', '脐静脉'],
    minQuality: 4.0,
    featureVector: [0.83, 0.72, 0.65, 0.43, 0.29]
  },
  obstetric_femur: {
    name: '胎儿股骨长',
    nameEn: 'Fetal Femur FL',
    examType: 'obstetric',
    description: '股骨干长轴',
    features: ['线性强回声', '两端钝圆'],
    minQuality: 3.5,
    featureVector: [0.79, 0.68, 0.60, 0.38, 0.24]
  },
  obstetric_spine: {
    name: '胎儿脊柱',
    nameEn: 'Fetal Spine',
    examType: 'obstetric',
    description: '脊柱长轴/横切',
    features: ['串珠样', '两条平行强回声'],
    minQuality: 3.5,
    featureVector: [0.76, 0.65, 0.58, 0.36, 0.23]
  },

  // ===== 浅表器官 =====
  thyroid_lobe: {
    name: '甲状腺',
    nameEn: 'Thyroid Lobe',
    examType: 'superficial',
    description: '甲状腺长轴/短轴',
    features: ['蝶形/椭圆', '均匀高回声', '气管/颈动脉为界'],
    minQuality: 4.0,
    featureVector: [0.81, 0.69, 0.63, 0.41, 0.27]
  },
  breast_mass: {
    name: '乳腺',
    nameEn: 'Breast',
    examType: 'superficial',
    description: '乳腺长轴/病灶',
    features: ['腺体层', '脂肪层', 'Cooper韧带'],
    minQuality: 3.5,
    featureVector: [0.74, 0.63, 0.57, 0.34, 0.21]
  },
  lymph_node: {
    name: '淋巴结',
    nameEn: 'Lymph Node',
    examType: 'superficial',
    description: '淋巴结长轴/短轴',
    features: ['椭圆形', '淋巴门', '皮质'],
    minQuality: 3.5,
    featureVector: [0.72, 0.60, 0.55, 0.32, 0.19]
  },

  // ===== 血管 =====
  carotid: {
    name: '颈动脉',
    nameEn: 'Carotid Artery',
    examType: 'vascular',
    description: '颈总/颈内/颈外动脉',
    features: ['管状无回声', '动脉搏动', '可测血流'],
    minQuality: 4.0,
    featureVector: [0.85, 0.73, 0.67, 0.45, 0.31]
  },
  vascular_upper: {
    name: '上肢血管',
    nameEn: 'Upper Extremity Vessels',
    examType: 'vascular',
    description: '锁骨下/腋/肱/桡/尺动脉',
    features: ['管状', '加压可压瘪', '彩色血流'],
    minQuality: 3.5,
    featureVector: [0.77, 0.66, 0.59, 0.37, 0.25]
  },
  vascular_lower: {
    name: '下肢血管',
    nameEn: 'Lower Extremity Vessels',
    examType: 'vascular',
    description: '股/腘/胫/腓动脉',
    features: ['管状', '静脉瓣', '血流频谱'],
    minQuality: 3.5,
    featureVector: [0.78, 0.67, 0.60, 0.38, 0.26]
  },

  // ===== 未知 =====
  unknown: {
    name: '未知切面',
    nameEn: 'Unknown Plane',
    examType: 'emergency',
    description: '无法识别',
    features: [],
    minQuality: 0,
    featureVector: [0, 0, 0, 0, 0]
  }
};

/**
 * 切面识别器
 */
export class PlaneDetector {
  private model: any = null;
  private isLoaded = false;
  private confidenceThreshold: number;

  constructor(confidenceThreshold: number = 0.7) {
    this.confidenceThreshold = confidenceThreshold;
  }

  /**
   * 加载模型（占位实现，实际应加载TF.js模型）
   */
  async loadModel(modelPath?: string): Promise<void> {
    // TODO: 接入真实的TensorFlow.js模型
    // const modelUrl = modelPath || '/models/plane-classifier/model.json';
    // this.model = await tf.loadGraphModel(modelUrl);
    this.isLoaded = true;
    console.log('[PlaneDetector] 模型加载完成（占位）');
  }

  /**
   * 识别切面
   */
  async detect(imageData: string, examType?: ExamType): Promise<PlaneDetection[]> {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    // TODO: 真实实现
    // const tensor = await this.preprocessImage(imageData);
    // const predictions = await this.model.predict(tensor);
    // const topK = await this.getTopK(predictions, 3);

    // 占位实现：基于规则的模拟
    const candidates = this.getCandidatesByExamType(examType);
    return candidates.map((plane, i) => ({
      plane,
      confidence: 0.92 - i * 0.15,
      bbox: [100 + i * 20, 80 + i * 30, 400 - i * 30, 300 - i * 20] as [number, number, number, number],
      qualityScore: 4.5 - i * 0.5,
      timestamp: Date.now(),
      imageHash: this.hashImage(imageData)
    })).filter(d => d.confidence >= this.confidenceThreshold);
  }

  /**
   * 评分切面质量
   */
  scoreQuality(plane: PlaneType, features: Record<string, number>): number {
    const meta = PLANE_LIBRARY[plane];
    if (!meta) return 0;

    let score = 0;
    let count = 0;
    for (const f of meta.features) {
      if (features[f] !== undefined) {
        score += features[f];
        count++;
      }
    }
    return count > 0 ? score / count : 0;
  }

  /**
   * 扫查引导建议
   */
  getGuidance(plane: PlaneType): string[] {
    const meta = PLANE_LIBRARY[plane];
    if (!meta) return [];

    const guidanceMap: Partial<Record<PlaneType, string[]>> = {
      abdominal_liver: [
        '探头置于右肋间',
        '嘱患者深吸气后屏气',
        '适当增加探头压力'
      ],
      cardiac_plax: [
        '探头置于胸骨左缘第3-4肋间',
        '探头方向与右肩-左肋连线平行',
        '左侧卧位'
      ],
      cardiac_apical_4ch: [
        '探头置于心尖搏动最强点',
        '探头方向指向右肩',
        '左侧卧位'
      ],
      obstetric_head: [
        '探头置于胎头位置',
        '获取丘脑平面',
        '测量BPD/HC'
      ]
    };
    return guidanceMap[plane] || ['请按标准切面要求操作'];
  }

  /**
   * 列出所有支持的切面
   */
  listPlanes(): Array<{ type: PlaneType; name: string; examType: ExamType }> {
    return Object.entries(PLANE_LIBRARY)
      .filter(([k]) => k !== 'unknown')
      .map(([type, meta]) => ({
        type: type as PlaneType,
        name: meta.name,
        examType: meta.examType
      }));
  }

  /**
   * 按检查类型获取候选切面
   */
  private getCandidatesByExamType(examType?: ExamType): PlaneType[] {
    if (!examType) {
      return Object.keys(PLANE_LIBRARY).filter(k => k !== 'unknown') as PlaneType[];
    }
    return Object.entries(PLANE_LIBRARY)
      .filter(([_, meta]) => meta.examType === examType)
      .map(([type]) => type as PlaneType);
  }

  private hashImage(data: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(data.length, 1000); i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }
}

export default PlaneDetector;
