<template>
    <div class="OnlineRecognize">
        <p class="title">在线识别</p>
        <p>上传视频，对视频的内容进行识别，并显示识别的结果</p>
        <el-button type="primary" size="small" onclick="document.getElementById('upload-button').click()">
            上传<i class="el-icon-upload el-icon--right"></i>
        </el-button>
        <input id="upload-button" type="file" style="display: none" @change="handleUploadChange" accept=".mp4"/>
        <br>
        <br>
        <el-row :gutter="20">
            <el-col :span="18">
                <video id="video" :src="videoUrl" class="video-area" preload controls>
                </video>
            </el-col>
            <el-col :span="6">
                <p class="recognize-title">识别结果</p>
                <p v-if="video.recognizeResult !== ''">{{video.recognizeResult}}</p>
                <p v-else>暂无结果</p>
                <el-button v-if="video.id === undefined" type="primary" size="small" disabled>
                    开始识别
                </el-button>
                <el-button v-else-if="video.recognizeResult !== ''" type="primary" size="small" @click="recognize">
                    重新识别
                </el-button>
                <el-button v-else-if="minutesSinceLastRecognize < 10" type="primary" size="small" @click="refreshCurrentVideo">
                    识别中，点击刷新
                </el-button>
                <el-button v-else type="primary" size="small" @click="recognize">
                    开始识别
                </el-button>
                <p class="hints">识别过程大约持续1～3分钟</p>
            </el-col>
        </el-row>
        <br>
        <br>
    </div>
</template>

<script>
    export default {
        name: "OnlineRecognize",
        data(){
            return{
                video: {lastRecognizeTime: '2021-04-06T12:53:59.000+00:00'}
            }
        },
        created(){
            if (this.$route.params.video !== undefined)
                this.video = this.$route.params.video;
            if (this.video.recognizeResult === undefined || this.video.recognizeResult === null)
                this.video.recognizeResult = '';
        },
        computed:{
            videoUrl(){
                return this.api.resPath + "/" + this.video.filePath;
            },
            minutesSinceLastRecognize(){
                if (this.video.lastRecognizeTime === undefined || this.video.lastRecognizeTime === null)
                    return 2147483647;
                const lastRecognizeTime = new Date(this.video.lastRecognizeTime).getTime();
                return (Date.now() - lastRecognizeTime) / 60000;
            }
        },
        methods: {
            handleUploadChange(event){
                let videoFile = event.target.files[0];
                console.log(videoFile);
                // 重命名文件
                videoFile = new File([videoFile], videoFile.name, {type: videoFile.type});
                // 使用父组件提供的上传方法
                this.$parent.uploadVideo(videoFile, "-1", video => {
                    console.log(video);
                    this.video = video;
                });
            },
            recognize(){
                this.axios.get(this.api.onlineInvokeRecognizeUrl, {
                    params: {
                        fileId: this.video.id
                    }
                }).then(res => {
                    console.log(res);
                    this.refreshCurrentVideo();
                })
            },
            refreshCurrentVideo(){
                this.axios.get(this.api.getFileByIdUrl, {
                    params: {
                        id: this.video.id
                    }
                }).then(res => {
                    this.video = res.data.file;
                })
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
</style>
