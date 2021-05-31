<template>
    <div class="UploadCard">
        <el-card class="upload-window" :body-style="{padding: 0}" v-if="videoInUploading.length > 0">
            <el-table :data="videoInUploading">
                <el-table-column
                        prop="name"
                        width="100px"
                        :show-overflow-tooltip="true"
                        label="文件名">
                </el-table-column>
                <el-table-column
                        label="上传进度">
                    <template slot-scope="scope">
                        <el-progress :percentage="percentages[scope.row.id]"></el-progress>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <video style="position: fixed;visibility: hidden" id="video" src="" width="320px" height="180px" preload controls>
        </video>
    </div>
</template>

<script>
    export default {
        name: "UploadCard",
        data(){
            return{
                cnt: 1,
                percentages: {},
                videoInUploading: [],
            }
        },
        methods:{
            async uploadVideo(videoFileList, parentDirectoryId, callback) {
                // 检查上传的视频是否小于500MB
                for (let videoFile of videoFileList){
                    if ((videoFile.size / 1048576) > 500){
                        this.$message.info("上传的文件必须要小于500MB");
                        return;
                    }
                }
                const video = document.getElementById('video');
                const canvas = document.createElement("canvas");
                canvas.width = video.clientWidth;
                canvas.height = video.clientHeight;
                // 上传视频之前，要先从视频中提取封面
                for (let videoFile of videoFileList){
                    let imageUrl;
                    video.src = window.URL.createObjectURL(videoFile);
                    await new Promise(resolve => {
                        video.onloadeddata = () => {
                            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                            imageUrl = canvas.toDataURL("image/png");
                            resolve()
                        }
                    })
                    this.upload(videoFile, parentDirectoryId, imageUrl, callback);
                }
            },
            upload(videoFile, parentDirectoryId, imageUrl, callback){
                const videoUploadInfo = {id: ++this.cnt, video: videoFile, name: videoFile.name};
                // 将上传文件的信息添加到上传队列
                this.videoInUploading.push(videoUploadInfo);
                // 为了方便进度条实时更新，使用percentages对象来记录上传的进度
                this.$set(this.percentages, videoUploadInfo.id, 0);

                let formData = new FormData();
                formData.append("parentId", parentDirectoryId);
                formData.append("video", videoUploadInfo.video);
                formData.append("poster", this.tools.dataURLtoFile(imageUrl, "poster.png"));

                const config = {
                    onUploadProgress: progressEvent => {
                        const progress = (progressEvent.loaded / progressEvent.total * 100 | 0)
                        this.$set(this.percentages, videoUploadInfo.id, progress);
                    }
                };
                // 上传视频
                this.axios.post(this.api.uploadVideoUrl, formData, config).then(r =>{
                    if (r.data.status === 0)
                        this.$message.warning(r.data.msg);

                    // 延迟一秒钟执行，给用户和前端动画一点反应时间
                    setTimeout(() => {
                        // 上传结束，将视频从队列中删除
                        this.$delete(this.percentages, videoUploadInfo.id);
                        this.videoInUploading = this.videoInUploading.filter(v =>{
                            return v.id !== videoUploadInfo.id;
                        });
                        this.$message.info(r.data.file.name + "上传成功");

                        // 调用回调函数
                        if (callback !== undefined)
                            callback(r.data.file);
                    }, 1000)
                }).catch(err => {
                    this.$message.error(err.message);
                })
            }
        }
    }
</script>

<style scoped>
    .upload-window{
        width: 400px;
        max-height: 350px;
        overflow: scroll;
        position: fixed;
        right: 20px;
        bottom: 10px;
    }
</style>
