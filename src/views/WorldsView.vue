<script setup lang="ts">
import { mande } from 'mande'
import ImageCard from '@/components/ImageCard.vue'
import { onBeforeMount, ref } from 'vue'
import type {IsValid, ModLoader, Version, World} from '@/lib/types.ts'
import {useServerDataStore} from "@/stores/server.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Combobox, ComboboxTrigger, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList } from '@/components/ui/combobox'
import {cn} from "@/lib/utils.ts";
import { Check, Search, ChevronsUpDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import  z from 'zod'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";

import { Icon } from '@iconify/vue';

import {useUserStore} from "@/stores/user.ts";
import {useForm} from "vee-validate";
import { UseImage } from "@vueuse/components";
import {toTypedSchema} from "@vee-validate/zod";
import { useImageCaches } from '@/stores/image_caches.ts'

const api = mande("/api")
const user = useUserStore()
const server = useServerDataStore()
const image_caches = useImageCaches()

const worlds = ref([] as World[])
const mod_loaders = ref([] as ModLoader[])
const versions = ref([] as Version[])

const selected_loader = ref(undefined as ModLoader | undefined)
const selected_verison = ref(undefined as Version | undefined)
const search_value = ref(undefined as string | undefined)

const dialog_open = ref(false)

const worldFormSchema = toTypedSchema(z.object({
  //username: z.string().min(2).max(50),
  name: z.string().min(1).max(255),
  hostname: z.string().min(2).max(255).regex(/^[a-z0-9]+$/, "The hostname can contain only lowercase letters and numbers"),
  allocated_memory: z.any(),
  version_id: z.string()
}))

const world_form = useForm({
    validationSchema: worldFormSchema
  }
)

const props = defineProps<{
  show_all?: boolean
}>()

async function validateHostname(hostname: any) {
  const response: IsValid = await api.get(`/valid/hostname/${hostname}`)
  return response.valid;
}

const onWorldSubmit = world_form.handleSubmit(async (values: any) => {
  if (await validateHostname(values.hostname)) {
    await api.post("/worlds", values)
    worlds.value = await api.get(props.show_all ? 'worlds' : `worlds?owner_id=${user.user.id}`) as World[]
    dialog_open.value = false
  } else {
    world_form.setFieldError("hostname", "Hostname is already taken")
  }
})



onBeforeMount(async () => {
  try {
    await Promise.all([
      api.get(props.show_all ? 'worlds' : `worlds?owner_id=${user.user.id}`),
      api.get('mod_loaders'),
    ]).then(result => {
      worlds.value = result[0] as World[]
      mod_loaders.value = result[1] as ModLoader[]
    })
  }
  catch (error: any) {
      console.log(error)
      toast.error('Error Loading Page', {
        description: `${error.message}`,
      })
      throw error
    }
});
</script>

<template>
  <div class="grid300 gap-4 p-4 overflow-y-auto">
    <router-link :to=" '/worlds/'+world.id" v-for="world in worlds" v-bind:key="world.id">
      <ImageCard :class="world.enabled ? '' : 'grayscale bg-muted'" :title="world.name" :description="world.hostname">
        <UseImage :src="`/api/worlds/${world.id}/icon?rnd=${image_caches.get(world.id)}`" class="rounded-md w-full aspect-square" >
          <template #error>
            <img src="@/assets/world_default.png" width="1" height="1" class="rounded-md w-full aspect-square" alt="">
          </template>
        </UseImage>
      </ImageCard>
    </router-link>


    <Dialog v-if="(user.user.group.world_limit ?? 1000000) > worlds.length" v-model:open="dialog_open" onopen="">
      <DialogTrigger>
        <ImageCard title="New" description="Create new world">
          <div class="rounded-md w-full aspect-square flex items-center justify-center text-muted-foreground">
            <Icon icon="radix-icons:plus" class="size-[30%]"/>
          </div>
        </ImageCard>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New World</DialogTitle>
          <DialogDescription/>
        </DialogHeader>

        <form @submit="onWorldSubmit" class="flex flex-col gap-4">
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

          <FormField v-slot="{ field }" mode="lazy" name="hostname">
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
                  :default-value="[server.info.world.default_memory]"
                  :min="server.info.world.min_memory"
                  :max="user.user.group.per_world_memory_limit ?? 8196"
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


          <FormField name="mod_loader">
            <FormItem class="flex flex-col justify-center">
              <FormLabel>Loader</FormLabel>
              <FormControl>
                <Combobox v-model="selected_loader" by="label">
                  <ComboboxAnchor as-child>
                    <ComboboxTrigger as-child>
                      <Button variant="outline" class="justify-between">
                        {{ selected_loader?.name ?? 'Select a loader' }}

                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </ComboboxTrigger>
                  </ComboboxAnchor>

                  <ComboboxList>

                    <ComboboxEmpty>
                      No mod loaders found
                    </ComboboxEmpty>

                    <ComboboxGroup>
                      <ComboboxItem
                        v-for="loader in mod_loaders"
                        :key="loader.name"
                        :value="loader"
                        @select="async() => {
                          world_form.resetField('version_id')
                          selected_verison = undefined
                          search_value = undefined
                          versions = await api.get(`versions?mod_loader_id=${loader.id}`)
                        }"
                      >
                        {{ loader.name }}
                        <ComboboxItemIndicator/>
                      </ComboboxItem>
                    </ComboboxGroup>
                  </ComboboxList>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="version_id" v-if="versions.length > 0 ">
            <FormItem class="flex flex-col justify-center">
              <FormLabel>Minecraft Version</FormLabel>
              <FormControl>
                <Combobox by="label">
                  <ComboboxAnchor>
                    <div class="relative w-full items-center">
                      <ComboboxInput class="pl-9" v-model="search_value" :display-value="(val) => val?.minecraft_version ?? ''" placeholder="Search" />
                      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                      <Search class="size-4 text-muted-foreground" />
                      </span>
                    </div>
                  </ComboboxAnchor>

                  <ComboboxList>
                    <ComboboxEmpty>
                      No versions found
                    </ComboboxEmpty>

                    <ComboboxGroup>
                      <ComboboxItem
                        v-for="version in versions"
                        v-model="selected_verison"
                        :key="version.minecraft_version"
                        :value="version"
                        @select="() => {
                          world_form.setFieldValue('version_id', version.id)
                          search_value = version.minecraft_version
                        }"
                      >
                        {{ version.minecraft_version }}

                        <ComboboxItemIndicator/>
                      </ComboboxItem>
                    </ComboboxGroup>
                  </ComboboxList>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <DialogFooter>
            <Button type="submit">
              Create
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>

  </div>

</template>

<style scoped>

</style>
