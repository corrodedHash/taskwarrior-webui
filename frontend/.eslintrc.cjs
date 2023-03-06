module.exports = {
  root: true,
  extends: ["@nuxt/eslint-config", "prettier"],
  rules: {
    // Generates false positives for the v-data-table, I think
    "vue/valid-v-slot": "off",
  },
};
