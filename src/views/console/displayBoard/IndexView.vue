<template>
  <div class="display-board-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="title-text">
            <h1>数据展板</h1>
            <p>系统数据统计与分析</p>
          </div>
        </div>
      </div>
    </div>

    <div class="page-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/console' }">
            <el-icon><House /></el-icon>
            <span>控制台</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item>数据展板</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <div class="section-header">
          <div class="header-icon stats">
            <el-icon><DataLine /></el-icon>
          </div>
          <span class="header-title">用户统计</span>
        </div>
        <div class="stats-cards">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <el-card class="stat-card total-users">
                <div class="stat-icon">
                  <el-icon class="icon-big"><User /></el-icon>
                </div>
                <el-statistic :value="peopleCount['total']" title="用户总数" value-style="color: var(--el-color-info);">
                </el-statistic>
                <div class="stat-trend">
                  <span class="trend-label">总用户数</span>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <el-card class="stat-card today-users">
                <div class="stat-icon">
                  <el-icon class="icon-big"><Calendar /></el-icon>
                </div>
                <el-statistic :value="peopleCount['todayRegister']" title="今日注册数" value-style="color: var(--el-color-success);">
                </el-statistic>
                <div class="stat-trend">
                  <span class="trend-label">今日新增</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="section-header">
          <div class="header-icon charts">
            <el-icon><PieChart /></el-icon>
          </div>
          <span class="header-title">数据分析</span>
        </div>
        <div class="charts-container">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-card class="chart-card">
                <div class="chart" id="peopleCreateByDayChartDataDiv"></div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-card class="chart-card">
                <div class="chart" id="apiReqTotalChartDataDiv"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { House, DataAnalysis, DataLine, PieChart, User, Calendar } from '@element-plus/icons-vue';







const peopleCount = ref({

})

const peopleCreateByDayChartData = ref({
    title: {
        text: '用户注册数近7天情况',
        textStyle: {
            fontSize: 16,
            fontWeight: 600,
            color: '#303133'
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            lineStyle: {
                color: '#667eea',
                width: 2
            }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
            color: '#303133'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: {
            lineStyle: {
                color: '#d9d9d9'
            }
        },
        axisLabel: {
            color: '#606266'
        }
    },
    yAxis: {
        type: 'value',
        axisLine: {
            lineStyle: {
                color: '#d9d9d9'
            }
        },
        axisLabel: {
            color: '#606266'
        },
        splitLine: {
            lineStyle: {
                color: '#f0f0f0'
            }
        }
    },
    series: [
        {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
                width: 3,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#667eea' },
                    { offset: 1, color: '#764ba2' }
                ])
            },
            itemStyle: {
                color: '#667eea',
                borderColor: '#fff',
                borderWidth: 2
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                    { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                ])
            },
            emphasis: {
                itemStyle: {
                    symbolSize: 12,
                    color: '#764ba2'
                }
            }
        }
    ]
})


const apiReqTotalChartData = ref({
    title: {
        text: 'api请求统计前10近30天情况统计',
        textStyle: {
            fontSize: 16,
            fontWeight: 600,
            color: '#303133'
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow',
            shadowStyle: {
                color: 'rgba(102, 126, 234, 0.1)'
            }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
            color: '#303133'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        axisLabel: {
            rotate: 30,
            interval: 0,
            fontSize: 12,
            color: '#606266',
            formatter: function (value) {
                return value.length > 6 ? value.substring(0, 6) + '...' : value;
            }
        },
        axisLine: {
            lineStyle: {
                color: '#d9d9d9'
            }
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value',
        axisLine: {
            lineStyle: {
                color: '#d9d9d9'
            }
        },
        axisLabel: {
            color: '#606266'
        },
        splitLine: {
            lineStyle: {
                color: '#f0f0f0'
            }
        }
    },
    series: [
        {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#4facfe' },
                    { offset: 1, color: '#00f2fe' }
                ]),
                borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#3a8ee6' },
                        { offset: 1, color: '#00b4ff' }
                    ])
                }
            }
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

<style scoped lang="scss">
.display-board-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px 0;
    margin-bottom: 24px;

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-icon {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);

        .el-icon {
          font-size: 32px;
          color: white;
        }
      }

      .title-text {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: white;
        }

        p {
          margin: 0;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }
  }

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .breadcrumb-wrapper {
    margin-bottom: 20px;

    :deep(.el-breadcrumb) {
      font-size: 14px;

      .el-breadcrumb__inner {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.stats {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.charts {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .el-icon {
        font-size: 18px;
        color: white;
      }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .stats-section,
  .charts-section {
    margin-bottom: 32px;
  }

  .stat-card {
    border-radius: 16px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
    padding: 24px;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    &.total-users {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }

    &.today-users {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(58, 194, 129, 0.05) 100%);
    }

    .stat-icon {
      margin-bottom: 16px;
      .icon-big {
        font-size: 48px;
        opacity: 0.8;
      }
      .total-users & {
        color: var(--el-color-info);
      }
      .today-users & {
        color: var(--el-color-success);
      }
    }

    :deep(.el-statistic__title) {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--el-text-color-secondary);
    }

    :deep(.el-statistic__content) {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 12px;
    }

    .stat-trend {
      .trend-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        padding: 4px 12px;
        border-radius: 16px;
        background-color: var(--el-fill-color-light);
      }
      .total-users & {
        .trend-label {
          background-color: rgba(102, 126, 234, 0.1);
          color: var(--el-color-info);
        }
      }
      .today-users & {
        .trend-label {
          background-color: rgba(103, 194, 58, 0.1);
          color: var(--el-color-success);
        }
      }
    }
  }

  .chart-card {
    border-radius: 16px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .chart {
      height: 400px;
      width: 100%;
    }
  }

  .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .display-board-page {
    .page-header {
      padding: 24px 0;

      .header-content {
        padding: 0 16px;
      }

      .header-title {
        flex-direction: column;
        text-align: center;

        .title-text {
          h1 {
            font-size: 22px;
          }
        }
      }
    }

    .page-container {
      padding: 0 16px 24px;
    }

    .stat-card,
    .chart-card {
      padding: 16px;

      :deep(.el-statistic__content) {
        font-size: 28px;
      }
    }

    .chart {
      height: 300px !important;
    }
  }
}
</style>