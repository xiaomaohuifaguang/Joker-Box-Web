<template>
    <div class="editor-container">
        <div v-if="editor && !props.onlyRead" class="toolbar" :class="{ 'readonly': onlyRead }">
            <el-button-group>
                <el-tooltip content="加粗" placement="bottom">
                    <el-button size="small" @click="editor.chain().focus().toggleBold().run()"
                        :type="editor.isActive('bold') ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.Bold />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="斜体" placement="bottom">
                    <el-button size="small" @click="editor.chain().focus().toggleItalic().run()"
                        :type="editor.isActive('italic') ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.Italic />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="删除线" placement="bottom">
                    <el-button size="small" @click="editor.chain().focus().toggleStrike().run()"
                        :type="editor.isActive('strike') ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.Strickout />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="无序列表" placement="bottom">
                    <el-button size="small" @click="editor.chain().focus().toggleBulletList().run()"
                        :type="editor.isActive('bulletList') ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.UnorderedList />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="左对齐" placement="bottom">
                    <el-button size="small" @click="toggleTextAlign('left')"
                        :type="editor.isActive({ textAlign: 'left' }) ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.LeftAlign />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="居中对齐" placement="bottom">
                    <el-button size="small" @click="toggleTextAlign('center')"
                        :type="editor.isActive({ textAlign: 'center' }) ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.CenterAlign />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="右对齐" placement="bottom">
                    <el-button size="small" @click="toggleTextAlign('right')"
                        :type="editor.isActive({ textAlign: 'right' }) ? 'primary' : ''" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.RightAlign />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip content="插入图片" placement="bottom">
                    <el-button size="small" @click="addImage" :disabled="onlyRead">
                        <el-icon>
                            <EditorIcons.Image />
                        </el-icon>
                    </el-button>
                </el-tooltip>
            </el-button-group>
        </div>

        <div class="editor-wrapper" :class="{ 'readonly': onlyRead }">
            <editor-content :editor="editor" class="editor-content" />
            <div v-if="editor !== null" class="character-count">
                {{ '字数：' + editor.storage.characterCount.characters() + (props.onlyRead ? '' : ' / ' + props.limit) }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Strike from '@tiptap/extension-strike'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'

import * as EditorIcons from '@/components/icon/editor'
import { ElButton, ElButtonGroup, ElIcon, ElTooltip } from 'element-plus'

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    onlyRead: {
        type: Boolean,
        default: false,
    },
    limit: {
        type: Number,
        default: 10000,
    },
})

const emit = defineEmits(['update:modelValue', 'textChange'])

const editor = ref(null)

watch(() => props.modelValue, (value) => {
    const isSame = editor.value?.getHTML() === value
    if (isSame || !editor.value) return
    editor.value.commands.setContent(value, false)
})

watch(() => props.onlyRead, (value) => {
    if (editor.value) {
        editor.value.setEditable(!value)
    }
})

const toggleTextAlign = (align) => {
    if (editor.value.isActive({ textAlign: align })) {
        editor.value.commands.unsetTextAlign()
    } else {
        editor.value.chain().focus().setTextAlign(align).run()
    }
}

// 添加图片
const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) { // 限制2MB
            ElMessage.warning('图片大小不能超过2MB')
            return
        }

        try {
            const base64 = await fileToBase64(file)
            editor.value.chain().focus().setImage({
                src: base64,
                'data-base64': base64
            }).run()
        } catch (error) {
            ElMessage.error('图片处理失败')
            console.error(error)
        }
    }

    input.click()
}

// 文件转Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

onMounted(() => {
    editor.value = new Editor({
        extensions: [
            StarterKit,
            Strike,
            CharacterCount.configure({
                limit: props.limit,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                allowBase64: true,
                inline: true
            })
        ],
        content: props.modelValue,
        editable: !props.onlyRead,
        onUpdate: () => {
            emit('update:modelValue', editor.value.getHTML())
            emit('textChange', editor.value.getText())
        },
    })
})

onBeforeUnmount(() => {
    editor.value?.destroy()
})
</script>

<style scoped lang="scss">
.editor-container {
    // width: 794px;
    margin: 0 auto;
    font-family: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: var(--el-border-radius-base);
    overflow: hidden;
    transition: all 0.3s ease;

    .toolbar {
        display: flex;
        padding: 8px;
        background-color: var(--el-bg-color);
        border-bottom: 1px solid var(--el-border-color-light);
        transition: background-color 0.3s;

        &.readonly {
            background-color: var(--el-fill-color-light);
            opacity: 0.7;
        }

        .el-button-group {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;

            .el-button {
                min-width: 36px;
                padding: 6px 8px;
                border-radius: var(--el-border-radius-base);
                transition: all 0.2s;

                &:hover:not(.is-disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                &.is-disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            }
        }
    }

    .editor-wrapper {
        background-color: var(--el-bg-color);
        transition: background-color 0.3s;

        &.readonly {
            background-color: var(--el-fill-color-light);
        }

        .character-count {
            padding: 8px 16px;
            text-align: right;
            font-size: 12px;
            color: var(--el-text-color-secondary);
            border-top: 1px solid var(--el-border-color-light);
        }
    }

    .editor-content {
        padding: 1rem;
        outline: none;
        // min-height: 200px;
        // max-height: 60vh;
        overflow-y: auto;

        :deep(.ProseMirror) {
            min-height: 200px;
            color: var(--el-text-color-regular);
            // padding: 0, 5rem;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;

            >*+* {
                margin-top: 0.75em;
            }

            ul,
            ol {
                padding: 0 1rem;
                color: var(--el-text-color-regular);
            }

            p {
                line-height: 1.5;
                color: var(--el-text-color-regular);
                margin-bottom: 0;
                margin-top: 0;
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                line-height: 1.2;
                color: var(--el-text-color-primary);
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }

            code {
                background-color: var(--el-fill-color-dark);
                color: var(--el-color-info);
                padding: 0.2em 0.4em;
                border-radius: var(--el-border-radius-base);
                font-size: 0.9em;
            }

            pre {
                background: var(--el-color-info-light-9);
                color: var(--el-text-color-primary);
                padding: 0.75rem 1rem;
                border-radius: var(--el-border-radius-base);
                margin: 1em 0;
                overflow-x: auto;

                code {
                    color: inherit;
                    padding: 0;
                    background: none;
                    font-size: 0.8rem;
                }
            }

            img {
                max-width: 100%;
                height: auto;
                border-radius: var(--el-border-radius-base);
                margin: 1em 0;
            }

            blockquote {
                padding-left: 1rem;
                border-left: 2px solid var(--el-border-color-light);
                color: var(--el-text-color-secondary);
                margin: 1em 0;
            }

            hr {
                border: none;
                border-top: 2px solid var(--el-border-color-light);
                margin: 2rem 0;
            }

            a {
                color: var(--el-color-primary);
                text-decoration: underline;
                transition: color 0.2s;

                &:hover {
                    color: var(--el-color-primary-light-3);
                }
            }

            strong {
                color: var(--el-text-color-primary);
            }

            em {
                color: var(--el-text-color-primary);
                font-style: italic;
            }

            s {
                color: var(--el-text-color-secondary);
            }
        }
    }
}
</style>