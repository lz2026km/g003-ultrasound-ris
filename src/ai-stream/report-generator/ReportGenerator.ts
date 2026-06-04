/**
 * 报告生成器
 * @version v0.8.0
 * @description 整合 LLM + 模板 + 测量数据，生成结构化超声报告
 */

import { ExamType, PlaneType, AIStreamContext } from '../types';
import { ReportTemplate, ReportSection, REPORT_TEMPLATES } from './ReportTemplates';
import { LLMStreamClient, LLMStreamCallbacks } from './LLMStreamClient';

export interface ReportData {
  template: ReportTemplate;
  values: Record<string, any>;
  generatedText?: string;
  sections: Array<{
    section: ReportSection;
    content: string;
  }>;
  warnings: string[];
  timestamp: number;
}

export interface ReportGenerationCallbacks extends LLMStreamCallbacks {
  onSectionComplete?: (sectionIndex: number, content: string) => void;
  onTemplateMatch?: (template: ReportTemplate) => void;
}

export class ReportGenerator {
  private llm: LLMStreamClient;

  constructor(llmConfig?: Partial<ConstructorParameters<typeof LLMStreamClient>[0]>) {
    this.llm = new LLMStreamClient(llmConfig);
  }

  /**
   * 匹配最佳模板
   */
  matchTemplate(
    examType: ExamType,
    plane?: PlaneType,
    hint?: string
  ): ReportTemplate | null {
    const templates = REPORT_TEMPLATES[examType] || [];
    if (templates.length === 0) return null;

    // 1. 按切面匹配
    if (plane) {
      const planeMatch = templates.find(t =>
        t.applicablePlanes?.includes(plane)
      );
      if (planeMatch) return planeMatch;
    }

    // 2. 按提示匹配
    if (hint) {
      const hintMatch = templates.find(t =>
        t.id.includes(hint) || t.name.includes(hint)
      );
      if (hintMatch) return hintMatch;
    }

    // 3. 默认第一个
    return templates[0];
  }

  /**
   * 渲染模板
   */
  renderTemplate(
    template: ReportTemplate,
    values: Record<string, any>
  ): Array<{ section: ReportSection; content: string }> {
    return template.sections.map(section => ({
      section,
      content: this.fillTemplate(section.template, values)
    }));
  }

  /**
   * 模板填充
   */
  private fillTemplate(template: string, values: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = values[key];
      if (value === undefined || value === null) {
        return `[${key}]`;  // 占位符
      }
      return String(value);
    });
  }

  /**
   * 生成报告
   */
  async generate(
    context: AIStreamContext,
    measurements: Array<{ name: string; value: number; unit: string }>,
    callbacks?: ReportGenerationCallbacks
  ): Promise<ReportData> {
    // 1. 匹配模板
    const template = this.matchTemplate(
      context.examType,
      context.currentPlane
    );

    if (!template) {
      throw new Error(`未找到 ${context.examType} 类型的报告模板`);
    }

    callbacks?.onTemplateMatch?.(template);

    // 2. 准备数据
    const values: Record<string, any> = {
      date: new Date().toLocaleDateString('zh-CN'),
      patientName: context.patientInfo.id,  // 简化
      patientId: context.patientInfo.id,
      doctorName: '系统自动生成',
      gestationalWeeks: 24,  // 简化
      ...this.mapMeasurements(measurements)
    };

    // 3. 渲染模板
    const sections = this.renderTemplate(template, values);

    // 4. LLM 增强（流式输出）
    const prompt = this.buildPrompt(context, template, values, sections);
    let generatedText = '';

    await this.llm.stream(
      [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      {
        onChunk: (chunk) => {
          generatedText += chunk;
          callbacks?.onChunk?.(chunk);
        },
        onComplete: (text) => {
          generatedText = text;
          callbacks?.onComplete?.(text);
        },
        onError: (err) => callbacks?.onError?.(err)
      }
    );

    // 5. 收集警告
    const warnings = this.collectWarnings(template, values);

    return {
      template,
      values,
      generatedText,
      sections,
      warnings,
      timestamp: Date.now()
    };
  }

  /**
   * 构建 Prompt
   */
  private buildPrompt(
    context: AIStreamContext,
    template: ReportTemplate,
    values: Record<string, any>,
    sections: Array<{ section: ReportSection; content: string }>
  ): string {
    return `请根据以下超声检查信息，生成一段专业、简洁的超声报告描述：

【患者信息】
患者ID: ${context.patientInfo.id}
检查指征: ${context.patientInfo.indication}
检查类型: ${context.examType}

【基础描述】
${sections.map(s => s.content).join('\n')}

【要求】
1. 语言专业、简洁、符合医学规范
2. 结构清晰，描述客观
3. 如有异常，给出明确提示
4. 字数控制在100-200字
`;
  }

  /**
   * 系统提示
   */
  private getSystemPrompt(): string {
    return `你是一位经验丰富的超声科医生，擅长撰写规范、专业的超声检查报告。
请用中文回答，语言专业、简洁、符合医学规范。`;
  }

  /**
   * 映射测量值
   */
  private mapMeasurements(
    measurements: Array<{ name: string; value: number; unit: string }>
  ): Record<string, any> {
    const map: Record<string, any> = {};
    for (const m of measurements) {
      map[m.name] = m.value;
      // 兼容多种命名
      if (m.name.includes('BPD')) map.BPD = m.value;
      if (m.name.includes('HC')) map.HC = m.value;
      if (m.name.includes('AC')) map.AC = m.value;
      if (m.name.includes('FL')) map.FL = m.value;
      if (m.name.includes('HL')) map.HL = m.value;
      if (m.name.includes('LVEDd')) map.LVEDd = m.value;
      if (m.name.includes('LVEDs')) map.LVEDs = m.value;
      if (m.name.includes('IVSd')) map.IVSd = m.value;
      if (m.name.includes('LVPWd')) map.LVPWd = m.value;
    }
    return map;
  }

  /**
   * 收集警告
   */
  private collectWarnings(
    template: ReportTemplate,
    values: Record<string, any>
  ): string[] {
    const warnings: string[] = [];
    // 检查未填字段
    for (const section of template.sections) {
      if (section.required && section.fields) {
        for (const field of section.fields) {
          if (values[field] === undefined) {
            warnings.push(`[${template.name}] 缺失必填字段: ${field}`);
          }
        }
      }
    }
    return warnings;
  }

  /**
   * 获取 LLM 客户端（用于高级操作）
   */
  getLLM(): LLMStreamClient {
    return this.llm;
  }
}

export default ReportGenerator;
