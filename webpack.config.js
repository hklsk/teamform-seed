'use strict';

// Modules
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const DefinePlugin = require('webpack/lib/DefinePlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

module.exports = function makeWebpackConfig() {

    var config = {};

    config.entry = isTest ? {} : {
        app: './src/app/app.js',
        vendor: './src/app/vendor.js'
    };

    config.resolve = {
        modulesDirectories: ['web_modules', 'node_modules', 'bower_components']
    };

    config.output = isTest ? {} : {
        path: __dirname + '/dist',
        publicPath: isProd ? './' : 'http://localhost:8080/',
        filename: isProd ? '[name].[hash].js' : '[name].bundle.js',
        chunkFilename: isProd ? '[id].[hash].js' : '[id].bundle.js'
    };

    if (isTest) {
        config.devtool = 'inline-source-map';
    } else if (isProd) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval-source-map';
    }

    config.module = {
        preLoaders: [],
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /(node_modules|bower_components)/
        }, {
            test: /\.css$/,
            loader: isTest ? 'null' : ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader')
        }, {
            test: /\.scss$/,
            loaders: ['style', 'css', 'sass']
        }, {
            test: /\.woff$/,
            loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=/assets/font/[hash].[ext]'
        }, {
            test: /\.woff2$/,
            loader: 'url-loader?limit=10000&mimetype=application/font-woff2&name=/assets/font/[hash].[ext]'
        }, {
            test: /\.(eot|ttf)$/,
            loader: 'url-loader?limit=10000&name=/assets/font/[hash].[ext]'
        }, {
            test: /\.(svg|gif|png|jpe?g)$/,
            loader: 'url-loader?limit=1024&name=/assets/images/[hash].[ext]'
        }, {
            test: /\.html$/,
            loader: 'html'
        }]
    };

    if (isTest) {
        config.module.preLoaders.push({
            test: /\.js$/,
            exclude: [
                /node_modules/,
                /\.spec\.js$/
            ],
            loader: 'isparta-loader'
        })
    }

    config.postcss = [
        autoprefixer({
            browsers: ['last 3 version']
        })
    ];

    config.plugins = [
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'root.jQuery': 'jquery'
        }),
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
        ),
        new DefinePlugin({
            ENV: JSON.stringify(require('./config.js'))
        })
    ];

    if (!isTest) {
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: './src/public/index.html',
                inject: 'body'
            }),
            new ExtractTextPlugin('[name].[hash].css', {
                disable: !isProd
            })
        )
    }

    if (!isProd) {
        config.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        )
    }

    if (isProd) {
        config.plugins.push(
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
            new CopyWebpackPlugin([{
                from: __dirname + '/src/public'
            }])
        )
    }

    config.devServer = {
        contentBase: './src/public',
        hot: true,
        colors: true,
        inline: true,
        stats: 'minimal'
    };
    return config;
}();