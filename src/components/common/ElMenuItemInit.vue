<template>
    <el-menu-item v-if="props.children.length === 0" :index="path">
        <el-icon>
            <component :is="props.icon" />
        </el-icon>
        <span>{{ props.name }}</span>
    </el-menu-item>
    <el-sub-menu v-if="props.children.length > 0" :index="path">
        <template #title>
            <el-icon>
                <component :is="props.icon" />
            </el-icon>
            <span>{{ props.name }}</span>
        </template>
        <ElMenuItemInit v-for="item in props.children" :name="item['name']" :path="item['path']" :icon="item['icon']"
            :children="item['children']" />
    </el-sub-menu>
</template>

<script setup lang='ts'>

const props = defineProps({
    path: String,
    name: String,
    children: Array,
    icon: String
});


// const currentIcon = computed(() => {
//     return () => import(`@/components/icon/${props.icon}.vue`);
// });
</script>

<style scoped></style>