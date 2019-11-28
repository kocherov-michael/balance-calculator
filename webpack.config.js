const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
	entry: {
		app: './src/index.js'
	},
	output: {
		// текущий [name] берётся из ярлыка entry (app), на выходе файл будет app.js
		filename: '[name].js',
		path: path.join(__dirname, '/dist'),
		// publicPath нужен для корректной работы devServer
		publicPath: '/dist'
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: '/node_modules/'
		},{
			test: /\.scss$/,
			use: [
				'style-loader',
				// плагин, который вытаскивает css из js
				MiniCssExtractPlugin.loader,
				{
					loader: 'css-loader',
					// конфигурация
					options: { sourceMap: true }
				}, {
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: `./postcss.config.js` } }
        }, {
					loader: 'sass-loader',
					options: { sourceMap: true }
				}
			]
		},{
			test: /\.css$/,
			use: [
				// плагин, который вытаскивает css из js
				MiniCssExtractPlugin.loader,
				{
					loader: 'css-loader',
					options: { sourceMap: true }
				}, {
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: `./postcss.config.js` } }
        }
			]
		}
	]
	},
	devtool: 'cheap-module-eval-source-map',
	devServer: {
		port: 8081,
		// ошибки выводятся на экране
		overlay: true
	},
	plugins: [
		new MiniCssExtractPlugin({
			// [name] ссылается на ярлык в entry (app)
			filename: "[name].css"
		}),
		new webpack.SourceMapDevToolPlugin({
			filename: '[file].map'
		})
	]
}