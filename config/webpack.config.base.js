/** Native **/
const path = require('path');

/** Third Party **/
const webpack = require('webpack')
const dotEnvWebpack = require('dotenv-webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const environment = `${process.env.NODE_ENV || 'development'}`;

/** Plugin Setup **/
const buildExample = new HtmlWebPackPlugin({
    template: './example.html',
    inject: true,
});

const dotenvPlugin = new dotEnvWebpack({
    path: `./.env.${environment}`,
    safe: true,
    silent: true,
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
            {
                test: /\.(png|jp(e*)g)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: 'images/[hash]-[name].[ext]'
                    }
                }]
            },
        ],
    },
    plugins: [dotenvPlugin, buildExample],
}
