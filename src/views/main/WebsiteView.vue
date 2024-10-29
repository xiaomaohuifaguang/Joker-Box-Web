<template>
    <el-row>

        <el-col :span="18" :offset="3">
            <el-row :gutter="20" v-for="group in groups">
                <el-col :span="24">
                    <el-button link size="large" :id="group.groupName" style="font-size: 1.5rem;">
                        # {{ group.groupName }}
                    </el-button>
                </el-col>
                <el-col :span="4" v-for="item in group.child">
                    <el-card class="card">
                        <a :href="item.url">
                            <div>
                                <el-text truncated>
                                    {{ item.title }}
                                </el-text>
                            </div>
                            <el-text style="margin-top: 1rem;margin-bottom: 1rem;" truncated>
                                {{ item.description }}
                            </el-text>
                            <div>
                                <el-text truncated>
                                    {{ item.url }}
                                </el-text>
                            </div>
                        </a>
                    </el-card>
                </el-col>
            </el-row>
        </el-col>
        <el-col :span="3">
            <el-anchor :offset="70">
                <el-anchor-link v-for="group in groups" :href="`#${group.groupName}`">
                    {{ group.groupName }}
                </el-anchor-link>
            </el-anchor>
        </el-col>
    </el-row>

</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';

const groups = ref([])


const queryList = () => {
    http.result({
        url: '/website/group',
        method: 'POST',
        success(result) {
            groups.value = result.data
        }
    })
}

onMounted(() => {
    queryList()
})


</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}

.card {
    cursor: pointer;
}

.card :hover {
    background-color: var(--el-color-primary);
}

/* 重置所有链接的样式 */
.card a {
    text-decoration: none;
    /* 去除下划线 */
    color: inherit;
    /* 继承文字颜色 */
}

/* 如果你想要在鼠标悬停时显示下划线，可以添加以下样式 */
.card a:hover {
    text-decoration: underline;
}
</style>