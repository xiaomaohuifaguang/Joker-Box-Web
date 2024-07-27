<template>
    <div>
        <div className="dropdown dropdown-bottom dropdown-end mb-auto">
            <div tabIndex={0} role="button" className="btn m-1">
                主题选择
                <svg width="12px" height="12px" className="inline-block h-2 w-2 fill-current opacity-60"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl">
                <li v-for="item in themes">
                    <input type="radio" name="theme-dropdown"
                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                        :aria-label="item.name" :value="item.value" @click="saveTheme(item.value)"/>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const saveTheme = (theme:string) => {
    localStorage.setItem("theme",theme)
}


const themes = ref([
    { name: "明亮", value: "light" },
    { name: "暗黑", value: "dark" },
    { name: "蛋糕", value: "cupcake" },
    { name: "大黄蜂", value: "bumblebee" },
    { name: "翡翠", value: "emerald" },
    { name: "公司", value: "corporate" },
    { name: "艺术流派", value: "synthwave" },
    { name: "复古", value: "retro" },
    { name: "赛博朋克", value: "cyberpunk" },
    { name: "情人节", value: "valentine" },
    { name: "万圣节", value: "halloween" },
    { name: "花园", value: "garden" },
    { name: "森林", value: "forest" },
    { name: "湖绿", value: "aqua" },
    { name: "夸张", value: "lofi" },
    { name: "淡的", value: "pastel" },
    { name: "幻想", value: "fantasy" },
    { name: "线框", value: "wireframe" },
    { name: "黑色", value: "black" },
    { name: "奢侈品", value: "luxury" },
    { name: "德古拉", value: "dracula" },
    { name: "四分色", value: "cmyk" },
    { name: "秋天", value: "autumn" },
    { name: "业务", value: "business" },
    { name: "酸的", value: "acid" },
    { name: "柠檬", value: "lemonade" },
    { name: "晚上", value: "night" },
    { name: "咖啡", value: "coffee" },
    { name: "冬天", value: "winter" },
    { name: "暗淡的", value: "dim" },
    { name: "北", value: "nord" },
    { name: "日落", value: "sunset" },
])

</script>

<style lang="scss" scoped></style>