import axios from 'axios';

/**
 * 七牛云 API 调用方法 (已配置为 deepseek 等模型)
 */

/**
 * 调用 API
 * @param {Object} options - 配置选项
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
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QINIU_API_KEY}`
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

