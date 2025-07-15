<script setup lang="ts">
import { mande } from 'mande'
import {ref, watch} from "vue";
import type { IsValid, World, WorldRecursive, WorldStatus } from '@/lib/types.ts'
import {useUserStore} from "@/stores/user.ts";
import {useServerDataStore} from "@/stores/server.ts";
import {useRoute} from "vue-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import { CgSpinner } from 'vue-icons-plus/cg'
import WorldConfigView from '@/views/world/WorldConfigView.vue'
import router from '@/router'
import ImageUpload from '@/components/ImageUpload.vue'


const api = mande("/api")
const user = useUserStore()
const server = useServerDataStore()
const route = useRoute()

const data_loaded = ref(false)
const world = ref({} as WorldRecursive)
const world_status = ref({} as WorldStatus)
const config = ref({} as Object)

const max_memory = ref(8196)
const remaining_memory = ref(null as number | null)
const other_enabled_world_count = ref(0)

const world_operation_running = ref(false)

const worldFormSchema = toTypedSchema(z.object({
  //username: z.string().min(2).max(50),
  name: z.string().min(1).max(255),
  hostname: z.string().min(2).max(255).regex(/^[a-z0-9]+$/, "The hostname can contain only lowercase letters and numbers"),
  allocated_memory: z.number().max(remaining_memory.value ?? max_memory.value, `Your remaining total memory limit is ${remaining_memory.value ?? max_memory.value}` ),
}))

const world_form = useForm({
  validationSchema: worldFormSchema,
})

async function validateHostname(hostname: any) {
  if (hostname === world.value.hostname) {
    return true
  }
  const response: IsValid = await api.get(`/valid/hostname/${hostname}`)
  return response.valid;
}

const onWorldUpdate = world_form.handleSubmit(async (values: any) => {
  if (await validateHostname(values.hostname)) {
    try {
    world.value = await api.patch(`/worlds/${world.value.id}?recursive=true`, values) as WorldRecursive
    }
    catch (error: any) {
      console.log(error)
      toast.error('error updating world', {
        description: `${error.message}`,
      })
      throw error
    }

  } else {
    world_form.setFieldError("hostname", "Hostname is already taken")
  }
})

async function updateWorldStatus(enabled: boolean) {
  if (!world_operation_running.value) {
    world_operation_running.value = true
    try {
      world.value = await api.patch(`/worlds/${world.value.id}?recursive=true`, {enabled: enabled})
      world_status.value = await api.get(`worlds/${world.value.id}/status`) as WorldStatus
      if (enabled) {
        toast.success("World Started", {
          description: `In a moment you will be able to connect to ${world.value.name}`,
        })
      }
    }
    catch (error: any) {
      console.log(error)
      toast.error(`Error ${enabled ? 'Starting' : 'Stopping'} World`, {
        description: `${error.message}`,
      })
      world_operation_running.value = false
      throw error
    }
    world_operation_running.value = false
  }
}

watch(() => route.params.id, (id) => fetchData(id as string), { immediate: true })

async function fetchData(id: string) {
  try {
    await Promise.all([
      api.get(`worlds/${id}?recursive=true`),
      api.get(`worlds/${id}/status`),
      api.get(`worlds/${id}/config`),
    ]).then((values) => {
      world.value = values[0] as WorldRecursive
      world_status.value = values[1] as WorldStatus
      config.value = values[2]
    })
  }
  catch (error: any) {
    console.log(error)
    toast.error('Error Loading Page', {
      description: `${error.message}`,
    })
    throw error
  }

  document.title = `${world.value.name} | ${server.info.name || "MCManager"}`;

  let memory_usage = user.user.total_memory_usage

  if (world.value.enabled) {
    memory_usage -= world.value.allocated_memory
  }

  const remaining = user.user.group.total_memory_limit as number - memory_usage

  if (user.user.group.total_memory_limit != null) {
    remaining_memory.value = remaining
  }
  if (user.user.group.per_world_memory_limit != null) {
    max_memory.value = user.user.group.per_world_memory_limit as number
  }
  world_form.setFieldValue('name', world.value.name)
  world_form.setFieldValue('hostname', world.value.hostname)
  world_form.setFieldValue('allocated_memory', world.value.allocated_memory)
  data_loaded.value = true

  const other_worlds = await api.get(`worlds?enabled=true&id=!${world.value.id}`) as World[]
  other_enabled_world_count.value = other_worlds.length
}

