import { DingtalkService } from '../src/common/services/dingtalk.service';

async function testDingtalk() {
  const dingtalkService = new DingtalkService();

  console.log('--- 开始测试钉钉机器人消息发送 ---');

  // 1. 测试发送文本消息
  console.log('\n1. 正在发送文本消息...');
  try {
    const textResult = await dingtalkService.sendText('这是一条来自 NestJS 单元测试的文本消息 小A同志');
    console.log('文本消息发送结果:', textResult);
  } catch (err) {
    console.error('文本消息发送失败:', err);
  }

  // 2. 测试发送 ActionCard 消息
  console.log('\n2. 正在发送 ActionCard 消息...');
  try {
    const cardResult = await dingtalkService.sendActionCard({
      title: '小A通知',
      text: '### 发布通知 \n- **项目**: AI Stock Assistant \n- **版本**: v1.0.0 \n- **状态**: 成功 \n\n 这是一个测试卡片',
      btns: [
        {
          title: '查看详情',
          actionURL: 'https://github.com',
        },
      ],
    });
    console.log('ActionCard 发送结果:', cardResult);
  } catch (err) {
    console.error('ActionCard 发送失败:', err);
  }

  console.log('\n--- 测试结束 ---');
}

testDingtalk().catch(console.error);
