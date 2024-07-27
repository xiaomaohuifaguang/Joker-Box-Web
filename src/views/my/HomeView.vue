<script setup lang="ts">
import MainHeader from '@/components/main/MainHeader.vue'
import MySiderMenu from '@/components/my/MySiderMenu.vue'
</script>
<template>
  <div class="divide-y">
    <MainHeader />
    <div class="container pt-1">
      <div class="flex flex-row">
        <div class="basis-2/12">
          <MySiderMenu />
        </div>
        <div class="basis-10/12">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>
