const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const fileName = 'bundle.js';

module.exports = async (env, argv) =>
{
    const target = env.target;

    const pathSrc = path.resolve(__dirname, './src');
    const pathDist = path.resolve(__dirname, `./_dist/${target}`);

    const isDev = argv.mode === 'development';

    const devServerConfig =
        {
            open : true,
            port : 'auto',
            hot  : false,

            static:
                [
                    {
                        directory : path.resolve(__dirname, './assets'),
                        watch     : true
                    },
                    {
                        directory : pathDist,
                        watch     : true
                    }
                ]
        };

    if (isDev)
    {
        const port = 8080;
        const gameUrl = `https://localhost:${port}`;
    }

    return ({
        entry: [`${pathSrc}/index.ts`],

        output:
            {
                path     : pathDist,
                filename : fileName,
                clean    : true
            },

        devtool: isDev ? 'source-map' : undefined,

        devServer: devServerConfig,

        module:
            {
                rules:
                [
                    {
                        test    : /\.(glsl|vert|frag)$/,
                        use     : 'ts-shader-loader',
                        exclude : /node_modules/
                    },

                    {
                        test   : /\.d\.ts$/,
                        loader : 'ignore-loader'
                    },

                    {
                        test: /\.tsx?$/,

                        use:
                            [
                                { loader: 'ts-loader' }
                            ],

                        exclude: /node_modules/
                    }
                ]
            },

        resolve:
            {
                alias:
                    {
                    },

                extensions: ['.ts', '.js'],

                modules: ['node_modules']
            },

        plugins:
            [
                new HtmlWebpackPlugin({
                    template : `${pathSrc}/template.html`,
                    inject   : false,
                    minify   : false,

                    templateParameters:
                        {
                            buildScript: `<script src="${fileName}"></script>`
                        }
                }),

                new webpack.DefinePlugin({
                    __VERSION__      : JSON.stringify(pkg.version),
                    __DESCRIPTION__  : JSON.stringify('EneaJS library'),
                    __HOMEPAGE__     : JSON.stringify(pkg.homepage),
                    __LICENSE__      : JSON.stringify(pkg.license),
                    __BUILD_TARGET__ : JSON.stringify(target)
                }),

                new CopyWebpackPlugin({
                    patterns:
                        [
                            { from: '**/**.*', context: 'assets' },
                            { from: '*.png', context: pathSrc, noErrorOnMissing: true },
                            { from: '*.jpg', context: pathSrc, noErrorOnMissing: true },
                            { from: '*.json', context: pathSrc, noErrorOnMissing: true },
                            { from: '*.php', context: pathSrc, noErrorOnMissing: true }
                        ],

                    options:
                        {
                            concurrency: 10
                        }
                })
            ],

        optimization:
            {
                concatenateModules: false,

                minimize: !isDev,

                minimizer:
                    [
                        new TerserWebpackPlugin({
                            test     : /\.js(\?.*)?$/i,
                            parallel : true,

                            terserOptions:
                                {
                                    ecma     : 5,
                                    warnings : false,
                                    parse    : {},
                                    compress:
                                        {
                                            drop_console: true
                                        },
                                    mangle          : true,
                                    module          : false,
                                    output          : null,
                                    toplevel        : false,
                                    nameCache       : null,
                                    ie8             : false,
                                    keep_classnames : undefined,
                                    keep_fnames     : false,
                                    safari10        : true
                                }
                        })
                    ]
            },

        performance: { hints: false }
    });
};
