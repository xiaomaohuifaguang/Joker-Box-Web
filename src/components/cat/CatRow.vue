<template>
    <div class="cat-row">
        <slot>

        </slot>
    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.cat-row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -0.75rem;
    margin-right: -0.75rem;
}

</style>