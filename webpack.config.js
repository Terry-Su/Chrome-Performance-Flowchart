const path = require( 'path' )

module.exports = {
	mode  : 'production',
	entry : './src/web.ts',
	output: {
		filename: 'bundle.js',
		path    : path.resolve( __dirname, 'build' )
	},
	devtool: 'source-map',
	module : {
		rules: [
			{
				test   : /\.ts?$/,
				use    : 'ts-loader?configFile=tsconfig.web.json',
				exclude: /node_modules/,
			}
		]
	},
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		],
	},
}
