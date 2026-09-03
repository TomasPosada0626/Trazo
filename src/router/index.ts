import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '@/components/layout/AppLayout.vue';
import { AuthService } from '@/services/AuthService';
import DashboardView from '@/views/dashboard/DashboardView.vue';
import LoginView from '@/views/login/LoginView.vue';
import ProjectsCreateView from '@/views/projects/ProjectsCreateView.vue';
import ProjectsEditView from '@/views/projects/ProjectsEditView.vue';
import ProjectsIndexView from '@/views/projects/ProjectsIndexView.vue';
import SprintsCreateView from '@/views/sprints/SprintsCreateView.vue';
import SprintsEditView from '@/views/sprints/SprintsEditView.vue';
import SprintsIndexView from '@/views/sprints/SprintsIndexView.vue';
import TasksCreateView from '@/views/tasks/TasksCreateView.vue';
import TasksEditView from '@/views/tasks/TasksEditView.vue';
import TasksIndexView from '@/views/tasks/TasksIndexView.vue';
import UsersCreateView from '@/views/users/UsersCreateView.vue';
import UsersEditView from '@/views/users/UsersEditView.vue';
import UsersIndexView from '@/views/users/UsersIndexView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    // Breadcrumb shown in the app layout's topbar: "title / section".
    title?: string;
    section?: string;
    // Redirects to Login when there's no active session.
    requiresAuth?: boolean;
    // Redirects non-admins to the Dashboard. Implies requiresAuth.
    requiresAdmin?: boolean;
    // Redirects already-authenticated users away from Login.
    guestOnly?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // No landing page: the app opens straight into the login screen.
      path: '/',
      redirect: { name: 'login' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      // Authenticated area. requiresAuth is set once here and inherited by
      // every child via the merged meta.
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Dashboard', section: 'overview' },
        },
        {
          path: 'projects',
          name: 'projects',
          component: ProjectsIndexView,
          meta: { title: 'Projects', section: 'management', requiresAdmin: true },
        },
        {
          path: 'projects/new',
          name: 'projects-create',
          component: ProjectsCreateView,
          meta: { title: 'Projects', section: 'new', requiresAdmin: true },
        },
        {
          path: 'projects/:id/edit',
          name: 'projects-edit',
          component: ProjectsEditView,
          meta: { title: 'Projects', section: 'edit', requiresAdmin: true },
        },
        {
          path: 'sprints',
          name: 'sprints',
          component: SprintsIndexView,
          meta: { title: 'Sprints', section: 'management', requiresAdmin: true },
        },
        {
          path: 'sprints/new',
          name: 'sprints-create',
          component: SprintsCreateView,
          meta: { title: 'Sprints', section: 'new', requiresAdmin: true },
        },
        {
          path: 'sprints/:id/edit',
          name: 'sprints-edit',
          component: SprintsEditView,
          meta: { title: 'Sprints', section: 'edit', requiresAdmin: true },
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: TasksIndexView,
          meta: { title: 'Tasks', section: 'management' },
        },
        {
          path: 'tasks/new',
          name: 'tasks-create',
          component: TasksCreateView,
          meta: { title: 'Tasks', section: 'new' },
        },
        {
          path: 'tasks/:id/edit',
          name: 'tasks-edit',
          component: TasksEditView,
          meta: { title: 'Tasks', section: 'edit' },
        },
        {
          path: 'users',
          name: 'users',
          component: UsersIndexView,
          meta: { title: 'Users', section: 'management', requiresAdmin: true },
        },
        {
          path: 'users/new',
          name: 'users-create',
          component: UsersCreateView,
          meta: { title: 'Users', section: 'new', requiresAdmin: true },
        },
        {
          path: 'users/:id/edit',
          name: 'users-edit',
          component: UsersEditView,
          meta: { title: 'Users', section: 'edit', requiresAdmin: true },
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const isAuthenticated = AuthService.getCurrentUser() !== undefined;
  const isAdmin = AuthService.isAdmin();

  if (to.meta.requiresAdmin && !isAdmin) {
    return isAuthenticated ? { name: 'dashboard' } : { name: 'login' };
  }
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' };
  }
  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
