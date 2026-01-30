import axios from 'axios';

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
const HUOSHAN_API_KEY = 'b771be6b-a693-443b-9781-d023bd441065'; // process.env.HUOSHAN_API_KEY;
const ModalMap = {
  'deepseek-v3-1': 'deepseek-v3-1',
  'doubao-1-5-pro-32k-250115': 'doubao-1-5-pro-32k-250115', 
}

async function chatCompletions({
  apiKey = HUOSHAN_API_KEY,
  model = 'deepseek-v3-1',
  messages = [],
  extraParams = {}
} = {}) {
  const url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  
  const requestBody = {
    "messages": [
      { "role": "system", "content": "You are a helpful assistant. Always respond in Chinese." },
      { "role": "user", "content": "夸一夸火山引擎 AI 推理服务" }
    ],
    "model": "doubao-1-5-pro-32k-250115",
    "stream": false,
    ...extraParams
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}. ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Network error: ${error.message || error}`);
  }
}

export { chatCompletions };
export default chatCompletions;

