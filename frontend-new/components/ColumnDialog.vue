<template>
  <v-dialog v-model="showDialog" max-width="400px" @keydown.esc="closeDialog">
    <v-card>
      <v-card-title> Hidden Columns </v-card-title>
      <v-card-text>
        <v-list
          v-model:selected="hiddenColumnsBuffer"
          lines="one"
          density="compact"
          select-strategy="classic"
        >
          <v-list-item
            v-for="c in props.activeColumns"
            :key="c.key"
            :value="c.key"
          >
            <template #append="{ isActive }">
              <v-list-item-action end>
                <v-checkbox-btn :model-value="isActive" />
              </v-list-item-action>
            </template>

            <v-list-item-title>{{ c.title }}</v-list-item-title>
            <!-- 
        <v-list-item-subtitle>
          Automatically add home screen widgets when downloads complete
        </v-list-item-subtitle> -->
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSettingsStore } from "~~/store";
const props = defineProps<{
  value?: boolean;
  activeColumns: { title: string; key: string }[];
}>();

const store = useSettingsStore();
const emits = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const showDialog = computed({
  get: () => props.value,
  set: (val) => emits("update:modelValue", val),
});

const closeDialog = () => {
  showDialog.value = false;
};
const hiddenColumnsBuffer = ref([...store.hiddenColumns]);
watch(hiddenColumnsBuffer, (v) => {
  store.updateHiddenColumns(v);
});
</script>
