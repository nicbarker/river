const merge = require('webpack-merge')
const browser = require('../browser/webpack.browser.js')

const config = {
    mode: 'development'
}

module.exports = merge.multiple(browser, { desktopWeb: config, mobileWeb: config })