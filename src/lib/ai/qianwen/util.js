import OpenAI from 'openai';

// 初始化 OpenAI 客户端（阿里云百炼）
const openai = new OpenAI({
  // 如果没有配置环境变量，请用阿里云百炼API Key替换：apiKey: "sk-xxx"
  // apiKey: 'sk-7d42db4e0416498e97f8ffb879c07819', // 阿里云百炼API wy Key
  apiKey: 'sk-42ba3bb2b02445b38605bdc8f2406c3a', // crm 测试环境的
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

/**
 * 调用千问聊天完成 API
 * @param {string} model - 模型名称，例如: "qwen-plus", "qwen3-vl-32b-thinking" 等
 * @param {Array} messages - 消息数组，格式: [{ role: "system|user|assistant", content: "..." }]
 * @param {Object} options - 可选参数
 * @param {boolean} options.stream - 是否使用流式输出，默认 false
 * @param {number} options.temperature - 温度参数，默认 undefined
 * @param {number} options.max_tokens - 最大 token 数，默认 undefined
 * @param {Object} options.extraParams - 其他额外参数
 * @returns {Promise<Object|AsyncIterable>} 如果 stream=true 返回流，否则返回完整响应
 */
const qianwenChatompletions = async (message, options = {}) => {
  const { stream = false, temperature, max_tokens, ...extraParams } = options;

  try {
    const requestParams = {
      model: 'qwen3-vl-32b-thinking',
      messages: [
        { role: "system", content: "You are a helpful assistant. You always respond in Chinese." },
        { role: "user", content: message }
      ],
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens !== undefined && { max_tokens }),
      ...(stream && { stream: true }),
      ...extraParams,
    };

    console.log('qianwenChatompletions requestParams \n', requestParams);
    const completion = await openai.chat.completions.create(requestParams);
    console.log('qianwenChatompletions completion \n', JSON.stringify(completion));
    return completion;
  } catch (error) {
    console.error('千问 API 调用错误:', error);
    throw error;
  }
};

export { qianwenChatompletions };
export default qianwenChatompletions;
