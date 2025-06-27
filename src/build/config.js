const path = require('path');

// 项目根目录
const rootPath = path.resolve(__dirname, "..");
// 开发源码项目目录
const src = path.join(rootPath, 'src');
// 配置
const build = path.join(rootPath, 'build');
// 当前环境
const env = process.env.NODE_ENV.trim();

const analyze = process.env.ANALYZE = 'true';

const CONTEXT_PATH = "/scene-web/";

module.exports = {
    CONTEXT_PATH, // 服务器上下文根目录，只生成环境有效
    PUBLIC_PATH: 
        env === 'development'
        ? '/'
        : './' + (process.env.NODEULE === 'NULL' ? '' : process.env.NODEULE) + '/', // 静态资源目录
    rootPath,
    src,
    dist: path.join(rootPath, 'dist', CONTEXT_PATH), // build后输出目录
    staticDir: path.join(rootPath, "static"), // 无需处理的静态资源目录
    build, // 配置
    env,
    analyze
}