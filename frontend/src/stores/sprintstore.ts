// Author: Mateo Garcia Carreno

// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';
// internal imports
import type { SprintInterface } from '@/interfaces/SprintInterface';

export const useSprintStore = defineStore('sprint', () => {
  const sprints = ref<SprintInterface[]>([]);

  return { sprints };
});
