<template>
  <v-app class="task-app">
    <SettingsDialog v-model="settingsDialog" />

    <v-snackbar
      v-model="store.snackbar"
      :color="notification.color"
      :timeout="4000"
    >
      {{ notification.text }}

      <template #action="{ attrs }">
        <v-btn dark text v-bind="attrs" @click="store.snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-app-bar fixed app>
      <v-icon class="mr-2" color="blue"> mdi-sticker-check-outline </v-icon>
      <v-toolbar-title> Taskwarrior WebUI </v-toolbar-title>
      <v-spacer />
      <v-icon class="mr-4" size="28px" title="Theme" @click="toggleDark">
        {{ store.settings.dark ? "mdi-brightness-4" : "mdi-brightness-7" }}
      </v-icon>
      <v-icon
        class="mr-2"
        size="28px"
        title="Settings"
        @click="settingsDialog = true"
      >
        mdi-cog
      </v-icon>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SettingsDialog from "../components/SettingsDialog.vue";
import { useSettingsStore } from "~~/store";
const store = useSettingsStore();

store.fetchSettings();
store.fetchHiddenColumns();

const toggleDark = () => {
  store.updateSettings({ ...store.settings, dark: !store.settings.dark });
};

const settingsDialog = ref(false);

const notification = computed(() => store.notification);

onErrorCaptured((err: any) => {
  let notification: any;
  if (err?.response) {
    const { status, data } = err.response!;
    notification = {
      color: "error",
      text: `Error ${status}: ${data}`,
    };
  } else {
    const { name, message } = err as Error;
    notification = {
      color: "error",
      text: `Error ${name}: ${message}`,
    };
  }
  store.setNotification(notification);
  return false;
});
</script>
