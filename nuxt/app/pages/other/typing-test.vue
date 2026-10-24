<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import type { StyleValue } from 'vue';

// Internal imports
import type { TypingTestStatus } from '@/types/TypingTestTypes';
import { TypingTestUtil } from '@/utils/TypingTestUtil';

// Non-reactive variables
const WORD_COUNT = 200;
const TICK_MS = 100;
const NO_BREAK_SPACE = String.fromCharCode(160);
const CARET_SHADOW = 'inset 2px 0 0 var(--bs-primary)';
let timerId: ReturnType<typeof setInterval> | undefined;
let startedAt = 0;

// Reactive variables
const selectedDuration = ref(30);
const selectorDurations = [15, 30, 60];
const text = ref(TypingTestUtil.generateText(WORD_COUNT));
const typed = ref('');
const status = ref<TypingTestStatus>('ready');
const remainingSeconds = ref(selectedDuration.value);
const elapsedSeconds = ref(0);
const keystrokes = ref(0);
const correctKeystrokes = ref(0);
const textBox = ref<HTMLElement | null>(null);
const words = computed(() => {
  let start = 0;

  return text.value.split(' ').map((word) => {
    const entry = { start, characters: [...word, NO_BREAK_SPACE] };
    start += word.length + 1;
    return entry;
  });
});
const correctCharacters = computed(() => TypingTestUtil.countCorrect(text.value, typed.value));
const wpm = computed(() =>
  TypingTestUtil.calculateWpm(correctCharacters.value, elapsedSeconds.value),
);
const accuracy = computed(() =>
  TypingTestUtil.calculateAccuracy(correctKeystrokes.value, keystrokes.value),
);

// Functions
function characterClass(index: number): string {
  if (index >= typed.value.length) {
    return 'text-body-tertiary';
  }
  if (typed.value[index] === text.value[index]) {
    return 'text-body';
  }

  return text.value[index] === ' ' ? 'bg-danger-subtle' : 'text-danger';
}

function caretStyle(index: number): StyleValue | undefined {
  return index === typed.value.length ? { boxShadow: CARET_SHADOW } : undefined;
}

function isActiveWord(start: number, length: number): boolean {
  return typed.value.length >= start && typed.value.length < start + length;
}

function startTest(): void {
  status.value = 'running';
  startedAt = Date.now();
  timerId = setInterval(tick, TICK_MS);
}

function tick(): void {
  const elapsed = (Date.now() - startedAt) / 1000;
  remainingSeconds.value = Math.max(0, Math.ceil(selectedDuration.value - elapsed));
  if (remainingSeconds.value === 0) {
    finishTest();
  }
}

function finishTest(): void {
  stopTimer();
  elapsedSeconds.value = Math.min(selectedDuration.value, (Date.now() - startedAt) / 1000);
  status.value = 'finished';
}

function stopTimer(): void {
  clearInterval(timerId);
  timerId = undefined;
}

function restart(): void {
  stopTimer();
  text.value = TypingTestUtil.generateText(WORD_COUNT);
  typed.value = '';
  status.value = 'ready';
  remainingSeconds.value = selectedDuration.value;
  elapsedSeconds.value = 0;
  keystrokes.value = 0;
  correctKeystrokes.value = 0;
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    restart();
    return;
  }
  if (status.value === 'finished' || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (event.key === 'Backspace') {
    event.preventDefault();
    typed.value = typed.value.slice(0, -1);
    return;
  }
  if (event.key.length !== 1) {
    return;
  }

  event.preventDefault();
  if (status.value === 'ready') {
    startTest();
  }
  keystrokes.value++;
  if (event.key === text.value[typed.value.length]) {
    correctKeystrokes.value++;
  }
  typed.value += event.key;
  if (typed.value.length >= text.value.length) {
    finishTest();
  }
}

// Watchers
watch(selectedDuration, restart);

watch(typed, async () => {
  await nextTick();
  const activeWord = textBox.value?.querySelector<HTMLElement>('[data-active-word]');
  if (textBox.value && activeWord) {
    textBox.value.scrollTop = Math.max(0, activeWord.offsetTop - activeWord.offsetHeight);
  }
});

// Hooks
onMounted(() => window.addEventListener('keydown', handleKeydown));

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  stopTimer();
});

useHead({ title: 'Typing test' });
</script>

<template>
  <NuxtLink to="/other" class="btn btn-outline-secondary btn-sm mb-4">← Other</NuxtLink>

  <div class="row justify-content-center">
    <div class="col-12 col-lg-10">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <h1 class="h2 fw-bold mb-0">Typing test</h1>
        <div class="btn-group" role="group" aria-label="Test duration">
          <button
            v-for="seconds in selectorDurations"
            :key="seconds"
            type="button"
            class="btn btn-outline-primary"
            :class="{ active: selectedDuration === seconds }"
            @click="selectedDuration = seconds"
          >
            {{ seconds }}s
          </button>
        </div>
      </div>

      <div v-if="status === 'finished'" class="card shadow-sm">
        <div class="card-body p-4">
          <div class="row g-3 text-center mb-4">
            <div class="col-6 col-md-3">
              <p class="text-body-secondary small mb-1">WPM</p>
              <p class="display-5 fw-bold text-primary mb-0">{{ wpm }}</p>
            </div>
            <div class="col-6 col-md-3">
              <p class="text-body-secondary small mb-1">Accuracy</p>
              <p class="display-5 fw-bold mb-0">{{ accuracy }}%</p>
            </div>
            <div class="col-6 col-md-3">
              <p class="text-body-secondary small mb-1">Characters</p>
              <p class="display-5 fw-bold mb-0">{{ correctCharacters }}/{{ typed.length }}</p>
            </div>
            <div class="col-6 col-md-3">
              <p class="text-body-secondary small mb-1">Time</p>
              <p class="display-5 fw-bold mb-0">{{ Math.round(elapsedSeconds) }}s</p>
            </div>
          </div>
          <div class="text-center">
            <button type="button" class="btn btn-primary" @click="restart">Try again</button>
          </div>
        </div>
      </div>

      <div v-else class="card shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="h3 fw-bold text-primary mb-0">{{ remainingSeconds }}</span>
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="restart">
              Restart
            </button>
          </div>

          <div
            ref="textBox"
            class="position-relative overflow-hidden font-monospace fs-4"
            :style="{ height: '7.5rem', lineHeight: '2.5rem' }"
          >
            <span
              v-for="word in words"
              :key="word.start"
              class="d-inline-block"
              :data-active-word="isActiveWord(word.start, word.characters.length) || undefined"
            >
              <span
                v-for="(character, offset) in word.characters"
                :key="offset"
                :class="characterClass(word.start + offset)"
                :style="caretStyle(word.start + offset)"
                >{{ character }}</span
              >
            </span>
          </div>

          <p class="small text-body-secondary mt-3 mb-0">
            <template v-if="status === 'ready'">The timer starts with your first key.</template>
            Press <kbd>Esc</kbd> to restart with new words.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
