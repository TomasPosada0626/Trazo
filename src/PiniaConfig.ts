import { createPinia } from 'pinia';
import { watch } from 'vue';
import { userSeeder } from '@/stores/userseeder';

const PINIA_STATE_KEY = 'piniaState';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    const savedState = localStorage.getItem(PINIA_STATE_KEY);
    if (savedState) {
      pinia.state.value = JSON.parse(savedState);
    } else {
      // Initialize the state with the seeders. Every store's initial data
      // lives here, keyed by store id, so it's ready before any component
      // calls useXStore() for the first time.
      pinia.state.value = {
        user: { users: userSeeder },
        auth: { currentUserId: null },
      };
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
    );

    return pinia;
  }
}
