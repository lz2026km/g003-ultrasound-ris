/**
 * 自动测量引擎
 * @version v0.8.0
 * @description 智能测量值预测 + 正常范围校验 + 异常预警
 */

import { ExamType, MeasurementRecommendation } from '../types';
import { MeasurementRule, MEASURE_RULES } from './MeasureRules';

export interface MeasurementPrediction {
  rule: MeasurementRule;
  predictedValue: number;
  confidence: number;       // 预测置信度 0-1
  reasoning: string;        // 预测依据
}

export interface MeasurementValidation {
  rule: MeasurementRule;
  measuredValue: number;
  status: 'normal' | 'low' | 'high' | 'abnormal_low' | 'abnormal_high' | 'critical';
  deviation: number;        // 偏离度（%）
  warning?: string;
  suggestion?: string;
}

export interface PatientContext {
  age?: number;
  gender?: 'M' | 'F';
  gestationalWeeks?: number; // 孕周（妇产）
}

export class MeasureEngine {
  /**
   * 按检查类型+器官推荐测量项
   */
  recommend(examType: ExamType, organ?: string): MeasurementRecommendation[] {
    const rules = MEASURE_RULES[examType] || {};
    let targetRules: Array<[string, MeasurementRule[]]>;

    if (organ) {
      targetRules = [[organ, rules[organ] || []]];
    } else {
      targetRules = Object.entries(rules);
    }

    return targetRules
      .filter(([_, measureList]) => measureList.length > 0)
      .map(([organName, measureList]) => ({
        organ: organName,
        measurements: measureList
          .sort((a, b) => b.priority - a.priority)
          .map(m => ({
            name: m.name,
            unit: m.unit,
            normalRange: m.normalRange,
            priority: m.priority,
            description: m.description
          }))
      }));
  }

  /**
   * 智能预测测量值
   * 基于患者信息（年龄/性别/孕周）+ 历史数据
   */
  predict(
    examType: ExamType,
    organ: string,
    patientCtx: PatientContext,
    history: Array<{ name: string; value: number }> = []
  ): MeasurementPrediction[] {
    const rules = MEASURE_RULES[examType]?.[organ] || [];
    const predictions: MeasurementPrediction[] = [];

    for (const rule of rules) {
      // 从历史中查找相同测量项
      const historical = history.find(h => h.name === rule.name);
      if (historical) {
        predictions.push({
          rule,
          predictedValue: historical.value,
          confidence: 0.95,
          reasoning: `基于历史测量值 (${historical.value}${rule.unit})`
        });
        continue;
      }

      // 基于规则预测中位数
      const [min, max] = rule.normalRange;
      const mid = (min + max) / 2;

      // 孕周调整（妇产）
      let adjusted = mid;
      let confidence = 0.7;
      if (rule.ageAdjusted && patientCtx.gestationalWeeks) {
        // 简化的孕周调整
        const weeks = patientCtx.gestationalWeeks;
        if (rule.name.includes('BPD')) {
          adjusted = 25 + weeks * 3;  // 简化公式
        } else if (rule.name.includes('FL')) {
          adjusted = 10 + weeks * 1.5;
        } else if (rule.name.includes('AC')) {
          adjusted = 50 + weeks * 9;
        } else if (rule.name.includes('HC')) {
          adjusted = 80 + weeks * 8;
        }
        confidence = 0.85;
      }

      predictions.push({
        rule,
        predictedValue: Math.round(adjusted * 10) / 10,
        confidence,
        reasoning: rule.ageAdjusted && patientCtx.gestationalWeeks
          ? `基于孕周${patientCtx.gestationalWeeks}周估算`
          : `基于正常范围中位数估算 (${min}-${max}${rule.unit})`
      });
    }

    return predictions.sort((a, b) => b.rule.priority - a.rule.priority);
  }

