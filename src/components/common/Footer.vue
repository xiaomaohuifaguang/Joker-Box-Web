<template>
    <el-divider />
    <el-row>
        <el-col :span="8" :offset="0" style="text-align: center;">
            📞联系方式
            <el-row>
                <el-col :span="24" :offset="0"><a
                        href="mailto:xiaomaohuifaguang@163.com?subject=&body=">xiaomaohuifaguang@163.com</a></el-col>
                <!-- <el-col :span="24" :offset="0">......</el-col> -->
            </el-row>
        </el-col>
        <el-col :span="8" :offset="0" style="text-align: center;">
            📕作品
            <el-row>
                <el-col :span="24" :offset="0">
                    <a href="https://xiaomaohuifaguang.github.io/blog/">博客</a>
                </el-col>
                <el-col :span="24" :offset="0">Joker-Box</el-col>
            </el-row>
        </el-col>
        <el-col :span="8" :offset="0" style="text-align: center;">
            😀源码
            <el-row>
                <el-col :span="24" :offset="0">
                    <a href="https://github.com/xiaomaohuifaguang/blog">Github:Blog</a>
                </el-col>
                <el-col :span="24" :offset="0">
                    <a href="https://github.com/xiaomaohuifaguang/Joker-Box-Web">Github:Joker-Box-Web</a>
                </el-col>
                <el-col :span="24" :offset="0">
                    <a href="https://github.com/xiaomaohuifaguang/Joker-Box">Github:Joker-Box</a>
                </el-col>
            </el-row>
        </el-col>
    </el-row>
    <div style="text-align: center;margin-top: 1rem;margin-bottom: 1rem;">
        版权所有©<a href="https://github.com/xiaomaohuifaguang">小猫会发光</a>
    </div>
</template>
<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>