</script>


<template>
  <div class="flex flex-1 flex-col sm:flex-row overflow-y-auto" v-if="data_loaded">
    <div class="w-full min-w-[20rem] sm:max-w-[30rem] flex flex-col bg-card/50 shadow-shadow shadow-lg mb-0 p-4 gap-4 sm:overflow-y-auto">
      <ImageUpload :icon_src="`/api/worlds/${world.id}/icon`" :icon_id="world.id">
        <template #error>
          <img src="@/assets/world_default.png"/>
        </template>
      </ImageUpload>

      <div>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">{{world.name}}</p>
            <p class="lg:text-lg">{{world.version.mod_loader.name}} {{world.version.minecraft_version}}</p>
          </div>
          <Button v-if="world_status.status === 'running'" variant="destructive" @click="updateWorldStatus(false)">
            <CgSpinner v-if="world_operation_running" class="animate-spin" />
            <Icon v-else icon="radix-icons:stop"/>
            Stop World
          </Button>
          <Button v-else-if="other_enabled_world_count < (user.user.group.active_world_limit ?? 1000000)" variant="green" @click="updateWorldStatus(true)">
            <CgSpinner v-if="world_operation_running" class="animate-spin"/>
            <Icon v-else icon="radix-icons:play"/>
            Start World
          </Button>
          <Button v-else disabled>
            <Icon icon="radix-icons:play"/>
            Start World
          </Button>
        </div>
        <p class="lg:text-lg">{{world.hostname}}.{{server.info.world.hostname}}{{server.info.world.port == 25565 ? '' : ':' + server.info.world.port}}</p>
      </div>

      <hr/>

      <p class="text-2xl lg:text-4xl font-bold mb-1">Update World Settings</p>

      <form @submit="onWorldUpdate" class="flex flex-col gap-4">
        <FormField v-slot="{ field }" name="name">
          <FormItem class="flex flex-col justify-center">
            <FormLabel>World Name</FormLabel>
            <FormControl>
              <Input placeholder="World Name" v-bind="field" class="col-span-3" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{field}" mode="lazy" name="hostname">
          <FormItem class="flex flex-col justify-center">
            <FormLabel>Hostname</FormLabel>
            <FormControl>
              <Input placeholder="Hostname" v-bind="field"  class="col-span-3" />
            </FormControl>
            <FormDescription>
              This world will be available at {{field.value ?? "hostname"}}.{{server.info.world.hostname}}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ field }" name="allocated_memory">
          <FormItem class="flex flex-col justify-center">
            <FormLabel>Allocated Memory</FormLabel>
            <FormControl>
              <Slider
                v-bind="field"
                :default-value="[world.allocated_memory]"
                :min="server.info.world.min_memory"
                :max="max_memory"
                :step="128"
                name="Allocated Memory"
              />
              <FormDescription class="flex justify-end w-full">
                <span>{{ field.value ?? server.info.world.default_memory}}MiB</span>
              </FormDescription>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>


        <DialogFooter>
          <Button type="submit" class="w-full">
            Update Settings
          </Button>
        </DialogFooter>

      </form>

      <p class="text-2xl lg:text-4xl font-bold mb-1">Danger Zone</p>
      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="destructive" class="w-full">
            Delete World
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              When you delete this world <b>all of its data will be irreversibly lost</b>.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel as="a">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction as="a" @click="async () => {
              try {
                await api.delete(`worlds/${world.id}`)
                await router.push(`/`)
                toast.success('World deleted successfully.')
              } catch (e: any) {
                toast.error('could not delete world', {
                  description: e.message,
                })
              }
            }">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>


    <div class="col-span-2 h-full w-full p-4 flex flex-col xl:flex-row sm:overflow-y-auto">
      <div class="xl:flex-2 xl:overflow-y-auto">
        <div v-if="Object.keys(config).length > 0" class="flex flex-col gap-4">
          <p class="text-2xl lg:text-4xl mb-1">Server Config</p>
          <WorldConfigView :config="config" :id="world.id" />
        </div>
        <div v-else>
          <p class="text-xl lg:text-2xl font-bold mb-1">Start this server to generate config and refresh this page</p>
        </div>
      </div>

      <div class="flex flex-col gap-4 xl:flex-3 xl:overflow-y-auto">
        <p class="text-2xl lg:text-4xl font-bold mb-1">Mods</p>
        this is work in progress
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
