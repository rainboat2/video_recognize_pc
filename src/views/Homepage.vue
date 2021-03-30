<template>
    <div class="Homepage">
        <div class="title">首頁</div>
        <div style="width: 65%;float:left;">
            <el-card :body-style="{padding: 0}">
                <div class="card-head">
                    <span>调用次数信息展示</span>
                </div>
                <div class="card-body">
                    <el-row>
                        <el-col :span="6">
                            <p class="auto-hide-text">在线调用次数</p>
                            <p><span class="lager-text">53</span>次</p>
                        </el-col>
                        <el-col :span="6" :offset="2">
                            <p class="auto-hide-text">通过接口调用次数</p>
                            <p><span class="lager-text">103</span>次</p>
                        </el-col>
                        <el-col :span="6" :offset="2">
                            <p class="auto-hide-text">本月剩余调用次数</p>
                            <p><span class="lager-text">844</span>次</p>
                        </el-col>
                    </el-row>
                </div>
                <div class="card-footer">
                    <span class="text-button">数据说明</span>
                    <el-divider direction="vertical"></el-divider>
                    <span class="text-button">如何回复调用次数？</span>
                </div>
            </el-card>
            <br>
            <el-card :body-style="{padding: 0}">
                <div class="card-head">
                    <span>调用时间展示</span>
                </div>
                <div class="card-body">
                    <div id="invoke_chart" class="center invoke-chart"></div>
                </div>
            </el-card>
            <br>
            <br>
            <br>
        </div>
        <div style="margin-left: 20px;width: 30%;float: left">
            <el-card :body-style="{padding: 0}">
                <div class="card-head">
                    <span>存储空间使用情况</span>
                </div>
                <div class="card-body">
                    <div id="show-storage" class="center storage-pie-chart"></div>
                </div>
            </el-card>
            <br>
            <el-card :body-style="{padding: 0}">
                <div class="card-head">
                    <span>过去24小时调用情况</span>
                </div>
                <div class="card-body">
                    <div id="invoke-day-chart" class="center invoke-day-chart"></div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Homepage",
        mounted(){
          this.init_storage_chart();
          this.init_invoke_chart();
          this.init_invoke_day_chart();
        },
        methods: {
            init_storage_chart(){
                let option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 10,
                        data: ['已使用存储', '未使用存储']
                    },
                    color: ["#5098eb", "#55f6d1"],
                    series: [
                        {
                            name: '访问来源',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            avoidLabelOverlap: false,
                            label: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data: [
                                {value: 335, name: '已使用存储'},
                                {value: 335, name: '未使用存储'},
                            ]
                        }
                    ]
                };
                const storageChart = this.echarts.init(document.getElementById("show-storage"));
                storageChart.setOption(option);
            },
            init_invoke_chart(){
                let base = +new Date(2000, 1, 1);
                const oneDay = 24 * 3600 * 1000;
                const date = [];
                const data1 = [Math.random()*300];
                const data2 = [Math.random()*300];

                for (let i = 1; i < 20000; i++) {
                    let now = new Date(base += oneDay);
                    date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
                    let r = Math.round((Math.random() - 0.5) * 20 + data1[i - 1]);
                    data1.push((r > 0)? r : -r);

                    r = Math.round((Math.random() - 0.5) * 20 + data2[i - 1]);
                    data2.push((r > 0)? r : -r);
                }

                const option = {
                    tooltip: {
                        trigger: 'axis',
                        position: function (pt) {
                            return [pt[0], '10%'];
                        }
                    },
                    toolbox: {
                        feature: {
                            dataZoom: {
                                yAxisIndex: 'none'
                            },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        name: '时间',
                        type: 'category',
                        boundaryGap: false,
                        data: date
                    },
                    yAxis: {
                        name: '调用次数',
                        type: 'value',
                        boundaryGap: [0, '100%']
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: 0,
                        end: 10
                    }, {
                        start: 0,
                        end: 10
                    }],
                    legend: {
                        data: ['在线调用', '通过api调用']
                    },
                    series: [
                        {
                            name: '在线调用',
                            type: 'line',
                            symbol: 'none',
                            sampling: 'lttb',
                            itemStyle: {
                                color: 'rgb(91,162,238)'
                            },
                            data: data1
                        },
                        {
                            name: '通过api调用',
                            type: 'line',
                            symbol: 'none',
                            sampling: 'lttb',
                            itemStyle: {
                                color: 'rgb(63,205,103)'
                            },
                            data: data2
                        }
                    ]
                };
                const invokeChart = this.echarts.init(document.getElementById("invoke_chart"));
                invokeChart.setOption(option);
            },
            init_invoke_day_chart(){
                let option = {
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: ['4点', '8点', '12点', '16点', '20点',  '24点']
                    },
                    yAxis: {
                        name: '调用次数'
                    },
                    series: [{
                        symbol: 'none',
                        data: [0, 2, 5, 1, 4, 1],
                        type: 'line',
                        itemStyle: {
                            color: '#5098eb'
                        },
                    }]
                };
                const invokeDayChart = this.echarts.init(document.getElementById("invoke-day-chart"));
                invokeDayChart.setOption(option);
            }
        },
    }
</script>

<style scoped>

    .Homepage{
        min-width: 960px;
    }

    .card-head{
        height: 34px;
        background-color: rgb(241, 233, 248);
        text-align: left;
        padding-left: 10px;
        padding-top: 12px;
        font-size: 17px;
        color: rgb(20, 20, 20);
    }

    .card-body{
        min-height: 100px;
        color: rgb(50, 50, 50);
    }

    .card-footer{
        height: 34px;
        padding-left: 10px;
        padding-top: 12px;
        text-align: left;
        border: rgb(230, 230, 230) solid;
        border-width: 1px 0 0 0;
    }

    .lager-text{
        font-size: 40px;
        font-weight: bold;
        margin-right: 7px;
    }

    .storage-pie-chart{
        width: 300px;
        height: 300px;
    }

    .invoke-chart{
        width: 600px;
        height: 430px;
        margin-top: 20px;
    }

    .invoke-day-chart{
        width: 300px;
        height: 300px;
    }
</style>

