/**
 * 报告模板库
 * @version v0.8.0
 * @description 按检查类型组织结构化报告模板
 */

import { ExamType, PlaneType } from '../types';

export interface ReportTemplate {
  id: string;
  name: string;
  examType: ExamType;
  applicablePlanes?: PlaneType[];
  sections: ReportSection[];
  description: string;
}

export interface ReportSection {
  type: 'header' | 'findings' | 'measurements' | 'impression' | 'suggestion' | 'warning' | 'signature';
  title: string;
  template: string;          // 模板字符串（支持 {{}} 占位）
  required: boolean;
  fields?: string[];          // 模板使用的字段
}

/**
 * 腹部超声报告模板
 */
export const ABDOMINAL_TEMPLATES: ReportTemplate[] = [
  {
    id: 'abdomen_liver',
    name: '腹部肝脏超声报告',
    examType: 'abdominal',
    applicablePlanes: ['abdominal_liver'],
    description: '肝脏标准切面报告',
    sections: [
      {
        type: 'header',
        title: '检查信息',
        template: '超声检查：腹部 / 肝脏\n检查日期：{{date}}\n患者：{{patientName}} ({{patientId}})',
        required: true,
        fields: ['date', 'patientName', 'patientId']
      },
      {
        type: 'findings',
        title: '声像图表现',
        template: '肝脏形态正常，包膜光滑，实质回声均匀，血管纹理清晰。肝脏大小测值：长径 {{liverLength}}mm（正常范围 100-140mm），厚度 {{liverThickness}}mm（正常范围 80-120mm）。门静脉内径 {{pvDiameter}}mm（正常范围 8-13mm）。',
        required: true,
        fields: ['liverLength', 'liverThickness', 'pvDiameter']
      },
      {
        type: 'measurements',
        title: '测值',
        template: '肝脏长径：{{liverLength}}mm\n肝脏厚度：{{liverThickness}}mm\n门静脉内径：{{pvDiameter}}mm',
        required: true,
        fields: ['liverLength', 'liverThickness', 'pvDiameter']
      },
      {
        type: 'impression',
        title: '超声提示',
        template: '肝脏声像图未见明显异常。',
        required: true
      },
      {
        type: 'suggestion',
        title: '建议',
        template: '建议定期超声复查。',
        required: false
      },
      {
        type: 'signature',
        title: '签名',
        template: '检查医师：{{doctorName}}\n报告时间：{{date}}',
        required: true,
        fields: ['doctorName', 'date']
      }
    ]
  }
];

/**
 * 心脏超声报告模板
 */
export const CARDIAC_TEMPLATES: ReportTemplate[] = [
  {
    id: 'cardiac_plax',
    name: '心脏超声报告（胸骨旁长轴）',
    examType: 'cardiac',
    applicablePlanes: ['cardiac_plax', 'cardiac_psax', 'cardiac_apical_4ch', 'cardiac_apical_2ch'],
    description: '标准心脏切面报告',
    sections: [
      {
        type: 'header',
        title: '检查信息',
        template: '超声检查：心脏\n检查日期：{{date}}\n患者：{{patientName}} ({{patientId}})',
        required: true
      },
      {
        type: 'findings',
        title: '声像图表现',
        template: '左心房、左心室大小正常。左室壁厚度正常，运动协调。瓣膜结构未见明显异常，开放关闭良好。主动脉根部内径正常。',
        required: true
      },
      {
        type: 'measurements',
        title: '心功能测值',
        template: '左室舒张末径(LVEDd)：{{LVEDd}}mm\n左室收缩末径(LVEDs)：{{LVEDs}}mm\n室间隔厚度(IVSd)：{{IVSd}}mm\n左室后壁(LVPWd)：{{LVPWd}}mm\n射血分数(EF)：{{EF}}%（Teichholz法）\n左室缩短分数(FS)：{{FS}}%',
        required: true,
        fields: ['LVEDd', 'LVEDs', 'IVSd', 'LVPWd', 'EF', 'FS']
      },
      {
        type: 'impression',
        title: '超声提示',
        template: '心脏结构及功能未见明显异常。',
        required: true
      },
      {
        type: 'warning',
        title: '警示',
        template: '本结果仅供临床参考，请结合症状、体征及其他检查综合判断。',
        required: false
      },
      {
        type: 'signature',
        title: '签名',
        template: '检查医师：{{doctorName}}\n报告时间：{{date}}',
        required: true
      }
    ]
  }
];

/**
 * 妇产超声报告模板
 */
