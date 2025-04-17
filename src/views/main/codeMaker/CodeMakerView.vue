<template>
    <div class="code-generator-container">
        <el-row>
            <el-col :span="20" :offset="2">
                <!-- 输入框区域 -->
                <el-card shadow="hover" class="input-card">
                    <div class="input-wrapper">
                        <el-input v-model="tableName" size="large" placeholder="请输入数据库表名，例如：sys_user" clearable
                            @keyup.enter="make">
                            <template #prepend>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                            <template #append>
                                <el-button type="primary" :icon="MagicStick" @click="make" :loading="loading">
                                    生成代码
                                </el-button>
                            </template>
                        </el-input>
                        <div class="input-tips">
                            <el-tag v-if="!tableName" type="info" size="small">
                                提示：输入数据库表名后点击生成按钮
                            </el-tag>
                            <el-tag v-else type="success" size="small">
                                即将生成 {{ tableName }} 表的代码
                            </el-tag>
                        </div>
                    </div>
                </el-card>

                <!-- 分割线 -->
                <el-divider content-position="center">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>代码生成结果</span>
                </el-divider>

                <!-- 代码展示区域 -->
                <el-card shadow="hover" class="code-display-card">
                    <el-tabs v-model="activeName" type="border-card" class="code-tabs" v-loading="loading">
                        <el-tab-pane v-for="(item, index) in tabList" :key="index" :label="item.label"
                            :name="item.name">
                            <div class="code-content">
                                <CodeDisplay v-if="data[item.name]" :code="data[item.name]" :language="item.language"
                                    :filename="getFilename(item)" />
                                <el-empty v-else description="暂无生成内容" :image-size="100" />
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { alert, http } from "@/utils";
import CodeDisplay from "@/components/media/CodeDisplay.vue";
import { Search, MagicStick, Document } from "@element-plus/icons-vue";

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
    { label: "Entity实体类", name: "entity", language: "java" },
    { label: "Index首页", name: "index", language: "html" },
    { label: "Add添加", name: "add", language: "html" },
    { label: "Info信息", name: "info", language: "html" },
    { label: "Controller控制层", name: "controller", language: "java" },
    { label: "Service业务层", name: "service", language: "java" },
    { label: "Impl业务实现类", name: "impl", language: "java" },
    { label: "Mapper接口", name: "mapper", language: "java" },
    { label: "XML映射", name: "xml", language: "xml" },
];

const make = () => {
    if (!tableName.value.trim()) {
        alert("请输入表名", "warning");
        return;
    }

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
        params: { tableName: tableName.value },
        success(result) {
            data.value = result.data;
            loading.value = false;
        },
        error() {
            loading.value = false;
        },
    });
};

const getFilename = (item: any) => {
    if (!tableName.value) return `${item.name}.${item.language}`;

    const prefix = tableName.value.toLowerCase().replace(/_/g, "-");
    switch (item.name) {
        case "entity":
            return `${tableName.value}.java`;
        case "controller":
            return `${tableName.value}Controller.java`;
        case "service":
            return `${tableName.value}Service.java`;
        case "impl":
            return `${tableName.value}ServiceImpl.java`;
        case "mapper":
            return `${tableName.value}Mapper.java`;
        case "xml":
            return `${tableName.value}Mapper.xml`;
        default:
            return `${prefix}-${item.name}.vue`;
    }
};
</script>

<style scoped lang="scss">
.code-generator-container {
    padding: 20px 0;
    min-height: calc(100vh - 60px);
    background-color: var(--el-bg-color-page);
}

.input-card {
    margin-bottom: 20px;
    border-radius: 12px;
    // background: linear-gradient(145deg, #f5f7fa, #e6e9f0);

    :deep(.el-card__body) {
        padding: 24px;
    }
}

.input-wrapper {
    .el-input {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        overflow: hidden;

        :deep(.el-input-group__prepend) {
            background-color: var(--el-color-primary-light-9);
            padding: 0 15px;
        }
    }

    .input-tips {
        margin-top: 12px;
        text-align: center;
    }
}

.el-divider {
    margin: 30px 0;

    :deep(.el-divider__text) {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: var(--el-color-primary);
        background-color: var(--el-bg-color);
        padding: 0 20px;
    }
}

.code-display-card {
    border-radius: 12px;

    :deep(.el-card__body) {
        padding: 0;
    }
}

.code-tabs {
    border-radius: 8px;

    :deep(.el-tabs__content) {
        padding: 0;
    }

    :deep(.el-tabs__item) {
        transition: all 0.3s ease;

        &:hover {
            color: var(--el-color-primary);
            transform: translateY(-2px);
        }
    }

    :deep(.el-tabs__item.is-active) {
        background-color: var(--el-color-primary-light-9);
        border-bottom-color: var(--el-color-primary);
    }
}

.code-content {
    height: 60vh;
    overflow: auto;
    background-color: var(--el-bg-color-page);
    border-radius: 0 0 8px 8px;
}

@media (max-width: 768px) {
    .el-col {
        width: 100%;
        margin-left: 0 !important;
    }

    .code-content {
        height: 50vh;
    }
}
</style>