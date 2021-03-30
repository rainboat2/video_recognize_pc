<template>
    <div class="VideoManagement">
        <p class="title">视频管理</p>
        <el-row>
            <el-col :span="2">
                <el-button type="primary" size="small" @click="clickUploadButton">
                    上传<i class="el-icon-upload el-icon--right"></i>
                </el-button>
                <input id="upload-button" type="file" style="display: none" @change="handleUploadChange" accept=".mp4"/>
            </el-col>
            <el-col :span="2">
                <el-button size="small" @click="showDirectoryNameDialog = true;newDirectory.name=''" plain>
                    新建文件夹
                </el-button>
                <el-dialog
                        center
                        title="新建文件夹"
                        :visible.sync="showDirectoryNameDialog"
                        :append-to-body="true"
                        width="350px">
                    <el-form :rules="rules" ref="directory-name-form" label-position="left" :model="newDirectory" label-width="70px">
                        <el-form-item label="名称" :inline="true" prop="name">
                            <el-input v-model="newDirectory.name" placeholder="请输入文件夹名"></el-input>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="showDirectoryNameDialog = false;">取 消</el-button>
                        <el-button type="primary" @click="addDirectory">确 定</el-button>
                    </span>
                </el-dialog>
            </el-col>
            <el-col :span="6" :offset="13">
                <div class="progress-area">
                    <span>存储空间使用量：10.5G/21G</span>
                    <el-progress :percentage="Number.parseFloat(((user.ownFileSize / user.fileCapacity) * 100).toFixed(2))">
                    </el-progress>
                </div>
            </el-col>
        </el-row>
        <div class="path-bar">
            <template v-if="currentPath.length > 1">
                <el-button type="text" @click="jumpBack">返回上一级</el-button>
                <el-divider direction="vertical"></el-divider>
            </template>
            <span v-for="(directory, index) in currentPath" :key="directory.id">
                <el-button type="text" @click="open(directory)">{{directory.name}}</el-button>
                <span v-if="index < currentPath.length-1"> > </span>
            </span>
        </div>
        <div class="horizon-divider"></div>
        <file-card class="file-card"
                   v-for="file in files"
                   :file="file"
                   @refreshFile="refreshFiles"
                   :key="'f' + file.id"
                   :is-directory="false">
        </file-card>
        <file-card class="file-card"
                   v-for="directory in directories"
                   :file="directory"
                   :key="directory.id"
                   @click.native="open(directory)"
                   :is-directory="true">
        </file-card>

        <el-card class="upload-window" :body-style="{padding: 0}" v-if="videoInUploading.length > 0">
            <el-table :data="videoInUploading">
                <el-table-column
                        prop="name"
                        width="100px"
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
    </div>
</template>

