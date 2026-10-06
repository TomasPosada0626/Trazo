<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
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

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Interfaces
export interface BarSeries {
  label: string;
  values: number[];
  color: string;
}

// Props
const {
  labels,
  series,
  horizontal = false,
  stepSize,
} = defineProps<{
  labels: string[];
  series: BarSeries[];
  horizontal?: boolean;
  stepSize?: number;
}>();

// Reactive variables
const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

// Functions
function datasets(): ChartDataset<'bar'>[] {
  return series.map((entry) => ({
    label: entry.label,
    data: entry.values,
    backgroundColor: entry.color,
    borderRadius: 2,
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

// Watchers
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
