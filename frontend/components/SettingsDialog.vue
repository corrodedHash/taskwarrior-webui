<template>
  <v-dialog v-model="showDialog" max-width="400px" @keydown.esc="closeDialog">
    <v-card>
      <v-card-title> Settings </v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-list>
            <v-list-item>
              <template #prepend="{ isActive }">
                <v-list-item-action start>
                  <v-checkbox v-model="settings.dark" />
                </v-list-item-action>
              </template>

              <v-list-item-title> Dark </v-list-item-title>
              <v-list-item-subtitle> default theme </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title> Auto Refresh </v-list-item-title>
              <v-list-item-subtitle>
                in minutes (0 means no refresh)
              </v-list-item-subtitle>
              <v-list-item-action>
                <v-text-field
                  v-model="settings.autoRefresh"
                  style="width: 40px"
                  :rules="numberRules"
                />
              </v-list-item-action>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="pb-1">
                Auto Sync
                <v-icon
                  size="18px"
                  class="ml-2"
                  title="Sync immediately"
                  @click="sync"
                >
                  mdi-sync
                </v-icon>
              </v-list-item-title>
              <v-list-item-subtitle>
                in minutes (0 means no auto sync)<br />
                run <code>task sync</code> periodically
              </v-list-item-subtitle>
              <v-list-item-action>
                <v-text-field
                  v-model="settings.autoSync"
                  style="width: 40px"
                  :rules="numberRules"
                />
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog"> Cancel </v-btn>
        <v-btn @click="reset"> Reset </v-btn>
        <v-btn color="primary" @click="save"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSettingsStore, useTaskStore } from "~~/store";

const settingsStore = useSettingsStore();
const taskStore = useTaskStore();

const props = defineProps<{
  modelValue: boolean;
}>();

const emits = defineEmits<{ (e: "update:modelValue", val: boolean): void }>();

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val),
});

const numberRules = [
  (str: string) => (str && !isNaN(+str) && +str >= 0) || "invalid",
];

const formRef = ref(null);
const settings = reactive({
  dark: settingsStore.settings.dark,
  autoRefresh: settingsStore.settings.autoRefresh,
  autoSync: settingsStore.settings.autoSync,
});

const reset = () => {
  settings.dark = settingsStore.settings.dark;
  settings.autoRefresh = settingsStore.settings.autoRefresh;
  settings.autoSync = settingsStore.settings.autoSync;
};

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      reset();
    }
  }
);

const closeDialog = () => {
  showDialog.value = false;
  reset();
};

const save = () => {
  const valid = (formRef as any).value.validate();
  if (valid) {
    settingsStore.updateSettings({
      ...settings,
    });
    closeDialog();
  }
};

const sync = async () => {
  await taskStore.syncTasks();
};
</script>
