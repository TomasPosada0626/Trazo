import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectInterface[]>([]);

  return { projects };
});
