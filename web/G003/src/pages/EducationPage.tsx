// @ts-nocheck
import { useState } from 'react';
import {
  BookOpen, Search, Filter, Eye, Image, Video, FileText,
  Clock, TrendingUp, QrCode, Download, X, Play, ChevronRight,
  Stethoscope, Pill, Utensils, Activity, ClipboardList, Scan,
  GraduationCap, Award, Target, Calendar, CheckCircle2,
  Circle, BarChart2, Clock3, BookMarked, FileCheck, ListChecks,
  TrendingDown, Pause, RefreshCw, Star, Trophy, Medal
} from 'lucide-react';

// ============ Types ============
type MaterialType = '图文' | '视频' | 'PDF';
type Category = '检查须知' | '术前准备' | '术后护理' | '康复指导' | '饮食建议' | '疾病科普';
type TabType = '资料库' | '学习进度' | '在线考核' | '题库练习' | '培训档案' | '每周计划';
type QuestionType = '单选' | '多选' | '判断' | '简答';
type ExamStatus = '未开始' | '进行中' | '已完成';
type PlanStatus = '待执行' | '进行中' | '已完成';

interface EducationItem {
  id: string;
  title: string;
  category: Category;
  type: MaterialType;
  summary: string;
  content: string;
  views: number;
  publishDate: string;
  author: string;
  tags: string[];
  duration?: string;
  pdfPages?: number;
}

// 学习进度
interface LearningProgress {
  courseId: string;
  courseName: string;
  category: Category;
  totalItems: number;
  completedItems: number;
  progressPercent: number;
  lastStudyDate: string;
  totalTimeSpent: string;
  isInProgress: boolean;
}

// 在线考核
interface ExamRecord {
  examId: string;
  examName: string;
  category: Category;
  totalScore: number;
  passingScore: number;
  myScore: number;
  status: ExamStatus;
  duration: number;
  totalQuestions: number;
  correctRate: number;
  completedDate?: string;
  timeSpent: string;
}

// 题库练习
interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: '简单' | '中等' | '困难';
  category: Category;
}

// 培训档案
interface TrainingRecord {
  recordId: string;
  trainingName: string;
  trainingType: '岗前培训' | '在职培训' | '专题讲座' | '技能考核' | '学术会议';
  date: string;
  hours: number;
  score?: number;
  certificate?: string;
  instructor: string;
  status: '已完成' | '进行中' | '未完成';
  location: string;
}

// 每周计划
interface WeeklyPlan {
  planId: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  completedHours: number;
  items: WeeklyPlanItem[];
}

interface WeeklyPlanItem {
  id: string;
  title: string;
  type: '学习' | '考核' | '练习' | '会议' | '其他';
  date: string;
  startTime: string;
  endTime: string;
  status: PlanStatus;
  description: string;
  category?: Category;
}

