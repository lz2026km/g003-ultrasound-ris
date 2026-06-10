// ============================================================
// G003 超声RIS系统 - 全流程AI辅助协调器（v0.19.4 P0-3）
// 对标联影 AI PACS + 华声 AI 质控 + 开立 5 大 AI 串联
// 5 模块: 切面识别 → 智能测量 → 报告生成 → 危急值预警 → 影像质控
// ============================================================
import { mockApi } from './mockApi'

export type AIModuleKey = 'plane' | 'measure' | 'report' | 'critical' | 'qc'

export interface AIModuleResult {
  module: AIModuleKey
  moduleName: string
  status: 'pending' | 'running' | 'success' | 'failed'
  progress: number           // 0-100
  result?: any               // 模块输出
  error?: string
  startedAt?: string
  finishedAt?: string
  durationMs?: number
}

export interface FullAIInput {
  examId: string
  examItemName: string
  patientId: string
  patientName: string
  gender?: string
  age?: number
  doctorId?: string
  doctorName?: string
  imageCount?: number         // 已采集图像数
  /** 跳过某些模块（用于手动控制） */
  skipModules?: AIModuleKey[]
}

export interface FullAIOutput {
  examId: string
  totalDurationMs: number
  modules: AIModuleResult[]
  /** 顶层摘要 */
  summary: {
    planeCount: number        // 识别切面数
    measurements: number      // 测量项数
    reportGenerated: boolean
    criticalAlerts: number
    qcScore: number           // 影像质评分
    overallConfidence: number // 总体置信度
  }
}

const MODULE_NAMES: Record<AIModuleKey, string> = {
  plane: '切面识别',
  measure: '智能测量',
  report: '结构化报告',
  critical: '危急值预警',
  qc: '影像质控',
}

const DEFAULT_ORDER: AIModuleKey[] = ['plane', 'measure', 'report', 'critical', 'qc']

/**
 * 单个 AI 模块（mock 模式：对标行业平均 2-5 秒）
 */
async function runModule(
  module: AIModuleKey,
  input: FullAIInput,
  onProgress?: (progress: number) => void
): Promise<AIModuleResult> {
  const startedAt = new Date().toISOString()
  const startTs = Date.now()
  // 模拟 AI 推理进度（2-4 秒）
  const totalMs = 2000 + Math.floor(Math.random() * 2000)
  const tickMs = 100
  const ticks = Math.ceil(totalMs / tickMs)
  let cur = 0
  for (let i = 0; i < ticks; i++) {
    await new Promise(r => setTimeout(r, tickMs))
    cur = Math.min(95, Math.floor((i + 1) / ticks * 100) + Math.floor(Math.random() * 5))
    onProgress?.(cur)
  }
  let result: any = null
  try {
    switch (module) {
      case 'plane':
        // 切面识别：mock 22 切面标准
        const required = input.examItemName?.includes('心脏') ? 28 : input.examItemName?.includes('妇产') ? 16 : 22
        const captured = input.imageCount || Math.floor(required * 0.95)
        result = {
          standard: required,
          captured,
          recognized: Math.floor(captured * 0.97),
          missing: required - captured,
          score: Math.round((captured / required) * 100),
        }
        break
      case 'measure':
        // 智能测量：mock 6-12 项
        const measureCount = 6 + Math.floor(Math.random() * 6)
        result = {
          measurements: measureCount,
          items: Array.from({ length: measureCount }, (_, i) => ({
            name: ['肝右叶最大斜径', '胆囊壁厚度', '脾脏长径', '门静脉内径', '肾盂分离', 'EF值', 'LA内径', 'LV舒张末径'][i % 8],
            value: (Math.random() * 10).toFixed(1),
            unit: ['cm', 'cm', 'cm', 'cm', 'cm', '%', 'mm', 'mm'][i % 8],
            confidence: 0.85 + Math.random() * 0.1,
          })),
        }
        break
      case 'report':
        // 复用 mockApi.generateStructuredReport
        const report = await mockApi.generateStructuredReport({
          examId: input.examId,
          examItemName: input.examItemName,
          patientId: input.patientId,
          patientName: input.patientName,
          gender: input.gender as any,
          age: input.age,
          doctorId: input.doctorId,
          doctorName: input.doctorName,
        })
        result = report
        break
      case 'critical':
        // 危急值预警
        const hasCritical = Math.random() < 0.15
        result = {
          alerts: hasCritical ? [{
            item: '门静脉内径',
            value: '1.5cm',
            threshold: '1.3cm',
            severity: 'high',
            suggestion: '建议增强 CT 进一步评估',
          }] : [],
        }
        break
      case 'qc':
        // 影像质控
        result = {
          clarity: 85 + Math.floor(Math.random() * 10),
          brightness: 80 + Math.floor(Math.random() * 15),
          coverage: 90 + Math.floor(Math.random() * 8),
          overall: 85 + Math.floor(Math.random() * 12),
          issues: Math.random() < 0.3 ? ['部分切面曝光不足'] : [],
        }
        break
    }
    return {
      module,
      moduleName: MODULE_NAMES[module],
      status: 'success',
      progress: 100,
      result,
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startTs,
    }
  } catch (e: any) {
    return {
      module,
      moduleName: MODULE_NAMES[module],
      status: 'failed',
      progress: 0,
      error: e?.message || String(e),
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startTs,
    }
  }
}

/**
 * 全流程 AI 辅助（5 大模块串联）
 * @param input 检查信息
 * @param onModuleStart 模块开始回调
 * @param onModuleProgress 模块进度回调
 * @param onModuleEnd 模块结束回调
 */
export async function runFullUltrasoundAI(
  input: FullAIInput,
  callbacks?: {
    onModuleStart?: (module: AIModuleKey) => void
    onModuleProgress?: (module: AIModuleKey, progress: number) => void
    onModuleEnd?: (result: AIModuleResult) => void
  }
): Promise<FullAIOutput> {
  const order = DEFAULT_ORDER.filter(m => !input.skipModules?.includes(m))
  const modules: AIModuleResult[] = []
  const startTs = Date.now()
  for (const module of order) {
    callbacks?.onModuleStart?.(module)
    const result = await runModule(module, input, (p) => callbacks?.onModuleProgress?.(module, p))
    modules.push(result)
    callbacks?.onModuleEnd?.(result)
  }
  // 计算汇总
  const planeMod = modules.find(m => m.module === 'plane')?.result
  const measureMod = modules.find(m => m.module === 'measure')?.result
  const reportMod = modules.find(m => m.module === 'report')?.result
  const criticalMod = modules.find(m => m.module === 'critical')?.result
  const qcMod = modules.find(m => m.module === 'qc')?.result
  const confidence = reportMod?.confidence || 0.85
  return {
    examId: input.examId,
    totalDurationMs: Date.now() - startTs,
    modules,
    summary: {
      planeCount: planeMod?.recognized || 0,
      measurements: measureMod?.measurements || 0,
      reportGenerated: !!reportMod,
      criticalAlerts: criticalMod?.alerts?.length || 0,
      qcScore: qcMod?.overall || 0,
      overallConfidence: confidence,
    },
  }
}

export const AI_MODULE_NAMES = MODULE_NAMES
export const AI_MODULE_ORDER = DEFAULT_ORDER
