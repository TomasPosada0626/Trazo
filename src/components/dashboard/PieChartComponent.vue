<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { ArcElement, Chart, Legend, PieController, Tooltip } from 'chart.js';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Only the pie pieces, so the bar/line/radar controllers stay tree-shaken.
Chart.register(PieController, ArcElement, Tooltip, Legend);

// props
const { labels, values, colors } = defineProps<{
  labels: string[];
  values: number[];
  /** One colour per slice, in the same order as `labels`. */
  colors: string[];
}>();

// reactive variables
const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

/** A pie of all zeros renders as an empty circle, so say so instead. */
const isEmpty = ref(false);

// functions
function syncEmpty(): void {
  isEmpty.value = values.every((value) => value === 0);
}

function render(): void {
  syncEmpty();
  if (!canvas.value) return;

  chart = new Chart(canvas.value, {
    type: 'pie',
    data: {
      labels: [...labels],
      datasets: [
        {
          data: [...values],
          backgroundColor: [...colors],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 16 } },
        tooltip: {
          callbacks: {
            // Chart.js shows the raw count; the share is what a pie is for.
            label: (context) => {
              const total = values.reduce((sum, value) => sum + value, 0);
              const share = total ? Math.round((context.parsed / total) * 100) : 0;
              return ` ${context.label}: ${context.parsed} (${share}%)`;
            },
          },
        },
      },
    },
  });
}

onMounted(render);

// watchers
// Every field is read straight from the props inside the callback, so there
// is no old/new value to name here.
watch(
  () => [labels, values, colors],
  () => {
    syncEmpty();
    if (!chart) return;

    const dataset = chart.data.datasets[0];
    if (!dataset) return;

    chart.data.labels = [...labels];
    dataset.data = [...values];
    dataset.backgroundColor = [...colors];
    chart.update();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});
</script>

<template>
  <div class="relative h-64">
    <p v-if="isEmpty" class="grid h-full place-items-center text-sm text-ink-soft">
      No tasks in this range yet.
    </p>
    <canvas v-show="!isEmpty" ref="canvas"></canvas>
  </div>
</template>
