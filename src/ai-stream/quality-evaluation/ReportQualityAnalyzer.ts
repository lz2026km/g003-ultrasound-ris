/**
 * 报告质量分析器
 * @version v0.8.0
 * @description 检查报告完整性、一致性、标准化
 */

import { AIStreamContext, AIStreamReport } from '../types';
import { ReportData } from '../report-generator/ReportGenerator';

export interface ReportQualityMetrics {
  completeness: number;     // 完整性 0-100
  consistency: number;      // 一致性 0-100
  standardization: number;  // 标准化 0-100
  accuracy: number;         // 准确性 0-100
  clarity: number;          // 清晰度 0-100
  compliance: number;       // 合规性 0-100
}

export interface ReportQualityResult {
  overall: number;          // 综合评分 0-100
  star: 1 | 2 | 3 | 4 | 5;
  metrics: ReportQualityMetrics;
  issues: string[];         // 质量问题
  suggestions: string[];     // 改进建议
  pass: boolean;
}

export class ReportQualityAnalyzer {
  private threshold: number;

  constructor(threshold: number = 70) {
    this.threshold = threshold;
  }

  /**
   * 分析报告质量
   */
  analyze(
    context: AIStreamContext,
    report: ReportData,
    measurements: Array<{ name: string; value: number; unit: string }>
  ): ReportQualityResult {
    const completeness = this.checkCompleteness(context, report);
    const consistency = this.checkConsistency(context, report, measurements);
    const standardization = this.checkStandardization(report);
    const accuracy = this.checkAccuracy(report, measurements);
    const clarity = this.checkClarity(report);
    const compliance = this.checkCompliance(report);

    const metrics: ReportQualityMetrics = {
      completeness: Math.round(completeness * 10) / 10,
      consistency: Math.round(consistency * 10) / 10,
      standardization: Math.round(standardization * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      clarity: Math.round(clarity * 10) / 10,
      compliance: Math.round(compliance * 10) / 10
    };

    const overall = (
      completeness * 0.25 +
      consistency * 0.20 +
      standardization * 0.15 +
      accuracy * 0.20 +
      clarity * 0.10 +
      compliance * 0.10
    );

    const issues: string[] = [];
    const suggestions: string[] = [];

    if (completeness < 80) {
      issues.push('报告内容不完整');
      suggestions.push('请补充缺失字段：' + this.findMissingFields(context, report).join(', '));
    }
    if (consistency < 80) {
      issues.push('报告内容前后不一致');
      suggestions.push('检查模板字段值是否与测量数据一致');
    }
    if (standardization < 80) {
      issues.push('报告不够标准化');
      suggestions.push('请使用规范的医学术语');
    }
    if (accuracy < 80) {
      issues.push('存在可疑测量值');
      suggestions.push('复核异常测量值');
    }
    if (clarity < 80) {
      issues.push('描述不够清晰');
      suggestions.push('使用更精炼的语言');
    }
    if (compliance < 80) {
      issues.push('合规性问题');
      suggestions.push('确保包含必填章节（签名/警示/建议）');
    }

    const star = this.toStar(overall);
    const pass = overall >= this.threshold;

    return {
      overall: Math.round(overall * 10) / 10,
      star,
      metrics,
      issues,
      suggestions,
      pass
    };
  }

  /**
   * 完整性检查
   */
  private checkCompleteness(
    context: AIStreamContext,
    report: ReportData
  ): number {
    let total = 0;
    let filled = 0;

    for (const section of report.template.sections) {
      if (section.required) {
        total += 10;
        const rendered = report.sections.find(s => s.section === section);
        if (rendered && rendered.content && !rendered.content.includes('[]')) {
          filled += 10;
        }
      }
    }

    // 检查必填字段
    for (const section of report.template.sections) {
      if (section.required && section.fields) {
        for (const field of section.fields) {
          total += 5;
          if (report.values[field] !== undefined) {
            filled += 5;
          }
        }
      }
    }

    return total > 0 ? (filled / total) * 100 : 100;
  }

  /**
   * 一致性检查
   */
  private checkConsistency(
    context: AIStreamContext,
    report: ReportData,
    measurements: Array<{ name: string; value: number; unit: string }>
  ): number {
    let score = 100;
    // 检查模板中的测量值是否与实际测量一致
    for (const m of measurements) {
      const templateVal = report.values[m.name];
      if (templateVal !== undefined && Math.abs(templateVal - m.value) > 0.01) {
        score -= 5;
      }
    }
    // 检查LLM生成文本中是否提到关键测量
    if (report.generatedText) {
      for (const m of measurements) {
        if (!report.generatedText.includes(String(m.value))) {
          score -= 2;
        }
      }
    }
    return Math.max(0, score);
  }

  /**
   * 标准化检查
   */
  private checkStandardization(report: ReportData): number {
    let score = 100;
    // 检查是否使用规范的章节
    const standardSections = ['header', 'findings', 'measurements', 'impression'];
    for (const required of standardSections) {
      if (!report.template.sections.some(s => s.type === required)) {
        score -= 10;
      }
    }
    return Math.max(0, score);
  }

  /**
   * 准确性检查
   */
  private checkAccuracy(
    report: ReportData,
    measurements: Array<{ name: string; value: number; unit: string }>
  ): number {
    // 简化的准确性检查
    return 95;
  }

  /**
   * 清晰度检查
   */
  private checkClarity(report: ReportData): number {
    if (!report.generatedText) return 100;
    const text = report.generatedText;
    // 检查长度
    if (text.length < 50) return 60;
    if (text.length > 500) return 70;
    return 90;
  }

  /**
   * 合规性检查
   */
  private checkCompliance(report: ReportData): number {
    let score = 100;
    if (!report.template.sections.some(s => s.type === 'signature')) {
      score -= 30;
    }
    if (!report.template.sections.some(s => s.type === 'warning')) {
      score -= 10;
    }
    return Math.max(0, score);
  }

  /**
   * 查找缺失字段
   */
  private findMissingFields(
    context: AIStreamContext,
    report: ReportData
  ): string[] {
    const missing: string[] = [];
    for (const section of report.template.sections) {
      if (section.required && section.fields) {
        for (const field of section.fields) {
          if (report.values[field] === undefined) {
            missing.push(field);
          }
        }
      }
    }
    return missing;
  }

  private toStar(score: number): 1 | 2 | 3 | 4 | 5 {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    return 1;
  }
}

export default ReportQualityAnalyzer;
