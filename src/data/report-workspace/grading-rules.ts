/**
 * 国际标准分级规则
 * TI-RADS / BI-RADS / O-RADS / LI-RADS
 * @version v0.17.0
 */

export const TIRADS_RULES = [
  { level: 1, name: '正常甲状腺', criteria: '无结节，正常甲状腺实质回声均匀', malignancy: '0%', management: '无需处理', color: '#10b981' },
  { level: 2, name: '良性结节', criteria: '纯囊性、海绵状结节', malignancy: '0%', management: '无需处理', color: '#10b981' },
  { level: 3, name: '良性可能', criteria: '等/高回声，边界清晰，实性或囊实性', malignancy: '<2%', management: '无需穿刺，建议12月后随访', color: '#84cc16' },
  { level: 4, name: '可疑恶性', criteria: '低回声实性，边界欠清/不规则/纵横比>1', malignancy: '2-90%', management: '建议FNA活检', color: '#f59e0b' },
  { level: 5, name: '高度可疑恶性', criteria: '低回声+微钙化+边缘不规则+纵横比>1', malignancy: '>90%', management: '强烈建议FNA/手术', color: '#ef4444' },
  { level: 6, name: '已活检证实恶性', criteria: '病理证实甲状腺癌', malignancy: '100%', management: '外科处理', color: '#991b1b' },
]

export const BIRADS_RULES = [
  { level: 0, name: '评估不全', criteria: '需要额外影像学评估', malignancy: '-', management: '补充钼靶/MRI/US', color: '#94a3b8' },
  { level: 1, name: '阴性', criteria: '乳腺组织正常，无异常发现', malignancy: '0%', management: '常规筛查', color: '#10b981' },
  { level: 2, name: '良性', criteria: '单纯囊肿、纤维腺瘤等', malignancy: '0%', management: '常规筛查', color: '#10b981' },
  { level: 3, name: '良性可能', criteria: '边界清晰的实性肿块', malignancy: '<2%', management: '6月后短期随访', color: '#84cc16' },
  { level: 4, name: '可疑异常', criteria: '形态不规则、边界不清', malignancy: '2-95%', management: '建议活检', color: '#f59e0b' },
  { level: 5, name: '高度可疑恶性', criteria: '典型恶性肿瘤征象', malignancy: '>95%', management: '活检+手术', color: '#ef4444' },
  { level: 6, name: '已活检证实恶性', criteria: '病理证实乳腺癌', malignancy: '100%', management: '肿瘤科处理', color: '#991b1b' },
]

export const ORADS_RULES = [
  { level: 1, name: '正常卵巢', criteria: '绝经前<10cm³，绝经后<6cm³', malignancy: '<1%', management: '常规随访', color: '#10b981' },
  { level: 2, name: '几乎良性', criteria: '单纯囊肿<3cm，黄体囊肿等', malignancy: '<1%', management: '1年随访', color: '#10b981' },
  { level: 3, name: '低度风险', criteria: '单房囊肿≥3cm，或其他低风险特征', malignancy: '1-10%', management: '6-12月随访', color: '#84cc16' },
  { level: 4, name: '中度风险', criteria: '多房囊肿≥4cm，实性成分不明确', malignancy: '10-50%', management: 'MRI或专家会诊', color: '#f59e0b' },
  { level: 5, name: '高度风险', criteria: '实性或多房囊实性，明确恶性特征', malignancy: '>50%', management: '肿瘤妇科会诊', color: '#ef4444' },
]

export const LIRADS_RULES = [
  { level: 1, name: '绝对良性', criteria: '单纯囊肿，血管瘤', malignancy: '0%', management: '常规随访', color: '#10b981' },
  { level: 2, name: '良性可能', criteria: '≤2cm低风险结节', malignancy: '<5%', management: '6-12月随访', color: '#10b981' },
  { level: 3, name: '中度风险', criteria: '2-3cm结节，无明确恶性特征', malignancy: '5-20%', management: '3-6月增强MRI/CT', color: '#f59e0b' },
  { level: 4, name: '高度可疑', criteria: '动脉期明显强化+廓清', malignancy: '20-80%', management: '多学科会诊+活检', color: '#ef4444' },
  { level: 5, name: '确诊恶性', criteria: '病理证实HCC', malignancy: '100%', management: '肿瘤科处理', color: '#991b1b' },
]
