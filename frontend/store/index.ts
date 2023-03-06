import { Task } from "taskwarrior-lib";
import { defineStore } from "pinia";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as Task[],
  }),
  actions: {
    async fetchTasks() {
      const tasks: Task[] = await $fetch("/api/tasks");
      this.tasks = tasks;
    },

    async deleteTasks(tasks: Task[]) {
      const query = tasks.map((v) => `tasks[]=${v.uuid}`).join("&");
      console.log(query);
      $fetch(`/api/tasks?${query}`, {
        method: "delete",
      });
      // Refresh
      await this.fetchTasks();
    },

    async updateTasks(tasks: Task[]) {
      await $fetch("/api/tasks", { method: "put", body: { tasks } });
      await this.fetchTasks();
    },

    async syncTasks() {
      await $fetch("/api/sync", { method: "post" });
    },
  },
  getters: {
    projects: (state) => {
      return state.tasks
        .map((task) => task.project)
        .filter((p) => p !== undefined) as string[];
    },
    tags: (state) =>
      state.tasks.reduce((tags: string[], task) => {
        return task.tags ? tags.concat(task.tags) : tags;
      }, []),
  },
});

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    snackbar: false,
    notification: {
      color: "",
      text: "",
    },
    settings: {
      dark: false,
      autoRefresh: "5", // in minutes
      autoSync: "0", // in minutes
    },
    hiddenColumns: [] as string[],
  }),
  actions: {
    setNotification(notification: typeof this.notification) {
      this.notification = notification;
      // Show notification
      this.snackbar = true;
    },

    fetchSettings() {
      if (process.client) {
        const settings = localStorage.getItem("settings");
        if (settings) {
          this.settings = JSON.parse(settings);
        }
      }
    },

    updateSettings(settings: typeof this.settings) {
      this.settings = settings;
      if (process.client) {
        localStorage.setItem("settings", JSON.stringify(settings));
      }
    },

    fetchHiddenColumns() {
      if (process.client) {
        const columns = localStorage.getItem("hiddenColumns");
        if (columns) {
          this.hiddenColumns = JSON.parse(columns);
        }
      }
    },

    updateHiddenColumns(columns: typeof this.hiddenColumns) {
      this.hiddenColumns = columns;
      if (process.client) {
        localStorage.setItem("hiddenColumns", JSON.stringify(columns));
      }
    },
  },
});
