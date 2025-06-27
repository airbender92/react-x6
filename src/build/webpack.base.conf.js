const path = require('path');
const webpack = require('webpack');
const os = require('os')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HappyPack = require('happypack')

const { src, env, dist, PUBLIC_PATH} = require('./config')

const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length})

const cssModifyVars = require('./cssModifyVars');

module.exports = {
    entry: {
        app: ["@babel/polyfill", path.join(src, 'index.jsx')]
    },
    devtool: 'source-map',
    output: {
        path: path.join(dist),
        filename: "js/[name].[chunkhash:6].js",
        chunkFilename: "js/[name].[chunkhash:6].js",
        assetModuleFilename: "imgs/[name].[hash:6][ext][query]",
        publicPath: PUBLIC_PATH
    },
    resolve: {
        modules: [src, 'node_modules'],
        extensions: [".js", ".jsx"],
        alias: {
            "@": src,
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)/,
                use: 'happypack/loader?id=babel',
                include: src,
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [{loader: "style-loader"}, {loader: 'css-loader'}]
            },
            {
                test: /\.less$/,
                include: [/src/],
                exclude: path.resolve(__dirname, '../src/assets/less'),
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: "[name]_[local]_[hash:base64:10]",
                            }
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            },
            {
                test: /\.less$/,
                include: [/node_modules/, path.resolve(__dirname, "../src/assets/less")],
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,

                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                                modifyVars: cssModifyVars
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?v=[\d\.]+)?$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    }
                }
            },
            {
                test: /\.(svg)$/,
                type: "asset/inline"
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            __DEV__: env === 'development',
            __PROD__: env === 'production',
        }),
        new HappyPack({
            id: 'babel',
            loaders: ["babel-loader?cacheDirectory"],
            threadPool: happyThreadPool,
            verbose: true,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, "../src/index.html"),
            chunksSortMode: 'none'
        })
    ]
}