const { defineConfig } = require('@vue/cli-service')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = defineConfig({
  // 生产环境配置
  productionSourceMap: false, // 禁用生产环境source map
  
  // 开发服务器配置
  devServer: {
    port: 3000,
    historyApiFallback: true,
    client: {
      overlay: false
    },
    proxy: {
      '/api/messages': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/api/training': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api/training': '/admin/training'
        }
      },
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/admin'
        }
      },
      '/image-service/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/uploads': '/image-service/uploads'
        }
      }
    }
  },
  
  // Webpack配置优化
  configureWebpack: config => {
    // 生产环境优化
    if (process.env.NODE_ENV === 'production') {
      // 代码分割优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              name: 'chunk-vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              chunks: 'initial'
            },
            elementPlus: {
              name: 'chunk-element-plus',
              test: /[\\/]node_modules[\\/]element-plus[\\/]/,
              priority: 20
            },
            echarts: {
              name: 'chunk-echarts',
              test: /[\\/]node_modules[\\/]echarts[\\/]/,
              priority: 20
            }
          }
        }
      }
      
      // 添加gzip压缩
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        })
      )
    }
  },
  
  // 链式配置
  chainWebpack: config => {
    // 基础配置优化
    config.resolve.alias.set('@', require('path').resolve(__dirname, 'src'))
  }
})