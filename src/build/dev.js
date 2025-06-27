const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.dev.conf');
const proxy = require('http-proxy-middleware');
const _ = rquire('lodash');

const {env, staticDir, CONTEXT_PATH} = require('./config')

const app = express();
const compiler = webpack(config);
app.use(express.static(staticDir));
app.use(CONTEXT_PATH, express.static(staticDir))

app.use(
    require('webpack-dev-middleware')(compiler, {
        publicPath: config.output.publicPath,
        stats: env === 'development' ? 'errors-only' : {color: true},
    })
);

app.use(require('webpack-hot-middleware')(compiler))

const ALLOWTOKEN = {
    common: 'API-TOKEN-COMMON',
    message: 'API-TOKEN-MESSAGE',
    drill: 'API-TOKEN-DRILL',
}

const proxtTarget = process.env.PROXY_TARGET || 'dev';

const PROXY_URL_MAP = {
    dev: {
        targetIp: '127.0.0.1',
        baseTarget: 'http://localhost'
    }
}

const {targetIp} = PROXY_URL_MAP[proxtTarget]

app.use(
    "/common/*",
    proxy(`http://${targetIp}:8080/`, {
        onProxyReq(proxyReq) {
            proxyReq.setHeader("jump-allow-token", ALLOWTOKEN.common)
        }
    })
)

app.use(
    "/drill/*",
    proxy(`http://${targetIp}:8080/`, {
        onProxyReq(proxyReq) {
            proxyReq.setHeader("jump-allow-token", ALLOWTOKEN.drill)
        }
    })
)

app.listen(8001, "127.0.0.1", function(err){
    console.log(err)
})