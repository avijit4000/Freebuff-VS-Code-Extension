const path = require('path');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = {
    mode: 'production',
    entry: {
        extension: './src/extension.ts'
    },
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            // Node.js core modules fallback if needed
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, 'tsconfig.json')
                    }
                }
            }
        ]
    },
    plugins: [
        // new ExtensionReloader({ reloadPage: true }) // Uncomment for development
    ],
    externals: {
        vscode: 'commonjs vscode'
    },
    target: 'node',
    stats: {
        errors: true,
        warnings: true
    }
};
