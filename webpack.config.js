const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
	entry: {
		// путь до входного файла от файла конфигурации webpack
		app: './src/index.js'
	},
	output: {
		// текущий [name] берётся из ярлыка entry (app), на выходе файл будет app.js
		filename: 'assets/js/[name].js',
		// как будет называться папка, где будет собираться проект
		path: path.join(__dirname, '/dist'),
		// publicPath нужен для корректной работы devServer
		publicPath: ''
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: '/node_modules/'
		},{
			test: /\.(png|jpg|jpeg|svg)$/,
			loader: 'file-loader',
			options: {
				name: 'assets/img/[name].[ext]'
			}
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
		// если не заданы параметры, то удаляет все файлы из path: path.join(__dirname, '/dist')
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			// [name] ссылается на ярлык в entry (app)
			filename: "assets/css/[name].css"
		}),
		new HtmlWebpackPlugin({
			// пока отключил
			hash: false,
			// откуда брать html
			template: path.join(__dirname, './src/html/index.html'),
			// куда скопировать
			filename: './index.html'
		}),
		new CopyWebpackPlugin([
			{ from: path.join(__dirname, './src/img'), to: 'assets/img'},
			{ from: path.join(__dirname, './static'), to: ''}
		]),
		new webpack.SourceMapDevToolPlugin({
			filename: '[file].map'
		})
	]
}