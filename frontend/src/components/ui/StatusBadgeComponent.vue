<script setup lang="ts">
// Author: Mateo Garcia Carreno

// variables
export type BadgeTone = 'positive' | 'warning' | 'neutral' | 'danger';

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

// props
const { tone = 'neutral', color } = defineProps<{
  tone?: BadgeTone;
  color?: string;
}>();
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="color ? 'badge-tinted' : toneClasses[tone]"
    :style="color ? { '--badge-color': color } : undefined"
  >
    <span class="size-1.5 rounded-full" :class="color ? 'badge-dot' : dotClasses[tone]"></span>
    <slot />
  </span>
</template>
