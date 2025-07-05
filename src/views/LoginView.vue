<script setup lang="ts">
import { useUserStore } from '@/stores/user.ts'
import { useServerDataStore } from '@/stores/server.ts'
import router from '@/router'
import { onBeforeMount } from 'vue'
import InfoBoxComponent from '@/components/InfoBoxComponent.vue'


const user_data = useUserStore();
const server_data = useServerDataStore();

onBeforeMount(async () => {
  if (user_data.logged_in) {
    console.info("User already logged in. redirecting to /")
    await router.replace("/")
  }
});

async function login(data: any, node: any) {
  try {
    await user_data.login(data.username, data.password);
    await router.replace("/")
  } catch {
    node.setErrors(
      ['Invalid username or password'],
    )
  }
}

</script>

<template>
  <div class="flex flex-col grid-rows-3 h-screen bg_gradient items-center justify-center gap-8 2xl:gap-16 text-white">
    <div class="flex flex-col gap-4 items-center justify-center mt-6 flex-1">
      <img class="logo" src="@/assets/logo.svg" />
    </div>

    <div class="flex flex-col gap-4 items-center">
      <p class="text-4xl lg:text-5xl pb-4 font-bold">Log in</p>
      <FormKit
        type="form"
        submit-label="Log In"
        :incomplete-message=false
        :disabled="server_data.failed"
        :config="{
          classes: {
            form: 'flex flex-col gap-4 items-center',
            input: 'input input-l',
            message: 'text-red-500 text-md '
          },
        }"
        @submit="login"
      >

        <FormKit
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          validation="required:trim"
        />
        <FormKit
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          validation="required:trim"
          class="input input-l"
        />
        <div v-if="!server_data.info.requires_invite"> Don't have an account? <router-link class="underline" to="/register">Register here</router-link>  </div>

      </FormKit>
    </div>
    <div class="flex flex-col max-w-[60vw] overflow-y-auto gap-4 flex-2">
      <InfoBoxComponent v-if="server_data.info.login_message !== ''" :title="server_data.info.login_message_title" :type="server_data.info.login_message_type" :message="server_data.info.login_message" class="self-center shadow-lg" />
      <InfoBoxComponent v-if="server_data.failed" title="Error" type="warning" message="Failed to connect to the API server" class="self-center shadow-lg" />
    </div>
  </div>
</template>

<style scoped>
.logo {
  width: min(80vw, 40rem);
}
</style>
