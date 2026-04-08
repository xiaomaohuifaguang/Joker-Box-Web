<template>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/console' }">控制台</el-breadcrumb-item>
        <el-breadcrumb-item>展板</el-breadcrumb-item>
    </el-breadcrumb>
    <el-divider />
    <el-row :gutter="20">
        <el-col :span="12" style="text-align: center;">
            <el-card>
                <el-statistic :value="peopleCount['total']" title="用户总数" value-style="color:var(--el-color-info);">
                </el-statistic>
            </el-card>

        </el-col>
        <el-col :span="12" style="text-align: center;">
            <el-card>
                <el-statistic :value="peopleCount['todayRegister']" title="今日注册数"
                    value-style="color:var(--el-color-success);">
                </el-statistic>
            </el-card>
        </el-col>
    </el-row>

    <el-row :gutter="20">
        <el-col :span="12">
            <el-card>
                <div class="chart" id="peopleCreateByDayChartDataDiv"></div>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card>
                <div class="chart" id="apiReqTotalChartDataDiv"></div>
            </el-card>
        </el-col>
    </el-row>

</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';







const peopleCount = ref({

})

const peopleCreateByDayChartData = ref({
    title: {
        text: '用户注册数近7天情况'
    },
    tooltip: {
        trigger: 'axis', // 触发类型，'axis'表示触发整个坐标轴的数据
        axisPointer: {
            type: 'cross' // 十字准星指示器，帮助对齐数据
        }
    },
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line'
        }
    ]
})


const apiReqTotalChartData = ref({
    title: {
        text: 'api请求统计前10近30天情况统计'
    },
    tooltip: {
        trigger: 'axis', // 触发类型，'axis'表示触发整个坐标轴的数据
        axisPointer: {
            type: 'cross' // 十字准星指示器，帮助对齐数据
        }
    },
    xAxis: {
        type: 'category',
        axisLabel: {
            rotate: 30, // 旋转角度，正值表示逆时针旋转
            interval: 0, // 强制显示所有标签
            fontSize: 12,
            // 如果标签仍然过长可以截断
            formatter: function (value) {
                return value.length > 6 ? value.substring(0, 6) + '...' : value;
            }
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'bar'
        }
    ]
})



const peopleCountFun = () => {
    http.result({
        url: '/statisticalCenter/peopleCount',
        method: 'POST',
        success(result) {
            peopleCount.value = result.data
        }
    })
}

const peopleCreateByDayFun = () => {
    http.result({
        url: '/statisticalCenter/peopleCreateByDay',
        method: 'POST',
        success(result) {
            var chartDom = document.getElementById('peopleCreateByDayChartDataDiv');
            var myChart = echarts.init(chartDom);
            peopleCreateByDayChartData.value.xAxis.data = result.data.xdata
            peopleCreateByDayChartData.value.series[0].data = result.data.ydata
            myChart.setOption(peopleCreateByDayChartData.value);

        }
    })
}


const apiReqTotalFun = () => {
    http.result({
        url: '/statisticalCenter/apiReqTotal',
        method: 'POST',
        success(result) {
            var chartDom = document.getElementById('apiReqTotalChartDataDiv');
            var myChart = echarts.init(chartDom);
            apiReqTotalChartData.value.xAxis.data = result.data.xdata
            apiReqTotalChartData.value.series[0].data = result.data.ydata
            myChart.setOption(apiReqTotalChartData.value);

        }
    })
}

onMounted(() => {
    peopleCountFun()
    peopleCreateByDayFun()
    apiReqTotalFun()
})



</script>

<style scoped>
.chart {
    height: 400px;
}

.el-col {
    margin-bottom: 1rem;
}
</style>