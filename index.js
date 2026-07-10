// index.js
// 先获取 express app 实例（需要你在 ./bin/www 里导出 app）
const app = require("./bin/www");

// 关键：导出 app 给 Vercel
module.exports = app;