  /**
   * 校验测量值
   */
  validate(
    examType: ExamType,
    organ: string,
    measurements: Array<{ name: string; value: number; unit: string }>
  ): MeasurementValidation[] {
    const rules = MEASURE_RULES[examType]?.[organ] || [];
    const validations: MeasurementValidation[] = [];

    for (const m of measurements) {
      const rule = rules.find(r => r.name === m.name);
      if (!rule) {
        validations.push({
          rule: {
            name: m.name, nameEn: '', unit: m.unit,
            normalRange: [0, 0], abnormalRange: [0, 0],
            priority: 3, category: 'size'
          },
          measuredValue: m.value,
          status: 'normal',
          deviation: 0,
          warning: '未找到对应规则'
        });
        continue;
      }

      const [nMin, nMax] = rule.normalRange;
      const [aMin, aMax] = rule.abnormalRange;
      const mid = (nMin + nMax) / 2;
      const range = nMax - nMin;
      const deviation = ((m.value - mid) / mid) * 100;

      let status: MeasurementValidation['status'];
      let warning: string | undefined;
      let suggestion: string | undefined;

      if (m.value < aMin) {
        status = 'abnormal_low';
        warning = `${rule.name} ${m.value}${rule.unit} 严重低于正常范围 (${nMin}-${nMax}${rule.unit})`;
        suggestion = '建议结合临床进一步评估';
      } else if (m.value > aMax) {
        status = 'abnormal_high';
        warning = `${rule.name} ${m.value}${rule.unit} 严重高于正常范围 (${nMin}-${nMax}${rule.unit})`;
        suggestion = '建议结合临床进一步评估';
      } else if (m.value < nMin) {
        status = 'low';
        warning = `${rule.name} ${m.value}${rule.unit} 略低于正常值下限 (${nMin}${rule.unit})`;
      } else if (m.value > nMax) {
        status = 'high';
        warning = `${rule.name} ${m.value}${rule.unit} 略高于正常值上限 (${nMax}${rule.unit})`;
      } else {
        status = 'normal';
      }

      validations.push({
        rule,
        measuredValue: m.value,
        status,
        deviation: Math.round(deviation * 10) / 10,
        warning,
        suggestion
      });
    }

    return validations;
  }

  /**
   * 计算衍生指标
   */
  calculate(
    examType: ExamType,
    primary: { name: string; value: number; unit: string }[]
  ): Array<{ name: string; value: number; unit: string; formula: string }> {
    const results: Array<{ name: string; value: number; unit: string; formula: string }> = [];

    if (examType === 'cardiac') {
      const LVEDd = primary.find(p => p.name.includes('LVEDd'));
      const LVEDs = primary.find(p => p.name.includes('LVEDs'));
      const IVSd = primary.find(p => p.name.includes('IVSd'));
      const LVPWd = primary.find(p => p.name.includes('LVPWd'));

      if (LVEDd && LVEDs) {
        // Teichholz EF
        const LVEDd3 = Math.pow(LVEDd.value, 3);
        const LVEDs3 = Math.pow(LVEDs.value, 3);
        const EF = ((LVEDd3 - LVEDs3) / LVEDd3) * 100;
        results.push({
          name: '射血分数(EF, Teichholz)',
          value: Math.round(EF * 10) / 10,
          unit: '%',
          formula: 'EF = (LVEDd³ - LVEDs³) / LVEDd³ × 100'
        });

        // FS
        const FS = ((LVEDd.value - LVEDs.value) / LVEDd.value) * 100;
        results.push({
          name: '左室缩短分数(FS)',
          value: Math.round(FS * 10) / 10,
          unit: '%',
          formula: 'FS = (LVEDd - LVEDs) / LVEDd × 100'
        });
      }

      if (LVEDd && IVSd && LVPWd) {
        // RWT
        const RWT = ((IVSd.value + LVPWd.value) / LVEDd.value) * 100;
        results.push({
          name: '相对室壁厚度(RWT)',
          value: Math.round(RWT * 10) / 10,
          unit: '%',
          formula: 'RWT = (IVSd + LVPWd) / LVEDd × 100'
        });
      }
    }

    if (examType === 'obstetric') {
      const BPD = primary.find(p => p.name.includes('BPD'));
      const FL = primary.find(p => p.name.includes('FL'));
      const AC = primary.find(p => p.name.includes('AC'));
      const HC = primary.find(p => p.name.includes('HC'));

      if (BPD && FL) {
        // 估算胎儿体重（简化Hadlock公式）
        const EFW = Math.pow(10, (1.304 + 0.05281 * AC?.value + 0.1938 * FL.value - 0.004 * (AC?.value || 0) * FL.value)) * 1000;
        if (!isNaN(EFW) && EFW > 0) {
          results.push({
            name: '估算胎儿体重(EFW)',
            value: Math.round(EFW),
            unit: 'g',
            formula: '简化Hadlock: log10(EFW) = 1.304 + 0.05281×AC + 0.1938×FL - 0.004×AC×FL'
          });
        }
      }

      if (BPD && HC) {
        // CI (cephalic index)
        const CI = (BPD.value / HC.value) * 100;
        results.push({
          name: '头颅指数(CI)',
          value: Math.round(CI * 10) / 10,
          unit: '%',
          formula: 'CI = BPD / HC × 100',
        });
      }
    }

    return results;
  }

  /**
   * 列出所有支持的检查类型
   */
  listExamTypes(): ExamType[] {
    return Object.keys(MEASURE_RULES) as ExamType[];
  }

  /**
   * 列出指定检查类型的所有测量项
   */
  listMeasures(examType: ExamType): Array<{ organ: string; measures: MeasurementRule[] }> {
    const rules = MEASURE_RULES[examType] || {};
    return Object.entries(rules).map(([organ, measures]) => ({ organ, measures }));
  }
}

export default MeasureEngine;
