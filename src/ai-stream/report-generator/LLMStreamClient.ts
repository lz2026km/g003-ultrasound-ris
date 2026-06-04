/**
 * MiniMax-M3 LLM 流式客户端
 * @version v0.8.0
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMStreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export interface LLMConfig {
  model: 'minimax/MiniMax-M3' | 'minimax/MiniMax-M2.7';
  temperature?: number;       // 0-1, default 0.3
  maxTokens?: number;         // default 2000
  topP?: number;              // default 0.9
  stream?: boolean;           // default true
  apiKey?: string;
  baseUrl?: string;
}

/**
 * LLM 流式客户端
 * 支持 MiniMax-M3（推荐）和 MiniMax-M2.7（备用）
 */
export class LLMStreamClient {
  private config: LLMConfig;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = {
      model: 'minimax/MiniMax-M3',
      temperature: 0.3,
      maxTokens: 2000,
      topP: 0.9,
      stream: true,
      baseUrl: 'https://api.minimaxi.com/anthropic',
      ...config
    };
  }

  /**
   * 发送流式请求
   * @param messages 消息列表
   * @param callbacks 回调函数
   */
  async stream(
    messages: LLMMessage[],
    callbacks: LLMStreamCallbacks
  ): Promise<string> {
    try {
      // 实际实现应调用 MiniMax API
      // 此处为占位实现，模拟流式输出
      return await this.simulateStream(messages, callbacks);
    } catch (e) {
      const error = e as Error;
      callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * 非流式请求
   */
  async complete(messages: LLMMessage[]): Promise<string> {
    return new Promise((resolve) => {
      let fullText = '';
      this.stream(messages, {
        onChunk: (chunk) => { fullText += chunk; },
        onComplete: (text) => resolve(text)
      });
    });
  }

  /**
   * 模拟流式输出（占位实现）
   * 实际应调用 MiniMax-M3 API
   */
  private async simulateStream(
    messages: LLMMessage[],
    callbacks: LLMStreamCallbacks
  ): Promise<string> {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return '';

    // 模拟生成的回答（按字符流式输出）
    const sampleResponse = this.generateMockResponse(lastMsg.content);
    let fullText = '';

    // 按词分块输出
    const tokens = sampleResponse.split(/(\s+)/);
    for (const token of tokens) {
      await this.delay(20);
      fullText += token;
      callbacks.onChunk?.(token);
    }

    callbacks.onComplete?.(fullText);
    return fullText;
  }

  private generateMockResponse(prompt: string): string {
    if (prompt.includes('腹部') || prompt.includes('肝脏')) {
      return '肝脏形态正常，包膜光滑，实质回声均匀，血管纹理清晰，未见明显占位性病变。建议定期超声复查。';
    }
    if (prompt.includes('心脏') || prompt.includes('心功能')) {
      return '心脏结构及功能未见明显异常。左心房、左心室大小正常，左室壁厚度正常，运动协调。射血分数在正常范围内。';
    }
    if (prompt.includes('胎儿') || prompt.includes('产科')) {
      return '宫内孕，单活胎，胎儿大小与孕周相符。胎儿颅骨光环完整，脊柱排列整齐，四肢长骨对称，腹壁完整。';
    }
    if (prompt.includes('甲状腺')) {
      return '甲状腺双侧叶大小正常，实质回声均匀，未见明显占位性病变。CDFI示血流信号未见明显异常。';
    }
    if (prompt.includes('血管') || prompt.includes('颈动脉')) {
      return '颈部血管管腔通畅，内中膜厚度在正常范围内，未见明显斑块形成。';
    }
    return '基于本次超声检查所见，未见明显异常征象。建议结合临床症状、体征及其他辅助检查综合判断。';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取当前配置
   */
  getConfig(): LLMConfig {
    return this.config;
  }

  /**
   * 切换模型
   */
  setModel(model: LLMConfig['model']): void {
    this.config.model = model;
  }
}

export default LLMStreamClient;
