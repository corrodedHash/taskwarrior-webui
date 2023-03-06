// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 8080,
  },
  css: [
    "vuetify/lib/styles/main.sass",
    // mdi font
    "@mdi/font/css/materialdesignicons.css",
    // main font
    "typeface-open-sans/index.css",
    // App css
    "@/assets/app.css",
  ],
  build: {
    transpile: ["vuetify"],
  },
  ssr: false,
  modules: [
    // ...
    "@pinia/nuxt",
  ],
  //   proxy: {
  //     // Backend
  //     "/api": {
  //       target: "http://localhost:3000/",
  //       changeOrigin: true,
  //       pathRewrite: {
  //         "/api": "",
  //       },
  //     },
  //   },
});
