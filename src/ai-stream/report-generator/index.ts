/**
 * 报告生成模块入口
 * @version v0.8.0
 */

export { ReportGenerator } from './ReportGenerator';
export { LLMStreamClient } from './LLMStreamClient';
export {
  REPORT_TEMPLATES,
  ABDOMINAL_TEMPLATES,
  CARDIAC_TEMPLATES,
  OBSTETRIC_TEMPLATES,
  SUPERFICIAL_TEMPLATES,
  VASCULAR_TEMPLATES
} from './ReportTemplates';
export type {
  ReportTemplate,
  ReportSection,
  ReportData,
  ReportGenerationCallbacks
} from './ReportGenerator';
export type {
  LLMMessage,
  LLMStreamCallbacks,
  LLMConfig
} from './LLMStreamClient';
