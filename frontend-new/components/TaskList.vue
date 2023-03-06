<template>
  <div>
    <ConfirmationDialog
      v-model="showConfirmationDialog"
      :title="confirmation.title"
      :text="confirmation.text"
      @yes="confirmation.handler"
    />
    <TaskDialog v-model="showTaskDialog" :task="currentTask || undefined" />
    <ColumnDialog v-model="showColumnDialog" :active-columns="headers" />
    <v-row class="px-4 pt-4">
      <v-btn-toggle
        v-model="status"
        mandatory
        background-color="rgba(0, 0, 0, 0)"
      >
        <v-row class="pa-3">
          <v-btn
            v-for="st in allStatus"
            :key="st"
            :value="st"
            text
            :color="st === status ? 'primary' : undefined"
            @click="st !== status && (selected = [])"
          >
            <v-icon class="mr-1" :color="st === status ? 'primary' : undefined">
              {{ statusIcons[st] }}
            </v-icon>
            {{ st }}
            <v-badge
              v-if="
                st === 'pending' &&
                classifiedTasks[st].value &&
                classifiedTasks[st].value.length
              "
              :content="classifiedTasks[st].value.length"
              :color="st === status ? 'primary' : 'grey'"
              inline
            />
          </v-btn>
        </v-row>
      </v-btn-toggle>
    </v-row>

    <v-row class="px-4 pt-4">
      <v-data-table
        :items="classifiedTasks[status]"
        :headers="filteredHeaders"
        show-select
        item-value="uuid"
        :item-class="rowClass"
        v-model="selected"
        class="elevation-1"
        density="compact"
        style="width: 100%"
      >
        <template v-slot:top>
          <v-row class="px-4">
            <!-- Batch actions -->
            <div class="pl-2 pt-2" v-show="selected.length">
              <v-btn
                v-show="status === 'pending'"
                class="ma-1 green"
                fab
                small
                dark
                title="Done"
                @click="completeTasks(selected)"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn
                v-show="status === 'completed' || status === 'deleted'"
                class="ma-1"
                color="primary"
                fab
                dark
                small
                title="Restore"
                @click="restoreTasks(selected)"
              >
                <v-icon>mdi-restore</v-icon>
              </v-btn>
              <v-btn
                v-show="status !== 'deleted'"
                class="ma-1 red"
                fab
                dark
                small
                title="Delete"
                @click="deleteTasks(selected)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>

            <v-spacer />

            <!-- Global Actions -->
            <div class="ma-2">
              <v-btn
                class="green ml-1"
                fab
                dark
                title="Refresh"
                @click="refresh"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
              <v-btn
                class="primary ml-1"
                fab
                dark
                title="New task"
                @click="newTask"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn
                class="primary ml-1"
                fab
                dark
                small
                title="Configure Columns"
                @click="showColumnDialog = true"
              >
                <v-icon>mdi-cogs</v-icon>
              </v-btn>
            </div>
          </v-row>
        </template>

        <template v-slot:item.description="{ item }">
          <span v-html="linkify(item.raw.description)" />
        </template>

        <template v-if="status === 'waiting'" v-slot:item.wait="{ item }">
          {{ displayDate(item.raw.wait) }}
        </template>
        <template v-slot:item.scheduled="{ item }">
          {{ displayDate(item.raw.scheduled) }}
        </template>
        <template v-slot:item.due="{ item }">
          {{ displayDate(item.raw.due) }}
        </template>
        <template v-slot:item.until="{ item }">
          {{ displayDate(item.raw.until) }}
        </template>

        <template v-slot:item.tags="{ item }">
          <v-chip v-for="tag in item.raw.tags" :key="tag" small>
            {{ tag }}
          </v-chip>
        </template>

        <template v-slot:item.urgency="{ item }">
          {{ item.raw.urgency }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon
            v-show="status === 'pending'"
            size="20px"
            class="ml-2"
            @click="completeTasks([item.raw.uuid])"
            title="Done"
          >
            mdi-check
          </v-icon>
          <v-icon
            v-show="status === 'completed' || status === 'deleted'"
            size="20px"
            class="ml-2"
            @click="restoreTasks([item.raw.uuid])"
            title="Restore"
          >
            mdi-restore
          </v-icon>
          <v-icon
            class="ml-2"
            size="20px"
            @click="editTask(item.raw)"
            title="Edit"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            v-show="status !== 'deleted'"
            class="ml-2"
            size="20px"
            @click="deleteTasks([item.raw.uuid])"
            title="Delete"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { Task } from "taskwarrior-lib";
import _ from "lodash";
import TaskDialog from "../components/TaskDialog.vue";
import ConfirmationDialog from "../components/ConfirmationDialog.vue";
import ColumnDialog from "../components/ColumnDialog.vue";
import moment from "moment";
import urlRegex from "url-regex-safe";
import normalizeUrl from "normalize-url";

import { useTaskStore, useSettingsStore } from "@/store/index";

const taskStore = useTaskStore();
const settingsStore = useSettingsStore();
function displayDate(str?: string) {
  if (!str) return str;

  const date = moment(str);
  const diff = moment.duration(date.diff(moment()));
  if (Math.abs(diff.asDays()) < 1) return diff.humanize(true);
  return date.format("YYYY-MM-DD");
}

function urgentDate(str?: string) {
  if (!str) return false;

  const date = moment(str);
  const diff = moment.duration(date.diff(moment()));
  const days = diff.asDays();
  if (days > 0 && days < 1) return true;

  return false;
}

function expiredDate(str?: string) {
  if (!str) return false;

  const date = moment(str);
  return date.isBefore(moment());
}

function futureDate(str?: string) {
  if (!str) return false;

  const date = moment(str);
  return date.isAfter(moment());
}

function linkify(text: string | undefined) {
  if (text === undefined) {
    return "";
  }
  const regex = urlRegex();

  let match;
  let lastIndex = 0;
  let result = "";
  while ((match = regex.exec(text)) !== null) {
    const str = text.substring(lastIndex, match.index);
    const url = `<a target="_blank" href=${normalizeUrl(match[0])}>${
      match[0]
    }</a>`;
    result = `${result}${str}${url}`;
    lastIndex = match.index + match[0].length;
  }
  result += text.substring(lastIndex);

  return result;
}

const props = defineProps<{ tasks: Task[] }>();

const selected = ref([] as string[]);

const status = ref("pending");
const allStatus = ["pending", "waiting", "completed", "deleted", "recurring"];
const statusIcons: { [st: string]: string } = {
  pending: "mdi-clock-outline",
  waiting: "mdi-pause",
  completed: "mdi-check",
  deleted: "mdi-delete",
  recurring: "mdi-restart",
};
const headers = computed(() => [
  { title: "Project", key: "project" },
  { title: "Description", key: "description" },
  { title: "Priority", key: "priority" },
  { title: "Scheduled", key: "scheduled" },
  ...(status.value === "recurring" ? [{ title: "Recur", key: "recur" }] : []),
  ...(status.value !== "waiting"
    ? [{ title: "Due", key: "due" }]
    : [{ title: "Wait", key: "wait" }]),
  { title: "Until", key: "until" },
  { title: "Tags", key: "tags" },
  {
    title: "Urgency",
    key: "urgency",
    sort: (a: number, b: number) => !(a > b),
  },
  { title: "Actions", key: "actions", sortable: false },
]);

const filteredHeaders = computed(() =>
  headers.value.filter((v) => !settingsStore.hiddenColumns.includes(v.key))
);

const showColumnDialog = ref(false);

const tempTasks: { [key: string]: ComputedRef<Task[]> } = {};
for (const status of allStatus) {
  tempTasks[status] = computed((): Task[] =>
    props.tasks?.filter((task) => {
      if (status === "waiting" || status === "pending") {
        const waiting =
          (task.wait && !expiredDate(task.wait)) ||
          (task.scheduled && futureDate(task.scheduled));
        return (
          task.status === "pending" &&
          (status === "pending" ? !waiting : waiting)
        );
      } else if (status === "pending") {
        return (
          task.status === "pending" && !(task.wait && !expiredDate(task.wait))
        );
      } else {
        return task.status === status;
      }
    })
  );
}
const classifiedTasks = reactive(tempTasks);

const refresh = () => {
  taskStore.fetchTasks();
};

const showConfirmationDialog = ref(false);
const confirmation = reactive({
  title: "Confirm",
  text: "",
  handler: () => {},
});

const showTaskDialog = ref(false);
const currentTask: Ref<Task | null> = ref(null);
const newTask = () => {
  showTaskDialog.value = true;
  currentTask.value = null;
};

const editTask = (task: Task) => {
  showTaskDialog.value = true;
  currentTask.value = _.cloneDeep(task);
};

const completeTasks = async (task_ids: string[]) => {
  const tasks = props.tasks.filter((v) => task_ids.includes(v.uuid as string));
  await taskStore.updateTasks(
    tasks.map((task) => {
      return {
        ...task,
        status: "completed",
      };
    })
  );
  selected.value = selected.value.filter(
    (task) => tasks.findIndex((t) => t.uuid === task) === -1
  );
  settingsStore.setNotification({
    color: "success",
    text: "Successfully complete the task(s)",
  });
};

const deleteTasks = (task_ids: string[]) => {
  const tasks = props.tasks.filter((v) => task_ids.includes(v.uuid as string));

  confirmation.text = "Are you sure to delete the task(s)?";
  confirmation.handler = async () => {
    await taskStore.deleteTasks(tasks);
    selected.value = selected.value.filter(
      (task) => tasks.findIndex((t) => t.uuid === task) === -1
    );
    settingsStore.setNotification({
      color: "success",
      text: "Successfully delete the task(s)",
    });
  };
  showConfirmationDialog.value = true;
};

const restoreTasks = (task_ids: string[]) => {
  const tasks = props.tasks.filter((v) => task_ids.includes(v.uuid as string));

  confirmation.text = "Are you sure to restore the task(s)?";
  confirmation.handler = async () => {
    await taskStore.updateTasks(
      tasks.map((task) => {
        return {
          ...task,
          status: "pending",
        };
      })
    );
    selected.value = selected.value.filter(
      (task) => tasks.findIndex((t) => t.uuid === task) === -1
    );
    settingsStore.setNotification({
      color: "success",
      text: "Successfully restore the task(s)",
    });
  };
  showConfirmationDialog.value = true;
};

const rowClass = (item: Task) => {
  if (item.mask) return "recur-task";
  else if (status.value !== "completed" && urgentDate(item.due))
    return "urgent-task";
  else if (status.value !== "completed" && expiredDate(item.due))
    return "expired-task";
  return undefined;
};
</script>

<style>
.v-application tr.recur-task {
  background-color: #2196f333;
}

.v-application tr.urgent-task {
  background-color: #f4433633;
}

.v-application tr.expired-task {
  background-color: #79554844;
}
</style>
