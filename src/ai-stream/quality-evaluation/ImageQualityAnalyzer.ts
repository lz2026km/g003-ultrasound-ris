/**
 * 图像质量分析器
 * @version v0.8.0
 * @description 基于多维度特征评估超声图像质量
 */

export interface ImageQualityMetrics {
  sharpness: number;        // 清晰度 0-1
  contrast: number;         // 对比度 0-1
  brightness: number;       // 亮度 0-1
  noise: number;            // 噪声 0-1 (越低越好)
  uniformity: number;       // 均匀性 0-1
  fieldOfView: number;      // 视野合理性 0-1
  depth: number;            // 深度合理性 0-1
  gain: number;             // 增益合理性 0-1
  artifact: number;         // 伪影程度 0-1 (越低越好)
}

export interface ImageQualityResult {
  overall: number;          // 综合评分 0-100
  star: 1 | 2 | 3 | 4 | 5;  // 星数评级
  metrics: ImageQualityMetrics;
  issues: string[];         // 质量问题
  suggestions: string[];     // 改进建议
  pass: boolean;            // 是否达标
}

export class ImageQualityAnalyzer {
  private threshold: number;

  constructor(threshold: number = 60) {
    this.threshold = threshold;
  }

  /**
   * 分析图像质量
   * @param imageData base64 图像数据
   * @param metadata 图像元数据（深度、增益、频率等）
   */
  analyze(
    imageData: string,
    metadata?: {
      depth?: number;        // cm
      gain?: number;         // dB
      frequency?: number;    // MHz
      width?: number;
      height?: number;
    }
  ): ImageQualityResult {
    // TODO: 实际应使用图像处理算法
    // 此处为基于规则的占位实现

    const metrics = this.extractMetrics(imageData, metadata);
    const overall = this.computeOverall(metrics);
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 检查问题
    if (metrics.sharpness < 0.6) {
      issues.push('图像清晰度不足');
      suggestions.push('检查探头频率是否合适，建议使用更高频率探头');
    }
    if (metrics.contrast < 0.6) {
      issues.push('图像对比度不够');
      suggestions.push('调整时间增益补偿(TGC)');
    }
    if (metrics.brightness < 0.3) {
      issues.push('图像过暗');
      suggestions.push('增加总增益或调整深度');
    } else if (metrics.brightness > 0.9) {
      issues.push('图像过亮');
      suggestions.push('降低总增益');
    }
    if (metrics.noise > 0.5) {
      issues.push('图像噪声较大');
      suggestions.push('降低增益或调整帧平均');
    }
    if (metrics.uniformity < 0.5) {
      issues.push('图像均匀性差');
      suggestions.push('检查探头接触是否良好');
    }
    if (metadata?.depth) {
      if (metadata.depth > 30) {
        issues.push('深度设置过深');
        suggestions.push('适当减小深度，提升分辨率');
      } else if (metadata.depth < 3) {
        issues.push('深度设置过浅');
        suggestions.push('适当增加深度');
      }
    }
    if (metadata?.gain !== undefined) {
      if (metadata.gain > 90) {
        issues.push('增益过高');
        suggestions.push('降低增益以减少噪声');
      } else if (metadata.gain < 30) {
        issues.push('增益过低');
        suggestions.push('增加增益以提升信号');
      }
    }
    if (metrics.artifact > 0.5) {
      issues.push('存在明显伪影');
      suggestions.push('调整探头位置或使用谐波成像');
    }

    const star = this.toStar(overall);
    const pass = overall >= this.threshold;

    return {
      overall: Math.round(overall * 10) / 10,
      star,
      metrics,
      issues,
      suggestions,
      pass
    };
  }

  /**
   * 提取特征（占位实现）
   * 实际应使用 OpenCV / TensorFlow.js
   */
  private extractMetrics(
    imageData: string,
    metadata?: any
  ): ImageQualityMetrics {
    // 模拟特征提取
    return {
      sharpness: this.simulateMetric(0.7, 0.2),
      contrast: this.simulateMetric(0.65, 0.2),
      brightness: this.simulateMetric(0.6, 0.15),
      noise: this.simulateMetric(0.3, 0.15),
      uniformity: this.simulateMetric(0.7, 0.15),
      fieldOfView: this.simulateMetric(0.75, 0.1),
      depth: metadata?.depth ? this.evalDepth(metadata.depth) : 0.75,
      gain: metadata?.gain !== undefined ? this.evalGain(metadata.gain) : 0.75,
      artifact: this.simulateMetric(0.25, 0.15)
    };
  }

  private evalDepth(depth: number): number {
    // 最佳深度 8-20cm
    if (depth >= 8 && depth <= 20) return 0.9;
    if (depth >= 5 && depth <= 25) return 0.75;
    return 0.5;
  }

  private evalGain(gain: number): number {
    // 最佳增益 50-80dB
    if (gain >= 50 && gain <= 80) return 0.9;
    if (gain >= 40 && gain <= 90) return 0.7;
    return 0.5;
  }

  private simulateMetric(mean: number, std: number): number {
    return Math.max(0, Math.min(1, mean + (Math.random() - 0.5) * 2 * std));
  }

  /**
   * 计算综合评分
   */
  private computeOverall(metrics: ImageQualityMetrics): number {
    const weights = {
      sharpness: 0.20,
      contrast: 0.15,
      brightness: 0.10,
      noise: -0.15,    // 负向
      uniformity: 0.10,
      fieldOfView: 0.05,
      depth: 0.10,
      gain: 0.10,
      artifact: -0.05  // 负向
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += (metrics as any)[key] * weight;
    }

    // 归一化到 0-100
    return Math.max(0, Math.min(100, score * 100 + 50));
  }

  /**
   * 转星数
   */
  private toStar(score: number): 1 | 2 | 3 | 4 | 5 {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  }
}

export default ImageQualityAnalyzer;
