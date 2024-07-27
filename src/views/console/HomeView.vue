<script setup lang="ts">
import MainHeader from '@/components/console/ConsoleHeader.vue'
import SiderMenu from '@/components/console/SiderMenu.vue';
import { RouterView } from 'vue-router';
</script>
<template>
  <div class="divide-y min-h-screen">
    <MainHeader />
    <div class="flex flex-row pr-5">
      <div class="basis-2/12">
        <SiderMenu />
      </div>
      <div class="divider divider-horizontal"></div>
      <div class="basis-11/12">
        <RouterView />
      </div>
    </div>

  </div>
</template>
