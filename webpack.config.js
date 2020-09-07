module.exports = {
  entry: {
    main: './main.js'
  },
  // 开发模式提升可读性 start
  mode: 'development',
  optimization: {
    minimize: false
  },
  // 开发模式提升可读性 end
  module: {
    rules: [
      {
        // 对 js 文件使用 babel 
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // babel 预设配置
            presets: ['@babel/preset-env'],
            // babel plugins
            plugins: [['@babel/plugin-transform-react-jsx', {
              pragma: 'createElement'
            }]]
          }
        }
      }
    ]
  }
}