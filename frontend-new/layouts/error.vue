<template>
  <v-app>
    <h2 class="headline">
      {{ props.error.statusCode }}
    </h2>
    <div>
      {{ props.error.message }}
    </div>
    <NuxtLink to="/"> Home page </NuxtLink>
  </v-app>
</template>

<script setup lang="ts">
import { NuxtError } from "#app";

const message_dict = {
  pageNotFound: "404 Not Found",
  otherError: "An error occurred",
};

const props = defineProps<{
  error: NuxtError;
}>();
</script>
