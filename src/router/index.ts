import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ProjectsCreateView from '@/views/ProjectsCreateView.vue';
import ProjectsIndexView from '@/views/ProjectsIndexView.vue';
import SprintsCreateView from '@/views/SprintsCreateView.vue';
import SprintsIndexView from '@/views/SprintsIndexView.vue';
import TasksIndexView from '@/views/TasksIndexView.vue';
import UsersCreateView from '@/views/UsersCreateView.vue';
import UsersIndexView from '@/views/UsersIndexView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    // Hides the marketing header, for standalone pages like login.
    hideHeader?: boolean;
    // Breadcrumb shown in the app layout's topbar: "title / section".
    title?: string;
    section?: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideHeader: true },
    },
    {
      // Authenticated area. The layout owns the sidebar and topbar, so the
      // marketing header is suppressed for every child route.
      path: '/app',
      component: AppLayout,
      meta: { hideHeader: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Panel Principal', section: 'vista general' },
        },
        {
          path: 'projects',
          name: 'projects',
          component: ProjectsIndexView,
          meta: { title: 'Proyectos', section: 'gestión' },
        },
        {
          path: 'projects/new',
          name: 'projects-create',
          component: ProjectsCreateView,
          meta: { title: 'Proyectos', section: 'nuevo' },
        },
        {
          path: 'sprints',
          name: 'sprints',
          component: SprintsIndexView,
          meta: { title: 'Sprints', section: 'gestión' },
        },
        {
          path: 'sprints/new',
          name: 'sprints-create',
          component: SprintsCreateView,
          meta: { title: 'Sprints', section: 'nuevo' },
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: TasksIndexView,
          meta: { title: 'Tareas', section: 'tablero' },
        },
        {
          path: 'users',
          name: 'users',
          component: UsersIndexView,
          meta: { title: 'Usuarios', section: 'gestión' },
        },
        {
          path: 'users/new',
          name: 'users-create',
          component: UsersCreateView,
          meta: { title: 'Usuarios', section: 'nuevo' },
        },
      ],
    },
  ],
});

export default router;
