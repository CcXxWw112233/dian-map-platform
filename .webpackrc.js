import { resolveOnChange } from "antd/lib/input/Input";
import { resolve } from 'path'

export default {
  define:{
    'process.env':{
      NODE_ENV: process.env.NODE_ENV,
      NODE_ENVI: process.env.NODE_ENVI
    }
  },
  proxy: {

  },
  alias:{
    api: resolve(__dirname, './src/services/'),
    components: resolve(__dirname, './src/components'),
    config: resolve(__dirname, './src/utils/config'),
    models: resolve(__dirname, './src/models'),
    routes: resolve(__dirname, './src/routes'),
    services: resolve(__dirname, './src/services'),
    themes: resolve(__dirname, './src/themes'),
    utils: resolve(__dirname, './src/utils'),
    "@": resolve(__dirname, './src'),

  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lodash',
    ],
  ],
  // chainWebpack: function(config, { webpack }) {
  //   config.merge({
  //     optimization: {
  //       minimize: true,
  //       splitChunks: {
  //         chunks: 'all',
  //         minSize: 30000,
  //         minChunks: 3,
  //         automaticNameDelimiter: '.',
  //         cacheGroups: {
  //           react: {
  //             name: 'react',
  //             priority: 20,
  //             test: /[\\/]node_modules[\\/](react|react-dom|react-dom-router)[\\/]/,
  //           },
  //           antd: {
  //             name: 'antd',
  //             priority: 20,
  //             test: /[\\/]node_modules[\\/](antd|@ant-design\/icons|@ant-design\/compatible|ant-design-pro)[\\/]/,
  //           },
  //           async: {
  //             chunks: 'async',
  //             minChunks: 2,
  //             name: 'async',
  //             maxInitialRequests: 1,
  //             minSize: 0,
  //             priority: 5,
  //             reuseExistingChunk: true,
  //           },
  //         },
  //       },
  //     },
  //   })
  // },
}
