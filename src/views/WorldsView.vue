<script setup lang="ts">
import { mande } from 'mande'
import ImageCard from '@/components/ImageCard.vue'
import { onBeforeMount, ref } from 'vue'
import type {ModLoader, Verion, World} from '@/lib/types.ts'
import {useServerDataStore} from "@/stores/server.ts";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList } from '@/components/ui/combobox'
import {cn} from "@/lib/utils.ts";
import { Check, Search } from 'lucide-vue-next'

import * as z from 'zod'

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

import {useUserStore} from "@/stores/user.ts";
import {toTypedSchema} from "@vee-validate/zod";
import {useForm} from "vee-validate";

const api = mande("/api")

const user = useUserStore()
const server = useServerDataStore()


const worlds = ref([] as World[])
const mod_loaders = ref([] as ModLoader[])

const versions = ref([] as Verion[])

const dialog_open = ref(false)

const worldFormSchema = toTypedSchema(z.object({
  //username: z.string().min(2).max(50),
  name: z.string().min(1).max(255),
  hostname: z.string().toLowerCase().min(2).max(255),
  memory: z.any(),
  version_id: z.string()
}))

const world_form = useForm({
  validationSchema: worldFormSchema,
})

const onWorldSubmit = world_form.handleSubmit(async (values: any) => {
  await api.post("/worlds", values)
  worlds.value = await api.get('worlds') as World[]
  console.log('Form submitted!', values)
})

//todo: change this
onBeforeMount(async () => {
  worlds.value = await api.get('worlds') as World[]
  mod_loaders.value = await api.get('mod_loaders') as ModLoader[]
  versions.value = await api.get('versions')
  console.log(versions.value)
});
</script>

<template>
  <div class="grid300 gap-4 p-4">
    <a v-for="world in worlds" v-bind:key="world.id">
      <ImageCard v-if="world.enabled" :image="'/api/worlds/'+world.id+'/icon'" :title="world.name" :description="world.hostname + '.' + server.info.world.hostname"/>
      <ImageCard v-else class="grayscale bg-muted" :image="'/api/worlds/'+world.id+'/icon'" :title="world.name" :description="world.hostname + '.' + server.info.world.hostname"/>
    </a>


    <Dialog>
      <DialogTrigger>
        <ImageCard image="/src/assets/plus.svg" title="New" description="Create new world"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New World</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form @submit="onWorldSubmit" class="flex flex-col gap-4">
          <FormField v-slot="{ field }" name="name">
            <FormItem>
              <FormLabel>World Name</FormLabel>
              <FormControl>
                <Input placeholder="World Name" v-bind="field" class="col-span-3 input" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="hostname">
            <FormItem>
              <FormLabel>Hostname</FormLabel>
              <FormControl>
                <Input placeholder="Hostname" v-bind="field" class="col-span-3 input" />
              </FormControl>
              <FormDescription>
                This world will be available at {{field.value ?? "hostname"}}.{{server.info.world.hostname}}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="memory">
            <FormItem>
              <FormLabel>Allocated Memory</FormLabel>
              <FormControl>
                <Slider
                  v-bind="field"
                  :default-value="[server.info.world.default_memory]"
                  :min="server.info.world.min_memory"
                  :max="user.group.per_world_memory_limit ?? 8196"
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


          <FormField name="version_">
            <FormItem>
              <FormLabel>Minecraft Version</FormLabel>
              <FormControl>
                <Combobox by="label">
                  <ComboboxAnchor>
                    <div class="relative w-full items-center">
                      <ComboboxInput class="pl-9" :display-value="(val) => val?.minecraft_version ?? ''" placeholder="Search" />
                      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                      <Search class="size-4 text-muted-foreground" />
                      </span>
                    </div>
                  </ComboboxAnchor>

                  <ComboboxList>
                    <ComboboxEmpty>
                      No framework found.
                    </ComboboxEmpty>

                    <ComboboxGroup>
                      <ComboboxItem
                        v-for="version in versions"
                        :key="version.minecraft_version"
                        :value="version"
                        @select="() => {
                          world_form.setFieldValue('version_id', version.id)
                        }"
                      >
                        {{ version.minecraft_version }}

                        <ComboboxItemIndicator>
                          <Check :class="cn('ml-auto h-4 w-4')" />
                        </ComboboxItemIndicator>
                      </ComboboxItem>
                    </ComboboxGroup>
                  </ComboboxList>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <DialogFooter>
            <Button type="submit" class="input-light">
              Create
            </Button>
          </DialogFooter>

        </form>

        <!--
                <form class="w-2/3 space-y-6" @submit="onSubmit">

                  <Input id="hostname" placeholder="Hostname" v-model="hostname" class="col-span-3 input" />

                 the server will be avaliable at <span class="bg-ring">{{ hostname || "hostname" }}.{{server.info.world.hostname}}</span>

          <Slider
          />
        </form>
-->
        <!--

        <FormKit
          type="form"
          submit-label="Log In"
          :incomplete-message=false
          :config="{
          classes: {
            form: 'flex flex-col gap-4 items-center w-full',
            outer: 'w-full',
            label: 'text-lg',
            input: 'input w-full my-2',
            message: 'text-muted-foreground text-sm'
          },
        }"
          @submit="login"
        >

        <FormKit
          type="text"
          label="World Name"
          name="world_name"
          id="world_name"
          validation="required:trim"
        />

        <FormKit
          type="text"
          label="Hostname"
          name="hostname"
          id="hostname"
          validation="required:trim"
        />

        <FormKit
          type="range"
          v-model="allocated_memory"
          :label="'Allocated Memory: ' + allocated_memory + 'MiB'"
          :min="server.info.world.min_memory"
          :value="server.info.world.default_memory"
          :max="user.group.per_world_memory_limit ?? 8196"
          number="integer"
          name="memory"
          id="memory"
          step="128"
        />

          <FormKit
            type="dropdown"
          />

        </FormKit>
        -->

      </DialogContent>
    </Dialog>

  </div>

</template>

<style scoped>

</style>
