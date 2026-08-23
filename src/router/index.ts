import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';
import { AuthService } from '@/services/AuthService';
import DashboardView from '@/views/DashboardView.vue';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ProjectsCreateView from '@/views/ProjectsCreateView.vue';
import ProjectsEditView from '@/views/ProjectsEditView.vue';
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
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideHeader: true, guestOnly: true },
    },
    {
      // Authenticated area. The layout owns the sidebar and topbar, so the
      // marketing header is suppressed for every child route. requiresAuth
      // is set once here and inherited by every child via the merged meta.
      path: '/app',
      component: AppLayout,
      meta: { hideHeader: true, requiresAuth: true },
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
          meta: { title: 'Proyectos', section: 'gestión', requiresAdmin: true },
        },
        {
          path: 'projects/new',
          name: 'projects-create',
          component: ProjectsCreateView,
          meta: { title: 'Proyectos', section: 'nuevo', requiresAdmin: true },
        },
        {
          path: 'projects/:id/edit',
          name: 'projects-edit',
          component: ProjectsEditView,
          meta: { title: 'Proyectos', section: 'editar', requiresAdmin: true },
        },
        {
          path: 'sprints',
          name: 'sprints',
          component: SprintsIndexView,
          meta: { title: 'Sprints', section: 'gestión', requiresAdmin: true },
        },
        {
          path: 'sprints/new',
          name: 'sprints-create',
          component: SprintsCreateView,
          meta: { title: 'Sprints', section: 'nuevo', requiresAdmin: true },
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
          meta: { title: 'Usuarios', section: 'gestión', requiresAdmin: true },
        },
        {
          path: 'users/new',
          name: 'users-create',
          component: UsersCreateView,
          meta: { title: 'Usuarios', section: 'nuevo', requiresAdmin: true },
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
