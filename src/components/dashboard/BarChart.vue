<script setup lang="ts">
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
  type ChartDataset,
} from 'chart.js';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Register only what these charts use, so tree-shaking can drop the rest of
// Chart.js (line, pie, radar, the date adapters...).
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface BarSeries {
  label: string;
  values: number[];
  color: string;
}

const {
  labels,
  series,
  horizontal = false,
  stepSize,
} = defineProps<{
  labels: string[];
  series: BarSeries[];
  /** Renders the bars left-to-right, for ranking charts like workload. */
  horizontal?: boolean;
  /** Forces whole-number ticks on count axes. */
  stepSize?: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function datasets(): ChartDataset<'bar'>[] {
  return series.map((entry) => ({
    label: entry.label,
    data: entry.values,
    backgroundColor: entry.color,
    borderRadius: 2,
    // A single series does not need a wide bar; two need room side by side.
    barPercentage: 0.7,
    categoryPercentage: 0.7,
  }));
}

function render(): void {
  if (!canvas.value) return;

  chart = new Chart(canvas.value, {
    type: 'bar',
    data: { labels: [...labels], datasets: datasets() },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // One series labels itself in the card heading already.
        legend: { display: series.length > 1, position: 'bottom', labels: { boxWidth: 10 } },
      },
      scales: {
        x: {
          grid: { display: horizontal },
          border: { display: false },
          ticks: horizontal ? { stepSize, precision: 0 } : {},
        },
        y: {
          beginAtZero: true,
          grid: { display: !horizontal },
          border: { display: false },
          ticks: horizontal ? {} : { stepSize, precision: 0 },
        },
      },
    },
  });
}

onMounted(render);

// Rebuilding the data in place keeps Chart.js's own transition, which a
// destroy-and-recreate would lose.
watch(
  () => [labels, series],
  () => {
    if (!chart) return;

    chart.data.labels = [...labels];
    chart.data.datasets = datasets();
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
    <canvas ref="canvas"></canvas>
  </div>
</template>
