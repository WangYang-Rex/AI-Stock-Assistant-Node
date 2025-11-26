/**
 * 火山引擎豆包 API 测试示例
 * 使用方法：
 * 1. 设置环境变量: export ARK_API_KEY=your-api-key
 * 2. 运行: node src/lib/huoshan/test.js
 */

import chatCompletions from './huoshan.js';

async function test() {
  try {
    console.log('开始调用火山引擎豆包 API...\n');
    
    const result = await chatCompletions({
      // 如果不设置环境变量，可以在这里直接传入 apiKey
      // apiKey: 'your-api-key-here',
      model: 'deepseek-v3-1',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Always respond in Chinese.'
        },
        {
          role: 'user',
          content: 'Hello! 你是谁？'
        }
      ]
    });

    console.log('\nAPI 响应结果:');
    console.log(JSON.stringify(result, null, 2));
    
    // 如果响应包含 choices，打印回复内容
    if (result.choices && result.choices.length > 0) {
      console.log('\n助手回复:');
      console.log(result.choices[0].message.content);
    }
  } catch (error) {
    console.error('错误:', error.message);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
  }
}

test();

