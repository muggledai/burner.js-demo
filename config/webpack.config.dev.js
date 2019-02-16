/** Native **/
const path = require('path');

/** Third Party **/
const webpack = require('webpack');

/** Base Config **/
const baseWebpackConfig = require('./webpack.config.base');

/** Configuration **/
const config = Object.assign({}, baseWebpackConfig, {
    entry: [
        'webpack-dev-server/client?http://localhost:5555',
        'webpack/hot/only-dev-server',
    ].concat(baseWebpackConfig.entry),

    devServer: {
        hot: true,
        port: 5555,
        contentBase: path.resolve(__dirname, '..', 'dist'),
        publicPath: '/',
        historyApiFallback: true,
    },

    plugins: baseWebpackConfig.plugins.concat([
        new webpack.HotModuleReplacementPlugin(),
    ]),
});

module.exports = config;
