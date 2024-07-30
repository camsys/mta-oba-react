const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});
const envPlugin = new webpack.DefinePlugin({
  'process.env.ALLOWED_HOST_ADDRESS': JSON.stringify(process.env.ALLOWED_HOST_ADDRESS || 'localhost'),
  'process.env.ENV_ADDRESS': JSON.stringify(cleanUpHostAddress(process.env.ENV_ADDRESS || 'app.dev.obanyc.com')),
  'process.env.VEHICLE_MONITORING_ENDPOINT': JSON.stringify(process.env.VEHICLE_MONITORING_ENDPOINT || 'api/siri/vehicle-monitoring.json?key=OBANYC'),
  'process.env.STOPS_ON_ROUTE_ENDPOINT': JSON.stringify(process.env.STOPS_ON_ROUTE_ENDPOINT || 'api/stops-on-route-for-direction?')
});

function cleanUpHostAddress(hostAddress) {
  return hostAddress.trimEnd().replace(/\/$/, '');
}

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
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
      },
    ]
  },
  plugins: [htmlPlugin, envPlugin],
  devServer: {
    allowedHosts: [
      process.env.ALLOWED_HOST_ADDRESS || 'localhost'
    ]
  }
};
