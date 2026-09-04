// Author: Hever-Alfonso

// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';
// internal imports
import type { TaskInterface } from '@/interfaces/TaskInterface';

export const useTaskStore = defineStore('task', () => {
  // reactive variables
  const tasks = ref<TaskInterface[]>([]);

  return { tasks };
});
