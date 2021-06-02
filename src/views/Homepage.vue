<template>
    <div class="Homepage">
        <div class="title">首页</div>
        <div style="width: 65%;float:left;">
            <div class="card">
                <div class="card-head">
                    <span>本月调用次数信息展示</span>
                </div>
                <div class="card-body">
                    <el-row>
                        <el-col :span="6">
                            <p class="auto-hide-text">在线调用次数</p>
                            <p><span class="lager-text">{{invokeTimeInfo.online}}</span>次</p>
                        </el-col>
                        <el-col :span="6" :offset="2">
                            <p class="auto-hide-text">通过接口调用次数</p>
                            <p><span class="lager-text">{{invokeTimeInfo.api}}</span>次</p>
                        </el-col>
                        <el-col :span="6" :offset="2">
                            <p class="auto-hide-text">本月剩余调用次数</p>
                            <p><span class="lager-text">{{invokeTimeInfo.remain}}</span>次</p>
                        </el-col>
                    </el-row>
                </div>
<!--                <div class="card-footer">-->
<!--                    <span class="text-button">数据说明</span>-->
<!--                    <el-divider direction="vertical"></el-divider>-->
<!--                    <span class="text-button">如何回复调用次数？</span>-->
<!--                </div>-->
            </div>
            <br>
            <div class="card">
                <div class="card-head">
                    <span>总体调用记录展示</span>
                </div>
                <div class="card-body">
                    <div id="invoke_chart" class="center invoke-chart"></div>
                </div>
                <div class="card-footer">
                    <span class="text-button" @click="goToPage('/online/recognize')"> >在线识别页面 </span>
                </div>
            </div>
            <br>
            <br>
            <br>
        </div>
        <div style="margin-left: 20px;width: 30%;float: left">
            <div class="card">
                <div class="card-head">
                    <span>存储空间使用情况</span>
                </div>
                <div class="card-body">
                    <div id="show-storage" class="center storage-pie-chart"></div>
                </div>
                <div class="card-footer">
                    <span class="text-button" @click="goToPage('video/management')"> >视频管理页面</span>
                </div>
            </div>
            <br>
            <div class="card">
                <div class="card-head">
                    <span>今天调用情况</span>
                </div>
                <div class="card-body">
                    <div id="invoke-day-chart" class="center invoke-day-chart"></div>
                </div>
            </div>
            <br>
            <br>
            <br>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Homepage",
        data(){
          return{
              user: {fileCapacity: 1000, ownFileSize: 500, totalInvokeTime: 100000},
              invokeRecords: [
                  {id: 1, isApiInvoke: true, accessToken: '', invokeTime: new Date('2021-04-23T10:09:49.000+00:00'), invokerId: 1}
                  ],
              invokeTimeInfo: {online: 53, api: 103, remain: 844},
              storageChart: {used: 500, remain: 1000},
          }
        },
        mounted(){
            this.axios.get(this.api.getRecordsAndUserUrl).then(r => {
                this.user = r.data.user;
                this.invokeRecords = r.data.records;
                for (let inv of this.invokeRecords){
                    inv.invokeTime = new Date(inv.invokeTime);
                }
                // 按调用时间升序排序
                this.invokeRecords.sort((r1, r2) => r1.invokeTime.getTime() - r2.invokeTime.getTime());
                this.init_invoke_info_card();
                this.init_storage_chart();
                this.init_invoke_chart();
                this.init_invoke_day_chart();
            })
        },
        methods: {
            goToPage(path){
                this.$router.push(path)
            },
            init_invoke_info_card(){
                let online = 0, api = 0;
                const now = new Date(Date.now());
                const records = this.invokeRecords.filter(record => {
                    return record.invokeTime.getMonth() === now.getMonth();
                })
                for (let i = 0; i < records.length; i++){
                    if (records[i].isApiInvoke)
                        api++;
                    else
                        online++;
                }
                this.invokeTimeInfo.api = api;
                this.invokeTimeInfo.online = online;
                this.invokeTimeInfo.remain = this.user.totalInvokeTime - api - online;
            },
            init_storage_chart(){
                this.storageChart.used = this.user.ownFileSize;
                this.storageChart.remain = this.user.fileCapacity - this.user.ownFileSize;

                const used = this.storageChart.used;
                const remain = this.storageChart.remain;
                let option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 10,
                        data: ['已使用：' + this.tools.format(used), '未使用：' + this.tools.format(remain)]
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
                                {value: Math.round(used/1048576), name: '已使用：' + this.tools.format(used)},
                                {value: Math.round(remain/1048576), name: '未使用：' + this.tools.format(remain)},
                            ]
                        }
                    ]
                };
                const storageChart = this.echarts.init(document.getElementById("show-storage"));
                storageChart.setOption(option);
            },
            init_invoke_chart(){
                const date = [];
                const api_data = [];
                const online_data = [];
                const N = this.invokeRecords.length;
                if (N !== 0) {
                    const oneDay = 24 * 3600 * 1000;
                    const getBaseDay = (d) => {return new Date(d.getFullYear(), d.getMonth(), d.getDate())};
                    let base = getBaseDay(this.invokeRecords[0].invokeTime);
                    let i = 0;
                    const now = new Date(Date.now());
                    while (base.getTime() <= now.getTime()){
                        let api = 0, online = 0;
                        // 统计同一天有多少次在线调用和api调用
                        while (i < N && this.tools.isSameDay(base, this.invokeRecords[i].invokeTime)){
                            const record = this.invokeRecords[i];
                            if (record.isApiInvoke)  api ++;
                            else                     online++;
                            i++;
                        }
                        // js月份默认从0开始，因此显示时要加1
                        date.push([base.getFullYear(), base.getMonth() + 1, base.getDate()].join('/'));
                        api_data.push(api);
                        online_data.push(online);
                        base = new Date(base.getTime() + oneDay);
                    }
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
                        start: 50,
                        end: 100
                    }, {
                        start: 50,
                        end: 100
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
                            data: online_data
                        },
                        {
                            name: '通过api调用',
                            type: 'line',
                            symbol: 'none',
                            sampling: 'lttb',
                            itemStyle: {
                                color: 'rgb(63,205,103)'
                            },
                            data: api_data
                        }
                    ]
                };
                const invokeChart = this.echarts.init(document.getElementById("invoke_chart"));
                invokeChart.setOption(option);
            },
            init_invoke_day_chart(){
                const now = new Date(Date.now());
                const records = this.invokeRecords.filter(r => {
                    return this.tools.isSameDay(r.invokeTime, now);
                });
                const time = new Array(12);
                const data = new Array(12);
                for (let i = 0; i < 12; i++){
                    time[i] = (i + 1) * 2 + '点';
                    data[i] = 0;
                }
                for (let r of records){
                    data[Math.ceil(r.invokeTime.getHours() / 2)]++;
                }
                let option = {
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: time,
                    },
                    yAxis: {
                        name: '调用次数'
                    },
                    series: [{
                        data: data,
                        type: 'line',
                        smooth: true,
                        areaStyle: {
                            opacity: 0.5,
                            color: new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(0, 221, 255)'
                            }, {
                                offset: 1,
                                color: 'rgba(77, 119, 255)'
                            }])
                        },
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
        padding-bottom: 50px;
    }

    .card{
        box-shadow: 0 4px 10px rgb(230, 230, 230);
        border-radius: 5px;
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
        min-height: 120px;
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

