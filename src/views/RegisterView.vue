<script setup lang="ts">
import { useUserStore } from '@/stores/user.ts'
import { useServerDataStore } from '@/stores/server.ts'
import router from '@/router'
import { onBeforeMount, ref } from 'vue'
import InfoBoxComponent from '@/components/InfoBoxComponent.vue'
import { mande } from 'mande'
import { useRoute } from 'vue-router'
import type { IsValid } from '@/lib/types.ts'

const user_data = useUserStore();
const server_data = useServerDataStore();

const api = mande("/api")

let token: string | null = null
if (useRoute().query.t != null) {
  token = useRoute().query.t as string
}
let can_register = token != null || !server_data.info.requires_invite

if (!server_data.info.requires_invite)
token = null;

const token_valid = ref( true)


onBeforeMount(async () => {
  console.log(token)
  if (token != null) {
    const response: IsValid = await api.get(`valid/invite_link/${token}`)
    token_valid.value = response.valid
    console.log(response)

    can_register = can_register && token_valid.value
  }

  console.log(token_valid)

  try {
    await user_data.refreshUserDataIfNeeded();
  } catch {
  }

  if (user_data.logged_in) {
    console.info("User already logged in. redirecting to /")
    await router.replace("/")
  }
});

async function register(data: any, node: any) {
  try {
    await user_data.register(data.username, data.password, token);
    await router.replace("/")
  } catch (e: any) {
    const status = e.response.status

    if (status === 400) {
      node.setErrors(['Username or password include invalid characters'],)
    }
    else if (status === 401) {
      node.setErrors(['Invalid invite'],)
    }
    else if (status === 409) {
      node.setErrors(['Username already taken'],)
    }
    else if (status === 500) {
      node.setErrors(['Could not register'],)
    }

  }
}

const username_valid = async function ({ value }: any ) {
  const response: IsValid = await api.get(`valid/username/${value}`)

  return response.valid;
}

username_valid.blocking = false;
username_valid.debounce = 300;
username_valid.skipEmpty = true;

</script>

<template>
  <div class="flex flex-col h-screen bg_gradient items-center gap-8 2xl:gap-16 text-white">
    <div class="flex flex-col gap-4 items-center justify-center mt-6 flex-1">
      <img class="logo" src="@/assets/logo.svg" />
    </div>

    <div class="flex flex-col gap-4 items-center">
      <p class="text-4xl lg:text-5xl pb-4 font-bold">Register</p>
      <FormKit
        type="form"
        submit-label="Register"
        :incomplete-message=false
        :config="{
          classes: {
            form: 'flex flex-col gap-4 items-center',
            input: 'input input_l',
          },
        }"
        @submit="register"
        :disabled="!can_register"
      >

        <FormKit
          type="text"
          name="username"
          :validation-rules="{ username_exists:username_valid }"
          placeholder="Username"
          validation="required:trim|username_exists"
          :validation-messages="{
            required: 'Username required',
            username_exists: 'Username already taken'
          }"

        />
        <FormKit
          type="password"
          name="password"
          placeholder="Password"
          validation="required:trim"
          class="input input_l"
        />
        <FormKit
          type="password"
          name="password_confirm"
          placeholder="Confirm Password"
          validation="required:trim|confirm"
          class="input input_l"
          :validation-messages="{
            required: 'Passwords do not match',
            confirm: 'Passwords do not match',
          }"
        />
        <div> Already have an account? <router-link class="underline" to="/login">Log in</router-link>  </div>
      </FormKit>
    </div>

    <div class="flex flex-col max-w-[60vw] overflow-y-scroll gap-4 flex-[2]">
      <InfoBoxComponent v-if="!can_register && token_valid" title="No Invite" type="warning" message="This server requires an invite to register" class="self-center shadow-lg" />
      <InfoBoxComponent v-if="!token_valid" title="Invalid Invite" type="warning" message="The invite link is is invalid or expired" class="self-center shadow-lg" />
      <InfoBoxComponent v-if="server_data.info.login_message !== ''" :title="server_data.info.login_message_title" :type="server_data.info.login_message_type" :message="server_data.info.login_message" class="self-center shadow-lg" />
    </div>
    <!--

    -->
  </div>
</template>

<style scoped>
.logo {
  width: min(80vw, 40rem);
}
</style>
