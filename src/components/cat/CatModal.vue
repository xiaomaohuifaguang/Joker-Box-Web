<template>
    <div>
        <dialog :id="id" className="modal">
            <div :className="props.large ? 'modal-box max-w-5xl' : 'modal-box'">
                <div>
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="close">✕</button>
                </div>
                <h3 className="font-bold text-lg text-center mb-2">{{ props.title }}</h3>
                <div class="divider"></div>
                <div v-if="showContent">
                    <slot></slot>
                </div>
            </div>
        </dialog>
    </div>

</template>

<script lang="ts" setup>
import { onMounted, ref, watch, nextTick } from 'vue'

const props = defineProps<{
    modelValue: boolean,
    title?: string,
    large?: boolean
}>();

const id = ref("")
const showContent = ref(false);

// 观察 props.open 的变化
watch(
    () => props.modelValue, // 观察的源
    (newValue: boolean, oldValue: boolean) => {
        // 当 props.open 发生变化时执行的回调
        if(props.modelValue){
            showContent.value = false; // 隐藏内容
            setTimeout(() => {
                showContent.value = true; // 再次显示内容
                let modal = document.getElementById(id.value) as HTMLDialogElement
                modal.showModal()
            }, 0);
        }else{
            close()
        }
    }
);

const emit = defineEmits(['update:modelValue',"close"]);

const close = () => {
    let modal = document.getElementById(id.value) as HTMLDialogElement
    modal.close()
    emit('update:modelValue', false);
    emit('close');
}

onMounted(() => {
    id.value = generateRandomId(10)
    if(props.modelValue){
        showContent.value = true;
        nextTick(() => {
            let modal = document.getElementById(id.value) as HTMLDialogElement;
            modal.showModal();
            let activeElement = document.activeElement as HTMLElement;
            if(activeElement){
                activeElement.blur();
            }
        });
    }
})



/**
 * 随机id
 * @param length 长度
 * @returns 
 */
const generateRandomId = (length: number): string => {
    const randomValues = Array.from({ length }, () => Math.random().toString(36).substring(2));
    return randomValues.join('');
}

</script>

<style lang="scss" scoped>
.cat-modal-box {
    max-width: none;
}
</style>