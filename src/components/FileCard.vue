<template>
    <div class="FileCard"
         @mouseover="dropdownButtonClass='dropdown-button-show'"
         @mouseout="dropdownButtonClass='dropdown-button-hidden'">
        <el-dropdown @command="handleCommand"
                     :class="dropdownButtonClass">
            <span class="el-dropdown-link"><i class="el-icon-more"></i></span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="rename">重命名</el-dropdown-item>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
                <el-dropdown-item command="move">移动到</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <el-image
                style="width: 100px;height: 100px"
                fit="contain"
                @click="previewVideo"
                :src="cardImage">
        </el-image>
        <br>
        <p class="file-name auto-hide-text">{{file.name}}</p>

        <el-dialog
                center
                title="重命名"
                :visible.sync="showRenameDialog"
                :append-to-body="true"
                width="350px">
            <el-form :rules="rules" ref="rename-form" label-position="left" :model="newFile" label-width="70px">
                <el-form-item label="名称" :inline="true" prop="name">
                    <el-input v-model="newFile.name" placeholder="请输入新的文件名">
                        <template v-if="!isDirectory" slot="append">{{newFile.suffix}}</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                        <el-button @click="showRenameDialog = false;">取 消</el-button>
                        <el-button type="primary" @click="rename">确 定</el-button>
                    </span>
        </el-dialog>

        <el-dialog
                title="删除"
                :visible.sync="deleteDialogVisible"
                :append-to-body="true"
                width="30%">
            <span>确认删除{{file.name}}?</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteDialogVisible = false;deleteThisFile()">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="选择文件夹"
                   :append-to-body="true"
                   width="30%"
                   :visible.sync="selectDirectoryDialogVisible">
            <el-tree
                    lazy
                    show-checkbox
                    :props="directories">

            </el-tree>
             <span slot="footer" class="dialog-footer">
                <el-button @click="selectDirectoryDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="selectDirectoryDialogVisible = false;">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="视频预览"
                   center
                   :append-to-body="true"
                   width="50%"
                   :visible.sync="showPreviewVideoDialog">
            <video v-if="showPreviewVideoDialog" :src="previewVideoUrl"  width="100%" controls preload></video>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showPreviewVideoDialog = false;goToOnlineRecognizePage()">前往分析页面</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "FileCard",
        props: ['file', 'isDirectory'],
        data(){
            return{
                directoryImage: require("../assets/directoryImage.png"),
                dropdownButtonClass: 'dropdown-button-hidden',
                showRenameDialog: false,
                showPreviewVideoDialog: false,
                previewVideoUrl: '',
                deleteDialogVisible: false,
                selectDirectoryDialogVisible: false,
                newFile: {name: '', suffix: ''},
                directories: {label: '测试文件'},
                rules:{
                    name: [
                        {required: true, message: '文件夹名不能为空', trigger: 'blur'},
                        {min: 2, max: 16, message: '昵称长度应在2～16个字符之间', trigger: 'blur'}
                    ],
                }
            }
        },
        computed: {
            cardImage(){
                if (this.isDirectory)
                    return this.directoryImage;
                else
                    return this.api.resPath + '/' + this.file.coverImagePath;
            }
        },
        created(){
        },
        methods:{
            refreshFiles(){
                this.$parent.refreshFiles();
            },
            handleCommand(cmd) {
                let rs;
                switch (cmd) {
                    case "rename":
                        // 若为文件，则使用正则表达式分离文件名和后缀名
                        if (this.isDirectory)
                            rs = ['', this.file.name, ''];
                        else
                            rs = this.file.name.match(/(.*)(\.[a-zA-z1-9]+)$/);
                        this.newFile.name = rs[1];
                        this.newFile.suffix = rs[2];
                        this.showRenameDialog = true;
                        break;
                    case "delete":
                        this.deleteDialogVisible = true;
                        break;
                    case "move":
                        break;
                    default:
                        this.$message.error("未知的文件操作指令");
                        break;
                }
            },
            previewVideo(){
                if (this.isDirectory)
                    return ;
                this.showPreviewVideoDialog = true;
                this.previewVideoUrl = this.api.resPath + "/" + this.file.filePath;
            },
            goToOnlineRecognizePage(){
                this.$router.push({
                    name: 'OnlineRecognize',
                    params: {
                        video: this.file
                    }
                })
            },
            rename(){
                this.$refs['rename-form'].validate(valid => {
                    if (!valid){
                        this.$message.info("请输入正确的名称");
                    }else{
                        this.showRenameDialog = false;
                        const url = (this.isDirectory)? this.api.renameDirectoryUrl : this.api.renameFileUrl;
                        this.axios.get(url, {
                            params:{
                                name: this.newFile.name + this.newFile.suffix,
                                id: this.file.id
                            }
                        }).then(r =>{
                            if (r.data.status === 1){
                                this.file.name = this.newFile.name + this.newFile.suffix;
                                this.$message.info("重命名成功");
                            }else{
                                this.$message.warning(r.data.msg);
                            }
                        })
                    }

                })
            },
            deleteThisFile(){
                const url = (this.isDirectory)? this.api.deleteDirectoryUrl : this.api.deleteFileUrl;
                this.axios.get(url, {
                    params: {
                        id: this.file.id
                    }
                }).then(r => {
                    if (r.data.status === 1){
                        this.refreshFiles();
                    }else{
                        this.$message.warning(r.data.msg);
                    }
                }).catch(err => {
                    this.$message.error(err.message);
                })
            },
        }
    }
</script>

<style scoped>
    .FileCard{
        transition: 0.5s;
        width: 100px;
        height: 150px;
        padding: 5px 15px 0 15px;
    }

    .FileCard:hover{
        background-color: rgb(242, 245, 250);
        transition: 0.5s;
        cursor: pointer;
    }

    .file-name{
        font-size: 14px;
        width: 100px;
        margin: 0 0 0 0;
        text-align: center;
    }

    .dropdown-button-hidden{
        float: right;
        visibility: hidden;
    }

    .dropdown-button-show{
        float: right;
    }

</style>
