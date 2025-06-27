const webpack = require('webpack')
const config = require('./webpack.base.conf')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const BrowserSyncPlugin = require('prowser-sync-webpack-plugin');

config.mode = 'development'

config.entry.app = [
    ...config.entry.app,
    "webpack-hot-middleware/client?reload=true",
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server'
];

config.plugins.push(
    new ProgressBarPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new BrowserSyncPlugin(
        {
            host: '127.0.0.1',
            port: 8001,
            proxy: 'http://127.0.0.1:8001',
            logConnections: false,
            notify: false,
            ghostMode: false,
        },
        {
            reload: false
        }
    )
)

module.exports = config;