<script setup lang="ts">
const {
  label,
  id,
  type = 'text',
  placeholder = '',
  required = false,
} = defineProps<{
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      class="mt-2 w-full border border-line px-3 py-2.5 text-sm placeholder:text-ink-soft/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
    />
  </div>
</template>
