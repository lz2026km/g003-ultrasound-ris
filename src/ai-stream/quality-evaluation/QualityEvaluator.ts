/**
 * 综合质量评价器
 * @version v0.8.0
 * @description 整合图像质量 + 报告质量 + AIStream质量评价
 */

import { AIStreamContext } from '../types';
import { ReportData } from '../report-generator/ReportGenerator';
import { ImageQualityAnalyzer, ImageQualityResult } from './ImageQualityAnalyzer';
import { ReportQualityAnalyzer, ReportQualityResult } from './ReportQualityAnalyzer';

export interface ComprehensiveQualityResult {
  overall: number;          // 0-100
  star: 1 | 2 | 3 | 4 | 5;
  image?: ImageQualityResult;
  report?: ReportQualityResult;
  combinedIssues: string[];
  combinedSuggestions: string[];
  pass: boolean;
}

export class QualityEvaluator {
  private imageAnalyzer: ImageQualityAnalyzer;
  private reportAnalyzer: ReportQualityAnalyzer;

  constructor(imageThreshold: number = 60, reportThreshold: number = 70) {
    this.imageAnalyzer = new ImageQualityAnalyzer(imageThreshold);
    this.reportAnalyzer = new ReportQualityAnalyzer(reportThreshold);
  }

  /**
   * 完整质量评价
   */
  evaluate(
    context: AIStreamContext,
    imageData?: string,
    report?: ReportData,
    measurements?: Array<{ name: string; value: number; unit: string }>
  ): ComprehensiveQualityResult {
    let imageResult: ImageQualityResult | undefined;
    let reportResult: ReportQualityResult | undefined;

    // 1. 图像质量
    if (imageData) {
      imageResult = this.imageAnalyzer.analyze(imageData, {
        depth: context.measurements.find(m => m.name.includes('depth'))?.value,
        gain: context.measurements.find(m => m.name.includes('gain'))?.value
      });
    }

    // 2. 报告质量
    if (report && measurements) {
      reportResult = this.reportAnalyzer.analyze(context, report, measurements);
    }

    // 3. 综合评分
    const imageScore = imageResult?.overall ?? 0;
    const reportScore = reportResult?.overall ?? 0;

    // 加权：图像 40% + 报告 60%
    const overall = (imageResult ? imageScore * 0.4 : 0) +
                    (reportResult ? reportScore * 0.6 : 0) +
                    (imageResult || reportResult ? 0 : 0);

    const finalScore = imageResult && reportResult
      ? overall
      : (imageResult?.overall ?? reportResult?.overall ?? 0);

    const combinedIssues: string[] = [];
    const combinedSuggestions: string[] = [];
    if (imageResult) {
      combinedIssues.push(...imageResult.issues);
      combinedSuggestions.push(...imageResult.suggestions);
    }
    if (reportResult) {
      combinedIssues.push(...reportResult.issues);
      combinedSuggestions.push(...reportResult.suggestions);
    }

    const star = this.toStar(finalScore);
    const pass = (imageResult?.pass ?? true) && (reportResult?.pass ?? true);

    return {
      overall: Math.round(finalScore * 10) / 10,
      star,
      image: imageResult,
      report: reportResult,
      combinedIssues,
      combinedSuggestions,
      pass
    };
  }

  /**
   * 仅图像质量评价
   */
  evaluateImage(imageData: string, metadata?: any): ImageQualityResult {
    return this.imageAnalyzer.analyze(imageData, metadata);
  }

  /**
   * 仅报告质量评价
   */
  evaluateReport(
    context: AIStreamContext,
    report: ReportData,
    measurements: Array<{ name: string; value: number; unit: string }>
  ): ReportQualityResult {
    return this.reportAnalyzer.analyze(context, report, measurements);
  }

  private toStar(score: number): 1 | 2 | 3 | 4 | 5 {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    return 1;
  }
}

export default QualityEvaluator;
