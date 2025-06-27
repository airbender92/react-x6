const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin} = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const config = require('./webpack.base.conf')
const { staticDir, dist} = require('./config')

config.mode = 'production'

config.optimization = {
    splitChunks: {
        cacheGroups: {
            // 抽离第三方库
            vendors: {
                name: 'vendors',
                test: /[\\/]node_modules[\\/]/,
                chunks: 'initial',
                priority: -10,
                minSize: 0,
                minChunks: 2, // 分割前最少引用两次
            },
            // 抽离公用模块
            default: {
                chunks: 'initial',
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
            }
        }
    }
}

config.plugins.push(
    new ProgressBarPlugin(),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({patterns: [{from: staticDir, to: dist}]})
);

module.exports = config;