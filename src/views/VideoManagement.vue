<template>
    <div class="VideoManagement">
        <p class="title">视频管理</p>
        <el-row>
            <el-col :span="2">
                <el-button type="primary" size="small" onclick="document.getElementById('upload-button').click()">
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
                    <span>存储空间使用量：{{ownFileSize}}/{{fileCapacity}}</span>
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

        <p class="empty-info" v-if="files.length === 0 && directories.length === 0">当前文件夹为空</p>
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
                user: {fileCapacity: 21474836480, ownFileSize: 0},
                newDirectory: {name: ''},
                showDirectoryNameDialog: false,
                rules:{
                    name: [
                        {required: true, message: '文件夹名不能为空', trigger: 'blur'},
                        {min: 2, max: 16, message: '名称长度应在2～16个字符之间', trigger: 'blur'}
                    ],
                }
            }
        },
        computed:{
            currentDirectory: function () {
                // 依据路径，计算出当前文件夹
                const len = this.currentPath.length;
                return this.currentPath[len - 1];
            },
            ownFileSize: function () {
                // fileSize的单位为B
                let fileSize = this.user.ownFileSize;
                return this.tools.format(fileSize);
            },
            fileCapacity: function () {
                return this.tools.format(this.user.fileCapacity);
            }
        },
        created() {
            this.refreshFiles();
        },
        methods:{

            refreshFiles(){
                // 刷新当前文件夹下的所有文件和文件夹
                this.axios.get(this.api.getFilesAndDirectoriesUrl, {
                    params: {parentId: this.currentDirectory.id}
                }).then(r => {
                    if (r.data.status === 1){
                        this.files = r.data.files;
                        this.directories = r.data.directories;
                        this.user = r.data.user;
                    }else{
                        this.$message.warning(r.data.msg);
                    }
                })
            },
            handleUploadChange(event){
                let videoFile = event.target.files[0];
                // 如果名称已经存在，则重命名文件
                videoFile = new File([videoFile], this.renameIfSame(videoFile.name, this.files), {type: videoFile.type});
                this.$parent.uploadVideo(videoFile, this.currentDirectory.id, () => {this.refreshFiles()});
                document.getElementById('upload-button').value = '';
            },
            addDirectory(){
                this.$refs['directory-name-form'].validate(valid => {
                    if (!valid){
                        this.$message.info("请输入符合要求的文件名");
                        return;
                    }
                    const name = this.renameIfSame(this.newDirectory.name, this.directories);
                    this.showDirectoryNameDialog = false;
                    this.axios.post(this.api.addDirectoryUrl, {
                        name: name,
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
                    // 跳转目录在路径里面
                    this.currentPath = this.currentPath.slice(0, pos + 1);
                }
                this.refreshFiles();
            },
            jumpBack(){
                this.currentPath = this.currentPath.slice(0, this.currentPath.length - 1);
                this.refreshFiles();
            },
            renameIfSame(name, ObjList){
                //ObjList: 文件或文件夹的数组
                let cnt = 1, newName = name;
                // eslint-disable-next-line no-constant-condition
                while (true){
                    let isSame = false;
                    for (let i = 0; i < ObjList.length; i++){
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

    .empty-info{
        margin-left: calc(50% - 100px);
        margin-top: 15%;
        font-size: 30px;
        color: rgb(200, 200, 200);
    }
</style>
