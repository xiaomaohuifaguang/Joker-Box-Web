<template>
    <div class="dynamic-form-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Document /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>{{ info.name || '动态表单' }}</h1>
                        <p>{{ info.description || '请填写以下信息' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="page-container">
            <div class="form-wrapper">
                <div class="form-card">
                    <FormMaker
                        v-model="formData"
                        v-bind:form-fields="info.formFields"
                        type="edit"
                        ref="formMakerRef" />
                </div>
                <div class="action-bar">
                    <el-button type="primary" size="large" @click="submit" class="submit-button" :loading="loading">
                        <el-icon><Check /></el-icon>
                        <span>提交表单</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { http, toPath } from '@/utils'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Check } from '@element-plus/icons-vue'
import FormMaker from '@/components/dynamicForm/FormMaker.vue'

const route = useRoute()
const loading = ref(false)

const info = ref({
    id: -1,
    name: '',
    description: '',
    version: '',
    status: '',
    deleted: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    formFields: []
})
const formData = ref({})
const formMakerRef = ref(null)

const queryFields = async () => {
    loading.value = true
    try {
        info.value = await http.post('/dynamicForm/info', {
            id: route.params.id,
            version: route.params.version
        })
        if (!info.value.formFields || info.value.formFields.length == 0) {
            toPath('/404')
        }
    } catch (e: any) {
        // error handled by interceptor
    } finally {
        loading.value = false
    }
}

const submit = async () => {
    const verifyFlag = await formMakerRef.value.verify();
    if (!verifyFlag) {
        return
    }

    loading.value = true
    try {
        await http.post("/dynamicForm/submit", {
            formId: info.value.id,
            version: route.params.version,
            formInstanceId: null,
            data: formData.value
        })
        http.alert('提交成功', 'success')
    } catch (e: any) {
        // error handled by interceptor
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    queryFields()
})
</script>

<style scoped lang="scss">
.dynamic-form-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

    .page-header {
        background: var(--brand-gradient);
        padding: 32px 0;
        margin-bottom: 24px;

        .header-content {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 20px;

            .title-icon {
                width: 64px;
                height: 64px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);

                .el-icon {
                    font-size: 32px;
                    color: var(--text-on-brand);
                }
            }

            .title-text {
                h1 {
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--text-on-brand);
                }

                p {
                    margin: 0;
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.85);
                }
            }
        }
    }

    .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 24px 40px;
    }

    .form-wrapper {
        .form-card {
            background: var(--bg-container);
            border-radius: 16px;
            padding: 32px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-light);
            margin-bottom: 24px;
        }

        .action-bar {
            display: flex;
            justify-content: center;

            .submit-button {
                min-width: 200px;
                height: 48px;
                font-size: 16px;
                font-weight: 500;
                border-radius: 12px;
                background: var(--brand-gradient);
                border: none;
                transition: all 0.3s;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow-strong);
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .dynamic-form-page {
        .page-header {
            padding: 24px 0;

            .header-content {
                padding: 0 16px;
            }

            .header-title {
                flex-direction: column;
                text-align: center;

                .title-text {
                    h1 {
                        font-size: 22px;
                    }
                }
            }
        }

        .page-container {
            padding: 0 16px 24px;
        }

        .form-wrapper {
            .form-card {
                padding: 20px;
            }

            .action-bar {
                .submit-button {
                    width: 100%;
                }
            }
        }
    }
}
</style>
