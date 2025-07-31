<script setup lang="ts">
import { z } from 'zod'
import { AutoForm } from '@/components/ui/auto-form'
import { mande } from 'mande'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user.ts'

const user = useUserStore()
const props = defineProps(['config', 'id'])
const config = props.config
let api = mande('/api')

let schema = {} as any
let field_config = {} as any
let keys = []

const bool_vals = [
  'accepts-transfers',
  'enable-jmx-monitoring',
  'enable-command-block',
  'enable-query',
  'enforce-secure-profile',
  'pvp',
  'generate-structures',
  'require-resource-pack',
  'use-native-transport',
  'online-mode',
  'enable-status',
  'allow-flight',
  'broadcast-rcon-to-ops',
  'allow-nether',
  'enable-rcon',
  'sync-chunk-writes',
  'prevent-proxy-connections',
  'hide-online-players',
  'force-gamemode',
  'hardcore',
  'white-list',
  'broadcast-console-to-ops',
  'spawn-npcs',
  'spawn-animals',
  'log-ips',
  'spawn-monsters',
  'enforce-whitelist',
]

const int_vals = [
  'rcon.port',
  'query.port',
  'max-chained-neighbor-updates',
  'network-compression-threshold',
  'max-tick-time',
  'max-players',
  'view-distance',
  'server-port',
  'op-permission-level',
  'entity-broadcast-range-percentage',
  'simulation-distance',
  'player-idle-timeout',
  'rate-limit',
  'function-permission-level',
  'spawn-protection',
  'max-world-size',
]

for (const key in config) {
  keys.push(key)
}
keys.sort((a, b) => a.localeCompare(b))
keys.forEach((key) => {
  if (bool_vals.includes(key)) {
    schema[key.valueOf()] = z.boolean().default(config[key] === 'true')

    field_config[key] = {
      label: capitalizeFirstLetter(key.replaceAll("-", " ").replaceAll(".", " ")),
      component: 'switch',
    }
  } else if (int_vals.includes(key)) {
    let val = z.number()
    if (user.user.group.config_limits[key] !== undefined) {
      const limit = user.user.group.config_limits[key] as string
      try {
        if (limit.startsWith('<')) {
          val = val.max(parseInt(limit.substring(1)))
        } else if (limit.startsWith('>')) {
          val = val.min(parseInt(limit.substring(1)))
        }
      } catch (e) {
        toast("There was en error processing server's config limits")
      }
    }
    schema[key.valueOf()] = val.default(parseInt(config[key]))

    field_config[key] = {
      label: capitalizeFirstLetter(key.replaceAll("-", " ").replaceAll(".", " ")),
    }
  } else {
    let val: any = z.string()

    if (user.user.group.config_limits[key] !== undefined) {
      const limit = user.user.group.config_limits[key] as string
      if (!limit.startsWith('<') && !limit.startsWith('>')) {
        const whitelist = limit.split("|")
        val = z.enum([whitelist[0], ...whitelist.slice(1, whitelist.length)])
      }
    }

    schema[key.valueOf()] = val.default(config[key])


    field_config[key] = {
      label: capitalizeFirstLetter(key.replaceAll('-', " ").replaceAll(".", " ")),
    }
  }
})

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function onSubmit(values: any) {
  for (let key in values) {
    values[key] = values[key].toString()
  }
  try {
    await api.patch(`worlds/${props.id}/config`, values)
    toast.success('Successfully updated world', {
      description: 'You need to restart the world before it takes effect',
    })
  } catch (error: any) {
    toast('Error updating world config', {
      description: error.message,
    })
  }
}

const formSchema = z.object(schema)

</script>

<template>
  <AutoForm
    class="flex flex-col justify-center gap-3"
    :schema="formSchema"
    :onSubmit="onSubmit"
    :field-config="field_config"
  >
    <Button type="submit"> Update </Button>
  </AutoForm>
</template>

<style scoped></style>
