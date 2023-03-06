<template>
  <v-dialog v-model="showDialog" max-width="400px" @keydown.esc="closeDialog">
    <v-card>
      <v-card-title> Hidden Columns </v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-list-item v-for="c in props.activeColumns" :key="c.value">
              <v-list-item-title> {{ c.text }} </v-list-item-title>
            <v-list-item-action>
              <v-checkbox v-model="hiddenColumnsBuffer" :value="c.value" />
            </v-list-item-action>
          </v-list-item>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useState } from "~~/store";
const props = defineProps<{
  value?: boolean;
  activeColumns: { text: string; value: string }[];
}>();

const store = useState();
const emits = defineEmits<{ (e: "input", value: boolean): void }>();

const showDialog = computed({
  get: () => props.value,
  set: (val) => emits("input", val),
});

const closeDialog = () => {
  showDialog.value = false;
};
const hiddenColumnsBuffer = ref([...store.hiddenColumns]);
watch(hiddenColumnsBuffer, (v) => {
  store.updateHiddenColumns(v);
});
</script>