// ============ 18条真实科普内容 ============
const educationData: EducationItem[] = [
  // 检查须知 (3条)
  {
    id: 'E001',
    title: 'CT检查注意事项全攻略',
    category: '检查须知',
    type: '图文',
    summary: 'CT检查前准备、检查流程及注意事项详解',
    content: '1. 检查前需去除检查部位金属物品；2. 腹部CT检查前需空腹4-6小时；3. 进行增强CT时需注射造影剂，请提前告知过敏史；4. 孕妇及备孕患者应避免CT检查；5. 检查时保持静止，配合呼吸指令。',
    views: 3421,
    publishDate: '2026-04-15',
    author: '影像科',
    tags: ['CT', '检查', '注意事项'],
    duration: '8分钟阅读'
  },
  {
    id: 'E002',
    title: '磁共振成像(MRI)检查指南',
    category: '检查须知',
    type: '视频',
    summary: 'MRI检查原理、适应症及检查流程介绍',
    content: 'MRI是一种无电离辐射的影像学检查方法，利用磁场和射频脉冲成像。本视频详细介绍MRI检查的适应症、检查流程、注意事项，以及哪些患者不适合进行MRI检查（如心脏起搏器植入者）。',
    views: 2187,
    publishDate: '2026-04-10',
    author: '影像科',
    tags: ['MRI', '磁共振', '视频指南'],
    duration: '12分钟'
  },
  {
    id: 'E003',
    title: '腹部超声检查前准备与配合要点',
    category: '检查须知',
    type: 'PDF',
    summary: '腹部超声检查准备事项、清肠方法及检查后护理',
    content: '腹部超声检查前需禁食8-12小时，禁水4小时。如有高血压可少量水服药。检查后咽喉部会有轻微不适，1-2小时后可进食温凉流质。本PDF详细说明无痛腹部超声的麻醉配合要点。',
    views: 1856,
    publishDate: '2026-04-08',
    author: '消化内科',
    tags: ['腹部超声', '超声探头', '检查准备'],
    pdfPages: 6
  },
  // 术前准备 (3条)
  {
    id: 'E004',
    title: '外科手术前准备工作清单',
    category: '术前准备',
    type: '图文',
    summary: '术前检查、用药调整、饮食管理及心理准备',
    content: '1. 术前需完成血常规、凝血功能、心电图等基础检查；2. 抗凝药物（如阿司匹林）需术前7天停用；3. 吸烟患者应至少术前2周戒烟；4. 术前夜需禁食8小时、禁水4小时；5. 保持良好心态，充分休息。',
    views: 4523,
    publishDate: '2026-04-12',
    author: '普外科',
    tags: ['手术', '术前准备', '注意事项'],
    duration: '10分钟阅读'
  },
  {
    id: 'E005',
    title: '术前麻醉评估与注意事项',
    category: '术前准备',
    type: '视频',
    summary: '麻醉医生讲解术前麻醉评估流程',
    content: '术前麻醉评估是保障手术安全的重要环节。麻醉医生会评估患者的心肺功能、过敏史、既往麻醉史等。根据手术类型和患者情况，选择全身麻醉、椎管内麻醉或局部麻醉等不同方式。',
    views: 2891,
    publishDate: '2026-04-05',
    author: '麻醉科',
    tags: ['麻醉', '术前评估', '视频讲解'],
    duration: '15分钟'
  },
  {
    id: 'E006',
    title: '术前心理疏导与放松技巧',
    category: '术前准备',
    type: '图文',
    summary: '手术前焦虑情绪的应对策略',
    content: '术前焦虑是正常情绪反应。可通过以下方式缓解：1. 充分了解手术信息，减少未知恐惧；2. 学习深呼吸和冥想放松技巧；3. 与家人朋友倾诉交流；4. 必要时寻求专业心理咨询；5. 保持规律作息。',
    views: 1678,
    publishDate: '2026-04-01',
    author: '心理科',
    tags: ['心理护理', '术前', '焦虑缓解'],
    duration: '6分钟阅读'
  },
  // 术后护理 (3条)
  {
    id: 'E007',
    title: '手术后伤口护理指南',
    category: '术后护理',
    type: '图文',
    summary: '伤口清洁、换药时机及感染预防',
    content: '1. 保持伤口干燥清洁，遵医嘱换药；2. 观察伤口有无红肿、渗液、发热等感染迹象；3. 避免伤口沾水，沐浴时做好防水保护；4. 适度活动，但避免剧烈运动牵拉伤口；5. 按医嘱使用抗生素。',
    views: 5234,
    publishDate: '2026-04-18',
    author: '外科护理',
    tags: ['伤口护理', '术后', '感染预防'],
    duration: '7分钟阅读'
  },
  {
    id: 'E008',
    title: '术后镇痛管理方案',
    category: '术后护理',
    type: 'PDF',
    summary: '术后疼痛评估与镇痛药物使用指南',
    content: '术后疼痛是常见症状，现代镇痛理念强调多模式镇痛。内容包括：疼痛评估方法（数字评分法NRS）、常用镇痛药物（PCA泵、曲马多、芬太尼透皮贴剂）、非药物镇痛方法（冰敷、体位管理）。',
    views: 2341,
    publishDate: '2026-04-14',
    author: '疼痛科',
    tags: ['镇痛', '术后疼痛', '镇痛泵'],
    pdfPages: 8
  },
  {
    id: 'E009',
    title: '术后早期活动与康复',
    category: '术后护理',
    type: '视频',
    summary: '术后尽早下床活动的重要性与注意事项',
    content: '术后早期活动有助于预防深静脉血栓、肺部感染、促进肠功能恢复。视频演示：术后床上踝泵运动、坐起训练、床边站立、下床行走的标准流程及注意事项。',
    views: 3789,
    publishDate: '2026-04-16',
    author: '康复科',
    tags: ['术后康复', '早期活动', '视频指导'],
    duration: '10分钟'
  },
  // 康复指导 (3条)
  {
    id: 'E010',
    title: '骨科手术后康复锻炼计划',
    category: '康复指导',
    type: '图文',
    summary: '关节置换、骨折术后分阶段康复训练',
    content: '康复训练分四阶段：1. 保护期（术后1-2周）：肌肉等长收缩；2. 早期（3-6周）：主动辅助运动；3. 中期（7-12周）：抗阻训练；4. 后期（12周后）：功能训练。循序渐进，避免过度负重。',
    views: 4123,
    publishDate: '2026-04-20',
    author: '骨科',
    tags: ['骨科康复', '功能锻炼', '关节保护'],
    duration: '12分钟阅读'
  },
  {
    id: 'E011',
    title: '脑卒中患者家庭康复指导',
    category: '康复指导',
    type: '视频',
    summary: '偏瘫患者居家康复训练方法演示',
    content: '脑卒中后康复是一个长期过程。视频内容包括：1. 床上体位摆放（防压疮、防痉挛）；2. 被动关节活动度训练；3. 翻身训练；4. 坐位平衡训练；5. 站立训练；6. 日常生活活动能力训练（穿衣、洗漱、进食）。',
    views: 5678,
    publishDate: '2026-04-22',
    author: '神经内科',
    tags: ['脑卒中', '偏瘫康复', '居家训练'],
    duration: '25分钟'
  },
  {
    id: 'E012',
    title: '心脏支架术后心脏康复',
    category: '康复指导',
    type: 'PDF',
    summary: '冠脉支架术后运动处方与生活方式管理',
    content: '心脏康复分三期：I期（住院期）早期活动；II期（门诊康复）3-6个月；III期（长期维护）终身坚持。运动处方包括有氧运动（快走、骑车、游泳）和抗阻训练，每周5次，每次30-60分钟。',
    views: 3456,
    publishDate: '2026-04-18',
    author: '心内科',
    tags: ['心脏康复', '支架术后', '运动处方'],
    pdfPages: 12
  },
  // 饮食建议 (3条)
  {
    id: 'E013',
    title: '围手术期营养支持方案',
    category: '饮食建议',
    type: '图文',
    summary: '术前营养储备与术后营养补充指南',
    content: '术前营养不良会影响术后恢复。推荐高蛋白饮食（鸡蛋、鱼肉、豆制品），补充维生素C、锌等微量元素。术后胃肠功能恢复后，从流质逐步过渡到半流质、普食。注意补充优质蛋白促进伤口愈合。',
    views: 2897,
    publishDate: '2026-04-11',
    author: '营养科',
    tags: ['围手术期', '营养支持', '高蛋白'],
    duration: '8分钟阅读'
  },
  {
    id: 'E014',
    title: '糖尿病患者饮食指南',
    category: '饮食建议',
    type: '视频',
    summary: '糖尿病饮食计算与餐盘搭配方法',
    content: '糖尿病饮食核心是控制总热量、均衡营养。视频介绍：1. 食物交换份法；2. 糖尿病餐盘法（1/2蔬菜、1/4蛋白、1/4主食）；3. 低GI食物选择；4. 外出就餐技巧；5. 血糖监测与饮食调整。',
    views: 6789,
    publishDate: '2026-04-25',
    author: '内分泌科',
    tags: ['糖尿病', '饮食控制', '血糖管理'],
    duration: '18分钟'
  },
  {
    id: 'E015',
    title: '肿瘤患者化疗期间饮食调理',
    category: '饮食建议',
    type: 'PDF',
    summary: '化疗期间恶心呕吐的营养应对策略',
    content: '化疗常见副作用包括恶心呕吐、食欲下降、味觉改变。饮食建议：1. 少食多餐，选择清淡易消化的食物；2. 化疗前2小时避免进食；3. 补充高热量、高蛋白流质（肠内营养液）；4. 生姜、柠檬有助于缓解恶心。',
    views: 2341,
    publishDate: '2026-04-08',
    author: '肿瘤科',
    tags: ['肿瘤营养', '化疗饮食', '副作用管理'],
    pdfPages: 10
  },
  // 疾病科普 (3条)
  {
    id: 'E016',
    title: '高血压的诊断与日常管理',
    category: '疾病科普',
    type: '图文',
    summary: '高血压标准、危害及非药物治疗方法',
    content: '高血压诊断标准：收缩压≥140mmHg和/或舒张压≥90mmHg。长期高血压可导致心脑肾损害。管理要点：1. 低盐饮食（每日<6g）；2. 规律有氧运动；3. 控制体重；4. 戒烟限酒；5. 规律服药，定期监测。',
    views: 8923,
    publishDate: '2026-04-20',
    author: '心内科',
    tags: ['高血压', '慢病管理', '心血管'],
    duration: '10分钟阅读'
  },
  {
    id: 'E017',
    title: '认识甲状腺结节',
    category: '疾病科普',
    type: '视频',
    summary: '甲状腺结节的良恶性鉴别与随访原则',
    content: '甲状腺结节非常常见，95%以上为良性。视频讲解：1. 甲状腺结节如何发现；2. 超声TI-RADS分类的意义；3. 哪些情况需要穿刺活检（FNA）；4. 良性结节的随访策略；5. 恶性结节的治疗原则。',
    views: 4567,
    publishDate: '2026-04-23',
    author: '内分泌科',
    tags: ['甲状腺', '结节', '超声检查'],
    duration: '14分钟'
  },
  {
    id: 'E018',
    title: '肺癌早期筛查与预防',
    category: '疾病科普',
    type: 'PDF',
    summary: 'LDCT筛查利弊及肺癌预防措施',
    content: '低剂量CT（LDCT）是肺癌筛查推荐方法，可降低20%肺癌死亡率。适合筛查人群：年龄50-80岁，吸烟≥20包年，戒烟<15年。预防措施：戒烟、避免二手烟、减少空气污染暴露、职业防护。',
    views: 3234,
    publishDate: '2026-04-17',
    author: '呼吸科',
    tags: ['肺癌', 'LDCT筛查', '预防'],
    pdfPages: 15
  }
];

