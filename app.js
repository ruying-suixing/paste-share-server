const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// ==========【必须放在所有中间件最前面】跨域修复 ==========
const allowedOrigins = [
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3001',
  'https://pshare.rusin7.com',
  'http://pshare.rusin7.com',
  'http://localhost:4000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // 匹配白名单源
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    // 显式列出所有请求头，不能用*，包含你的自定义token
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // 预检缓存时间
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // OPTIONS预检直接返回200，终止请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
// ==============================================

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 导入路由
const authRouter = require('./routes/api/auth.js');
const shareRouter = require('./routes/api/share');
const viewRouter = require('./routes/api/view');
const captchaRouter = require('./routes/api/captcha');

// 使用接口路由，路径添加api前缀
app.use('/api', authRouter);
app.use('/api', shareRouter);
app.use('/api', viewRouter);
app.use('/api', captchaRouter);

// 兜底路由
app.all('*', (req, res) => {
  res.json({
    code: 9001,
    msg: '无效的api',
    data: null
  })
})

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({
    code: '9002',
    msg: '服务器内部错误',
    data: null
  })
});

module.exports = app;