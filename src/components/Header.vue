<script setup lang="ts">
import { useServerDataStore } from '@/stores/server.ts'
import { useUserStore } from '@/stores/user.ts'
import {useColorMode} from "@vueuse/core";
import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import { Icon } from '@iconify/vue'
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const server_data = useServerDataStore()
const user_data = useUserStore()

const mode = useColorMode()

</script>

<template>
  <header class=" bg-popover flex flex-row gap-2 p-4 text-xl items-center justify-between shadow-lg shadow-shadow">
    <div class="flex items-center justify-start gap-4 font-bold">
      <!--<img alt="App logo" class="h-8" src="../assets/icon.png"/>-->
      <div class="text-2xl">
        {{server_data.info.name}}
      </div>

    </div>

    <div class="flex items-center justify-end items-center gap-4 font-bold">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline">
          <Icon icon="radix-icons:moon" class="h-[3rem] w-[3rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Icon icon="radix-icons:sun" class="absolute h-[3rem] w-[3rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="mode = 'light'">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'dark'">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'auto'">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar class="size-16 shadow-md shadow-shadow ">
          <AvatarImage :src="'/api/users/' + user_data.user.id + '/icon'"/>
          <AvatarFallback>{{user_data.user.username[0].toUpperCase}}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="m-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <router-link :to="'/profile'">
            Profile
          </router-link>
        </DropdownMenuItem>
        <DropdownMenuItem @click="user_data.logout()">
          Log Out
        </DropdownMenuItem>
        <DropdownMenuItem>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>


  </header>
</template>

<style scoped>

</style>
