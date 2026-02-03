"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleepFun = void 0;
const sleepFun = (ms) => {
    return new Promise((resolve) => {
        console.log(`sleepFun 开始 延迟 ${ms} 毫秒`);
        setTimeout(() => {
            console.log(`sleepFun 延迟 ${ms} 毫秒结束`);
            resolve(true);
        }, ms);
    });
};
exports.sleepFun = sleepFun;
//# sourceMappingURL=sleep.js.map