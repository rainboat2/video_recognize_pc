<template>
    <div class="OnlineRecognize">
        <p class="title">在线识别</p>
        <p>上传视频，对视频的内容进行识别，并显示识别的结果</p>
        <el-button type="primary" size="small" @click="upload()">上传<i class="el-icon-upload el-icon--right"></i></el-button>
        <input id="upload-button" type="file" style="visibility: hidden" accept=".mp4"/>
        <br>
        <br>
        <video-player class="video-player vjs-custom-skin video-area"
                      ref="videoPlayer"
                      :playsinline="true"
                      :options="playerOptions">
        </video-player>
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
                playerOptions: {
                    playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
                    autoplay: false, // 如果为true,浏览器准备好时开始回放。
                    muted: false, // 默认情况下将会消除任何音频。
                    loop: false, // 是否视频一结束就重新开始。
                    preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                    language: 'zh-CN',
                    aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                    fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                    sources: [{
                        type: "video/mp4", // 类型
                        src: this.api.resPath + "/Aegean_Sea.mp4" // url地址
                    }],
                    poster: '', // 封面地址
                    notSupportedMessage: '点击上传按钮，上传用于分析的视频', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
                    controlBar: {
                        timeDivider: true, // 当前时间和持续时间的分隔符
                        durationDisplay: true, // 显示持续时间
                        remainingTimeDisplay: false, // 是否显示剩余时间功能
                        fullscreenToggle: true // 是否显示全屏按钮
                    }
                },
                recognizeResult: "此处显示识别结果",
            }
        },
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
