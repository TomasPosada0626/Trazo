import { createPinia } from 'pinia';
import { watch } from 'vue';

const PINIA_STATE_KEY = 'piniaState';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    /* const savedState = localStorage.getItem(PINIA_STATE_KEY);
    if (savedState) {
      // Saved stores win, but a store added after this browser's last visit
      // is missing from the saved blob, so it falls back to its seeder.
      // Without this, adding an entity leaves existing users with an empty
      // table until they clear LocalStorage by hand.
      pinia.state.value = { ...seededState, ...JSON.parse(savedState) };
    } else {
      pinia.state.value = seededState;
      localStorage.setItem(PINIA_STATE_KEY, JSON.stringify(pinia.state.value));
    }

    // The whole Pinia state tree is the "database": any change to any
    // store gets persisted here, so individual services never touch
    // localStorage directly.
    watch(
      pinia.state,
      (state) => {
        localStorage.setItem(PINIA_STATE_KEY, JSON.stringify(state));
      },
      { deep: true },
    ); */

    return pinia;
  }
}
