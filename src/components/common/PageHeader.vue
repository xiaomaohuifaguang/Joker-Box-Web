<template>
    <div class="page-header">
        <div class="header-content">
            <div class="header-title">
                <div class="title-icon">
                    <el-icon>
                        <component :is="icon" />
                    </el-icon>
                </div>
                <div class="title-text">
                    <h1>{{ title }}</h1>
                    <p v-if="description">{{ description }}</p>
                </div>
            </div>
            <div v-if="$slots.extra" class="header-extra">
                <slot name="extra" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue';

defineProps<{
    icon: Component;
    title: string;
    description?: string;
}>();
</script>

<style scoped lang="scss">
.page-header {
    background: var(--brand-gradient);
    padding: 32px 0;
    margin-bottom: 24px;

    .header-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 16px;
            text-align: center;
        }
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
            flex-shrink: 0;

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

    .header-extra {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
    }
}

@media (max-width: 768px) {
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
}
</style>
