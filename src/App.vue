<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user.ts'
import { useServerDataStore } from '@/stores/server.ts'
import router from '@/router'

const user_data = useUserStore()
const server_data = useServerDataStore()

router.beforeEach(async () => {
  try {
    await server_data.refreshServerDataIfNeeded()
  } catch (error) {
    console.error(error)
    // if connection to the API server fails, go to /login to display the message about it
    if (!window.location.href.includes("login")) {
      await router.replace("/login")
    }
  }
  try {
    await user_data.refreshUserDataIfNeeded();
  } catch (error) {
    console.error(error)
    if (!window.location.href.includes("login") && !window.location.href.includes("register")) {
      await router.replace("/login")
    }
  }
});


</script>

<template>
  <RouterView v-if="server_data.initialised && user_data.initialised" />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
