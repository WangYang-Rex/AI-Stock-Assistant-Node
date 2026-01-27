
import OpenAI from "openai";
import process from 'process';

// 初始化OpenAI客户端
const openai = new OpenAI({
  // 如果没有配置环境变量，请用阿里云百炼API Key替换：apiKey: "sk-xxx"
  apiKey: 'sk-7d42db4e0416498e97f8ffb879c07819', // process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = ''; // 完整思考过程
let answerContent = ''; // 完整回复
let isAnswering = false; // 是否进入回复阶段

async function main() {
  try {
    const messages = [{ role: 'user', content: '你是谁' }];

    const stream = await openai.chat.completions.create({
      model: 'glm-4.6',
      messages,
      // 注意：在 Node.js SDK，enable_thinking 这样的非标准参数作为顶层属性传递，无需放在 extra_body 中
      enable_thinking: true,
      stream: true,
      stream_options: {
        include_usage: true
      },
    });

    console.log('\n' + '='.repeat(20) + '思考过程' + '='.repeat(20) + '\n');

    for await (const chunk of stream) {
      if (!chunk.choices?.length) {
        console.log('\n' + '='.repeat(20) + 'Token 消耗' + '='.repeat(20) + '\n');
        console.log(chunk.usage);
        continue;
      }

      const delta = chunk.choices[0].delta;

      // 只收集思考内容
      if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
        if (!isAnswering) {
          process.stdout.write(delta.reasoning_content);
        }
        reasoningContent += delta.reasoning_content;
      }

      // 收到content，开始进行回复
      if (delta.content !== undefined && delta.content) {
        if (!isAnswering) {
          console.log('\n' + '='.repeat(20) + '完整回复' + '='.repeat(20) + '\n');
          isAnswering = true;
        }
        process.stdout.write(delta.content);
        answerContent += delta.content;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();