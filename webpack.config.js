const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const htmlPlugin = new HtmlWebPackPlugin({
 template: "./src/index.html",
 filename: "./index.html"
});
const envPlugin = new webpack.EnvironmentPlugin(['DEV_ENV_ADDRESS', 'VEHICLE_MONITORING_ENDPOINT']);
module.exports = {
mode: 'development',
  module: {
    rules: [{
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
]},
 plugins: [htmlPlugin, envPlugin]
};
