const path = require('path');
const CracoLessPlugin = require('craco-less');
const { loaderByName } = require('@craco/craco');

// 保留原有正则定义
const lessModuleRegex = /\.module\.less$/;

module.exports = function (webpackEnv) {
  return {
    // 原有 Webpack 配置整合到此处
    webpack: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
      },
      configure: (webpackConfig) => {
        // 保留原有 chinese-days 处理规则
        webpackConfig.module.rules.push({
          test: /\.m?js$/,
          include: /node_modules[\\/]chinese-days/,
          type: 'javascript/auto',
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: 'auto' }]
              ]
            }
          }
        });

        // 保留原有 devtool 配置
        webpackConfig.devtool = 'cheap-module-source-map';
        return webpackConfig;
      },
    },
    // 新增 Less 插件配置
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            lessOptions: {
              // 自定义主题变量（注意用字符串包裹变量名）
              modifyVars: { '@primary-color': '#2378ff' },
              javascriptEnabled: true,
            },
          },
          // 处理普通 Less 文件（非 module）
          modifyLessRule: (lessRule) => {
            lessRule.exclude = lessModuleRegex; // 排除 module.less 文件
            return lessRule;
          },
          // 处理 CSS Modules 的 Less 文件
          modifyLessModuleRule: (lessModuleRule) => {
            lessModuleRule.test = lessModuleRegex; // 匹配 .module.less 文件
            
            // 配置 CSS Modules 类名生成规则
            const cssLoader = lessModuleRule.use.find(loaderByName('css-loader'));
            cssLoader.options.modules = {
              localIdentName: '[local]_[hash:base64:5]', // 与 CRA 默认规则一致
            };
            
            return lessModuleRule;
          },
        },
      },
    ],
  };
};