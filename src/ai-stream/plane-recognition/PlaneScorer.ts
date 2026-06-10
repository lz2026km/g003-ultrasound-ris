/**
 * 切面质量评分器
 * @version v0.8.0
 */

import { PlaneType } from '../types';
import { PLANE_LIBRARY } from './PlaneDetector';

export interface QualityScore {
  overall: number;           // 1-5 总分
  completeness: number;      // 完整性
  clarity: number;           // 清晰度
  standardness: number;      // 标准度
  issues: string[];          // 问题列表
  suggestions: string[];     // 改进建议
  pass: boolean;             // 是否达标
}

export class PlaneScorer {
  /**
   * 综合评分
   */
  score(plane: PlaneType, features: Record<string, number>): QualityScore {
    const meta: any = PLANE_LIBRARY[plane];
    if (!meta) {
      return {
        overall: 0,
        completeness: 0,
        clarity: 0,
        standardness: 0,
        issues: ['未知切面'],
        suggestions: [],
        pass: false
      };
    }

    // 完整性：特征覆盖率
    const featureCount = Object.keys(features).length;
    const expectedCount = meta.features.length;
    const completeness = expectedCount > 0
      ? Math.min(1, featureCount / expectedCount) * 5
      : 0;

    // 清晰度：特征值平均
    const values = Object.values(features);
    const clarity = values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length * 5
      : 0;

    // 标准度：与标准特征向量的相似度
    const standardness = this.cosineSimilarity(features, meta.featureVector) * 5;

    const overall = (completeness + clarity + standardness) / 3;
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (completeness < 3) {
      issues.push('图像不完整');
      suggestions.push('请调整探头位置，获取完整切面');
    }
    if (clarity < 3) {
      issues.push('图像清晰度不足');
      suggestions.push('请调整增益、深度或频率');
    }
    if (standardness < 3) {
      issues.push('切面不够标准');
      suggestions.push(...this.getGuidance(plane));
    }

    return {
      overall: Math.round(overall * 10) / 10,
      completeness: Math.round(completeness * 10) / 10,
      clarity: Math.round(clarity * 10) / 10,
      standardness: Math.round(standardness * 10) / 10,
      issues,
      suggestions,
      pass: overall >= meta.minQuality
    };
  }

  private cosineSimilarity(a: any, b: number[]): number {
    const aVec = Object.values(a) as number[];
    if (aVec.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < aVec.length; i++) {
      dot += aVec[i] * b[i];
      normA += aVec[i] * aVec[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
  }

  private getGuidance(plane: PlaneType): string[] {
    const guidanceMap: Partial<Record<PlaneType, string[]>> = {
      abdominal_liver: [
        '嘱患者深吸气后屏气',
        '探头置于右肋间',
        '可调整探头方向获取门静脉长轴'
      ],
      cardiac_plax: [
        '调整探头角度',
        '尝试不同肋间',
        '嘱患者左侧卧位'
      ]
    };
    return guidanceMap[plane] || ['请按标准切面要求操作'];
  }
}

export default PlaneScorer;
