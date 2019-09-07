const merge = require('webpack-merge')
const path  = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const assetsPluginInstance = new AssetsPlugin({
    'filename': 'manifest.json',
    'path': path.resolve(__dirname, '../../webpack-build')
})

const common = {
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/, options: { transpileOnly: true, experimentalWatchApi: true } },
            { test: /\.svg$/, use: [ { loader: "react-svg-loader" } ] }
        ]
    },
    target: 'web',
    node: {
        /* http://webpack.github.io/docs/configuration.html#node */
        __dirname: false,
        __filename: false
    },
    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: path.resolve(__dirname, '../../images/*'), to: path.resolve(__dirname, '../../webpack-build'), flatten: true },
            { from: path.resolve(__dirname, '../../static/*'), to: path.resolve(__dirname, '../../webpack-build'), flatten: true }
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'SENTRY_KEY': JSON.stringify(process.env.SENTRY_KEY),
                'API_URL': JSON.stringify(process.env.API_URL),
                'FRONTEND_URL': JSON.stringify(process.env.FRONTEND_URL)
            }
        }),
        new HtmlWebpackPlugin({
            template: "./static/index.html"
        }),
        assetsPluginInstance
    ],
    resolve: {
        alias: {
            'common': path.resolve(__dirname, '../../common'),
        },
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        path: path.resolve(__dirname, '../../webpack-build'),
        chunkFilename: '[name].[chunkhash].bundle.js',
        filename: '[name].[chunkhash].bundle.js',
        publicPath: '/'
    }
}

const specific = {
    mobileWeb: {
        entry: {
            mobileWeb: [path.resolve(__dirname, '../../common/application-web.tsx')]
        },
        resolve: {
            modules: [
                path.resolve(__dirname, '../../mobile-web'),
                path.resolve(__dirname, '../../common'),
                path.resolve(__dirname, '../../scss/mobile-web'),
                path.resolve(__dirname, '../../node_modules')
            ]
        }
    },
    desktopWeb: {
        entry: {
            desktopWeb: [path.resolve(__dirname, '../../common/application-web.tsx')]
        },
        resolve: {
            modules: [
                path.resolve(__dirname, '../../desktop-web'),
                path.resolve(__dirname, '../../common'),
                path.resolve(__dirname, '../../scss/desktop-web'),
                path.resolve(__dirname, '../../node_modules')
            ]
        }
    }
}

module.exports = {
    mobileWeb: merge(common, specific.mobileWeb),
    desktopWeb: merge(common, specific.desktopWeb)
}