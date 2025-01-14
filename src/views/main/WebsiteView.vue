<template>
    <el-row class="container">
        <el-col :span="18" :offset="3">
            <el-row :gutter="20" v-for="group in groups" :key="group.groupName" class="group-container">
                <el-col :span="24">
                    <el-button link size="large" :id="group.groupName" class="group-btn">
                        # {{ group.groupName }}
                    </el-button>
                </el-col>
                <el-col :span="6" v-for="item in group.child" :key="item.title" class="item-container">
                    <el-card class="card" shadow="hover">
                        <a :href="item.url">
                            <div>
                                <el-text class="title" truncated>{{ item.title }}</el-text>
                            </div>
                            <el-text class="description" truncated>{{ item.description }}</el-text>
                            <div class="url-container">
                                <el-text class="url" truncated>{{ item.url }}</el-text>
                            </div>
                        </a>
                    </el-card>
                </el-col>
            </el-row>
        </el-col>

        <el-col :span="3">
            <el-anchor :offset="70">
                <el-anchor-link v-for="group in groups" :key="group.groupName" :href="`#${group.groupName}`"
                    class="anchor-link">
                    {{ group.groupName }}
                </el-anchor-link>
            </el-anchor>
        </el-col>
    </el-row>
</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';

const groups = ref([]);

const queryList = () => {
    http.result({
        url: '/website/group',
        method: 'POST',
        success(result) {
            groups.value = result.data;
        }
    });
};

onMounted(() => {
    queryList();
});
</script>

<style scoped>
.container {
    padding: 2rem 0;
}

.group-container {
    margin-bottom: 2rem;
}

.group-btn {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--el-link-color);
    background-color: transparent;
    border: 2px solid var(--el-link-color);
    border-radius: 8px;
    padding: 1rem 2rem;
    transition: all 0.3s ease;
}

.group-btn:hover {
    background-color: var(--el-link-color);
    color: var(--el-white);
    border-color: var(--el-link-color);
}

.item-container {
    margin-top: 1.5rem;
}

.card {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.card a {
    text-decoration: none;
    color: inherit;
}

.card .title {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--el-text-color-primary);
}

.card .description {
    font-size: 0.95rem;
    color: var(--el-text-color-secondary);
    margin: 1rem 0;
}

.card .url-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 1rem;
}

.card .url {
    font-size: 0.9rem;
    color: var(--el-link-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.anchor-link {
    display: block;
    padding: 10px 0;
    font-size: 1.1rem;
    color: var(--el-link-color);
    transition: color 0.3s ease;
}

.anchor-link:hover {
    color: var(--el-link-hover-color);
}
</style>
