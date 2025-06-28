const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      "@packages": resolve(__dirname, "../../packages")
    },
    extension: [".ts", ".js"]
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ["./src/assets", "./src/swagger-output.json"],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    })
  ],
};
