const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const htmlPlugin = new HtmlWebPackPlugin({
 template: "./src/index.html",
 filename: "./index.html"
});
const envPlugin = new webpack.DefinePlugin({
    'process.env.ALLOWED_HOST_ADDRESS': JSON.stringify(process.env.ALLOWED_HOST_ADDRESS || 'app-react.qa.obanyc.com/'),
    'process.env.ENV_ADDRESS': JSON.stringify(process.env.ENV_ADDRESS || 'app.qa.obanyc.com/'),
    'process.env.VEHICLE_MONITORING_ENDPOINT': JSON.stringify(process.env.VEHICLE_MONITORING_ENDPOINT || 'api/siri/vehicle-monitoring.json?key=OBANYC&_=1707407738784&OperatorRef=MTA+NYCT')
});
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
        process.env.ALLOWED_HOST_ADDRESS || 'app.qa.obanyc.com/'
    ]
  }
};
