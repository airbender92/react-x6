const path = require('path');

module.exports = {
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
      // 添加less支持
      const lessRule = {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true, // 自动启用CSS模块
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  // 可以在这里覆盖antd主题变量
                },
              },
            },
          },
        ],
      };

      // 将less规则插入到rules数组中
      webpackConfig.module.rules.push(lessRule);
      return webpackConfig;
    },
  },
};