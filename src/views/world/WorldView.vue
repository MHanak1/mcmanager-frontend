<script setup lang="ts">
import { mande } from 'mande'
import {onBeforeMount, ref} from "vue";
import type { IsValid, ModLoader, Version, World, WorldStatus } from '@/lib/types.ts'
import {useUserStore} from "@/stores/user.ts";
import {useServerDataStore} from "@/stores/server.ts";
import {useRoute} from "vue-router";
import {UseImage } from '@vueuse/components'
import { cn } from '@/lib/utils.ts'
import {
  Combobox,
  ComboboxAnchor, ComboboxEmpty,
  ComboboxGroup, ComboboxInput,
  ComboboxItem, ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger
} from '@/components/ui/combobox'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'
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


const api = mande("/api")
const user = useUserStore()
const server = useServerDataStore()
const route = useRoute()
const id = route.params.id

const data_loaded = ref(false)
const world = ref({} as World)
const world_status = ref({} as WorldStatus)
const version = ref({} as Version)
const loader = ref({} as ModLoader)

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
    world.value = await api.patch(`/worlds/${world.value.id}`, values) as World
    }
    catch (error: any) {
      console.log(error)
      toast.error('Error Updating World', {
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
      world.value = await api.patch(`/worlds/${world.value.id}`, {enabled: enabled})
      world_status.value = await api.get(`worlds/${id}/status`) as WorldStatus
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

onBeforeMount(async () => {
  try {
    world.value = await api.get(`worlds/${id}`) as World
    version.value = await api.get(`versions/${world.value.version_id}`) as Version
    loader.value = await api.get(`mod_loaders/${version.value.mod_loader_id}`) as ModLoader
  }
  catch (error: any) {
    console.log(error)
    toast.error('Error Loading Page', {
      description: `${error.message}`,
    })
    throw error
  }

  const other_worlds = await api.get(`worlds?enabled=true&id=!${world.value.id}`) as World[]
  let remaining = user.group.total_memory_limit as number
  for (const other_world of other_worlds) {
    other_enabled_world_count.value += 1
    remaining -= other_world.allocated_memory
  }
  if (user.group.total_memory_limit != null) {
    remaining_memory.value = remaining
  }
  if (user.group.per_world_memory_limit != null) {
    max_memory.value = user.group.per_world_memory_limit as number
  }
  world_form.setFieldValue('name', world.value.name)
  world_form.setFieldValue('hostname', world.value.hostname)
  world_form.setFieldValue('allocated_memory', world.value.allocated_memory)
  data_loaded.value = true

  // this does not to be loaded before display
  try {
    world_status.value = await api.get(`worlds/${id}/status`) as WorldStatus
    console.log(world_status.value)
  }
  catch (error: any) {
    console.log(error)
    toast.error('Error Loading World Status', {
      description: `${error.message}`,
    })
    throw error
  }
});


</script>


<template>
  <div class="flex flex-1 flex-col sm:flex-row " v-if="data_loaded">
    <div class="w-full lg:w-[30rem] flex flex-col bg-card/50 shadow-shadow shadow-lg mb-0 p-4 gap-4 overflow-y-auto">
      <UseImage :src="`/api/worlds/${world.id}/icon`" class="rounded-md w-full aspect-square">
        <template #error>
          <img src="@/assets/world_default.png" width="1" height="1" class="rounded-md w-full aspect-square" alt="">
        </template>
      </UseImage>
      <div class="flex justify-between items-center">
        <div>
          <p class="text-2xl lg:text-4xl font-bold mb-1">{{world.name}}</p>
          <p class="lg:text-lg">{{loader.name}} {{version.minecraft_version}}</p>
          <p class="lg:text-lg">{{world.hostname}}.{{server.info.world.hostname}}</p>
        </div>
        <Button v-if="world_status.status === 'running'" variant="destructive" @click="updateWorldStatus(false)">
          <CgSpinner v-if="world_operation_running" class="animate-spin" />
          <Icon v-else icon="radix-icons:stop"/>
          Stop World
        </Button>
        <Button v-else-if="other_enabled_world_count < (user.group.active_world_limit ?? 1000000)" variant="green" @click="updateWorldStatus(true)">
          <CgSpinner v-if="world_operation_running" class="animate-spin"/>
          <Icon v-else icon="radix-icons:play"/>
          Start World
        </Button>
        <Button v-else disabled>
          <Icon icon="radix-icons:play"/>
          Start World
        </Button>
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
          <Button type="submit">
            Update Settings
          </Button>
        </DialogFooter>

      </form>

    </div>
    <div class="col-span-2 h-full">
      {{world}}
    </div>
  </div>

</template>

<style scoped>

</style>
