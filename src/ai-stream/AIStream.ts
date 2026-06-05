/**
 * AIStream 智能工作流 - 核心编排器
 * @version v0.8.0
 * @description 对标联影uSONIQUE AIStream
 *
 * 4 步流水线：识别 → 测量 → 评价 → 生成
 */

import {
  AIStreamContext,
  AIStreamReport,
  AIStreamConfig,
  AIStreamStep,
  PlaneDetection,
  MeasurementRecommendation,
  QualityEvaluation
} from './types';

import { PlaneDetector, PLANE_LIBRARY, PlaneScorer } from './plane-recognition';
import { MeasureEngine, MeasurementRule } from './auto-measure';
import { ReportGenerator, ReportData } from './report-generator';
import { QualityEvaluator, ComprehensiveQualityResult } from './quality-evaluation';

export class AIStream {
  private config: AIStreamConfig;
  private steps: AIStreamStep[] = [];
  private report: Partial<AIStreamReport> = {};

  // 子模块
  private planeDetector: PlaneDetector;
  private planeScorer: PlaneScorer;
  private measureEngine: MeasureEngine;
  private reportGenerator: ReportGenerator;
  private qualityEvaluator: QualityEvaluator;

  constructor(config: Partial<AIStreamConfig> = {}) {
    this.config = {
      enablePlaneRecognition: true,
      enableAutoMeasure: true,
      enableLLMGeneration: true,
      enableQualityEval: true,
      llmModel: 'minimax/MiniMax-M3',
      confidenceThreshold: 0.7,
      qualityThreshold: 3.0,
      ...config
    };

    this.planeDetector = new PlaneDetector(this.config.confidenceThreshold);
    this.planeScorer = new PlaneScorer();
    this.measureEngine = new MeasureEngine();
    this.reportGenerator = new ReportGenerator({ model: this.config.llmModel });
    this.qualityEvaluator = new QualityEvaluator();
  }

  /**
   * 初始化（异步加载模型）
   */
  async init(): Promise<void> {
    if (this.config.enablePlaneRecognition) {
      await this.planeDetector.loadModel();
    }
  }

  /**
   * 启动 AIStream 全流程
   * 扫查 → 分析 → 报告
   */
  async run(
    context: AIStreamContext,
    imageData?: string,
    onProgress?: (step: AIStreamStep) => void
  ): Promise<AIStreamReport> {
    this.steps = [];
    this.report = {
      reportId: this.generateId(),
      timestamp: Date.now(),
      context
    };

    // Step 1: 切面识别
    if (this.config.enablePlaneRecognition && imageData) {
      const result = await this.executeStep(
        'plane-recognition',
        '切面识别',
        () => this.recognizePlane(imageData, context.examType),
        onProgress
      );
      this.report.planesDetected = result;
      context.currentPlane = result[0]?.plane;
    }

    // Step 2: 自动测量推荐
    let measurements: Array<{ name: string; value: number; unit: string }> = [];
    if (this.config.enableAutoMeasure) {
      const result = await this.executeStep(
        'auto-measure',
        '自动测量推荐',
        () => this.recommendMeasurements(context),
        onProgress
      );
      this.report.measurements = context.measurements;
    }

    // Step 3: 质量评价
    let qualityResult: ComprehensiveQualityResult | undefined;
    if (this.config.enableQualityEval) {
      // 先生成报告用于质量评价
      let reportData: ReportData | undefined;
      if (this.config.enableLLMGeneration) {
        reportData = await this.executeStep(
          'llm-generate',
          'LLM报告生成',
          () => this.reportGenerator.generate(context, measurements),
          onProgress
        );
        if (reportData) { this.report.generatedText = reportData.generatedText; }
        if (reportData) { measurements = this.collectMeasurements(reportData); }
      }

      qualityResult = await this.executeStep(
        'quality-eval',
        '质量评价',
        () => Promise.resolve(this.qualityEvaluator.evaluate(
          context,
          imageData,
          reportData,
          measurements
        )),
        onProgress
      );

      this.report.quality = {
        imageQuality: {
          score: qualityResult?.image?.star ?? 0,
          issues: qualityResult?.image?.issues ?? [],
          suggestions: qualityResult?.image?.suggestions ?? []
        },
        reportQuality: {
          completeness: qualityResult?.report?.metrics.completeness ?? 0,
          consistency: qualityResult?.report?.metrics.consistency ?? 0,
          standardization: qualityResult?.report?.metrics.standardization ?? 0,
          issues: qualityResult?.report?.issues ?? []
        },
        overall: qualityResult?.overall ?? 0
      };
    } else if (this.config.enableLLMGeneration) {
      // 仅 LLM 生成
      const result = await this.executeStep(
        'llm-generate',
        'LLM报告生成',
        () => this.reportGenerator.generate(context, measurements),
        onProgress
      );
      this.report.generatedText = result.generatedText;
    }

    return this.report as AIStreamReport;
  }

  /**
   * 执行单步
   */
  private async executeStep(
    stepId: string,
    name: string,
    fn: () => Promise<any>,
    onProgress?: (step: AIStreamStep) => void
  ): Promise<any> {
    const step: AIStreamStep = {
      stepId,
      name,
      status: 'running',
      startTime: Date.now()
    };
    this.steps.push(step);
    onProgress?.(step);

    try {
      const result = await fn();
      step.status = 'success';
      step.endTime = Date.now();
      step.result = result;
      onProgress?.(step);
      return result;
    } catch (e) {
      step.status = 'failed';
      step.endTime = Date.now();
      step.error = (e as Error).message;
      onProgress?.(step);
      throw e;
    }
  }

  /**
   * Step 1: 切面识别
   */
  private async recognizePlane(
    imageData: string,
    examType: string
  ): Promise<PlaneDetection[]> {
    return await this.planeDetector.detect(imageData, examType as any);
  }

  /**
   * Step 2: 自动测量推荐
   */
  private async recommendMeasurements(
    context: AIStreamContext
  ): Promise<MeasurementRecommendation[]> {
    return this.measureEngine.recommend(context.examType);
  }

  /**
   * 收集测量数据
   */
  private collectMeasurements(report: ReportData): Array<{ name: string; value: number; unit: string }> {
    const measurements: Array<{ name: string; value: number; unit: string }> = [];
    for (const [name, value] of Object.entries(report.values)) {
      if (typeof value === 'number') {
        measurements.push({ name, value, unit: '' });
      }
    }
    return measurements;
  }

  /**
   * 获取子模块（高级用法）
   */
  getModules() {
    return {
      planeDetector: this.planeDetector,
      planeScorer: this.planeScorer,
      measureEngine: this.measureEngine,
      reportGenerator: this.reportGenerator,
      qualityEvaluator: this.qualityEvaluator
    };
  }

  getSteps(): AIStreamStep[] {
    return this.steps;
  }

  getConfig(): AIStreamConfig {
    return this.config;
  }

  private generateId(): string {
    return `ais-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default AIStream;
