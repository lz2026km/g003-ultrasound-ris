/**
 * 切面识别测试
 * @version v0.8.0
 */

import { PlaneDetector, PLANE_LIBRARY, PlaneScorer } from '../plane-recognition';

describe('PlaneDetector 切面识别', () => {
  let detector: PlaneDetector;

  beforeEach(async () => {
    detector = new PlaneDetector(0.7);
    await detector.loadModel();
  });

  test('加载模型', () => {
    expect(detector).toBeDefined();
  });

  test('识别腹部切面', async () => {
    const result = await detector.detect('mock-image', 'abdominal');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].confidence).toBeGreaterThanOrEqual(0.7);
  });

  test('识别心脏切面', async () => {
    const result = await detector.detect('mock-image', 'cardiac');
    expect(result.length).toBeGreaterThan(0);
    expect(['cardiac_plax', 'cardiac_psax', 'cardiac_apical_4ch', 'cardiac_apical_2ch'])
      .toContain(result[0].plane);
  });

  test('列出所有切面', () => {
    const planes = detector.listPlanes();
    expect(planes.length).toBeGreaterThanOrEqual(20);
  });

  test('切面特征库完整性', () => {
    expect(PLANE_LIBRARY.abdominal_liver).toBeDefined();
    expect(PLANE_LIBRARY.cardiac_plax).toBeDefined();
    expect(PLANE_LIBRARY.obstetric_head).toBeDefined();
    expect(PLANE_LIBRARY.thyroid_lobe).toBeDefined();
    expect(PLANE_LIBRARY.carotid).toBeDefined();
  });

  test('扫查引导建议', () => {
    const guidance = detector.getGuidance('abdominal_liver');
    expect(guidance.length).toBeGreaterThan(0);
  });

  test('质量评分', () => {
    const scorer = new PlaneScorer();
    const score = scorer.score('abdominal_liver', {
      '楔形低回声区': 0.8,
      '门静脉高回声管状结构': 0.7,
      '边界清晰': 0.9
    });
    expect(score.overall).toBeGreaterThan(0);
    expect(score.completeness).toBeGreaterThan(0);
  });
});
