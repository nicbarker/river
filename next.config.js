const path = require('path')

module.exports = {
    webpack(config, options) {
        config.resolve.alias['components'] = path.join(__dirname, 'components')
        config.resolve.alias['styles'] = path.join(__dirname, 'styles')
        config.resolve.alias['lib'] = path.join(__dirname, 'lib')
        config.resolve.alias['context'] = path.join(__dirname, 'context')
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: 'react-svg-loader'
                }
            ]
        })
        return config
    }
}