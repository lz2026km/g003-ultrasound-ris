/**
 * 循证医学库
 * @version v0.17.0
 * 对标卫宁 WiNEX+DeepSeek
 */

export const EVIDENCE_GUIDELINES = [
  { id: 'G001', title: '2015 ATA 成人甲状腺结节和分化型甲状腺癌管理指南', organization: 'ATA美国甲状腺协会', year: 2015, category: '内分泌', summary: '甲状腺结节超声评估、活检、治疗的综合指南。', keyRecommendations: ['TI-RADS分级', 'FNA指征', '随访策略'], url: 'https://www.thyroid.org' },
  { id: 'G002', title: '2017 ACR TI-RADS 白皮书', organization: 'ACR美国放射学会', year: 2017, category: '内分泌', summary: '基于超声特征的甲状腺结节分级系统。', keyRecommendations: ['TR1-TR5分级', '管理建议'], url: 'https://www.acr.org' },
  { id: 'G003', title: '2018 AASLD 肝硬化门脉高压管理指南', organization: 'AASLD美国肝病学会', year: 2018, category: '消化', summary: '肝硬化门脉高压的评估与治疗。', keyRecommendations: ['HVPG测量', 'β受体阻滞剂', '内镜筛查'], url: 'https://www.aasld.org' },
  { id: 'G004', title: '2022 中国肝硬化诊治指南', organization: '中华医学会肝病学分会', year: 2022, category: '消化', summary: '中国肝硬化诊治最新指南。', keyRecommendations: ['病因治疗', '并发症防治'], url: 'http://www.chead.org.cn' },
  { id: 'G005', title: '2013 ACR BI-RADS 乳腺影像报告与数据系统', organization: 'ACR美国放射学会', year: 2013, category: '乳腺', summary: '乳腺影像标准化报告系统。', keyRecommendations: ['BI-RADS 0-6分级', '钼靶/超声/MRI标准'], url: 'https://www.acr.org' },
  { id: 'G006', title: '2021 NCCN 乳腺癌筛查与诊断指南', organization: 'NCCN', year: 2021, category: '乳腺', summary: '乳腺癌风险分层与筛查策略。', keyRecommendations: ['高危人群筛查', 'MRI补充'], url: 'https://www.nccn.org' },
  { id: 'G007', title: '2016 EASL 胆石症临床实践指南', organization: 'EASL欧洲肝脏研究学会', year: 2016, category: '消化', summary: '胆石症诊断与治疗国际指南。', keyRecommendations: ['腹腔镜胆囊切除', 'ERCP指征'], url: 'https://www.easl.eu' },
  { id: 'G008', title: '2019 EAU 尿石症指南', organization: 'EAU欧洲泌尿外科学会', year: 2019, category: '泌尿', summary: '尿路结石的诊断治疗指南。', keyRecommendations: ['CTU', 'ESWL', 'URL'], url: 'https://uroweb.org' },
  { id: 'G009', title: '2022 BCLC 肝细胞癌分期与治疗策略', organization: 'EASL/AASLD', year: 2022, category: '消化', summary: 'HCC的国际标准分期与治疗。', keyRecommendations: ['BCLC分期', '治疗选择'], url: 'https://www.easl.eu' },
  { id: 'G010', title: '2023 中国原发性肝癌诊疗指南', organization: '国家卫健委', year: 2023, category: '消化', summary: '中国HCC诊疗规范。', keyRecommendations: ['分期标准', '综合治疗'], url: 'http://www.nhc.gov.cn' },
  { id: 'G011', title: '2011 ACC/AHA 卒中预防指南', organization: 'ACC/AHA', year: 2011, category: '血管', summary: '缺血性卒中一级/二级预防。', keyRecommendations: ['颈动脉狭窄评估', '他汀治疗'], url: 'https://www.acc.org' },
  { id: 'G012', title: '2020 AAGL 子宫肌瘤管理指南', organization: 'AAGL', year: 2020, category: '妇产', summary: '子宫肌瘤微创治疗指南。', keyRecommendations: ['腹腔镜手术', '能量器械选择'], url: 'https://www.aagl.org' },
]

export const EVIDENCE_LITERATURE = [
  { id: 'L001', title: 'Thyroid ultrasound reporting: consensus from the AIUM/ACR/SRU', journal: 'J Ultrasound Med', impactFactor: 2.8, year: 2023, summary: '甲状腺超声报告标准化共识。' },
  { id: 'L002', title: 'TI-RADS vs ACR-TIRADS: A comparison study', journal: 'Radiology', impactFactor: 11.1, year: 2022, summary: '两种TI-RADS系统的对比研究。' },
  { id: 'L003', title: 'Deep learning for thyroid nodule classification on ultrasound', journal: 'Nature Medicine', impactFactor: 87.2, year: 2023, summary: '深度学习在甲状腺结节分类中的应用。' },
  { id: 'L004', title: 'Shear wave elastography for liver fibrosis staging', journal: 'Hepatology', impactFactor: 17.3, year: 2022, summary: '剪切波弹性成像评估肝纤维化的准确性研究。' },
  { id: 'L005', title: 'Contrast-enhanced ultrasound for focal liver lesions', journal: 'Lancet Gastroenterology', impactFactor: 45.0, year: 2023, summary: '超声造影在肝脏局灶性病变诊断中的应用。' },
  { id: 'L006', title: 'BI-RADS 3 lesions: outcomes of short-term follow-up', journal: 'Radiology', impactFactor: 11.1, year: 2021, summary: 'BI-RADS 3类病变的随访结果分析。' },
  { id: 'L007', title: 'AI-assisted breast ultrasound: multi-center study', journal: 'JAMA Oncology', impactFactor: 33.0, year: 2023, summary: 'AI辅助乳腺超声的多中心研究。' },
  { id: 'L008', title: 'Carotid plaque characterization by ultrasound', journal: 'Stroke', impactFactor: 10.3, year: 2022, summary: '颈动脉斑块的超声特征与卒中风险。' },
]
