/**
 * 测量引擎测试
 * @version v0.8.0
 */

import { MeasureEngine } from '../auto-measure/MeasureEngine';

describe('MeasureEngine 测量引擎', () => {
  let engine: MeasureEngine;

  beforeEach(() => {
    engine = new MeasureEngine();
  });

  test('推荐腹部测量', () => {
    const recs = engine.recommend('abdominal', 'liver');
    expect(recs.length).toBe(1);
    expect(recs[0].organ).toBe('liver');
    expect(recs[0].measurements.length).toBeGreaterThan(0);
  });

  test('推荐心脏测量', () => {
    const recs = engine.recommend('cardiac', 'leftVentricle');
    expect(recs[0].measurements.length).toBeGreaterThanOrEqual(4);
  });

  test('胎儿体重估算', () => {
    const results = engine.calculate('obstetric', [
      { name: '腹围(AC)', value: 250, unit: 'mm' },
      { name: '股骨长(FL)', value: 50, unit: 'mm' }
    ]);
    const efw = results.find(r => r.name.includes('EFW'));
    expect(efw).toBeDefined();
    expect(efw!.value).toBeGreaterThan(0);
  });

  test('心脏EF计算 (Teichholz法)', () => {
    const results = engine.calculate('cardiac', [
      { name: '左室舒张末径(LVEDd)', value: 50, unit: 'mm' },
      { name: '左室收缩末径(LVEDs)', value: 35, unit: 'mm' }
    ]);
    const ef = results.find(r => r.name.includes('EF'));
    expect(ef).toBeDefined();
    // EF = (50³-35³)/50³ × 100 = 64.3%
    expect(ef!.value).toBeGreaterThan(60);
    expect(ef!.value).toBeLessThan(70);
  });

  test('正常范围校验 - 正常', () => {
    const validations = engine.validate('cardiac', 'leftVentricle', [
      { name: '左室舒张末径(LVEDd)', value: 48, unit: 'mm' }
    ]);
    expect(validations[0].status).toBe('normal');
  });

  test('正常范围校验 - 异常高', () => {
    const validations = engine.validate('cardiac', 'leftVentricle', [
      { name: '左室舒张末径(LVEDd)', value: 70, unit: 'mm' }
    ]);
    expect(['abnormal_high', 'high']).toContain(validations[0].status);
    expect(validations[0].warning).toBeDefined();
  });

  test('智能预测 - 妇产孕周调整', () => {
    const predictions = engine.predict('obstetric', 'fetus', {
      gestationalWeeks: 28
    });
    const bpd = predictions.find(p => p.rule.name.includes('BPD'));
    expect(bpd).toBeDefined();
    // 28周BPD应在 70-80mm 范围
    expect(bpd!.predictedValue).toBeGreaterThan(80);
    expect(bpd!.reasoning).toContain('孕周');
  });

  test('列出所有检查类型', () => {
    const types = engine.listExamTypes();
    expect(types).toContain('abdominal');
    expect(types).toContain('cardiac');
    expect(types).toContain('obstetric');
  });
});
