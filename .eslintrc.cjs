module.exports = {
  extends: ['@vexip-ui/eslint-config'],
  root: true,
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    'vue/no-v-html': 'off',
    'vue/no-textarea-mustache': 'off'
  }
}
