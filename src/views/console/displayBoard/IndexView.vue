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
                <el-statistic :value="peopleCount['total']" title="用户总数" value-style="color: var(--info);">
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
                <el-statistic :value="peopleCount['todayRegister']" title="今日注册数" value-style="color: var(--success);">
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
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as echarts from 'echarts';
import { House, DataAnalysis, DataLine, PieChart, User, Calendar } from '@element-plus/icons-vue';

const cssVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const hexToRgba = (hex: string, alpha: number) => {
    const v = hex.replace('#', '');
    const full = v.length === 3 ? v.split('').map(c => c + c).join('') : v;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

let peopleChart: echarts.ECharts | null = null;
let apiChart: echarts.ECharts | null = null;
let peopleData: { xdata: any[]; ydata: any[] } = { xdata: [], ydata: [] };
let apiData: { xdata: any[]; ydata: any[] } = { xdata: [], ydata: [] };

const peopleCount = ref({})

const buildPeopleOption = () => {
    const brandPrimary = cssVar('--brand-primary') || '#A855F7';
    const brandSecondary = cssVar('--brand-secondary') || '#EC4899';
    const textPrimary = cssVar('--text-primary') || '#303133';
    const textSecondary = cssVar('--text-secondary') || '#606266';
    const borderLight = cssVar('--border-light') || '#d9d9d9';
    const bgContainer = cssVar('--bg-container') || '#ffffff';

    return {
        title: {
            text: '用户注册数近7天情况',
            textStyle: { fontSize: 16, fontWeight: 600, color: textPrimary }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', lineStyle: { color: brandPrimary, width: 2 } },
            backgroundColor: bgContainer,
            borderColor: brandPrimary,
            borderWidth: 1,
            textStyle: { color: textPrimary }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: peopleData.xdata.length ? peopleData.xdata : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { lineStyle: { color: borderLight } },
            axisLabel: { color: textSecondary }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: borderLight } },
            axisLabel: { color: textSecondary },
            splitLine: { lineStyle: { color: borderLight } }
        },
        series: [
            {
                data: peopleData.ydata.length ? peopleData.ydata : [150, 230, 224, 218, 135, 147, 260],
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: brandPrimary },
                        { offset: 1, color: brandSecondary }
                    ])
                },
                itemStyle: { color: brandPrimary, borderColor: bgContainer, borderWidth: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: hexToRgba(brandPrimary, 0.3) },
                        { offset: 1, color: hexToRgba(brandPrimary, 0.05) }
                    ])
                },
                emphasis: { itemStyle: { symbolSize: 12, color: brandSecondary } }
            }
        ]
    };
};

const buildApiOption = () => {
    const data3 = cssVar('--data-3') || '#22D3EE';
    const data4 = cssVar('--data-4') || '#10F2A0';
    const brandPrimary = cssVar('--brand-primary') || '#A855F7';
    const textPrimary = cssVar('--text-primary') || '#303133';
    const textSecondary = cssVar('--text-secondary') || '#606266';
    const borderLight = cssVar('--border-light') || '#d9d9d9';
    const bgContainer = cssVar('--bg-container') || '#ffffff';

    return {
        title: {
            text: 'api请求统计前10近30天情况统计',
            textStyle: { fontSize: 16, fontWeight: 600, color: textPrimary }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow', shadowStyle: { color: hexToRgba(brandPrimary, 0.1) } },
            backgroundColor: bgContainer,
            borderColor: brandPrimary,
            borderWidth: 1,
            textStyle: { color: textPrimary }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            axisLabel: {
                rotate: 30,
                interval: 0,
                fontSize: 12,
                color: textSecondary,
                formatter: (v: string) => v.length > 6 ? v.substring(0, 6) + '...' : v
            },
            axisLine: { lineStyle: { color: borderLight } },
            data: apiData.xdata.length ? apiData.xdata : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: borderLight } },
            axisLabel: { color: textSecondary },
            splitLine: { lineStyle: { color: borderLight } }
        },
        series: [
            {
                data: apiData.ydata.length ? apiData.ydata : [150, 230, 224, 218, 135, 147, 260],
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: data3 },
                        { offset: 1, color: data4 }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: brandPrimary },
                            { offset: 1, color: data3 }
                        ])
                    }
                }
            }
        ]
    };
};

const peopleCountFun = async () => {
    peopleCount.value = await http.post('/statisticalCenter/peopleCount')
}

const peopleCreateByDayFun = async () => {
    const result = await http.post('/statisticalCenter/peopleCreateByDay')
    peopleData = { xdata: result.xdata, ydata: result.ydata }
    if (!peopleChart) {
        const dom = document.getElementById('peopleCreateByDayChartDataDiv')
        if (dom) peopleChart = echarts.init(dom)
    }
    peopleChart?.setOption(buildPeopleOption())
}

const apiReqTotalFun = async () => {
    const result = await http.post('/statisticalCenter/apiReqTotal')
    apiData = { xdata: result.xdata, ydata: result.ydata }
    if (!apiChart) {
        const dom = document.getElementById('apiReqTotalChartDataDiv')
        if (dom) apiChart = echarts.init(dom)
    }
    apiChart?.setOption(buildApiOption())
}

const themeObserver = new MutationObserver(() => {
    peopleChart?.setOption(buildPeopleOption())
    apiChart?.setOption(buildApiOption())
})

onMounted(() => {
    peopleCountFun()
    peopleCreateByDayFun()
    apiReqTotalFun()
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
    themeObserver.disconnect()
    peopleChart?.dispose()
    apiChart?.dispose()
})

</script>

<style scoped lang="scss">
.display-board-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

  .page-header {
    background: var(--brand-gradient);
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
          color: var(--text-on-brand);
        }
      }

      .title-text {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: var(--text-on-brand);
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
        background: var(--brand-gradient);
      }

      &.charts {
        background: var(--data-grad-3);
      }

      .el-icon {
        font-size: 18px;
        color: var(--text-on-brand);
      }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .stats-section,
  .charts-section {
    margin-bottom: 32px;
  }

  .stat-card {
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    padding: 24px;
    transition: transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
    text-align: center;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    &.total-users {
      background: var(--brand-gradient-soft);
    }

    &.today-users {
      background: var(--success-bg);
    }

    .stat-icon {
      margin-bottom: 16px;
      .icon-big {
        font-size: 48px;
        opacity: 0.8;
      }
      .total-users & {
        color: var(--info);
      }
      .today-users & {
        color: var(--success);
      }
    }

    :deep(.el-statistic__title) {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--text-secondary);
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
        color: var(--text-secondary);
        padding: 4px 12px;
        border-radius: 16px;
        background-color: var(--bg-overlay);
      }
      .total-users & {
        .trend-label {
          background-color: var(--bg-overlay);
          color: var(--info);
        }
      }
      .today-users & {
        .trend-label {
          background-color: var(--success-bg);
          color: var(--success);
        }
      }
    }
  }

  .chart-card {
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    padding: 24px;
    transition: transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
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