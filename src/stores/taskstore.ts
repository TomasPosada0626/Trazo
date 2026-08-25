import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TaskInterface } from '@/interfaces/TaskInterface';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<TaskInterface[]>([]);

  return { tasks };
});
