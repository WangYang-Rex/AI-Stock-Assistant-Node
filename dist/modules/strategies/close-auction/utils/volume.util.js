"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDistribution = isDistribution;
function isDistribution(bars) {
    const last3 = bars.slice(-3);
    if (last3.length === 0)
        return false;
    const avgVol = bars.slice(0, -3).reduce((s, b) => s + b.volume, 0) /
        Math.max(1, bars.length - 3);
    const lastVol = last3.reduce((s, b) => s + b.volume, 0) / last3.length;
    return (lastVol > avgVol * 2 && last3[last3.length - 1].close <= last3[0].close);
}
//# sourceMappingURL=volume.util.js.map