// ============ 学习进度数据 ============
const learningProgressData: LearningProgress[] = [
  { courseId: 'P001', courseName: '围手术期患者教育', category: '术前准备', totalItems: 18, completedItems: 15, progressPercent: 83, lastStudyDate: '2026-04-29', totalTimeSpent: '12小时35分', isInProgress: true },
  { courseId: 'P002', courseName: 'CT检查宣教课程', category: '检查须知', totalItems: 8, completedItems: 8, progressPercent: 100, lastStudyDate: '2026-04-25', totalTimeSpent: '4小时20分', isInProgress: false },
  { courseId: 'P003', courseName: '术后康复指导', category: '康复指导', totalItems: 12, completedItems: 7, progressPercent: 58, lastStudyDate: '2026-04-28', totalTimeSpent: '8小时10分', isInProgress: true },
  { courseId: 'P004', courseName: '糖尿病患者教育', category: '疾病科普', totalItems: 15, completedItems: 15, progressPercent: 100, lastStudyDate: '2026-04-20', totalTimeSpent: '6小时45分', isInProgress: false },
  { courseId: 'P005', courseName: '营养支持培训', category: '饮食建议', totalItems: 10, completedItems: 4, progressPercent: 40, lastStudyDate: '2026-04-27', totalTimeSpent: '3小时15分', isInProgress: true },
];

// ============ 在线考核数据 ============
const examData: ExamRecord[] = [
  { examId: 'EX001', examName: '围手术期护理考核', category: '术前准备', totalScore: 100, passingScore: 60, myScore: 85, status: '已完成', duration: 60, totalQuestions: 50, correctRate: 85, completedDate: '2026-04-25', timeSpent: '45分钟' },
  { examId: 'EX002', examName: '影像检查知识测试', category: '检查须知', totalScore: 100, passingScore: 60, myScore: 92, status: '已完成', duration: 45, totalQuestions: 40, correctRate: 92, completedDate: '2026-04-22', timeSpent: '38分钟' },
  { examId: 'EX003', examName: '康复技能评定', category: '康复指导', totalScore: 100, passingScore: 70, myScore: 0, status: '进行中', duration: 90, totalQuestions: 60, correctRate: 0, timeSpent: '32分钟' },
  { examId: 'EX004', examName: '慢病管理能力考核', category: '疾病科普', totalScore: 100, passingScore: 60, myScore: 78, status: '已完成', duration: 60, totalQuestions: 50, correctRate: 78, completedDate: '2026-04-18', timeSpent: '52分钟' },
  { examId: 'EX005', examName: '营养支持规范考试', category: '饮食建议', totalScore: 100, passingScore: 60, myScore: 0, status: '未开始', duration: 45, totalQuestions: 35, correctRate: 0 },
];

// ============ 题库练习数据 ============
const questionBankData: Question[] = [
  { id: 'Q001', type: '单选', question: 'CT检查前，以下哪项不需要特别准备？', options: ['去除金属物品', '空腹4-6小时', '穿着宽松衣物', '签署知情同意书'], correctAnswer: '穿着宽松衣物', explanation: 'CT检查前需去除金属物品、腹部检查需空腹、需签署知情同意书，穿着并非关键。', difficulty: '简单', category: '检查须知' },
  { id: 'Q002', type: '单选', question: '下列哪项是MRI检查的禁忌症？', options: ['骨折', '心脏起搏器植入', '肝囊肿', '腰椎间盘突出'], correctAnswer: '心脏起搏器植入', explanation: 'MRI产生的强磁场会干扰心脏起搏器工作，因此是绝对禁忌症。', difficulty: '中等', category: '检查须知' },
  { id: 'Q003', type: '判断', question: '腹部超声检查前需要禁食8-12小时，禁水4小时。', options: ['正确', '错误'], correctAnswer: '正确', explanation: '腹部超声检查前禁食8-12小时、禁水4小时是为了保证检查视野清晰，减少呕吐误吸风险。', difficulty: '简单', category: '检查须知' },
  { id: 'Q004', type: '多选', question: '术前抗凝药物（如阿司匹林）需要停用，以下说法正确的有？', options: ['需术前7天停用', '华法林不需停用', '停药期间需评估血栓风险', '所有抗凝药都需停用'], correctAnswer: ['需术前7天停用', '停药期间需评估血栓风险'], explanation: '阿司匹林等抗血小板药物需术前7天停用，华法林等抗凝药需根据情况决定是否停用或用低分子肝素替代。', difficulty: '困难', category: '术前准备' },
  { id: 'Q005', type: '单选', question: '术后镇痛管理的多模式镇痛不包括以下哪项？', options: ['NSAIDs药物', '阿片类药物', '单一用药', '非药物镇痛'], correctAnswer: '单一用药', explanation: '多模式镇痛强调联合使用不同作用机制的镇痛药物和方法，以达到协同镇痛、减少单一用药副作用的目的。', difficulty: '中等', category: '术后护理' },
  { id: 'Q006', type: '判断', question: '术后早期活动有助于预防深静脉血栓形成。', options: ['正确', '错误'], correctAnswer: '正确', explanation: '术后早期活动可促进血液循环，减少深静脉血栓（DVT）的风险，是术后快速康复（ERAS）的重要组成部分。', difficulty: '简单', category: '术后护理' },
  { id: 'Q007', type: '单选', question: '心脏康复分为几期？', options: ['1期', '2期', '3期', '4期'], correctAnswer: '3期', explanation: '心脏康复分为三期：I期（住院期）、II期（门诊康复期3-6个月）、III期（长期维护期需终身坚持）。', difficulty: '中等', category: '康复指导' },
  { id: 'Q008', type: '多选', question: '高血压的非药物治疗方法包括？', options: ['低盐饮食', '规律运动', '控制体重', '立即开始药物治疗'], correctAnswer: ['低盐饮食', '规律运动', '控制体重'], explanation: '高血压管理首先推荐非药物措施，包括低盐饮食（<6g/日）、规律有氧运动、控制体重、戒烟限酒等。', difficulty: '简单', category: '疾病科普' },
  { id: 'Q009', type: '简答', question: '请简述糖尿病患者饮食管理的核心原则。', correctAnswer: '控制总热量、均衡营养、少量多餐、低GI食物', explanation: '糖尿病饮食核心是控制总热量、均衡营养、规律进食，选择低升糖指数（GI）食物，参考糖尿病餐盘法进行搭配。', difficulty: '中等', category: '饮食建议' },
  { id: 'Q010', type: '单选', question: '化疗期间出现恶心呕吐时，以下哪种食物有助于缓解？', options: ['辛辣食物', '油腻食物', '生姜或柠檬', '咖啡'], correctAnswer: '生姜或柠檬', explanation: '生姜、柠檬等清淡酸味食物有助于缓解化疗相关的恶心呕吐，应少食多餐、选择清淡易消化食物。', difficulty: '简单', category: '饮食建议' },
];

