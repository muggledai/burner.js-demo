/** Native **/
const path = require('path');

/** Third Party **/
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin');

/** Plugin Setup **/
const buildExample = new HtmlWebPackPlugin({
    template: './example.html',
    inject: true,
});

/** Configuration **/
module.exports = {
    devtool: 'cheap-module-eval-source-map',

    output: {
        filename: 'assets/bundle.js',
        path: path.resolve(__dirname, '..', 'dist'),
        publicPath: '/',
    },

    context: path.resolve(__dirname, '..', 'src'),

    entry: ['./app.js'],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    plugins: [buildExample],
}
