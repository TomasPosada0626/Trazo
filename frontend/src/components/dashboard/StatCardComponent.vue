<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { CountUp } from 'countup.js';
import { onMounted, ref, watch } from 'vue';

// props
const {
  value,
  suffix = '',
  total,
} = defineProps<{
  label: string;
  value: number;
  suffix?: string;
  total?: number;
}>();

// reactive variables
const valueEl = ref<HTMLElement | null>(null);
let counter: CountUp | null = null;

// functions
onMounted(() => {
  if (!valueEl.value) return;

  counter = new CountUp(valueEl.value, value, {
    duration: 1,
    decimalPlaces: 0,
    suffix,
  });
  if (!counter.error) counter.start();
});

// watchers
watch(
  () => value,
  (newValue) => counter?.update(newValue),
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
