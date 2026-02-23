/** @type {import('postcss-load-config').Config} */

console.log('✅ PostCSS Config Loaded!');
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  }
}