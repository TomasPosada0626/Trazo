<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import BrandMark from '@/components/BrandMark.vue';
import { AuthService } from '@/services/AuthService';
import { USER_ROLE } from '@/utils/labels';

interface NavItem {
  label: string;
  to: string;
  /** SVG path data for the 24x24 outline icon. */
  icon: string;
  /** Renders the padlock badge. Matches the route's requiresAdmin guard. */
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const LOCK_ICON =
  'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z';

const groups: NavGroup[] = [
  {
    label: 'General',
    items: [
      {
        label: 'Panel Principal',
        to: '/app/dashboard',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Proyectos',
        to: '/app/projects',
        adminOnly: true,
        icon: 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z',
      },
      {
        label: 'Sprints',
        to: '/app/sprints',
        adminOnly: true,
        icon: 'M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5',
      },
      {
        label: 'Tareas',
        to: '/app/tasks',
        icon: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z',
      },
      {
        label: 'Usuarios',
        to: '/app/users',
        adminOnly: true,
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
      },
    ],
  },
];

const isAdmin = computed(() => AuthService.isAdmin());

/**
 * Admin-only entries are hidden from members rather than shown locked: the
 * route guard would bounce them to the dashboard, so a padlocked link is a
 * dead end. Admins still see the padlock, which marks the entry as restricted.
 */
const visibleGroups = computed(() =>
  groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isAdmin.value || !item.adminOnly),
    }))
    .filter((group) => group.items.length > 0),
);

const router = useRouter();

const currentUser = computed(() => {
  const user = AuthService.getCurrentUser();
  if (!user) return null;

  return {
    name: user.name,
    roleLabel: USER_ROLE[user.role].text,
    initials: user.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  };
});

function handleLogout(): void {
  AuthService.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="flex w-56 shrink-0 flex-col bg-ink text-white">
    <RouterLink to="/" class="flex items-center gap-2.5 px-5 py-5">
      <BrandMark class="size-7 shrink-0 text-accent" />
      <span class="leading-tight">
        <span class="block text-lg font-bold tracking-tight">Trazo</span>
        <span class="block font-mono text-[9px] tracking-[0.18em] text-white/50 uppercase">
          Gestión de proyectos
        </span>
      </span>
    </RouterLink>

    <div class="mx-5 border-t border-white/10"></div>

    <nav class="flex-1 overflow-y-auto py-5">
      <div v-for="group in visibleGroups" :key="group.label" class="mb-6 last:mb-0">
        <p class="px-5 pb-2 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
          {{ group.label }}
        </p>

        <RouterLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 border-l-2 border-transparent px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white nav-section:border-accent nav-section:bg-white/10 nav-section:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4 shrink-0"
            aria-hidden="true"
          >
            <path :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
          <svg
            v-if="item.adminOnly"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            class="ml-auto size-3 shrink-0 text-white/35"
            aria-hidden="true"
          >
            <title>Solo administradores</title>
            <path :d="LOCK_ICON" />
          </svg>
        </RouterLink>
      </div>
    </nav>

    <div class="mx-5 border-t border-white/10"></div>

    <div v-if="currentUser" class="flex items-center gap-3 px-5 py-4">
      <span
        class="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-semibold"
      >
        {{ currentUser.initials }}
      </span>
      <span class="min-w-0 flex-1 leading-tight">
        <span class="block truncate text-sm font-medium">{{ currentUser.name }}</span>
        <span class="block text-[11px] text-white/50">{{ currentUser.roleLabel }}</span>
      </span>
      <button
        type="button"
        class="shrink-0 text-[11px] font-medium text-white/50 transition-colors hover:text-white"
        @click="handleLogout"
      >
        Salir
      </button>
    </div>
  </aside>
</template>
