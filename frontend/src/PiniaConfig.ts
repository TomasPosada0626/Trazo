import { createPinia } from 'pinia';
import { watch } from 'vue';
import { projectSeeder } from '@/seeders/projectseeder';
import { sprintSeeder } from '@/seeders/sprintseeder';
import { taskSeeder } from '@/seeders/taskseeder';
import { userSeeder } from '@/seeders/userseeder';

const PINIA_STATE_KEY = 'piniaState';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    // Every store's initial data, keyed by store id, ready before any
    // component calls useXStore() for the first time.
    const seededState = {
      user: { users: userSeeder },
      project: { projects: projectSeeder },
      sprint: { sprints: sprintSeeder },
      task: { tasks: taskSeeder },
      auth: { currentUserId: null },
    };

    const savedState = localStorage.getItem(PINIA_STATE_KEY);
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
    );

    return pinia;
  }
}
