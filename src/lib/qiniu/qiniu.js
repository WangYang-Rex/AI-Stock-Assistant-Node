/**
 * 火山引擎豆包 API 调用方法
 * 将 curl 命令转换为 Node.js 方法
 */

/**
 * 调用火山引擎豆包 API
 * @param {Object} options - 配置选项
 * @param {string} options.apiKey - API Key (从环境变量 ARK_API_KEY 获取，或直接传入)
 * @param {string} options.model - 模型名称，默认为 "doubao-1-5-pro-32k-250115"
 * @param {Array} options.messages - 消息数组
 * @param {Object} options.extraParams - 额外的请求参数
 * @returns {Promise<Object>} API 响应结果
 */
const QINIU_API_KEY = 'sk-2217226648d7c8221cddc90f05b648357dfa19983d3062e6e81add787f5d42b0'; // process.env.QINIU_API_KEY;
const ModalMap = {
  'deepseek': 'deepseek/deepseek-v3.1-terminus',
  'grok': 'x-ai/grok-code-fast-1',
  'gpt': 'gpt-oss-20b',
}

async function chatCompletions({
  messages = [],
  extraParams = {}
} = {}) {
  const url = 'https://api.qnaigc.com/v1/chat/completions';

  const requestBody = {
    "messages": [
      { "role": "system", "content": "You are a helpful assistant. Always respond in Chinese." },
      { "role": "user", "content": "夸一夸火山引擎 AI 推理服务" }
    ],
    "model": ModalMap['deepseek'], // "deepseek-v3",
    "stream": false,
    ...extraParams
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QINIU_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${error.message || error}`);
  }
}


export { chatCompletions };
export default chatCompletions;

