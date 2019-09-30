const merge = require('webpack-merge')
const production = require('./webpack.common.production.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = {
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerPort: 8899,
            analyzerMode: 'static'
        })
    ],
}

module.exports = merge.multiple(production, { desktopWeb: config, mobileWeb: config })