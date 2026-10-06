// Author: Mateo Garcia Carreno

// external imports
import { createPinia } from 'pinia';
import { watch } from 'vue';

const AUTH_STATE_KEY = 'authState';
const LEGACY_STATE_KEY = 'piniaState_v2';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    // The LocalStorage-era blob held every user, password included. The
    // backend owns that data now, so nothing in it is worth keeping.
    localStorage.removeItem(LEGACY_STATE_KEY);

    // Only the session survives a reload. Everything else comes from the API
    // on every visit, so a stale copy can never shadow the server.
    const savedAuth = localStorage.getItem(AUTH_STATE_KEY);
    if (savedAuth) {
      pinia.state.value.auth = JSON.parse(savedAuth);
    }

    watch(
      () => pinia.state.value.auth,
      (auth) => {
        localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(auth));
      },
      { deep: true },
    );

    return pinia;
  }
}
