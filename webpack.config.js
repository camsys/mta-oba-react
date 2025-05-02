const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const isProd = process.env.NODE_ENV === 'production';
const loggingLevel = isProd ?  'error' : 'info';
const siri_request_freq = isProd ? 30 : 15; // seconds

// HTML Webpack Plugin for generating HTML file with script tags
const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});

// Environment variables setup using DefinePlugin
const envPlugin = new webpack.DefinePlugin({
  'process.env.ALLOWED_HOST_ADDRESS': JSON.stringify(process.env.ALLOWED_HOST_ADDRESS || 'localhost'),
  'process.env.ENV_ADDRESS': JSON.stringify(cleanUpHostAddress(process.env.ENV_ADDRESS || 'app.qa.obanyc.com')),
  'process.env.VEHICLE_MONITORING_ENDPOINT': JSON.stringify(process.env.VEHICLE_MONITORING_ENDPOINT || 'api/siri/vehicle-monitoring.json?key=OBANYC'),
  'process.env.STOP_MONITORING_ENDPOINT': JSON.stringify(process.env.STOP_MONITORING_ENDPOINT || '/api/stop-for-id?key=OBANYC'),
  'process.env.STOPS_ON_ROUTE_ENDPOINT': JSON.stringify(process.env.STOPS_ON_ROUTE_ENDPOINT || 'api/stops-on-route-for-direction?'),
  'process.env.LOGGINGLEVEL': JSON.stringify(process.env.LOGGINGLEVEL || loggingLevel),
  'process.env.ENABLE_GOOGLE_TRANSLATE': JSON.stringify(process.env.ENABLE_GOOGLE_TRANSLATE || true),
  'process.env.SIRI_REQUEST_FREQ': JSON.stringify(process.env.SIRI_REQUEST_FREQ || siri_request_freq)
});

// Copy Plugin to copy static assets
const copyPlugin = new CopyPlugin({
  patterns: [
    { from: "public", to: "." }
  ]
})
 
// Function to clean up host address
function cleanUpHostAddress(hostAddress) {
  return hostAddress.trimEnd().replace(/\/$/, '');
}

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // Entry point for the application
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/, // Regex to include both JS and TS files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        loader: "file-loader"
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Resolve these extensions
    alias: {
      Components: path.resolve(__dirname, 'src/components/'),
      Utils: path.resolve(__dirname, 'src/utils/'),
      Assets: path.resolve(__dirname, 'src/assets/')
    }
  },
  plugins: [htmlPlugin, envPlugin,copyPlugin],
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
    poll: 1000, // Check for changes every second
  }
};