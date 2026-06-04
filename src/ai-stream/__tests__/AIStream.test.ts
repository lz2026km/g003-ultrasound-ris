/**
 * AIStream 集成测试
 * @version v0.8.0
 */

import { AIStream } from '../AIStream';
import { AIStreamContext } from '../types';

describe('AIStream 智能工作流', () => {
  let aiStream: AIStream;

  beforeEach(() => {
    aiStream = new AIStream({
      enablePlaneRecognition: true,
      enableAutoMeasure: true,
      enableLLMGeneration: true,
      enableQualityEval: true,
      llmModel: 'minimax/MiniMax-M3'
    });
  });

  test('初始化', async () => {
    await aiStream.init();
    const config = aiStream.getConfig();
    expect(config.llmModel).toBe('minimax/MiniMax-M3');
    expect(config.enablePlaneRecognition).toBe(true);
  });

  test('腹部检查完整流程', async () => {
    const context: AIStreamContext = {
      examType: 'abdominal',
      patientInfo: {
        id: 'P001',
        age: 45,
        gender: 'M',
        indication: '右上腹不适'
      },
      measurements: []
    };

    const report = await aiStream.run(context, 'mock-image-data');

    expect(report).toBeDefined();
    expect(report.reportId).toBeDefined();
    expect(report.timestamp).toBeGreaterThan(0);
    expect(report.context.examType).toBe('abdominal');
  });

  test('心脏检查流程', async () => {
    const context: AIStreamContext = {
      examType: 'cardiac',
      patientInfo: {
        id: 'P002',
        age: 60,
        gender: 'F',
        indication: '胸闷气短'
      },
      measurements: []
    };

    const report = await aiStream.run(context, 'mock-image-data');
    expect(report).toBeDefined();
  });

  test('产科检查流程（含孕周）', async () => {
    const context: AIStreamContext = {
      examType: 'obstetric',
      patientInfo: {
        id: 'P003',
        age: 28,
        gender: 'F',
        indication: '中孕筛查'
      },
      measurements: []
    };

    const report = await aiStream.run(context, 'mock-image-data');
    expect(report).toBeDefined();
  });

  test('子模块可独立访问', () => {
    const modules = aiStream.getModules();
    expect(modules.planeDetector).toBeDefined();
    expect(modules.planeScorer).toBeDefined();
    expect(modules.measureEngine).toBeDefined();
    expect(modules.reportGenerator).toBeDefined();
    expect(modules.qualityEvaluator).toBeDefined();
  });

  test('执行步骤被记录', async () => {
    const context: AIStreamContext = {
      examType: 'abdominal',
      patientInfo: { id: 'P004', indication: '体检' },
      measurements: []
    };

    await aiStream.run(context, 'mock-image-data');
    const steps = aiStream.getSteps();
    expect(steps.length).toBeGreaterThan(0);

    const stepIds = steps.map(s => s.stepId);
    expect(stepIds).toContain('plane-recognition');
    expect(stepIds).toContain('auto-measure');
  });

  test('配置禁用功能', async () => {
    const stream = new AIStream({
      enablePlaneRecognition: false,
      enableAutoMeasure: false,
      enableLLMGeneration: false,
      enableQualityEval: false
    });

    const context: AIStreamContext = {
      examType: 'abdominal',
      patientInfo: { id: 'P005', indication: 'test' },
      measurements: []
    };

    const report = await stream.run(context, 'mock-image-data');
    expect(report).toBeDefined();
  });
});
