"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToMysqlDateTime = formatToMysqlDateTime;
exports.formatToTrendDateTime = formatToTrendDateTime;
function formatToMysqlDateTime(date, offsetHours = 8) {
    const adjustedDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 19).replace('T', ' ');
}
function formatToTrendDateTime(date, offsetHours = 8) {
    const adjustedDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 16).replace('T', ' ');
}
//# sourceMappingURL=date.utils.js.map