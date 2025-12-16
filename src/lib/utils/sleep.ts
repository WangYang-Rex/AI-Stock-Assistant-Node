/**
 * 延迟函数
 * @param ms 延迟时间，单位：毫秒
 * @returns Promise<boolean>
 */
export const sleepFun = (ms: number) => {
  return new Promise((resolve) => {
    console.log(`sleepFun 开始 延迟 ${ms} 毫秒`);
    setTimeout(() => {
      console.log(`sleepFun 延迟 ${ms} 毫秒结束`);
      resolve(true);
    }, ms);
  });
};
