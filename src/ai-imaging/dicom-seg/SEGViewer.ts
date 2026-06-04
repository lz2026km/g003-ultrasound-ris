/**
 * DICOM SEG 查看器
 * @version v0.8.0
 * @description 在Canvas上叠加显示分割结果
 */

import { SegmentationMask } from '../types';

export interface OverlayOptions {
  opacity: number;          // 0-1
  color: string;            // 边框颜色
  fillColor: string;        // 填充颜色
  showLabel: boolean;
  showConfidence: boolean;
}

export class SEGViewer {
  private canvas: HTMLCanvasElement | null = null;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || null;
  }

  /**
   * 设置画布
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * 叠加分割结果
   */
  render(
    imageData: string,
    masks: SegmentationMask[],
    options?: Partial<OverlayOptions>
  ): void {
    if (!this.canvas) {
      console.warn('Canvas not set');
      return;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const opts: OverlayOptions = {
      opacity: 0.3,
      color: '#FF0000',
      fillColor: 'rgba(255, 0, 0, 0.2)',
      showLabel: true,
      showConfidence: true,
      ...options
    };

    // 清空画布
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制底图
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, this.canvas!.width, this.canvas!.height);

      // 叠加分割掩膜
      for (const mask of masks) {
        this.drawMask(ctx, mask, opts);
      }
    };
    img.src = imageData;
  }

  /**
   * 绘制单个掩膜
   */
  private drawMask(
    ctx: CanvasRenderingContext2D,
    mask: SegmentationMask,
    opts: OverlayOptions
  ): void {
    const { x, y, width, height } = mask.boundingBox;

    // 边框
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // 填充
    ctx.fillStyle = opts.fillColor;
    ctx.fillRect(x, y, width, height);

    // 标签
    if (opts.showLabel) {
      ctx.fillStyle = opts.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(this.typeToLabel(mask.type), x, y - 5);
    }

    // 置信度
    if (opts.showConfidence) {
      ctx.fillStyle = opts.color;
      ctx.font = '12px sans-serif';
      ctx.fillText(`${Math.round(mask.confidence * 100)}%`, x + width - 35, y - 5);
    }
  }

  private typeToLabel(type: string): string {
    const map: Record<string, string> = {
      thyroid_nodule: '甲状腺结节',
      breast_mass: '乳腺肿块',
      carotid_plaque: '颈动脉斑块',
      liver_lesion: '肝占位',
      kidney_lesion: '肾占位'
    };
    return map[type] || type;
  }

  /**
   * 导出叠加图像为 base64
   */
  exportImage(format: 'png' | 'jpeg' = 'png'): string {
    if (!this.canvas) return '';
    return this.canvas.toDataURL(`image/${format}`);
  }
}

export default SEGViewer;
