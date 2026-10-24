<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Internal imports
import { ColorUtil } from '@/utils/ColorUtil';
import { LabelUtil } from '@/utils/LabelUtil';

// Reactive variables
const { data: projects } = await useFetch('/api/projects');

// Hooks
useHead({ title: 'Projects' });
</script>

<template>
  <header class="mb-4">
    <h1 class="h2 fw-bold mb-1">Projects</h1>
    <p class="text-body-secondary mb-0">Every project in Trazo, with its progress and its team.</p>
  </header>

  <div class="row g-4">
    <div v-for="project in projects" :key="project.id" class="col-12 col-md-6 col-xl-3 d-flex">
      <div class="card w-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h2 class="h5 card-title mb-0">{{ project.name }}</h2>
            <span :class="`badge text-bg-${ColorUtil.PROJECT_STATUS[project.status]}`">
              {{ LabelUtil.PROJECT_STATUS[project.status] }}
            </span>
          </div>
          <p class="card-text text-body-secondary">{{ project.description }}</p>

          <div class="mt-auto">
            <div class="d-flex justify-content-between small mb-1">
              <span>Progress</span>
              <span class="fw-semibold">{{ project.progress }}%</span>
            </div>
            <div
              class="progress mb-3"
              role="progressbar"
              :aria-valuenow="project.progress"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div class="progress-bar" :style="{ width: `${project.progress}%` }"></div>
            </div>
            <p class="small text-body-secondary mb-3">
              {{ LabelUtil.pluralize(project.taskCount, 'task') }} ·
              {{ LabelUtil.pluralize(project.sprints.length, 'sprint') }} ·
              {{ LabelUtil.pluralize(project.users.length, 'user') }}
            </p>
            <NuxtLink :to="`/projects/${project.id}`" class="btn btn-primary btn-sm">
              View project
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
