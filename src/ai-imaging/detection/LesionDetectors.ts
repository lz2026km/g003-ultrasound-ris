/**
 * 病灶检测器集合
 * @version v0.8.0
 * @description 对标联影/数坤/推想
 */

import { DetectionResult, LesionType, LesionMalignancy } from '../types';

/**
 * 甲状腺结节检测器
 */
export class ThyroidDetector {
  async detect(imageData: string): Promise<DetectionResult[]> {
    // TODO: 实际应使用训练好的模型
    // 占位实现
    return [
      {
        type: 'thyroid_nodule',
        confidence: 0.93,
        bbox: { x: 150, y: 100, width: 30, height: 25 },
        malignancy: 'benign',
        size: {
          diameter1: 8,
          diameter2: 6,
          diameter3: 5
        },
        tirads: '3',
        description: '甲状腺右叶中下部结节，边界清，内部回声均匀，CDFI未见明显血流信号。',
        measurements: [
          { name: '结节长径', value: 8, unit: 'mm' },
          { name: '结节宽径', value: 6, unit: 'mm' }
        ]
      }
    ];
  }

  /**
   * TI-RADS 分级
   */
  classifyTIRADS(features: {
    composition: 'solid' | 'mixed' | 'cystic';
    echogenicity: 'hyperechoic' | 'isoechoic' | 'hypoechoic' | 'markedly_hypoechoic';
    shape: 'wider-than-tall' | 'taller-than-wide';
    margins: 'smooth' | 'lobulated' | 'irregular' | 'extrathyroidal';
    calcifications: 'none' | 'macro' | 'micro' | 'comet-tail';
  }): { grade: string; score: number; risk: string } {
    let score = 0;

    // 成分
    if (features.composition === 'solid') score += 2;
    else if (features.composition === 'mixed') score += 1;

    // 回声
    if (features.echogenicity === 'markedly_hypoechoic') score += 3;
    else if (features.echogenicity === 'hypoechoic') score += 2;

    // 形态
    if (features.shape === 'taller-than-wide') score += 3;

    // 边缘
    if (features.margins === 'irregular') score += 2;
    else if (features.margins === 'lobulated') score += 1;

    // 钙化
    if (features.calcifications === 'micro') score += 3;
    else if (features.calcifications === 'macro') score += 1;

    let grade: string;
    let risk: string;
    if (score === 0) { grade = '1'; risk = '良性'; }
    else if (score <= 2) { grade = '2'; risk = '不怀疑恶性'; }
    else if (score <= 3) { grade = '3'; risk = '低度怀疑恶性（<5%）'; }
    else if (score <= 6) { grade = '4'; risk = '中度怀疑恶性（5-20%）'; }
    else if (score <= 9) { grade = '5'; risk = '高度怀疑恶性（>20%）'; }
    else { grade = '6'; risk = '已证实恶性'; }

    return { grade, score, risk };
  }
}

/**
 * 乳腺肿块检测器
 */
export class BreastDetector {
  async detect(imageData: string): Promise<DetectionResult[]> {
    return [
      {
        type: 'breast_mass',
        confidence: 0.89,
        bbox: { x: 200, y: 150, width: 40, height: 35 },
        malignancy: 'suspicious',
        size: {
          diameter1: 12,
          diameter2: 10
        },
        biRads: '4A',
        description: '乳腺外上象限低回声团块，形态欠规则，边界欠清，建议活检。',
        measurements: [
          { name: '肿块长径', value: 12, unit: 'mm' },
          { name: '肿块宽径', value: 10, unit: 'mm' }
        ]
      }
    ];
  }

  /**
   * BI-RADS 分级
   */
  classifyBIRADS(features: {
    shape: 'round' | 'oval' | 'irregular';
    margin: 'circumscribed' | 'indistinct' | 'angular' | 'microlobulated' | 'spiculated';
    echogenicity: 'anechoic' | 'hyperechoic' | 'complex' | 'hypoechoic' | 'isoechoic';
    posteriorFeatures: 'none' | 'enhancement' | 'shadowing' | 'mixed';
    calcifications: 'none' | 'benign' | 'suspicious';
  }): { category: string; recommendation: string } {
    // 简化版BI-RADS
    if (features.margin === 'spiculated' || features.calcifications === 'suspicious') {
      return { category: '4C-5', recommendation: '建议活检' };
    }
    if (features.margin === 'angular' || features.margin === 'microlobulated') {
      return { category: '4A-4B', recommendation: '建议短期随访或活检' };
    }
    if (features.shape === 'irregular') {
      return { category: '4A', recommendation: '建议活检' };
    }
    if (features.margin === 'indistinct') {
      return { category: '3', recommendation: '建议短期随访' };
    }
    if (features.shape === 'round' || features.shape === 'oval') {
      return { category: '2-3', recommendation: '良性，定期随访' };
    }
    return { category: '0', recommendation: '需进一步检查' };
  }
}

/**
 * 颈动脉斑块检测器
 */
export class CarotidDetector {
  async detect(imageData: string): Promise<DetectionResult[]> {
    return [
      {
        type: 'carotid_plaque',
        confidence: 0.91,
        bbox: { x: 180, y: 200, width: 50, height: 20 },
        size: {
          diameter1: 3.5,
          diameter2: 1.8
        },
        description: '右侧颈总动脉后壁扁平斑块，IMT增厚至1.2mm。',
        measurements: [
          { name: 'IMT', value: 1.2, unit: 'mm' },
          { name: '斑块厚度', value: 3.5, unit: 'mm' }
        ]
      }
    ];
  }

  /**
   * 颈动脉狭窄率评估
   */
  evaluateStenosis(diameterStenosis: number): {
    grade: string;
    risk: string;
    recommendation: string;
  } {
    if (diameterStenosis < 30) {
      return { grade: '轻度', risk: '低', recommendation: '每年复查' };
    } else if (diameterStenosis < 50) {
      return { grade: '轻-中度', risk: '低-中', recommendation: '每6月复查' };
    } else if (diameterStenosis < 70) {
      return { grade: '中度', risk: '中', recommendation: '建议药物+密切随访' };
    } else if (diameterStenosis < 99) {
      return { grade: '重度', risk: '高', recommendation: '建议介入治疗' };
    } else {
      return { grade: '闭塞', risk: '极高', recommendation: '紧急处理' };
    }
  }
}

/**
 * 肝占位检测器
 */
export class LiverDetector {
  async detect(imageData: string): Promise<DetectionResult[]> {
    return [
      {
        type: 'liver_cyst',
        confidence: 0.95,
        bbox: { x: 220, y: 180, width: 35, height: 30 },
        malignancy: 'benign',
        size: { diameter1: 15 },
        description: '肝右叶无回声区，边界清，后方回声增强，提示肝囊肿。'
      }
    ];
  }
}
