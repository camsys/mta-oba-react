const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const isProd = process.env.NODE_ENV === 'production';
const loggingLevel = isProd ?  'silent' : 'info';
const siri_request_freq = isProd ? 30 : 15; // seconds
const defaultAPIKey = 'OBANYCUI'
const tracking_host_address = process.env.ALLOWED_HOST_ADDRESS ? 
  "https://" + process.env.ALLOWED_HOST_ADDRESS :
  'http://localhost:8081'


// Environment variables setup using DefinePlugin
const envPlugin = new webpack.DefinePlugin({
  'process.env.TRACKING_HOST_ADDRESS': JSON.stringify(process.env.TRACKING_HOST_ADDRESS || tracking_host_address),
  'process.env.ALLOWED_HOST_ADDRESS': JSON.stringify(process.env.ALLOWED_HOST_ADDRESS || 'localhost'),
  'process.env.API_KEY': JSON.stringify(process.env.API_KEY || defaultAPIKey),
  'process.env.ENV_ADDRESS': JSON.stringify(cleanUpHostAddress(process.env.ENV_ADDRESS || 'app.qa.obanyc.com')),
  'process.env.VEHICLE_MONITORING_ENDPOINT': JSON.stringify(process.env.VEHICLE_MONITORING_ENDPOINT || `api/siri/vehicle-monitoring.json?`),
  'process.env.STOP_MONITORING_ENDPOINT': JSON.stringify(process.env.STOP_MONITORING_ENDPOINT || `/api/stop-for-id?`),
  'process.env.STOPS_ON_ROUTE_ENDPOINT': JSON.stringify(process.env.STOPS_ON_ROUTE_ENDPOINT || 'api/stops-on-route-for-direction?'),
  'process.env.LOGGINGLEVEL': JSON.stringify(process.env.LOGGINGLEVEL || loggingLevel),
  'process.env.ENABLE_GOOGLE_TRANSLATE': JSON.stringify(process.env.ENABLE_GOOGLE_TRANSLATE || true),
  'process.env.SIRI_REQUEST_FREQ': JSON.stringify(process.env.SIRI_REQUEST_FREQ || siri_request_freq)
});

function cleanUpHostAddress(hostAddress) {
  return hostAddress.trimEnd().replace(/\/$/, '');
}


module.exports = {
  mode: 'development',
  entry: './src/index.tsx', 
  module: { 
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
        test: /\.(js|jsx|ts|tsx)$/, // Regex to include both JS and TS files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }, 
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        loader: "file-loader"
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
    alias: {
      Components: path.resolve(__dirname, 'src/components/'),
      Utils: path.resolve(__dirname, 'src/utils/'),
      Assets: path.resolve(__dirname, 'src/img/'),
      JS: path.resolve(__dirname, 'src/js/'),
      Style: path.resolve(__dirname, 'src/css/')
    }
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }), 
    envPlugin,
    new CopyPlugin({
      patterns: [
        { from: "public", to: "." }
      ]
    })],
  devServer: {
    allowedHosts: [
      process.env.ALLOWED_HOST_ADDRESS || 'localhost'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: isProd ? './' : '/',
  },
  watchOptions: {
    poll: 1000,
  }
};