// ============ 培训档案数据 ============
const trainingRecordsData: TrainingRecord[] = [
  { recordId: 'TR001', trainingName: '2026年新员工岗前培训', trainingType: '岗前培训', date: '2026-01-15', hours: 40, score: 95, certificate: '岗前培训合格证', instructor: '人事处', status: '已完成', location: '学术报告厅' },
  { recordId: 'TR002', trainingName: '手术室安全与管理', trainingType: '在职培训', date: '2026-02-20', hours: 16, score: 88, certificate: '手术室培训证书', instructor: '手术室护理部', status: '已完成', location: '技能培训中心' },
  { recordId: 'TR003', trainingName: '患者安全与风险管理', trainingType: '专题讲座', date: '2026-03-10', hours: 8, score: 92, certificate: '安全培训证书', instructor: '医务处', status: '已完成', location: '行政楼会议室' },
  { recordId: 'TR004', trainingName: '心肺复苏技能考核', trainingType: '技能考核', date: '2026-03-25', hours: 4, score: 100, certificate: 'BLS证书', instructor: '急诊科', status: '已完成', location: '急诊科示教室' },
  { recordId: 'TR005', trainingName: '国际医学教育研讨会', trainingType: '学术会议', date: '2026-04-12', hours: 24, score: undefined, certificate: '学分证书', instructor: '外聘专家', status: '已完成', location: '线上会议' },
  { recordId: 'TR006', trainingName: '护理科研方法培训', trainingType: '在职培训', date: '2026-04-28', hours: 12, score: undefined, instructor: '护理部', status: '进行中', location: '护理部会议室' },
];

// ============ 每周计划数据 ============
const weeklyPlanData: WeeklyPlan = {
  planId: 'WP001',
  weekStart: '2026-04-28',
  weekEnd: '2026-05-04',
  totalHours: 40,
  completedHours: 24,
  items: [
    { id: 'WP001-1', title: '学习CT检查注意事项', type: '学习', date: '2026-04-28', startTime: '09:00', endTime: '10:30', status: '已完成', description: '完成CT检查宣教课程学习', category: '检查须知' },
    { id: 'WP001-2', title: '术前准备知识考核', type: '考核', date: '2026-04-28', startTime: '14:00', endTime: '15:00', status: '已完成', description: '参加术前准备在线考核', category: '术前准备' },
    { id: 'WP001-3', title: '术后护理题库练习', type: '练习', date: '2026-04-29', startTime: '10:00', endTime: '11:00', status: '已完成', description: '完成术后护理相关题目练习', category: '术后护理' },
    { id: 'WP001-4', title: '科室业务学习', type: '会议', date: '2026-04-29', startTime: '15:00', endTime: '17:00', status: '已完成', description: '参加科室每周业务学习会议' },
    { id: 'WP001-5', title: '康复指导视频学习', type: '学习', date: '2026-04-30', startTime: '09:30', endTime: '11:00', status: '已完成', description: '学习脑卒中患者康复指导视频', category: '康复指导' },
    { id: 'WP001-6', title: '慢病管理能力考核', type: '考核', date: '2026-04-30', startTime: '14:00', endTime: '15:00', status: '进行中', description: '完成慢病管理能力在线考核', category: '疾病科普' },
    { id: 'WP001-7', title: '围手术期营养支持学习', type: '学习', date: '2026-05-02', startTime: '10:00', endTime: '11:30', status: '待执行', description: '学习围手术期营养支持课程', category: '饮食建议' },
    { id: 'WP001-8', title: '题库练习-检查须知', type: '练习', date: '2026-05-03', startTime: '09:00', endTime: '10:00', status: '待执行', description: '完成检查须知相关题库练习', category: '检查须知' },
    { id: 'WP001-9', title: '月度护理技能考核', type: '考核', date: '2026-05-04', startTime: '14:00', endTime: '16:00', status: '待执行', description: '参加月度护理技能操作考核' },
  ]
};

// ============ 分类配置 ============
const categoryConfig: Record<Category, { icon: React.ReactNode; color: string; desc: string }> = {
  '检查须知': { icon: <Scan size={18} />, color: '#3b82f6', desc: '各类检查前准备与注意事项' },
  '术前准备': { icon: <ClipboardList size={18} />, color: '#8b5cf6', desc: '手术前准备工作与评估' },
  '术后护理': { icon: <Stethoscope size={18} />, color: '#ec4899', desc: '手术后护理与并发症预防' },
  '康复指导': { icon: <Activity size={18} />, color: '#10b981', desc: '术后康复训练与功能恢复' },
  '饮食建议': { icon: <Utensils size={18} />, color: '#f59e0b', desc: '围手术期及慢病饮食指导' },
  '疾病科普': { icon: <BookOpen size={18} />, color: '#6366f1', desc: '常见疾病知识与预防' }
};

// ============ Tab配置 ============
const tabConfig: Record<TabType, { icon: React.ReactNode; color: string }> = {
  '资料库': { icon: <BookOpen size={18} />, color: '#6366f1' },
  '学习进度': { icon: <TrendingUp size={18} />, color: '#10b981' },
  '在线考核': { icon: <FileCheck size={18} />, color: '#f59e0b' },
  '题库练习': { icon: <ListChecks size={18} />, color: '#3b82f6' },
  '培训档案': { icon: <GraduationCap size={18} />, color: '#8b5cf6' },
  '每周计划': { icon: <Calendar size={18} />, color: '#ec4899' },
};

