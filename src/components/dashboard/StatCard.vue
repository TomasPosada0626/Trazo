<script setup lang="ts">
import { CountUp } from 'countup.js';
import { onMounted, ref, watch } from 'vue';

const {
  value,
  suffix = '',
  total,
} = defineProps<{
  label: string;
  value: number;
  /** Rendered after the number, e.g. '%' or 'pts'. */
  suffix?: string;
  /** Renders the value as "value / total", for completed-of-total counts. */
  total?: number;
}>();

const valueEl = ref<HTMLElement | null>(null);
let counter: CountUp | null = null;

onMounted(() => {
  if (!valueEl.value) return;

  counter = new CountUp(valueEl.value, value, {
    duration: 1,
    // The metrics are whole numbers; a decimal would only flicker.
    decimalPlaces: 0,
    suffix,
  });
  if (!counter.error) counter.start();
});

// Re-run the animation when the project or range filter changes.
watch(
  () => value,
  (next) => counter?.update(next),
);
</script>

<template>
  <div class="border-l-2 border-accent bg-paper px-5 py-4 shadow-sm">
    <p class="font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">{{ label }}</p>
    <p class="mt-1 text-3xl font-bold tracking-tight">
      <span ref="valueEl">0{{ suffix }}</span>
      <span v-if="total !== undefined" class="text-ink-soft"> / {{ total }}</span>
    </p>
  </div>
</template>
