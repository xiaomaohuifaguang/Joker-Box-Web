<template>
    <div class="card lg:card-side bg-base-100 shadow-x card-bordered">
        <slot name="header"></slot>
        <div class="card-body">
            <slot>

            </slot>
        </div>
        <slot name="footer"></slot>

    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped></style>