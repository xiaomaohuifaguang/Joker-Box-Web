<template>
    <div :class="getClassName()">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
    span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
}>();

const getClassName = () => {
    switch (props.span) {
        case 1: return "cat-col basis-1/12";
        case 2: return "cat-col basis-2/12";
        case 3: return "cat-col basis-3/12";
        case 4: return "cat-col basis-4/12";
        case 5: return "cat-col basis-5/12";
        case 6: return "cat-col basis-6/12";
        case 7: return "cat-col basis-7/12";
        case 8: return "cat-col basis-8/12";
        case 9: return "cat-col basis-9/12";
        case 10: return "cat-col basis-10/12";
        case 11: return "cat-col basis-11/12";
        case 12: return "cat-col basis-full";
        default: return "cat-col basis-full";
    }
}


</script>

<style lang="scss" scoped>
.cat-col {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    box-sizing: border-box;
}
</style>