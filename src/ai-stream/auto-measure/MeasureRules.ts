/**
 * 测量规则引擎 - 按器官/检查类型组织
 * @version v0.8.0
 * @description 对标联影/开立/祥生
 */

import { ExamType, PlaneType } from '../types';

export interface MeasurementRule {
  name: string;              // 测量项名称
  nameEn: string;            // 英文名
  unit: string;              // 单位
  normalRange: [number, number];  // 正常值范围 [min, max]
  abnormalRange: [number, number]; // 异常提示阈值
  priority: 1 | 2 | 3 | 4 | 5;  // 优先级
  category: 'size' | 'function' | 'flow' | 'ratio' | 'volume';
  description?: string;
  formula?: string;          // 计算公式（如EF）
  applicablePlanes?: PlaneType[];  // 适用切面
  applicableExams?: ExamType[];     // 适用检查
  ageAdjusted?: boolean;     // 是否需要年龄调整
  genderAdjusted?: boolean;  // 是否需要性别调整
}

/**
 * 腹部测量规则
 */
export const ABDOMINAL_MEASURES: Record<string, MeasurementRule[]> = {
  liver: [
    {
      name: '肝脏长径',
      nameEn: 'Liver LENGTH',
      unit: 'mm',
      normalRange: [100, 140],
      abnormalRange: [80, 160],
      priority: 5,
      category: 'size',
      description: '右肋缘下斜切测量',
      applicableExams: ['abdominal']
    },
    {
      name: '肝脏厚度',
      nameEn: 'Liver THICKNESS',
      unit: 'mm',
      normalRange: [80, 120],
      abnormalRange: [60, 140],
      priority: 4,
      category: 'size',
      description: '右腋中线测量',
      applicableExams: ['abdominal']
    },
    {
      name: '门静脉内径',
      nameEn: 'Portal Vein DIAMETER',
      unit: 'mm',
      normalRange: [8, 13],
      abnormalRange: [6, 15],
      priority: 3,
      category: 'size',
      description: '门脉高压时增宽',
      applicableExams: ['abdominal']
    }
  ],
  gallbladder: [
    {
      name: '胆囊长径',
      nameEn: 'GB LENGTH',
      unit: 'mm',
      normalRange: [40, 90],
      abnormalRange: [30, 100],
      priority: 4,
      category: 'size',
      applicableExams: ['abdominal']
    },
    {
      name: '胆囊壁厚度',
      nameEn: 'GB WALL',
      unit: 'mm',
      normalRange: [1, 3],
      abnormalRange: [1, 5],
      priority: 3,
      category: 'size',
      description: '增厚提示胆囊炎',
      applicableExams: ['abdominal']
    }
  ],
  kidney: [
    {
      name: '肾脏长径',
      nameEn: 'Kidney LENGTH',
      unit: 'mm',
      normalRange: [90, 120],
      abnormalRange: [70, 130],
      priority: 5,
      category: 'size',
      applicableExams: ['abdominal', 'urologic'],
      ageAdjusted: true
    },
    {
      name: '肾实质厚度',
      nameEn: 'Renal Cortex',
      unit: 'mm',
      normalRange: [10, 18],
      abnormalRange: [7, 22],
      priority: 4,
      category: 'size',
      description: '变薄提示慢性肾病',
      applicableExams: ['abdominal', 'urologic']
    }
  ]
};

/**
 * 心脏测量规则
 */
export const CARDIAC_MEASURES: Record<string, MeasurementRule[]> = {
  leftVentricle: [
    {
      name: '左室舒张末径(LVEDd)',
      nameEn: 'LVIDd',
      unit: 'mm',
      normalRange: [40, 55],
      abnormalRange: [35, 60],
      priority: 5,
      category: 'size',
      applicableExams: ['cardiac'],
      genderAdjusted: true
    },
    {
      name: '左室收缩末径(LVEDs)',
      nameEn: 'LVIDs',
      unit: 'mm',
      normalRange: [25, 40],
      abnormalRange: [20, 45],
      priority: 5,
      category: 'size',
      applicableExams: ['cardiac'],
      genderAdjusted: true
    },
    {
      name: '室间隔厚度(IVSd)',
      nameEn: 'IVSd',
      unit: 'mm',
      normalRange: [8, 11],
      abnormalRange: [6, 13],
      priority: 4,
      category: 'size',
      applicableExams: ['cardiac']
    },
    {
      name: '左室后壁厚度(LVPWd)',
      nameEn: 'LVPWd',
      unit: 'mm',
      normalRange: [8, 11],
      abnormalRange: [6, 13],
      priority: 4,
      category: 'size',
      applicableExams: ['cardiac']
    }
  ],
  function: [
    {
      name: '射血分数(EF)',
      nameEn: 'EF',
      unit: '%',
      normalRange: [55, 75],
      abnormalRange: [50, 80],
      priority: 5,
      category: 'function',
      description: 'Teichholz法或Simpson法',
      formula: 'EF = (LVEDd³ - LVEDs³) / LVEDd³ × 100',
      applicableExams: ['cardiac']
    },
    {
      name: '左室缩短分数(FS)',
      nameEn: 'FS',
      unit: '%',
      normalRange: [25, 45],
      abnormalRange: [20, 50],
      priority: 4,
      category: 'function',
      formula: 'FS = (LVEDd - LVEDs) / LVEDd × 100',
      applicableExams: ['cardiac']
    },
    {
      name: '二尖瓣口血流E峰',
      nameEn: 'MV E Peak',
      unit: 'cm/s',
      normalRange: [50, 100],
      abnormalRange: [40, 120],
      priority: 3,
      category: 'flow',
      applicableExams: ['cardiac']
    },
    {
      name: '二尖瓣口血流A峰',
      nameEn: 'MV A Peak',
      unit: 'cm/s',
      normalRange: [40, 80],
      abnormalRange: [30, 90],
      priority: 3,
      category: 'flow',
      applicableExams: ['cardiac']
    }
  ]
};