// ============ Styles ============
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  // Tab导航
  tabNav: { display: 'flex', gap: 8, marginBottom: 20, background: '#fff', padding: '8px 12px', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tabItem: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s', border: 'none', background: 'transparent', color: '#64748b' },
  tabItemActive: { background: '#f1f5f9', color: '#1a3a5c', fontWeight: 600 },
  // 分类导航
  categoryNav: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 },
  categoryCard: { background: '#fff', borderRadius: 10, padding: 16, cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  categoryCardActive: { borderColor: '#1a3a5c', background: '#f8fafc' },
  categoryIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  categoryName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 2 },
  categoryCount: { fontSize: 11, color: '#94a3b8' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  searchRow: { display: 'flex', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  filterSelect: { padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', minWidth: 120 },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  contentCard: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s' },
  cardThumb: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  typeBadge: { position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, color: '#fff' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 6, lineHeight: 1.4 },
  cardSummary: { fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#94a3b8' },
  viewCount: { display: 'flex', alignItems: 'center', gap: 3 },
  typeIcon: { display: 'flex', alignItems: 'center', gap: 4 },
  tag: { display: 'inline-block', padding: '2px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontSize: 10, marginRight: 4 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 12, width: 720, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', flex: 1 },
  modalBody: { padding: 20 },
  modalFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #e2e8f0' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 },
  contentText: { fontSize: 13, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' },
  qrSection: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  qrBox: { background: '#f8fafc', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #e2e8f0' },
  qrTitle: { fontSize: 12, color: '#64748b', marginTop: 8 },
  noData: { textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 },
  totalStats: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 32 },
  totalItem: { textAlign: 'center' },
  totalValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  totalLabel: { fontSize: 12, color: '#64748b' },
  // 搜索筛选栏
  filterRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: '#fff',
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    flexWrap: 'wrap' as const,
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: '#64748b',
    minHeight: 44,
  },
  progressSection: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  progressCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  progressItem: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s' },
  progressBar: { height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  // 考核样式
  examCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  examHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  examStatus: { padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  // 题库样式
  questionCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  difficultyBadge: { padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 },
  optionItem: { padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' },
  optionSelected: { background: '#dbeafe', borderColor: '#3b82f6' },
  // 档案样式
  archiveCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  archiveHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  archiveBadge: { padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  // 计划样式
  planSummary: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 24 },
  planItem: { background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' },
  planTime: { minWidth: 60, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' },
  planContent: { flex: 1 },
  planStatus: { padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 },
};

// ============ Component ============
export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('资料库');
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [activeType, setActiveType] = useState<string>('全部');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<EducationItem | null>(null);
  const [viewedItems, setViewedItems] = useState<string[]>([]);
  
  // 题库练习状态
  const [practiceCategory, setPracticeCategory] = useState<Category | '全部'>('全部');
  const [practiceDifficulty, setPracticeDifficulty] = useState<string>('全部');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  // 统计数据
  const totalViews = educationData.reduce((sum, item) => sum + item.views, 0);
  const totalItems = educationData.length;
  const todayViews = 1247;
  const videoCount = educationData.filter(i => i.type === '视频').length;
  const pdfCount = educationData.filter(i => i.type === 'PDF').length;
  const imageCount = educationData.filter(i => i.type === '图文').length;

  // 各分类统计
  const categoryStats = Object.keys(categoryConfig).map(cat => ({
    name: cat as Category,
    count: educationData.filter(i => i.category === cat).length,
    ...categoryConfig[cat as Category]
  }));

  // 过滤数据
  const filteredData = educationData.filter(item => {
    const matchCategory = activeCategory === '全部' || item.category === activeCategory;
    const matchType = activeType === '全部' || item.type === activeType;
    const matchSearch = search === '' || item.title.includes(search) || item.summary.includes(search) || item.tags.some(tag => tag.includes(search));
    return matchCategory && matchType && matchSearch;
  });

  // 过滤题库
  const filteredQuestions = questionBankData.filter(q => {
    const matchCategory = practiceCategory === '全部' || q.category === practiceCategory;
    const matchDifficulty = practiceDifficulty === '全部' || q.difficulty === practiceDifficulty;
    return matchCategory && matchDifficulty;
  });

  // 学习进度统计
  const totalLearningHours = learningProgressData.reduce((sum, p) => sum + parseFloat(p.totalTimeSpent), 0);
  const completedCourses = learningProgressData.filter(p => p.progressPercent === 100).length;
  const inProgressCourses = learningProgressData.filter(p => p.isInProgress).length;
  const overallProgress = Math.round(learningProgressData.reduce((sum, p) => sum + p.progressPercent, 0) / learningProgressData.length);

  // 考核统计
  const completedExams = examData.filter(e => e.status === '已完成').length;
  const passedExams = examData.filter(e => e.status === '已完成' && e.myScore >= e.passingScore).length;
  const avgScore = Math.round(examData.filter(e => e.myScore > 0).reduce((sum, e) => sum + e.myScore, 0) / examData.filter(e => e.myScore > 0).length);

  // 培训统计
  const totalTrainingHours = trainingRecordsData.reduce((sum, r) => sum + r.hours, 0);
  const completedTrainings = trainingRecordsData.filter(r => r.status === '已完成').length;
  const avgTrainingScore = Math.round(trainingRecordsData.filter(r => r.score).reduce((sum, r) => sum + (r.score || 0), 0) / trainingRecordsData.filter(r => r.score).length);

  // 点击查看详情
  const handleViewDetail = (item: EducationItem) => {
    setSelectedItem(item);
    if (!viewedItems.includes(item.id)) {
      setViewedItems(prev => [...prev, item.id]);
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case '图文': return <Image size={14} />;
      case '视频': return <Video size={14} />;
      case 'PDF': return <FileText size={14} />;
    }
  };

  // 获取类型颜色
  const getTypeColor = (type: MaterialType) => {
    switch (type) {
      case '图文': return '#3b82f6';
      case '视频': return '#ec4899';
      case 'PDF': return '#ef4444';
    }
  };

  // 获取分类颜色
  const getCategoryColor = (category: Category) => {
    return categoryConfig[category]?.color || '#6366f1';
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return '#10b981';
      case '进行中': return '#f59e0b';
      case '未开始': case '待执行': return '#94a3b8';
      default: return '#64748b';
    }
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return '#10b981';
      case '中等': return '#f59e0b';
      case '困难': return '#ef4444';
      default: return '#64748b';
    }
  };

  // 渲染分类卡片
  const renderCategoryCard = (cat: typeof categoryStats[0] | { name: '全部'; count: number; icon: React.ReactNode; color: string; desc: string }) => (
    <div
      key={cat.name}
      style={{
        ...styles.categoryCard,
        ...(activeCategory === cat.name ? styles.categoryCardActive : {})
      }}
      onClick={() => setActiveCategory(cat.name as Category | '全部')}
    >
      <div style={{ ...styles.categoryIcon, background: cat.color + '20', color: cat.color }}>
        {cat.icon}
      </div>
      <div style={styles.categoryName}>{cat.name}</div>
      <div style={styles.categoryCount}>{cat.count}篇</div>
    </div>
  );

  // 渲染Tab
  const renderTab = (tab: TabType) => (
    <button
      key={tab}
      style={{
        ...styles.tabItem,
        ...(activeTab === tab ? styles.tabItemActive : {}),
        color: activeTab === tab ? tabConfig[tab].color : '#64748b',
        background: activeTab === tab ? tabConfig[tab].color + '15' : 'transparent',
      }}
      onClick={() => setActiveTab(tab)}
    >
      {tabConfig[tab].icon}
      {tab}
      {tab === '在线考核' && examData.filter(e => e.status === '进行中').length > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
          {examData.filter(e => e.status === '进行中').length}
        </span>
      )}
    </button>
  );

  // 处理答题
  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setShowExplanation(true);
    const currentQ = filteredQuestions[currentQuestionIndex];
    const isCorrect = Array.isArray(currentQ.correctAnswer) 
      ? currentQ.correctAnswer.includes(selectedAnswer)
      : currentQ.correctAnswer === selectedAnswer;
    if (isCorrect) {
      setPracticeScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setPracticeScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsPracticeMode(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const startPractice = () => {
    setIsPracticeMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setPracticeScore({ correct: 0, total: 0 });
  };

  // ============ 渲染各Tab内容 ============
  const renderContent = () => {
    switch (activeTab) {
      case '资料库':
        return renderMaterialLibrary();
      case '学习进度':
        return renderLearningProgress();
      case '在线考核':
        return renderOnlineExam();
      case '题库练习':
        return renderQuestionPractice();
      case '培训档案':
        return renderTrainingArchive();
      case '每周计划':
        return renderWeeklyPlan();
      default:
        return renderMaterialLibrary();
    }
  };

  // 资料库
  const renderMaterialLibrary = () => (
    <>
      {/* 总统计 */}
      <div style={styles.totalStats}>
        <div style={styles.totalItem}>
          <div style={styles.totalValue}>{totalItems}</div>
          <div style={styles.totalLabel}>资料总数</div>
        </div>
        <div style={styles.totalItem}>
          <div style={styles.totalValue}>{totalViews.toLocaleString()}</div>
          <div style={styles.totalLabel}>总阅读量</div>
        </div>
        <div style={styles.totalItem}>
          <div style={styles.totalValue}>{todayViews.toLocaleString()}</div>
          <div style={styles.totalLabel}>今日阅读</div>
        </div>
        <div style={{ ...styles.totalItem, display: 'flex', gap: 16 }}>
          <div>
            <div style={{ ...styles.totalValue, fontSize: 20, color: '#3b82f6' }}>{imageCount}</div>
            <div style={styles.totalLabel}>图文</div>
          </div>
          <div>
            <div style={{ ...styles.totalValue, fontSize: 20, color: '#ec4899' }}>{videoCount}</div>
            <div style={styles.totalLabel}>视频</div>
          </div>
          <div>
            <div style={{ ...styles.totalValue, fontSize: 20, color: '#ef4444' }}>{pdfCount}</div>
            <div style={styles.totalLabel}>PDF</div>
          </div>
        </div>
      </div>

      {/* 分类导航 */}
      <div style={styles.categoryNav}>
        {renderCategoryCard({ name: '全部', count: totalItems, icon: <BookOpen size={18} />, color: '#1a3a5c', desc: '所有分类' })}
        {categoryStats.map(renderCategoryCard)}
      </div>

      {/* 搜索筛选 */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="搜索资料标题/摘要/标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.filterSelect} value={activeType} onChange={e => setActiveType(e.target.value)}>
          <option value="全部">全部类型</option>
          <option value="图文">图文</option>
          <option value="视频">视频</option>
          <option value="PDF">PDF</option>
        </select>
      </div>

      {/* 资料列表 */}
      <div style={styles.contentGrid}>
        {filteredData.length === 0 ? (
          <div style={{ ...styles.contentCard, gridColumn: '1/-1', padding: 40, textAlign: 'center' }}>
            <BookOpen size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ color: '#94a3b8', fontSize: 14 }}>暂无符合条件的资料</div>
          </div>
        ) : filteredData.map(item => (
          <div key={item.id} style={styles.contentCard} onClick={() => handleViewDetail(item)}>
            <div style={{ ...styles.cardThumb, background: `linear-gradient(135deg, ${getCategoryColor(item.category)}15, ${getCategoryColor(item.category)}30)` }}>
              {item.type === '视频' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: '50%', background: 'rgba(236,72,153,0.9)' }}>
                  <Play size={24} color="#fff" fill="#fff" />
                </div>
              ) : item.type === 'PDF' ? (
                <FileText size={48} color="#ef4444" />
              ) : (
                <Image size={48} color="#3b82f6" />
              )}
              <span style={{ ...styles.typeBadge, background: getTypeColor(item.type) }}>
                {getTypeIcon(item.type)} {item.type}
              </span>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>{item.title}</div>
              <div style={styles.cardSummary}>{item.summary}</div>
              <div style={{ marginBottom: 8 }}>
                {item.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={styles.tag}>{tag}</span>
                ))}
              </div>
              <div style={styles.cardMeta}>
                <span style={styles.viewCount}><Eye size={12} /> {item.views.toLocaleString()}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {item.publishDate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // 学习进度
  const renderLearningProgress = () => (
    <>
      {/* 学习进度统计 */}
      <div style={styles.progressSection}>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>总学习时长</div>
          <div style={{ ...styles.statValue, color: '#6366f1' }}>{totalLearningHours}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>小时</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>已完成课程</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{completedCourses}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>门课程</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>进行中课程</div>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{inProgressCourses}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>门课程</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>综合进度</div>
          <div style={{ ...styles.statValue, color: '#ec4899' }}>{overallProgress}%</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>较上周+5%</div>
        </div>
      </div>

      {/* 课程列表 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookMarked size={18} color="#6366f1" />
          我的学习课程
        </div>
        {learningProgressData.map(course => (
          <div key={course.courseId} style={styles.progressItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{course.courseName}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock3 size={10} /> {course.totalTimeSpent}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={10} /> {course.lastStudyDate}
                  </span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: getCategoryColor(course.category) + '20', color: getCategoryColor(course.category), fontSize: 10 }}>
                    {course.category}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: course.progressPercent === 100 ? '#10b981' : '#1a3a5c' }}>
                  {course.progressPercent}%
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>
                  {course.completedItems}/{course.totalItems} 课时
                </div>
              </div>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${course.progressPercent}%`, background: course.progressPercent === 100 ? '#10b981' : course.progressPercent > 50 ? '#3b82f6' : '#f59e0b' }} />
            </div>
            {course.progressPercent === 100 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: '#10b981', fontSize: 11 }}>
                <Award size={12} /> 已完成全部课时，获得结业证书
              </div>
            )}
            {course.isInProgress && course.progressPercent < 100 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: '#f59e0b', fontSize: 11 }}>
                <RefreshCw size={12} /> 继续学习未完成的 {course.totalItems - course.completedItems} 课时
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  // 在线考核
  const renderOnlineExam = () => (
    <>
      {/* 考核统计 */}
      <div style={styles.progressSection}>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>考核总数</div>
          <div style={{ ...styles.statValue, color: '#6366f1' }}>{examData.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>场考核</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>已完成</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{completedExams}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>场</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>通过考试</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{passedExams}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>场通过</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>平均分</div>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{avgScore || '--'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>分</div>
        </div>
      </div>

      {/* 考核列表 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCheck size={18} color="#f59e0b" />
          考核记录
        </div>
        {examData.map(exam => (
          <div key={exam.examId} style={styles.examCard}>
            <div style={styles.examHeader}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{exam.examName}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock3 size={10} /> {exam.duration}分钟
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ListChecks size={10} /> {exam.totalQuestions}题
                  </span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: getCategoryColor(exam.category) + '20', color: getCategoryColor(exam.category), fontSize: 10 }}>
                    {exam.category}
                  </span>
                </div>
              </div>
              <span style={{ ...styles.examStatus, background: getStatusColor(exam.status) + '20', color: getStatusColor(exam.status) }}>
                {exam.status === '已完成' ? <><Trophy size={10} style={{ marginRight: 3 }} />{exam.status}</> : 
                 exam.status === '进行中' ? <><RefreshCw size={10} style={{ marginRight: 3 }} />{exam.status}</> : exam.status}
              </span>
            </div>
            
            {exam.status === '已完成' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: exam.myScore >= exam.passingScore ? '#10b981' : '#ef4444' }}>{exam.myScore}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>我的得分</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>{exam.passingScore}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>及格分数</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{exam.correctRate}%</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>正确率</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                  <Medal size={12} /> {exam.completedDate} | 用时{exam.timeSpent}
                </div>
              </div>
            ) : exam.status === '进行中' ? (
              <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>已用时：32分钟</span>
                  <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>剩余28分钟</span>
                </div>
                <button style={{ width: '100%', padding: '10px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <RefreshCw size={14} /> 继续答题
                </button>
              </div>
            ) : (
              <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>及格分数：{exam.passingScore}分 | 时长：{exam.duration}分钟</span>
                <button style={{ padding: '8px 16px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Play size={12} /> 开始考核
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  // 题库练习
  const renderQuestionPractice = () => (
    <>
      {!isPracticeMode ? (
        <>
          {/* 练习统计 */}
          <div style={styles.progressSection}>
            <div style={styles.progressCard}>
              <div style={styles.statLabel}>题目总数</div>
              <div style={{ ...styles.statValue, color: '#6366f1' }}>{questionBankData.length}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>道题目</div>
            </div>
            <div style={styles.progressCard}>
              <div style={styles.statLabel}>已完成</div>
              <div style={{ ...styles.statValue, color: '#10b981' }}>{practiceScore.total}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>道</div>
            </div>
            <div style={styles.progressCard}>
              <div style={styles.statLabel}>正确率</div>
              <div style={{ ...styles.statValue, color: practiceScore.total > 0 ? (practiceScore.correct / practiceScore.total >= 0.8 ? '#10b981' : '#f59e0b') : '#94a3b8' }}>
                {practiceScore.total > 0 ? Math.round(practiceScore.correct / practiceScore.total * 100) : 0}%
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>正确率</div>
            </div>
            <div style={styles.progressCard}>
              <div style={{ ...styles.statLabel, marginBottom: 8 }}>快速开始</div>
              <button 
                onClick={startPractice}
                style={{ width: '100%', padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Play size={14} /> 开始练习
              </button>
            </div>
          </div>

          {/* 筛选 */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 12 }}>
            <select 
              style={{ ...styles.filterSelect, flex: 1 }} 
              value={practiceCategory} 
              onChange={e => setPracticeCategory(e.target.value as Category | '全部')}
            >
              <option value="全部">全部分类</option>
              {Object.keys(categoryConfig).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select 
              style={{ ...styles.filterSelect, flex: 1 }} 
              value={practiceDifficulty} 
              onChange={e => setPracticeDifficulty(e.target.value)}
            >
              <option value="全部">全部难度</option>
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
          </div>

          {/* 题目列表 */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListChecks size={18} color="#3b82f6" />
              题目列表 ({filteredQuestions.length}道)
            </div>
            {filteredQuestions.map((q, idx) => (
              <div key={q.id} style={styles.questionCard} onClick={() => { startPractice(); setCurrentQuestionIndex(idx); }}>
                <div style={styles.questionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                      {idx + 1}
                    </span>
                    <span style={{ background: getDifficultyColor(q.difficulty) + '20', color: getDifficultyColor(q.difficulty), padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                      {q.difficulty}
                    </span>
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: 4, fontSize: 10 }}>
                      {q.type}
                    </span>
                  </div>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: getCategoryColor(q.category) + '20', color: getCategoryColor(q.category), fontSize: 10 }}>
                    {q.category}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#1a3a5c', lineHeight: 1.6 }}>{q.question}</div>
                {q.options && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#64748b', padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                        {String.fromCharCode(65 + i)}.{opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 练习模式 */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>第 {currentQuestionIndex + 1} / {filteredQuestions.length} 题</span>
              <span style={{ padding: '4px 10px', borderRadius: 12, background: getDifficultyColor(filteredQuestions[currentQuestionIndex].difficulty) + '20', color: getDifficultyColor(filteredQuestions[currentQuestionIndex].difficulty), fontSize: 11, fontWeight: 600 }}>
                {filteredQuestions[currentQuestionIndex].difficulty}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b' }}>
              <span>正确: <strong style={{ color: '#10b981' }}>{practiceScore.correct}</strong></span>
              <span>错误: <strong style={{ color: '#ef4444' }}>{practiceScore.total - practiceScore.correct}</strong></span>
            </div>
          </div>

          <div style={styles.questionCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                {filteredQuestions[currentQuestionIndex].type}
              </span>
              <span style={{ padding: '2px 6px', borderRadius: 4, background: getCategoryColor(filteredQuestions[currentQuestionIndex].category) + '20', color: getCategoryColor(filteredQuestions[currentQuestionIndex].category), fontSize: 10 }}>
                {filteredQuestions[currentQuestionIndex].category}
              </span>
            </div>
            <div style={{ fontSize: 15, color: '#1a3a5c', lineHeight: 1.7, marginBottom: 20 }}>
              {filteredQuestions[currentQuestionIndex].question}
            </div>
            
            {filteredQuestions[currentQuestionIndex].options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredQuestions[currentQuestionIndex].options!.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = showExplanation && opt === filteredQuestions[currentQuestionIndex].correctAnswer;
                  const isWrong = showExplanation && isSelected && opt !== filteredQuestions[currentQuestionIndex].correctAnswer;
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.optionItem,
                        ...(isSelected && !showExplanation ? styles.optionSelected : {}),
                        ...(isCorrect ? { background: '#dcfce7', borderColor: '#10b981' } : {}),
                        ...(isWrong ? { background: '#fee2e2', borderColor: '#ef4444' } : {}),
                        cursor: showExplanation ? 'default' : 'pointer',
                      }}
                      onClick={() => handleAnswerSelect(opt)}
                    >
                      <span style={{ fontWeight: 600, marginRight: 8, color: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#64748b' }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                      {isCorrect && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
                      {isWrong && <Circle size={16} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {showExplanation && (
              <div style={{ marginTop: 16, padding: 14, background: '#fef3c7', borderRadius: 8, border: '1px solid #fbbf24' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} /> 答案解析
                </div>
                <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
                  {filteredQuestions[currentQuestionIndex].explanation}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {!showExplanation ? (
              <>
                <button 
                  style={{ flex: 1, padding: '12px 16px', background: selectedAnswer ? '#3b82f6' : '#e2e8f0', color: selectedAnswer ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: selectedAnswer ? 'pointer' : 'not-allowed' }}
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                >
                  提交答案
                </button>
                <button 
                  style={{ padding: '12px 16px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
                  onClick={() => setIsPracticeMode(false)}
                >
                  退出练习
                </button>
              </>
            ) : (
              <>
                <button 
                  style={{ flex: 1, padding: '12px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < filteredQuestions.length - 1 ? '下一题' : '完成练习'}
                </button>
                <button 
                  style={{ padding: '12px 16px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
                  onClick={() => setIsPracticeMode(false)}
                >
                  退出
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );

  // 培训档案
  const renderTrainingArchive = () => (
    <>
      {/* 培训统计 */}
      <div style={styles.progressSection}>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>培训总数</div>
          <div style={{ ...styles.statValue, color: '#6366f1' }}>{trainingRecordsData.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>次培训</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>完成培训</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{completedTrainings}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>次</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>总学时</div>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{totalTrainingHours}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>小时</div>
        </div>
        <div style={styles.progressCard}>
          <div style={styles.statLabel}>平均成绩</div>
          <div style={{ ...styles.statValue, color: '#ec4899' }}>{avgTrainingScore || '--'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>分</div>
        </div>
      </div>

      {/* 培训类型统计 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 16 }}>
        {['岗前培训', '在职培训', '专题讲座', '技能考核', '学术会议'].map(type => {
          const count = trainingRecordsData.filter(r => r.trainingType === type).length;
          return (
            <div key={type} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>{count}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{type}</div>
            </div>
          );
        })}
      </div>

      {/* 培训记录列表 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GraduationCap size={18} color="#8b5cf6" />
          培训记录
        </div>
        {trainingRecordsData.map(record => (
          <div key={record.recordId} style={styles.archiveCard}>
            <div style={styles.archiveHeader}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{record.trainingName}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={10} /> {record.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock3 size={10} /> {record.hours}小时
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <BookOpen size={10} /> {record.instructor}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ ...styles.archiveBadge, background: getStatusColor(record.status) + '20', color: getStatusColor(record.status) }}>
                  {record.status}
                </span>
                {record.score && (
                  <div style={{ fontSize: 16, fontWeight: 700, color: record.score >= 90 ? '#10b981' : record.score >= 60 ? '#f59e0b' : '#ef4444', marginTop: 4 }}>
                    {record.score}分
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span style={{ padding: '4px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontSize: 10 }}>
                {record.trainingType}
              </span>
              <span style={{ padding: '4px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontSize: 10 }}>
                {record.location}
              </span>
              {record.certificate && (
                <span style={{ padding: '4px 8px', background: '#dbeafe', color: '#3b82f6', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Award size={10} /> {record.certificate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // 每周计划
  const renderWeeklyPlan = () => (
    <>
      {/* 计划概览 */}
      <div style={styles.planSummary}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>本周时间</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{weeklyPlanData.weekStart} ~ {weeklyPlanData.weekEnd}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>计划学时</div>
          <div style={{ fontSize: 20, fontWeight:  700, color: '#6366f1' }}>{weeklyPlanData.totalHours}<span style={{ fontSize: 12, fontWeight: 400 }}>小时</span></div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>已完成</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{weeklyPlanData.completedHours}<span style={{ fontSize: 12, fontWeight: 400 }}>小时</span></div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>完成进度</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{Math.round(weeklyPlanData.completedHours / weeklyPlanData.totalHours * 100)}%</div>
        </div>
      </div>

      {/* 进度条 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>本周学习进度</span>
          <span style={{ fontSize: 13, color: '#64748b' }}>{weeklyPlanData.completedHours} / {weeklyPlanData.totalHours} 小时</span>
        </div>
        <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(weeklyPlanData.completedHours / weeklyPlanData.totalHours * 100)}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* 每日计划 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="#ec4899" />
          每日安排
        </div>
        
        {['2026-04-28', '2026-04-29', '2026-04-30', '2026-05-02', '2026-05-03', '2026-05-04'].map(date => {
          const dayItems = weeklyPlanData.items.filter(item => item.date === date);
          const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          const dayName = dayNames[new Date(date).getDay()];
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{date}</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>{dayName}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
                  {dayItems.filter(i => i.status === '已完成').length}/{dayItems.length} 已完成
                </span>
              </div>
              {dayItems.map(item => (
                <div key={item.id} style={styles.planItem}>
                  <div style={{ ...styles.planTime, background: item.status === '已完成' ? '#dcfce7' : item.status === '进行中' ? '#fef3c7' : '#f8fafc' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1a3a5c' }}>{item.startTime}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{item.endTime}</div>
                  </div>
                  <div style={styles.planContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ 
                        padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                        background: item.type === '学习' ? '#3b82f620' : item.type === '考核' ? '#f59e0b20' : item.type === '练习' ? '#10b98120' : item.type === '会议' ? '#8b5cf620' : '#6474820',
                        color: item.type === '学习' ? '#3b82f6' : item.type === '考核' ? '#f59e0b' : item.type === '练习' ? '#10b981' : item.type === '会议' ? '#8b5cf6' : '#64748b'
                      }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.description}</div>
                    {item.category && (
                      <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 6px', background: getCategoryColor(item.category) + '20', color: getCategoryColor(item.category), borderRadius: 4, fontSize: 10 }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ ...styles.planStatus, background: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}>
                      {item.status === '已完成' ? <CheckCircle2 size={10} style={{ marginRight: 2 }} /> : 
                       item.status === '进行中' ? <RefreshCw size={10} style={{ marginRight: 2 }} /> : <Circle size={10} style={{ marginRight: 2 }} />}
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div style={styles.root}>
      {/* 标题 */}
      <div style={styles.header}>
        <div style={styles.title}>
          <BookOpen size={22} color="#6366f1" />
          患者教育中心
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#64748b', minHeight: 44 }}>
            <Download size={14} /> 导出资料
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 500, minHeight: 44 }}>
            <FileText size={14} /> 新增教材
          </button>
        </div>
      </div>

      {/* 搜索筛选栏 */}
      <div style={styles.filterRow}>
        <Search size={14} color="#64748b" />
        <input
          style={{ ...styles.searchInput, border: '1px solid #e2e8f0', outline: 'none', flex: 1, minHeight: 44, padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
          placeholder="搜索教材标题..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...styles.filterBtn, borderRadius: 6 }}>
          <option>全部类型</option>
          <option>视频</option>
          <option>图文</option>
          <option>PDF</option>
        </select>
        <select style={{ ...styles.filterBtn, borderRadius: 6 }}>
          <option>全部分类</option>
          <option>检查准备</option>
          <option>术后指导</option>
          <option>健康科普</option>
        </select>
      </div>

      {/* Tab导航 */}
      <div style={styles.tabNav}>
        {(Object.keys(tabConfig) as TabType[]).map(tab => renderTab(tab))}
      </div>

      {/* Tab内容 */}
      {renderContent()}

      {/* 详情弹窗 */}
      {selectedItem && (
        <div style={styles.modal} onClick={() => setSelectedItem(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: getCategoryColor(selectedItem.category) + '20', color: getCategoryColor(selectedItem.category) }}>
                    {selectedItem.category}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: getTypeColor(selectedItem.type) + '20', color: getTypeColor(selectedItem.type), display: 'flex', alignItems: 'center', gap: 3 }}>
                    {getTypeIcon(selectedItem.type)} {selectedItem.type}
                  </span>
                </div>
                <div style={styles.modalTitle}>{selectedItem.title}</div>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              {/* 元信息 */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>作者: <strong style={{ color: '#1a3a5c' }}>{selectedItem.author}</strong></span>
                <span style={{ fontSize: 12, color: '#64748b' }}>发布: <strong style={{ color: '#1a3a5c' }}>{selectedItem.publishDate}</strong></span>
                <span style={{ fontSize: 12, color: '#64748b' }}>阅读: <strong style={{ color: '#1a3a5c' }}>{selectedItem.views.toLocaleString()}</strong></span>
                {selectedItem.duration && <span style={{ fontSize: 12, color: '#64748b' }}>时长: <strong style={{ color: '#1a3a5c' }}>{selectedItem.duration}</strong></span>}
                {selectedItem.pdfPages && <span style={{ fontSize: 12, color: '#64748b' }}>页数: <strong style={{ color: '#1a3a5c' }}>{selectedItem.pdfPages}页</strong></span>}
              </div>
              {/* 摘要 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>摘要</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedItem.summary}</div>
              </div>
              {/* 内容 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>详细内容</div>
                <div style={styles.contentText}>{selectedItem.content}</div>
              </div>
              {/* 标签 */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedItem.tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 10px', background: '#f1f5f9', color: '#64748b', borderRadius: 12, fontSize: 12 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <div style={styles.qrSection}>
                <div style={styles.qrBox}>
                  <QrCode size={80} color="#1a3a5c" />
                  <div style={styles.qrTitle}>扫码分享给患者</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 6 }}>患者端访问</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>扫描上方二维码或访问：</div>
                  <div style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'monospace' }}>patient.hospital.com/edu/{selectedItem.id}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#64748b' }}>
                  <Download size={14} /> 下载
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: '#1a3a5c', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff' }}>
                  <TrendingUp size={14} /> 分享
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
