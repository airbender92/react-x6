const path = require('path')
const webpack = require('webpack')
const { BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const config = requrie("./webpack.prod.conf")
const gzipSize = require('gzip-size')
const {Table}  = require('console-table-printer')

const {analyze} = require('./config')

if(analyze) {
    config.plugins.push(new BundleAnalyzerPlugin())
}

webpack(config, (err, stats) => {
    if(err) {
        console.error(err.stack || err)
        if(err.details) {
            console.error(err.details)
        }
        return;
    }
    const info = stats.toJson();
    if(stats.hasErrors()) {
        console.error(info.errors)
        return;
    }

    if(stats.hasWarnings()) {
        console.warn(info.warnings);
    }

    const { compilation} = stats;
    const {assets} = compilation;
    reports(assets)
})

function reports(assets){
    const p = new Table({
        columns: [
            {name: 'index', alignment: 'left'},
            {name: 'name', alignment: 'left', title: 'resource name'},
            {name: 'originSize', alignment: 'left', title: 'origin size(k)'},
            {name: 'gSize', alignment: 'left', title: 'gzip size(k)'},
        ]
    });

    let index = 1;
    let originSizeTotal = 0;
    let gSizeTotal = 0;
    for(const [k, v] of Object.entries(assets)) {
        const gSize = gzipSize.sync(v.buffer.toString());
        const extname = path.extname(k);
        if(extname !== '.map') {
            originSizeTotal += v.size();
            gSizeTotal += gSize;
        }
        p.addRow({
            index,
            name: k,
            originSize: (v.size() / 1024).toFixed(2),
            gSize: (gSize / 1024).toFixed(2),
        },
    {color: v.size() / 1024 > 1024 ? 'red' : 'green'});
    index++;
    }
    p.addRow({});
    p.addRow({
        index: 'total',
        name: 'total(filter map file)',
        originSize: (originSizeTotal / 1024).toFixed(2),
        gSize: (gSizeTotal / 1024).toFixed(2)
    });
    index++;

    p.printTable();
}