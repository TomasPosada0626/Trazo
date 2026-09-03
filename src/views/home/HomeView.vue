<script setup lang="ts">
interface Feature {
  label: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    label: 'Projects',
    title: 'One blueprint per project',
    description:
      'Define scope, status and overall progress. Each project groups its own sprints and its assigned team.',
  },
  {
    label: 'Sprints',
    title: 'Visible velocity',
    description:
      'Compare committed points against completed points and see how many days each sprint has left.',
  },
  {
    label: 'Tasks',
    title: 'Board by status',
    description:
      'Move tasks between "To do", "In progress" and "Done", with priority and assignee always in view.',
  },
];
</script>

<template>
  <main class="mx-auto max-w-6xl px-6">
    <section class="py-20 sm:py-28">
      <p class="font-mono text-xs tracking-[0.25em] text-accent uppercase">
        # PRJ · SPR · TASK — one single blueprint
      </p>

      <h1
        class="mt-6 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
      >
        Every sprint, measured like a construction blueprint.
      </h1>

      <p class="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
        Trazo organizes projects, sprints and tasks on a single board: define the scope, track the
        team's velocity and close tasks without losing sight of real progress.
      </p>

      <div class="mt-9 flex flex-wrap items-center gap-3">
        <RouterLink
          to="/login"
          class="bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Enter the app
        </RouterLink>
        <a
          href="#features"
          class="border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          See how it works
        </a>
      </div>
    </section>

    <section id="features" class="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="feature in features"
        :key="feature.label"
        class="border border-line bg-paper p-6 transition-colors hover:border-ink-soft"
      >
        <p class="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
          {{ feature.label }}
        </p>
        <h2 class="mt-3 text-lg font-semibold tracking-tight">{{ feature.title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ feature.description }}</p>
      </article>
    </section>
  </main>
</template>
