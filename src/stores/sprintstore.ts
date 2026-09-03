import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SprintInterface } from '@/interfaces/SprintInterface';

export const useSprintStore = defineStore('sprint', () => {
  const sprints = ref<SprintInterface[]>([]);

  return { sprints };
});
