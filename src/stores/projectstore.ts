// Author: Mateo Garcia Carreno

// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';
// internal imports
import type { ProjectInterface } from '@/interfaces/ProjectInterface';

export const useProjectStore = defineStore('project', () => {
  // reactive variables
  const projects = ref<ProjectInterface[]>([]);

  return { projects };
});
