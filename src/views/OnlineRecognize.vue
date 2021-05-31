<template>
    <div class="OnlineRecognize">
        <p class="title">在线识别</p>
        <el-button type="primary" size="small" onclick="document.getElementById('upload-button').click()">
            上传视频<i class="el-icon-upload el-icon--right"></i>
        </el-button>
        <input id="upload-button" type="file" style="display: none"   @change="handleUploadChange" accept=".mp4"/>
        <br>
        <br>
        <el-row :gutter="20">
            <el-col :span="16">
                <video id="display-video" :src="videoUrl"
                       class="video-area" preload controls>
                </video>
            </el-col>
            <el-col :span="8">
                <div class="video-list-card">
                    <el-row>
                        <el-col :span="6">
                            <span class="video-list-title">视频列表</span>
                        </el-col>
                        <el-col :span="5" :offset="6">
                            <span class="text-button recognize-all-button"
                                  @click="refreshAll();info('刷新成功！')">
                                刷新全部
                            </span>
                        </el-col>
                        <el-col :span="5">
                            <span class="text-button recognize-all-button" @click="recognizeAll">识别全部</span>
                        </el-col>
                        <el-col :span="2">
                            <span class="video-list-num">{{curVideoIndex + 1}}/{{videoList.length}}</span>
                        </el-col>
                    </el-row>
                    <div class="video-list-card-body">
                        <p v-if="videoList.length === 0" style="margin-left: 40%;color: #42b983">暂无视频</p>
                        <template v-for="(video, index) in videoList">
                            <div v-if="index !== curVideoIndex" class="video-item" @click="select(index)" :key="video.id">
                                {{video.name}}
                            </div>
                            <div v-else class="video-item selected" :key="video.id">
                                <i class="el-icon-video-play">{{" " + video.name}}</i>
                            </div>
                        </template>
                    </div>
                </div>
                <p class="recognize-title">识别结果</p>
                <div v-if="curVideo.recognizeResult !== ''">
                    <template v-if="Object.keys(curVideo.recognizeResult).length !== 0">
                        <el-tag effect="plain" v-for="(val, key) in curVideo.recognizeResult" :key="key">
                            {{key}}
                        </el-tag>
                    </template>
                    <template v-else>
                        <el-tag effect="plain" type="warning">
                            没有识别到任何结果
                        </el-tag>
                    </template>
                </div>
                <p v-else>暂无结果</p>
                <el-button v-if="curVideo.id === undefined" type="primary" size="small" disabled>
                    开始识别
                </el-button>
                <el-button v-else-if="curVideo.recognizeResult !== ''" type="primary" size="small" @click="recognize">
                    重新识别
                </el-button>
                <el-button v-else-if="minutesSinceLastRecognize < 10" type="primary"
                           size="small" @click="refreshCurrentVideo();info('刷新成功！')" id="refresh-button">
                    识别中，点击刷新
                </el-button>
                <el-button v-else type="primary" size="small" @click="recognize">
                    开始识别
                </el-button>
                <p class="hints">依据视频长度不同，识别时间也不同，请耐心等待！</p>
            </el-col>
        </el-row>
        <br>
        <br>
        <el-dialog title="批量识别结果"
                   center
                   :append-to-body="true"
                   width="30%"
                   :visible.sync="showRecognizeAllDialog">
            <p>开始识别的视频:</p>
            <el-tag v-for="name in recognizeAllResult.succeed" :key="name" type="success" effect="dark">
                {{name}}
            </el-tag>
            <p>未能开始识别的视频</p>
            <el-tag v-for="name in recognizeAllResult.failed" :key="name" type="danger" effect="dark">
                {{name}}
            </el-tag>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showRecognizeAllDialog = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "OnlineRecognize",
        data(){
            return{
                curVideoIndex: -1,
                videoList: [],
                showRecognizeAllDialog: false,
                recognizeAllResult: {
                    failed: ['1.mp4'],
                    succeed: ['2.mp4'],
                    status: 1,
                }
            }
        },
        created(){
            if (this.$route.params.videoList !== undefined && this.$route.params.videoList !== null){
                this.videoList = JSON.parse(this.$route.params.videoList);
                this.curVideoIndex = 0;
            }
            for (let v of this.videoList){
                v.recognizeResult = this.parseRecognizeResult(v.recognizeResult);
            }
        },
        computed:{
            videoUrl(){
                return this.api.resPath + "/" + this.curVideo.filePath;
            },
            minutesSinceLastRecognize(){
                if (this.curVideo.lastRecognizeTime === undefined || this.curVideo.lastRecognizeTime === null)
                    return 2147483647;
                const lastRecognizeTime = new Date(this.curVideo.lastRecognizeTime).getTime();
                return (Date.now() - lastRecognizeTime) / 60000;
            },
            curVideo(){
                if (this.curVideoIndex >= this.videoList.length || this.curVideoIndex < 0)
                    return {lastRecognizeTime: '2021-04-06T12:53:59.000+00:00', recognizeResult: '', name: '暂无视频'};
                return this.videoList[this.curVideoIndex];
            },
        },
        methods: {
            parseRecognizeResult(rec){
                if (rec === null || rec === undefined)
                    return ''
                else if (rec !== '')
                    return JSON.parse(rec);
                else
                    return ''
            },
            handleUploadChange(event){
                let videoFile = event.target.files[0];
                // 重命名文件
                videoFile = new File([videoFile], videoFile.name, {type: videoFile.type});
                // 使用父组件提供的上传方法
                this.$parent.uploadVideo([videoFile], "-1", video => {
                    video.recognizeResult = this.parseRecognizeResult(video.recognizeResult);
                    this.videoList.push(video);
                });
            },
            recognize(){
                this.axios.get(this.api.onlineInvokeRecognizeUrl, {
                    params: {
                        fileId: this.curVideo.id
                    }
                }).then(res => {
                    if (res.data.status === 1){
                        this.refreshCurrentVideo();
                    }else{
                        this.$message.warning(res.data.msg);
                    }
                })
            },
            recognizeAll(){
                if (this.videoList.length === 0){
                    this.$message.info("没有可以用来识别的视频");
                    return;
                }
                const ids = [];
                for (let v of this.videoList)
                    ids.push(v.id);
                this.axios.post(this.api.recognizeAllUrl, {
                    idList: ids
                }).then(res => {
                    if (res.data.status === 1){
                        this.recognizeAllResult = res.data;
                        this.showRecognizeAllDialog = true;
                        this.refreshAll();
                    }else{
                        this.$message.warning(res.data.msg);
                    }
                })
            },
            refreshCurrentVideo(){
                this.axios.get(this.api.getFileByIdUrl, {
                    params: {
                        id: this.curVideo.id
                    }
                }).then(res => {
                    const video = res.data.file;
                    video.recognizeResult = this.parseRecognizeResult(video.recognizeResult);
                    this.$set(this.videoList, this.curVideoIndex, video);
                })
            },
            refreshAll(){
                const ids = [];
                for (let v of this.videoList)
                    ids.push(v.id);
                this.axios.post(this.api.getAllFilesByIdListUrl, {
                    idList: ids
                }).then(res => {
                    const videos = res.data.files;
                    for (let v of videos) {
                        v.recognizeResult = this.parseRecognizeResult(v.recognizeResult);
                        console.log(v.recognizeResult);
                        console.log(this.minutesSinceLastRecognize)
                    }
                    this.videoList = videos;
                })
            },
            select(videoIndex){
                this.curVideoIndex = videoIndex;
            },
            info(msg){
                this.$message.info(msg);
            }
        }
    }