<script>
    import FileCard from "@/components/FileCard";
    export default {
        name: "VideoManagement",
        components: {FileCard},
        data(){
            return{
                currentPath: [{id: -1, name: '全部文件', depth: -1}],
                files:[{id: 1, name: '测试文件', coverImagePath: 'default.png'}],
                directories: [{id: 1, name: '测试文件'}],
                cnt: 1,
                percentages: {},
                videoInUploading: [],
                user: {fileCapacity: 21474836480, ownFileSize: 0},
                newDirectory: {name: ''},
                showDirectoryNameDialog: false,
                rules:{
                    name: [
                        {required: true, message: '文件夹名不能为空', trigger: 'blur'},
                        {min: 2, max: 16, message: '昵称长度应在2～16个字符之间', trigger: 'blur'}
                    ],
                }
            }
        },
        computed:{
          currentDirectory: function () {
              const len = this.currentPath.length;
              return this.currentPath[len - 1];
          }
        },
        created() {
            this.refreshFiles();
        },
        methods:{
            refreshFiles(){
                this.getCurrentFilesAndDirectories();
                this.getCurrentUser();
            },
            getCurrentUser(){
                this.axios.get(this.api.currentUserUrl).then(r => {
                    if (r.data.status === 1){
                        this.user = r.data.user;
                    }else{
                        this.$message.error(r.data.msg);
                    }
                })
            },
            clickUploadButton(){
                document.getElementById('upload-button').click();
            },
            getCurrentFilesAndDirectories(){
                this.axios.get(this.api.getFilesAndDirectoriesUrl, {
                    params: {parentId: this.currentDirectory.id}
                }).then(r => {
                    if (r.data.status === 1){
                        this.files = r.data.files;
                        this.directories = r.data.directories;
                    }else{
                        this.$message.warning(r.data.msg);
                    }
                })
            },
            handleUploadChange(event){
                const video = event.target.files[0];
                // 检查上传的视频是否小于100MB
                console.log(video);
                console.log(video.name);
                if ((video.size / 1048576) < 100){
                    this.uploadVideo(video);
                }else{
                    this.$message.info("上传的文件必须要小于100MB");
                }
            },
            uploadVideo(video) {
                const videoInfo = {id : ++this.cnt, video: video, name: video.name};
                // 将上传文件的信息添加到上传队列
                this.videoInUploading.push(videoInfo);
                // 为了方便进度条实时更新，使用percentages对象来记录上传的进度
                this.$set(this.percentages, videoInfo.id, 0);

                let formData = new FormData();
                formData.append("parentId", this.currentDirectory.id);
                formData.append("video", videoInfo.video);

                const config = {
                    onUploadProgress: progressEvent => {
                        const progress = (progressEvent.loaded / progressEvent.total * 100 | 0)
                        this.$set(this.percentages, videoInfo.id, progress);
                    }
                };
                // 上传视频
                this.axios.post(this.api.uploadVideoUrl, formData, config).then(r =>{
                    if (r.data.status === 0)
                        this.$message.warning(r.data.msg);

                    // 延迟一秒钟执行，给用户和前端动画一点反应时间
                    setTimeout(() => {
                        // 上传结束，将视频从队列中删除
                        this.$delete(this.percentages, videoInfo.id);
                        this.videoInUploading = this.videoInUploading.filter(v =>{
                            return v.id !== videoInfo.id;
                        });
                        this.$message.info(videoInfo.name + "上传成功");
                        this.refreshFiles();
                    }, 1000)
                    console.log(this.percentages);
                }).catch(err => {
                    this.$message.error(err.message);
                })
            },
            addDirectory(){
                this.$refs['directory-name-form'].validate(valid => {
                    if (!valid){
                        this.$message.info("请输入符合要求的文件名");
                        return;
                    }
                    this.showDirectoryNameDialog = false;
                    this.axios.post(this.api.addDirectoryUrl, {
                        name: this.newDirectory.name,
                        parentId: this.currentDirectory.id
                    }).then(r => {
                        if (r.data.status === 1){
                            this.refreshFiles();
                        }else{
                            this.$message.warning(r.data.msg);
                        }
                    })
                })
            },
            open(directory){
                // 如果要跳转的目录就是当前目录，不做操作直接返回
                if (directory === this.currentDirectory)
                    return;
                // 找到跳转目录在路径中的位置
                let pos = -1;
                for (let i = 0; i < this.currentPath.length; i++){
                    if (this.currentPath[i] === directory){
                        pos = i;
                        break;
                    }
                }
                if (pos === -1){
                    // 若跳转目录不在路径里面
                    this.currentPath.push(directory);
                }else{
                    // 跳转路径在目录里面
                    this.currentPath = this.currentPath.slice(0, pos + 1);
                }
                this.getCurrentFilesAndDirectories();
            },
            jumpBack(){
                this.currentPath = this.currentPath.slice(0, this.currentPath.length - 1);
                this.getCurrentFilesAndDirectories();
            },
            renameIfSame(name, ObjList){
                //ObjList: 文件或文件夹的数组
                let cnt = 1, newName = name;
                // eslint-disable-next-line no-constant-condition
                while (true){
                    let isSame = false;
                    for (let i = 0; i < ObjList; i++){
                        if (newName === ObjList[i].name){
                            isSame = true;
                            break;
                        }
                    }
                    if (!isSame) break;
                    newName = name + "(" + cnt + ")";
                    cnt++;
                }
                return newName;
            }
        }
    }
</script>

<style scoped>
    .VideoManagement{
        text-align: left;
    }

    .path-bar{
        margin-top: 5px;
        height: 40px;
    }

    .progress-area{
        font-size: 14px;
        color: rgb(80, 80, 80);
    }

    .file-card{
        float: left;
    }

    .upload-window{
        width: 400px;
        height: 150px;
        overflow: scroll;
        position: fixed;
        right: 20px;
        bottom: 10px;
    }
</style>
