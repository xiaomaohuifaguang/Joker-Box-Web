<template>
    <div>
        <div className="card card-compact bg-base-100 w-96 shadow-xl">
            <figure>
                <img src="https://img.zcool.cn/community/01f8ae5dfce917a8012165183b2b94.jpg?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100" alt="Shoes" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">Not Found</h2>
                <p>没有找到你想要的页面</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">
                        <RouterLink :to="{path: props.backUrl}">返回主页</RouterLink>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props =   defineProps({
    backUrl:{
        type: String,
        default: false
    }
})


</script>

<style lang="scss" scoped>


</style>