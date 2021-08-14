// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },

  "eslint.autoFixOnSave": true,  //  启用保存时自动修复,默认只支持.js文件

  "eslint.validate": [
    "javascript",  //  用eslint的规则检测js文件
    {
      "language": "vue",   // 检测vue文件
      "autoFix": true   //  为vue文件开启保存自动修复的功能
    },
    {
      "language": "html",
      "autoFix": true
    },
  ],
}
