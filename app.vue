<script setup lang="ts">
useHead({
  script: [
    {
      innerHTML: `try{var theme=localStorage.getItem('mahjong:theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle('dark',theme==='dark')}catch(e){document.documentElement.dataset.theme='light'}`,
      tagPosition: 'head'
    }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
