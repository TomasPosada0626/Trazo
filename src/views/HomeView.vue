<script setup lang="ts">
interface Feature {
  label: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    label: 'Proyectos',
    title: 'Un plano por proyecto',
    description:
      'Define alcance, estado y avance general. Cada proyecto agrupa sus propios sprints y su equipo asignado.',
  },
  {
    label: 'Sprints',
    title: 'Velocidad visible',
    description:
      'Compara puntos comprometidos contra puntos completados y conoce los días restantes de cada sprint.',
  },
  {
    label: 'Tareas',
    title: 'Tablero por estado',
    description:
      'Mueve tareas entre "Por hacer", "En progreso" y "Hecho", con prioridad y responsable siempre a la vista.',
  },
];
</script>

<template>
  <main class="mx-auto max-w-6xl px-6">
    <section class="py-20 sm:py-28">
      <p class="font-mono text-xs tracking-[0.25em] text-accent uppercase">
        # PRJ · SPR · TASK — un solo plano
      </p>

      <h1
        class="mt-6 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
      >
        Cada sprint, medido como un plano de obra.
      </h1>

      <p class="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
        Trazo organiza proyectos, sprints y tareas en un mismo tablero: define el alcance, sigue la
        velocidad del equipo y cierra tareas sin perder de vista el avance real.
      </p>

      <div class="mt-9 flex flex-wrap items-center gap-3">
        <RouterLink
          to="/login"
          class="bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Entrar al sistema
        </RouterLink>
        <a
          href="#features"
          class="border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Ver cómo funciona
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
