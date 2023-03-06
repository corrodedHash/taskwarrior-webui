// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 8080,
  },
  nitro: {
    devProxy: {
      "/api/tasks": { target: "http://localhost:3000/tasks", ignorePath: true },
      "/api/sync": { target: "http://localhost:3000/sync", ignorePath: true },
    },
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
  ssr: false,
  build: {
    transpile: ["vuetify"],
  },
  modules: ["@pinia/nuxt"],
});
