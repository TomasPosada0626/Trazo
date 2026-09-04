<script setup lang="ts">
// Author: Mateo Garcia Carreno

// variables
/** Visual tone of the badge, independent of which entity it describes. */
export type BadgeTone = 'positive' | 'warning' | 'neutral' | 'danger';

// props
const { tone = 'neutral' } = defineProps<{ tone?: BadgeTone }>();

// variables
const toneClasses: Record<BadgeTone, string> = {
  positive: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-slate-100 text-slate-600',
  danger: 'bg-red-50 text-red-700',
};

const dotClasses: Record<BadgeTone, string> = {
  positive: 'bg-emerald-500',
  warning: 'bg-amber-500',
  neutral: 'bg-slate-400',
  danger: 'bg-red-500',
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="toneClasses[tone]"
  >
    <span class="size-1.5 rounded-full" :class="dotClasses[tone]"></span>
    <slot />
  </span>
</template>
