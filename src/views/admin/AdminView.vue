<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import Header from '@/components/Header.vue'
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarTrigger size="large"/>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/users">
                    <span>Users</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/groups">
                    <span>Groups</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/sessions">
                    <span>Sessions</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/invite_links">
                    <span>Invite Links</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/worlds">
                    <span>Worlds</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/versions">
                    <span>Versions</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/mod_loaders">
                    <span>Loaders</span>
                  </router-link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <router-link to="/admin/mods">
                    <span>Mods</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <main class="container">
      <Header />
      <RouterView />
    </main>
  </SidebarProvider>
</template>

<style scoped>

</style>
