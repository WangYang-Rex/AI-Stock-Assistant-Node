"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToJSON = saveToJSON;
const fs_1 = require("fs");
function saveToJSON(rows, filename) {
    const output = {
        timestamp: new Date().toISOString(),
        count: rows.length,
        data: rows,
    };
    (0, fs_1.writeFileSync)(filename, JSON.stringify(output, null, 2), 'utf-8');
}
//# sourceMappingURL=saveToJSON.js.map