/**
 * 妇产测量规则
 */
export const OBSTETRIC_MEASURES: Record<string, MeasurementRule[]> = {
  fetus: [
    {
      name: '双顶径(BPD)',
      nameEn: 'BPD',
      unit: 'mm',
      normalRange: [40, 100],
      abnormalRange: [30, 110],
      priority: 5,
      category: 'size',
      description: '胎头左右径',
      applicableExams: ['obstetric'],
      ageAdjusted: true  // 孕周调整
    },
    {
      name: '头围(HC)',
      nameEn: 'HC',
      unit: 'mm',
      normalRange: [120, 350],
      abnormalRange: [100, 380],
      priority: 5,
      category: 'size',
      applicableExams: ['obstetric'],
      ageAdjusted: true
    },
    {
      name: '腹围(AC)',
      nameEn: 'AC',
      unit: 'mm',
      normalRange: [110, 360],
      abnormalRange: [90, 400],
      priority: 5,
      category: 'size',
      applicableExams: ['obstetric'],
      ageAdjusted: true
    },
    {
      name: '股骨长(FL)',
      nameEn: 'FL',
      unit: 'mm',
      normalRange: [20, 75],
      abnormalRange: [15, 85],
      priority: 5,
      category: 'size',
      applicableExams: ['obstetric'],
      ageAdjusted: true
    },
    {
      name: '肱骨长(HL)',
      nameEn: 'HL',
      unit: 'mm',
      normalRange: [18, 65],
      abnormalRange: [15, 75],
      priority: 4,
      category: 'size',
      applicableExams: ['obstetric'],
      ageAdjusted: true
    },
    {
      name: '小脑横径(TCD)',
      nameEn: 'TCD',
      unit: 'mm',
      normalRange: [15, 35],
      abnormalRange: [10, 40],
      priority: 3,
      category: 'size',
      applicableExams: ['obstetric'],
      ageAdjusted: true
    }
  ]
};

/**
 * 浅表器官测量规则
 */
export const SUPERFICIAL_MEASURES: Record<string, MeasurementRule[]> = {
  thyroid: [
    {
      name: '甲状腺左叶长径',
      nameEn: 'Thyroid L-LENGTH',
      unit: 'mm',
      normalRange: [40, 60],
      abnormalRange: [30, 70],
      priority: 4,
      category: 'size',
      applicableExams: ['superficial']
    },
    {
      name: '甲状腺左叶厚径',
      nameEn: 'Thyroid L-THICKNESS',
      unit: 'mm',
      normalRange: [10, 20],
      abnormalRange: [8, 25],
      priority: 3,
      category: 'size',
      applicableExams: ['superficial']
    },
    {
      name: '甲状腺右叶长径',
      nameEn: 'Thyroid R-LENGTH',
      unit: 'mm',
      normalRange: [40, 60],
      abnormalRange: [30, 70],
      priority: 4,
      category: 'size',
      applicableExams: ['superficial']
    },
    {
      name: '甲状腺右叶厚径',
      nameEn: 'Thyroid R-THICKNESS',
      unit: 'mm',
      normalRange: [10, 20],
      abnormalRange: [8, 25],
      priority: 3,
      category: 'size',
      applicableExams: ['superficial']
    },
    {
      name: '峡部厚度',
      nameEn: 'Isthmus',
      unit: 'mm',
      normalRange: [2, 6],
      abnormalRange: [1, 8],
      priority: 3,
      category: 'size',
      applicableExams: ['superficial']
    }
  ]
};

/**
 * 血管测量规则
 */
export const VASCULAR_MEASURES: Record<string, MeasurementRule[]> = {
  carotid: [
    {
      name: '颈总动脉内径',
      nameEn: 'CCA Diameter',
      unit: 'mm',
      normalRange: [6, 8],
      abnormalRange: [5, 10],
      priority: 4,
      category: 'size',
      applicableExams: ['vascular']
    },
    {
      name: '颈内动脉内径',
      nameEn: 'ICA Diameter',
      unit: 'mm',
      normalRange: [4, 6],
      abnormalRange: [3, 7],
      priority: 4,
      category: 'size',
      applicableExams: ['vascular']
    },
    {
      name: '颈总动脉IMT',
      nameEn: 'CCA IMT',
      unit: 'mm',
      normalRange: [0.5, 1.0],
      abnormalRange: [0.3, 1.5],
      priority: 5,
      category: 'size',
      description: '内中膜厚度，>1.0mm提示动脉硬化',
      applicableExams: ['vascular']
    },
    {
      name: '颈总动脉PSV',
      nameEn: 'CCA PSV',
      unit: 'cm/s',
      normalRange: [50, 100],
      abnormalRange: [40, 130],
      priority: 3,
      category: 'flow',
      applicableExams: ['vascular']
    }
  ]
};

/**
 * 测量规则库 - 统一入口
 */
export const MEASURE_RULES: Record<ExamType, Record<string, MeasurementRule[]>> = {
  abdominal: ABDOMINAL_MEASURES,
  cardiac: CARDIAC_MEASURES,
  obstetric: OBSTETRIC_MEASURES,
  gynecologic: OBSTETRIC_MEASURES,  // 妇科部分规则同
  superficial: SUPERFICIAL_MEASURES,
  vascular: VASCULAR_MEASURES,
  urologic: ABDOMINAL_MEASURES,  // 泌尿部分规则同
  msk: {},
  pediatric: {},
  emergency: {},
  interventional: {},
  contrast: {}
};
