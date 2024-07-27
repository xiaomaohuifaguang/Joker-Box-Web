<template>
    <div className="join justify-center">
        <!-- <input className="join-item btn mr-2" type="radio" name="options" aria-label="首页" @click="onPageChange(1)"
            :disabled="props.current <= 1" /> -->
        <button className="join-item btn mr-2"
            @click="onPageChange(props.current - 1)" :disabled="props.current == 1">
            上一页
        </button>
        <button v-for="page in displayedPages" :key="page" :className="page == props.current ? 'join-item btn mr-2 btn-active' : 'join-item btn mr-2'" 
            :aria-label="page.toString()" @click="onPageChange(page)" :disabled="page=='...'">
            {{ page }}
        </button>
        <!-- <input className="join-item btn mr-2" 
            type="radio" 
            name="options" 
            v-for="index in props.pages" 
            :aria-label="index.toString()" 
            :defaultChecked="index === props.current"
            @change="onPageChange(Number(index))"
            /> -->

        <button className="join-item btn mr-2"
            @click="onPageChange(props.current + 1)" :disabled="props.current >= props.pages">
            下一页
        </button>
        <!-- <input className="join-item btn mr-2" type="radio" name="options" aria-label="尾页"
            @click="onPageChange(props.pages)" :disabled="props.current >= props.pages" /> -->
    </div>
</template>

<script lang="ts" setup>

import { computed } from 'vue'

const props = defineProps<{
    current: number,
    size: number,
    pages: number
}>();

const emit = defineEmits(['pageChange']);

const onPageChange = (newCurrent: string | number) => {
    emit('pageChange', newCurrent);
};

const displayedPages = computed(() => {
    const totalPages = props.pages;
    const currentPage = props.current;
    const maxPagesToShow = 10;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 6) {
            for (let i = 1; i <= 7; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 5) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 6; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
    }
    return pages;
});

</script>

<style lang="scss" scoped></style>