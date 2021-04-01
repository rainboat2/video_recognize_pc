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
        <video id="video" :src="videoUrl" type="video/mp4"  class="video-area" preload controls>
        </video>
        <br>
        <p class="title">识别结果</p>
        <p>{{recognizeResult}}</p>
        <br>
        <br>
        <br>
    </div>
</template>

<script>
    export default {
        name: "OnlineRecognize",
        data(){
            return{
                recognizeResult: "此处显示识别结果",
                imageUrl: '',
                video: ''
            }
        },
        created(){
            this.video = this.$route.params.video;
        },
        computed:{
          videoUrl(){
              if (this.video === '' || this.video === undefined)
                  return '';
              else
                  return this.api.resPath + "/" + this.video.filePath;
          }
        },
        methods: {
            handleUploadChange(event){
                const videoFile = event.target.files[0];
                this.videoUrl = window.URL.createObjectURL(videoFile);
                this.$parent.uploadVideo(videoFile, "-1");
            }
        }
    }
</script>

<style scoped>

    .OnlineRecognize{
        text-align: left;
    }

    .video-area{
        width: 90%;
    }
</style>
