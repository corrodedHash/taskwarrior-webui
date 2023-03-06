<template>
  <v-dialog v-model="showDialog" max-width="300px" @keydown.esc="handler('no')">
    <v-card>
      <v-card-title>
        {{ title }}
      </v-card-title>
      <v-card-text>
        {{ text }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="handler('no')">No</v-btn>
        <v-btn text color="red" @click="handler('yes')">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  value?: boolean;
  title: string;
  text: string;
}>();
const emits = defineEmits<{
  (e: "no"): void;
  (e: "yes"): void;
  (e: "input", val: boolean): void;
}>();

const showDialog = computed({
  get: () => props.value,
  set: (val) => emits("input", val),
});

const handler = (event: "yes" | "no") => {
  showDialog.value = false;
  emits(event as 'yes');
};
</script>
