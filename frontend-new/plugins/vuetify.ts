import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VDataTable } from "vuetify/labs/VDataTable";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components: { ...components, VDataTable },
    directives,
    defaults: {
      VDataTable: {
        fixedHeader: true,
        noDataText: "Results not found",
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