</script>

<style scoped>

    .OnlineRecognize{
        text-align: left;
        margin-top: 0;
    }

    .video-area{
        width: 100%;
        max-height: 560px;
        border: 1px solid #E0E0E0;
    }

    .recognize-title{
        margin-top: 0;
        font-weight: bold;
        font-size: 20px;
    }

    .hints{
        color: #909399;
        font-size: 14px;
    }

    .video-list-card{
        background-color: rgb(242, 242, 242);
        margin-bottom: 5px;
        width: 83%;
        padding: 10px;
    }

    .video-list-card-body{
        max-height: 180px;
        overflow: scroll;
    }

    .video-list-title{
        font-weight: bold;
        font-size: 18px;
    }

    .video-list-num{
        font-size: 14px;
        margin-top: 4px;
        color: #8e8e8e;
    }

    .recognize-all-button{
        font-size: 14px;
    }

    .video-item{
        height: 28px;
        width: 95%;
        border-radius: 2px;
        background-color: rgb(242, 242, 242);
        margin-top: 5px;
        transition: 0.2s;
        padding: 5px 0 0 10px;
    }

    .video-item:hover{
        background-color: white;
        cursor: pointer;
        transition: 0.2s;
        padding: 5px 0 0 15px;
    }

    .selected{
        background-color: white;
        color: #3a8ee6;
    }

    .el-tag{
        margin-right: 5px;
        margin-bottom: 10px;
    }
</style>
