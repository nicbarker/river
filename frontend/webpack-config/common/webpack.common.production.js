const merge = require('webpack-merge')
const browser = require('../browser/webpack.browser.js')
const TerserPlugin = require('terser-webpack-plugin')

const config = {
    optimization: {
        minimizer: [new TerserPlugin()],
    },
    mode: 'production'
}

module.exports = merge.multiple(browser, { desktopWeb: config, mobileWeb: config })