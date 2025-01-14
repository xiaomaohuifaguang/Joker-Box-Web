<template>
    <el-row>
        <el-col :span="18" :offset="3">
            <!-- 输入框 -->
            <el-input v-model="tableName" style="width: 100%" size="large" placeholder="请输入表名" @keyup.enter="make">
                <template #append>
                    <el-button @click="make" :loading="loading">生成</el-button>
                </template>
            </el-input>

            <!-- 分割线 -->
            <el-divider />

            <!-- Tab 页签展示代码 -->
            <el-tabs v-model="activeName" type="card" class="tabs" v-loading="loading">
                <el-tab-pane v-for="(item, index) in tabList" :key="index" :label="item.label" :name="item.name">
                    <el-card class="pre-wrap card-with-button">
                        <!-- <el-button v-if="data[item.name] != ''" class="copy-button" v-clipboard:copy="data[item.name]"
                            v-clipboard:success="onCopySuccess" v-clipboard:error="onCopyError">
                            复制
                        </el-button> -->
                        <!-- {{ data[item.name] }} -->
                        <CodeDisplay v-if="data[item.name] != ''" :code="data[item.name]"
                            :language="data[item.language]" />
                    </el-card>
                </el-tab-pane>
            </el-tabs>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { alert, http } from "@/utils";
import { ref } from "vue";
import type { TabsPaneContext } from "element-plus";
import CodeDisplay from "@/components/media/CodeDisplay.vue";

const loading = ref(false);
const tableName = ref("");

const activeName = ref("entity");
const data = ref({
    index: "",
    add: "",
    info: "",
    entity: "",
    controller: "",
    service: "",
    impl: "",
    mapper: "",
    xml: "",
});

const tabList = [
    { label: "Entity实体类", name: "entity", language: 'java' },
    { label: "Index首页", name: "index", language: 'vue' },
    { label: "Add添加", name: "add", language: 'vue' },
    { label: "Info信息", name: "info", language: 'vue' },
    { label: "Controller控制层", name: "controller", language: 'java' },
    { label: "Service业务层", name: "service", language: 'java' },
    { label: "Impl业务实现类", name: "impl", language: 'java' },
    { label: "Mapper接口", name: "mapper", language: 'java' },
    { label: "XML映射", name: "xml", language: 'xml' },
];

const make = () => {
    loading.value = true;
    data.value = {
        index: "",
        add: "",
        info: "",
        entity: "",
        controller: "",
        service: "",
        impl: "",
        mapper: "",
        xml: "",
    };
    http.result({
        url: "/rapidDevelopmentController/generate",
        method: "POST",
        params: {
            tableName: tableName.value,
        },
        success(result) {
            data.value = result.data;
            loading.value = false;
        },
    });
};

const onCopySuccess = () => {
    alert("复制成功！", "success");
};
const onCopyError = () => {
    alert("复制失败！", "error");
};
</script>

<style scoped>
/* 导入 Element Plus 的主题变量 */

.tabs {
    margin-top: 20px;
}

.pre-wrap {
    white-space: pre-wrap;
    min-height: 50vh;
    padding: 20px;
    background-color: var(--el-color-background);
    /* 使用 Element Plus 背景色 */
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-with-button {
    position: relative;
    padding: 15px;
}

.copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    background-color: var(--el-color-primary);
    /* 使用 Element Plus 的主色 */
    border-color: var(--el-color-primary);
    /* 使用 Element Plus 的主色 */
    color: white;
}

.el-button {
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.el-button:hover {
    background-color: var(--el-color-primary-light);
    /* 使用主色的浅色 */
    transform: scale(1.05);
}

.el-input {
    margin-bottom: 10px;
}

.el-divider {
    margin: 20px 0;
}
</style>