<template>
  <div class="px-md-6 px-lg-12">
    <v-row class="px-4 pt-4">
      <div class="headline d-flex align-center">{{ mode }}</div>
      <template v-if="mode === 'Projects'">
        <v-icon class="mx-2"> mdi-chevron-right </v-icon>

        <v-select
          class="mb-3"
          :items="projects"
          label="Project"
          v-model="project"
          style="max-width: 120px"
          hide-details
        />
        <div class="ml-6 d-flex align-center">
          <v-progress-circular
            :size="54"
            :width="5"
            :value="progress"
            color="primary"
          >
            {{ progress }}%
          </v-progress-circular>
        </div>
      </template>

      <v-spacer />
      <v-select
        class="mb-3 ml-3"
        :items="allModes"
        label="Display Mode"
        v-model="mode"
        style="max-width: 120px"
        hide-details
      />
    </v-row>

    <TaskList :tasks="tasks" />
  </div>
</template>

<script lang="ts" setup>
import TaskList from "../components/TaskList.vue";
import { Task } from "taskwarrior-lib";
import { useSettingsStore, useTaskStore } from "~~/store";
import { useTheme } from "vuetify";

const settingsStore = useSettingsStore();
const taskStore = useTaskStore();
taskStore.fetchTasks();

// Auto Refresh
let refreshInterval: NodeJS.Timeout | null = null;
const setAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);
  const freq = +settingsStore.settings.autoRefresh;
  if (freq > 0) {
    refreshInterval = setInterval(() => {
      taskStore.fetchTasks();
    }, +settingsStore.settings.autoRefresh * 60000);
  }
};
setAutoRefresh();

// Auto Sync
let syncInterval: NodeJS.Timeout | null = null;
const setAutoSync = () => {
  if (syncInterval) clearInterval(syncInterval);
  const freq = +settingsStore.settings.autoSync;
  if (freq > 0) {
    syncInterval = setInterval(() => {
      taskStore.syncTasks();
    }, +settingsStore.settings.autoSync * 60000);
  }
};
setAutoSync();

const theme = useTheme();

// Update settings
watch(
  () => settingsStore.settings,
  () => {
    setAutoSync();
    setAutoRefresh();
    theme.global.name.value = settingsStore.settings.dark ? "dark" : "light";
  }
);

const mode = ref("Tasks");
const allModes = ["Tasks", "Projects"];

const project = ref("");
const projects: ComputedRef<string[]> = computed(() => taskStore.projects);
watch(projects, () => {
  if (projects.value.includes(project.value)) return;
  if (projects.value.length) project.value = projects.value[0];
  else project.value = "";
});

const tasks: ComputedRef<Task[]> = computed(() => {
  if (mode.value === "Tasks") return taskStore.tasks;

  if (project.value)
    return taskStore.tasks.filter(
      (task: Task) => task.project === project.value
    );

  return [];
});

const progress = computed(() => {
  if (mode.value === "Projects" && project.value) {
    const completed = tasks.value.reduce(
      (acc: number, task) => (task.status === "completed" ? acc + 1 : acc),
      0
    );
    const pending = tasks.value.reduce(
      (acc: number, task) => (task.status === "pending" ? acc + 1 : acc),
      0
    );
    return completed + pending === 0
      ? 100
      : Math.ceil((100 * completed) / (completed + pending));
  }
  return 0;
});
</script>