export const OBSTETRIC_TEMPLATES: ReportTemplate[] = [
  {
    id: 'obstetric_fetal',
    name: '产科胎儿超声报告',
    examType: 'obstetric',
    applicablePlanes: ['obstetric_head', 'obstetric_abdomen', 'obstetric_femur', 'obstetric_spine'],
    description: '中晚孕胎儿系统超声检查',
    sections: [
      {
        type: 'header',
        title: '检查信息',
        template: '超声检查：产科 / 中晚孕系统筛查\n检查日期：{{date}}\n患者：{{patientName}} ({{patientId}})\n孕周：{{gestationalWeeks}}周',
        required: true,
        fields: ['date', 'patientName', 'patientId', 'gestationalWeeks']
      },
      {
        type: 'findings',
        title: '声像图所见',
        template: '胎儿头颅：颅骨光环完整，中线居中，侧脑室未见增宽。\n胎儿脊柱：双条平行强回声，排列整齐。\n胎儿四肢：四肢长骨可见，对称。\n胎儿腹围：腹壁完整，胃泡可见，肾脏双侧可见。',
        required: true
      },
      {
        type: 'measurements',
        title: '生物测值',
        template: '双顶径(BPD)：{{BPD}}mm\n头围(HC)：{{HC}}mm\n腹围(AC)：{{AC}}mm\n股骨长(FL)：{{FL}}mm\n肱骨长(HL)：{{HL}}mm\n估算胎儿体重(EFW)：{{EFW}}g',
        required: true,
        fields: ['BPD', 'HC', 'AC', 'FL', 'HL', 'EFW']
      },
      {
        type: 'impression',
        title: '超声提示',
        template: '宫内孕，单活胎，胎儿大小与孕周{{gestationalWeeks}}周相符。',
        required: true
      },
      {
        type: 'suggestion',
        title: '建议',
        template: '建议按时产检，定期超声监测胎儿生长发育。',
        required: false
      }
    ]
  }
];

/**
 * 浅表器官报告模板
 */
export const SUPERFICIAL_TEMPLATES: ReportTemplate[] = [
  {
    id: 'thyroid',
    name: '甲状腺超声报告',
    examType: 'superficial',
    applicablePlanes: ['thyroid_lobe'],
    description: '甲状腺常规超声',
    sections: [
      {
        type: 'header',
        title: '检查信息',
        template: '超声检查：甲状腺\n检查日期：{{date}}\n患者：{{patientName}} ({{patientId}})',
        required: true
      },
      {
        type: 'findings',
        title: '声像图表现',
        template: '甲状腺左叶：长径 {{lThyroidLength}}mm，厚径 {{lThyroidThickness}}mm。\n甲状腺右叶：长径 {{rThyroidLength}}mm，厚径 {{rThyroidThickness}}mm。\n峡部厚度：{{isthmus}}mm。\n甲状腺实质回声均匀，未见明显占位。',
        required: true,
        fields: ['lThyroidLength', 'lThyroidThickness', 'rThyroidLength', 'rThyroidThickness', 'isthmus']
      },
      {
        type: 'measurements',
        title: '测值',
        template: '左叶：{{lThyroidLength}}×{{lThyroidThickness}}mm\n右叶：{{rThyroidLength}}×{{rThyroidThickness}}mm\n峡部：{{isthmus}}mm',
        required: true
      },
      {
        type: 'impression',
        title: '超声提示',
        template: '甲状腺声像图未见明显异常。',
        required: true
      }
    ]
  }
];

/**
 * 血管报告模板
 */
export const VASCULAR_TEMPLATES: ReportTemplate[] = [
  {
    id: 'carotid',
    name: '颈动脉超声报告',
    examType: 'vascular',
    applicablePlanes: ['carotid'],
    description: '颈部血管常规超声',
    sections: [
      {
        type: 'header',
        title: '检查信息',
        template: '超声检查：颈部血管\n检查日期：{{date}}\n患者：{{patientName}} ({{patientId}})',
        required: true
      },
      {
        type: 'findings',
        title: '声像图表现',
        template: '双侧颈总动脉、颈内动脉、颈外动脉管腔通畅，内中膜厚度（IMT）测值：左 {{lCCAIMT}}mm，右 {{rCCAIMT}}mm。未见明显斑块形成。',
        required: true,
        fields: ['lCCAIMT', 'rCCAIMT']
      },
      {
        type: 'measurements',
        title: '测值',
        template: '左颈总动脉：内径 {{lCCADiameter}}mm，IMT {{lCCAIMT}}mm\n右颈总动脉：内径 {{rCCADiameter}}mm，IMT {{rCCAIMT}}mm',
        required: true
      },
      {
        type: 'impression',
        title: '超声提示',
        template: '颈部血管未见明显异常。',
        required: true
      }
    ]
  }
];

/**
 * 模板库统一入口
 */
export const REPORT_TEMPLATES: Record<ExamType, ReportTemplate[]> = {
  abdominal: ABDOMINAL_TEMPLATES,
  cardiac: CARDIAC_TEMPLATES,
  obstetric: OBSTETRIC_TEMPLATES,
  gynecologic: OBSTETRIC_TEMPLATES,
  superficial: SUPERFICIAL_TEMPLATES,
  vascular: VASCULAR_TEMPLATES,
  urologic: ABDOMINAL_TEMPLATES,
  msk: [],
  pediatric: [],
  emergency: [],
  interventional: [],
  contrast: []
};
