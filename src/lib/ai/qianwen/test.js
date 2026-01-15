
import qianwenChatompletions from './util.js';

async function test() {
  const result = await qianwenChatompletions('夸一夸火山引擎 AI 推理服务');
  console.log(result);
}

test();