/// <reference types="vite/client" />

/**
 * vue-cal 4.x ships no type declarations, so `vue-tsc` cannot resolve the
 * import on its own. Declaring it as a component keeps the build passing;
 * its props are checked at runtime by the library rather than by TypeScript.
 */
declare module 'vue-cal' {
  import type { DefineComponent } from 'vue';

  const VueCal: DefineComponent<Record<string, unknown>>;
  export default VueCal;
}
