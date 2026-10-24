<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Internal imports
import type { CalculatorOperator } from '@/types/CalculatorTypes';
import { CalculatorUtil } from '@/utils/CalculatorUtil';
import { LabelUtil } from '@/utils/LabelUtil';

// Non-reactive variables
const KEYPAD_ROWS: { digits: string[]; operator: CalculatorOperator }[] = [
  { digits: ['7', '8', '9'], operator: '*' },
  { digits: ['4', '5', '6'], operator: '-' },
  { digits: ['1', '2', '3'], operator: '+' },
];

// Reactive variables
const display = ref('0');
const storedValue = ref<number | null>(null);
const pendingOperator = ref<CalculatorOperator | null>(null);
const isWaitingForOperand = ref(false);
const expression = computed(() =>
  storedValue.value !== null && pendingOperator.value
    ? `${storedValue.value} ${LabelUtil.CALCULATOR_OPERATOR[pendingOperator.value]}`
    : '',
);

// Functions
function inputDigit(digit: string): void {
  if (isWaitingForOperand.value) {
    display.value = digit;
    isWaitingForOperand.value = false;
    return;
  }

  display.value = CalculatorUtil.appendDigit(display.value, digit);
}

function inputDecimal(): void {
  if (isWaitingForOperand.value) {
    display.value = '0.';
    isWaitingForOperand.value = false;
    return;
  }

  display.value = CalculatorUtil.appendDecimal(display.value);
}

function chooseOperator(operator: CalculatorOperator): void {
  if (pendingOperator.value && !isWaitingForOperand.value) {
    evaluate();
  }
  if (display.value === CalculatorUtil.ERROR) {
    return;
  }

  storedValue.value = Number(display.value);
  pendingOperator.value = operator;
  isWaitingForOperand.value = true;
}

function evaluate(): void {
  if (storedValue.value === null || !pendingOperator.value || isWaitingForOperand.value) {
    return;
  }

  display.value = CalculatorUtil.calculate(
    storedValue.value,
    Number(display.value),
    pendingOperator.value,
  );
  storedValue.value = null;
  pendingOperator.value = null;
  isWaitingForOperand.value = true;
}

function deleteLast(): void {
  if (isWaitingForOperand.value) {
    return;
  }

  display.value = CalculatorUtil.removeLast(display.value);
}

function clear(): void {
  display.value = '0';
  storedValue.value = null;
  pendingOperator.value = null;
  isWaitingForOperand.value = false;
}

function handleKeydown(event: KeyboardEvent): void {
  const { key } = event;
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === '.' || key === ',') {
    inputDecimal();
  } else if (CalculatorUtil.isOperator(key)) {
    chooseOperator(key);
  } else if (key === 'Enter' || key === '=') {
    evaluate();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    clear();
  } else {
    return;
  }

  event.preventDefault();
}

// Hooks
onMounted(() => window.addEventListener('keydown', handleKeydown));

onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

useHead({ title: 'Calculator' });
</script>

<template>
  <NuxtLink to="/other" class="btn btn-outline-secondary btn-sm mb-4">← Other</NuxtLink>

  <div class="row justify-content-center">
    <div class="col-12 col-sm-8 col-md-6 col-lg-4">
      <h1 class="h2 fw-bold mb-3">Calculator</h1>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="bg-body-tertiary rounded p-3 mb-3 text-end">
            <div class="small text-body-secondary text-truncate" :style="{ minHeight: '1.5em' }">
              {{ expression }}
            </div>
            <output class="d-block display-6 fw-semibold text-truncate" aria-live="polite">
              {{ display }}
            </output>
          </div>

          <div class="row g-2">
            <div class="col-6">
              <button type="button" class="btn btn-danger w-100 py-3" @click="clear">C</button>
            </div>
            <div class="col-3">
              <button
                type="button"
                class="btn btn-outline-secondary w-100 py-3"
                aria-label="Delete last digit"
                @click="deleteLast"
              >
                ⌫
              </button>
            </div>
            <div class="col-3">
              <button
                type="button"
                class="btn btn-warning w-100 py-3"
                :class="{ active: pendingOperator === '/' }"
                @click="chooseOperator('/')"
              >
                {{ LabelUtil.CALCULATOR_OPERATOR['/'] }}
              </button>
            </div>

            <template v-for="row in KEYPAD_ROWS" :key="row.operator">
              <div v-for="digit in row.digits" :key="digit" class="col-3">
                <button
                  type="button"
                  class="btn btn-light border w-100 py-3"
                  @click="inputDigit(digit)"
                >
                  {{ digit }}
                </button>
              </div>
              <div class="col-3">
                <button
                  type="button"
                  class="btn btn-warning w-100 py-3"
                  :class="{ active: pendingOperator === row.operator }"
                  @click="chooseOperator(row.operator)"
                >
                  {{ LabelUtil.CALCULATOR_OPERATOR[row.operator] }}
                </button>
              </div>
            </template>

            <div class="col-6">
              <button
                type="button"
                class="btn btn-light border w-100 py-3"
                @click="inputDigit('0')"
              >
                0
              </button>
            </div>
            <div class="col-3">
              <button type="button" class="btn btn-light border w-100 py-3" @click="inputDecimal">
                .
              </button>
            </div>
            <div class="col-3">
              <button type="button" class="btn btn-primary w-100 py-3" @click="evaluate">=</button>
            </div>
          </div>
        </div>
      </div>

      <p class="small text-body-secondary mt-3 mb-0">
        Keyboard: digits, <kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd>, <kbd>Enter</kbd> for
        the result, <kbd>Backspace</kbd> to delete and <kbd>Esc</kbd> to clear.
      </p>
    </div>
  </div>
</template>
