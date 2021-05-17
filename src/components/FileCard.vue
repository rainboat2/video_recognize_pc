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
        <el-checkbox style="float: left" @change="handleCheckboxChange" v-model="checked"></el-checkbox>
        <el-image
                style="width: 100px;height: 100px"
                fit="contain"
                @dblclick="previewVideo"
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

        <el-dialog title="选择要移动到的文件夹"
                   :append-to-body="true"
                   width="30%"
                   :visible.sync="selectDirectoryDialogVisible">
            <el-tree
                    lazy
                    highlight-current
                    @node-click="selectNode"
                    :load="loadDirectory"
                    :props="treeDirectoryProps">
            </el-tree>
             <span slot="footer" class="dialog-footer">
                <el-button @click="selectDirectoryDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="selectDirectoryDialogVisible = false;moveFileToSelectedDirectory()">
                    确 定
                </el-button>
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
                rules:{
                    name: [
                        {required: true, message: '文件夹名不能为空', trigger: 'blur'},
                        {min: 2, max: 16, message: '昵称长度应在2～16个字符之间', trigger: 'blur'}
                    ],
                },
                treeDirectoryProps: {
                    label: 'name',
                    children: 'childrenDirectories',
                    isLeaf: 'leaf'
                },
                selectedDirectoryId: '',
                checked: false
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
                        console.log(rs);
                        console.log(this.isDirectory);
                        console.log(this.file.name)
                        this.newFile.name = rs[1];
                        this.newFile.suffix = rs[2];
                        this.showRenameDialog = true;
                        break;
                    case "delete":
                        this.deleteDialogVisible = true;
                        break;
                    case "move":
                        this.selectedDirectoryId = '';
                        this.selectDirectoryDialogVisible = true;
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
                        videoList: JSON.stringify([this.file])
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
            loadDirectory(node, resolve){
                if (node.level === 0){
                    return resolve([{name: '全部文件', id: -1}]);
                }
                this.axios.get(this.api.getDirectoriesUrl, {
                    params:{
                        parentId : node.data.id
                    }
                }).then(res => {
                    const directories = res.data.directories;
                    resolve(directories);
                })
            },
            selectNode(data, node){
                this.selectedDirectoryId = node.data.id;
            },
            moveFileToSelectedDirectory(){
                if (this.selectedDirectoryId === undefined || this.selectedDirectoryId === ''){
                    this.$message.warning("未选中文件夹");
                    return;
                }
                // 无需进行移动
                if (this.file.parentId === this.selectedDirectoryId) {
                    this.$message.info("移动成功");
                    return;
                }

                this.axios.get(this.api.moveFileUrl, {
                    params:{
                        fileId: this.file.id,
                        isDirectory: this.isDirectory,
                        newParentId: this.selectedDirectoryId,
                    }
                }).then(res => {
                    if (res.data.status === 1){
                        this.refreshFiles();
                        this.$message.info("移动成功!");
                    }else{
                        this.$message.error(res.data.msg);
                    }
                })
            },
            handleCheckboxChange(isSelected){
                if (isSelected){
                    this.$parent.select(this.file, this.isDirectory);
                }else{
                    this.$parent.cancelSelect(this.file, this.isDirectory);
                }
            },
            setChecked(isChecked){
                // 直接设定绑定的指貌似不会触发onchange回调函数，所以需要手动调用handleCheckboxChange方法
                this.checked = isChecked;
                this.handleCheckboxChange(isChecked);
            }
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
