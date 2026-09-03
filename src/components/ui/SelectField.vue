<script setup lang="ts">
export interface SelectOption {
  value: string;
  label: string;
}

const { compact = false } = defineProps<{
  label: string;
  id: string;
  options: SelectOption[];
  /** Toolbar variant: micro mono label, used for the table filters. */
  compact?: boolean;
}>();

const model = defineModel<string>({ required: true });

// Inlined chevron so the control needs no external asset.
const CHEVRON =
  "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22%235a7591%22%3E%3Cpath%20d%3D%22M4.5%206.5L8%2010l3.5-3.5z%22/%3E%3C/svg%3E')";
</script>

<template>
  <div>
    <label
      :for="id"
      :class="
        compact
          ? 'block font-mono text-[10px] tracking-[0.12em] text-ink-soft uppercase'
          : 'block text-sm font-medium'
      "
    >
      {{ label }}
    </label>
    <select
      :id="id"
      v-model="model"
      :style="{ backgroundImage: CHEVRON }"
      class="w-full appearance-none border border-line bg-paper bg-[length:16px_16px] bg-[position:right_0.65rem_center] bg-no-repeat pr-8 text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
      :class="compact ? 'mt-1.5 py-2 pl-3' : 'mt-2 py-2.5 pl-3'"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
