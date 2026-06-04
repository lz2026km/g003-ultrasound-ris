/**
 * 影像AI 统一入口
 * @version v0.8.0
 * @description 对标联影智能分割、数坤数字医生
 */

export * from './types';
export * from './dicom-seg';
export * from './detection';
export * from './measurement';
export * from './ai-models';

/**
 * 一站式AI影像分析
 */
import { SEGLoader, SEGViewer } from './dicom-seg';
import { ThyroidDetector, BreastDetector, CarotidDetector, LiverDetector } from './detection';
import { BiometricMeasure } from './measurement';
import { ModelManager, registerDefaultModels } from './ai-models';
import { DetectionResult } from './types';

export class AIImagingSuite {
  public segLoader: SEGLoader;
  public segViewer: SEGViewer;
  public thyroidDetector: ThyroidDetector;
  public breastDetector: BreastDetector;
  public carotidDetector: CarotidDetector;
  public liverDetector: LiverDetector;
  public fetalMeasure: BiometricMeasure;
  public modelManager: ModelManager;

  constructor() {
    this.segLoader = new SEGLoader();
    this.segViewer = new SEGViewer();
    this.thyroidDetector = new ThyroidDetector();
    this.breastDetector = new BreastDetector();
    this.carotidDetector = new CarotidDetector();
    this.liverDetector = new LiverDetector();
    this.fetalMeasure = new BiometricMeasure();
    this.modelManager = new ModelManager();
    registerDefaultModels(this.modelManager);
  }

  /**
   * 综合分析
   */
  async comprehensiveAnalysis(
    imageData: string,
    modality: 'thyroid' | 'breast' | 'carotid' | 'liver' | 'obstetric'
  ): Promise<DetectionResult[]> {
    switch (modality) {
      case 'thyroid':
        return this.thyroidDetector.detect(imageData);
      case 'breast':
        return this.breastDetector.detect(imageData);
      case 'carotid':
        return this.carotidDetector.detect(imageData);
      case 'liver':
        return this.liverDetector.detect(imageData);
      case 'obstetric':
        // 胎儿返回测量结果
        const fetal = await this.fetalMeasure.measureAll(imageData);
        return fetal.map(f => ({
          type: f.nameEn === 'BPD' ? 'fetal_head' :
                f.nameEn === 'AC' ? 'fetal_abdomen' :
                f.nameEn === 'FL' ? 'fetal_femur' : 'unknown',
          confidence: f.confidence,
          bbox: { x: 0, y: 0, width: 0, height: 0 },
          size: { diameter1: f.value },
          description: `${f.name}(${f.nameEn}) ${f.value}${f.unit}, 估算孕周${f.gestationalAge}周`,
          measurements: [{ name: f.name, value: f.value, unit: f.unit }]
        }));
      default:
        return [];
    }
  }
}

export default AIImagingSuite;
