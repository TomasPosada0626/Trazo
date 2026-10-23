<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Internal imports
import { ColorUtil } from '@/utils/ColorUtil';
import { DateUtil } from '@/utils/DateUtil';
import { LabelUtil } from '@/utils/LabelUtil';
import type { ProjectInterface } from '#shared/interfaces/ProjectInterface';

// Non-reactive variables
const route = useRoute();
const project = await fetchProject(Number(route.params.id));

// Functions
async function fetchProject(id: number): Promise<ProjectInterface> {
  const { data } = await useFetch<ProjectInterface>(`/api/projects/${id}`);
  if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true });
  }

  return data.value;
}

// Hooks
useHead({ title: project.name });
</script>

<template>
  <NuxtLink to="/projects" class="btn btn-outline-secondary btn-sm mb-4">← All projects</NuxtLink>

  <header class="mb-4">
    <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
      <h1 class="h2 fw-bold mb-0">{{ project.name }}</h1>
      <span :class="`badge text-bg-${ColorUtil.PROJECT_STATUS[project.status]}`">
        {{ LabelUtil.PROJECT_STATUS[project.status] }}
      </span>
    </div>
    <p class="text-body-secondary mb-0">{{ project.description }}</p>
  </header>

  <div class="row g-3 mb-4">
    <div class="col-12 col-md-4">
      <div class="card h-100">
        <div class="card-body">
          <p class="text-body-secondary small mb-1">Progress</p>
          <p class="h3 fw-bold mb-2">{{ project.progress }}%</p>
          <div
            class="progress"
            role="progressbar"
            :aria-valuenow="project.progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-bar" :style="{ width: `${project.progress}%` }"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-4">
      <div class="card h-100">
        <div class="card-body">
          <p class="text-body-secondary small mb-1">Tasks</p>
          <p class="h3 fw-bold mb-0">{{ project.taskCount }}</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-4">
      <div class="card h-100">
        <div class="card-body">
          <p class="text-body-secondary small mb-1">Sprints</p>
          <p class="h3 fw-bold mb-0">{{ project.sprints.length }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <section class="col-12 col-lg-8">
      <h2 class="h5 fw-bold">Sprints</h2>
      <div v-if="project.sprints.length" class="table-responsive">
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th scope="col">Sprint</th>
              <th scope="col">Dates</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-end">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sprint in project.sprints" :key="sprint.id">
              <td>
                <div class="fw-semibold">{{ sprint.name }}</div>
                <small class="text-body-secondary">{{ sprint.goal }}</small>
              </td>
              <td class="text-nowrap">
                {{ DateUtil.formatDateRange(sprint.startDate, sprint.endDate) }}
              </td>
              <td>
                <span :class="`badge text-bg-${ColorUtil.SPRINT_STATUS[sprint.status]}`">
                  {{ LabelUtil.SPRINT_STATUS[sprint.status] }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                {{ sprint.completedPoints }} / {{ sprint.committedPoints }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-body-secondary">This project has no sprints.</p>
    </section>

    <section class="col-12 col-lg-4">
      <h2 class="h5 fw-bold">Project users</h2>
      <ul class="list-group">
        <li v-for="user in project.users" :key="user" class="list-group-item">{{ user }}</li>
      </ul>
    </section>
  </div>
</template>
