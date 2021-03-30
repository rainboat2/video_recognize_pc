<template>
    <div class="PersonalInformation">
        <p class="title">个人信息</p>
        <br>

        <el-row class="information-form">
            <el-col :span="3"><span class="label">头像:</span></el-col>
            <el-col :span="4">
                <el-image :src="avatarPath" style="width: 120px; height: 120px"></el-image>
            </el-col>
            <el-col :span="8">
                <span class="text-button" @click="showAvatarDialog = true">更换头像</span>
            </el-col>
        </el-row>
        <el-row class="information-form">
            <el-col :span="3"><span class="label">昵称:</span></el-col>
            <el-col :span="3"><span>{{user.name}}</span></el-col>
            <el-col :span="3">
                <span class="text-button" @click="showNameDialog = true">修改</span>
            </el-col>
        </el-row>
        <el-row class="information-form">
            <el-col :span="3"><span class="label">密码:</span></el-col>
            <el-col :span="3">
                <span class="text-button" @click="showPasswordDialog = true">修改</span>
            </el-col>
        </el-row>
        <el-row class="information-form">
            <el-col :span="3"><span class="label">邮箱:</span></el-col>
            <el-col :span="6"><span>{{user.email}}</span></el-col>
        </el-row>

        <el-row class="information-form">
            <el-col :span="3"><span class="label">手机号：</span></el-col>
            <el-col :span="6"><span>{{user.phone}}</span></el-col>
        </el-row>

        <el-dialog
                center
                title="修改头像"
                :visible.sync="showAvatarDialog"
                :append-to-body="true"
                width="350px">
            <input type="file" class="select-button" @change="handleChange" accept=".png,.jpg,jpeg"/>
            <br>
            <el-image style="width: 150px; height: 150px;margin-left: 30%" :src="avatar.url" />
            <span slot="footer" class="dialog-footer">
                <el-button @click="showAvatarDialog = false;">取 消</el-button>
                <el-button type="primary" @click="showAvatarDialog = false;changeUserAvatar()">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                center
                title="修改昵称"
                :visible.sync="showNameDialog"
                :append-to-body="true"
                width="350px">
            <el-form :rules="rules" ref="nameForm" :model="userForUpdate">
                <el-form-item label="名称" :inline="true" prop="name">
                    <el-input v-model="userForUpdate.name" placeholder="请输入新的昵称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showNameDialog = false;">取 消</el-button>
                <el-button type="primary" @click="updateUserName">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                center
                title="修改密码"
                :visible.sync="showPasswordDialog"
                :append-to-body="true"
                width="350px">
            <el-form :rules="rules" ref="passwordForm" :model="userForUpdate">
                <el-form-item label="名称" :inline="true" prop="password">
                    <el-input v-model="userForUpdate.password" placeholder="请输入新的密码"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showPasswordDialog = false;">取 消</el-button>
                <el-button type="primary" @click="updateUserPassword">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "PersonalInformation",
        data(){
            const password =  /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{5,16}$/;
            const checkPassword = (rule, value, callback) => {
                if (password.test(value) === true){
                    callback();
                }else{
                    callback("密码长度应为5-16个字符，且由数字和字母组成！");
                }
            };
            return {
                user: {email: '', password: '', phone: '', name: '', imagePath: ''},
                avatar: {file: '', url: ''},
                showAvatarDialog: false,
                showNameDialog: false,
                showPasswordDialog: false,
                userForUpdate: {name: undefined, password: undefined},
                rules:{
                    password:[
                        {required: true, message: '密码不能为空', trigger: 'blur'},
                        {validator: checkPassword, trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message: '昵称不能为空', trigger: 'blur'},
                        {min: 2, max: 16, message: '昵称长度应在2～16个字符之间', trigger: 'blur'}
                    ],
                }
            }
        },
        computed:{
          avatarPath: function(){
              return this.api.resPath + '/' + this.user.imagePath;
          }
        },
        created(){
            this.axios.get(this.api.currentUserUrl).then(r => {
                console.log(r);
                if (r.data.status === 1){
                    this.user = r.data.user;
                }else{
                    this.$message.error(r.data.msg);
                }
            })
        },
        methods: {
            handleChange(event){
                const file = event.target.files[0];
                this.avatar.file = file;
                let reader = new FileReader();
                reader.onload = ()=> {
                    this.avatar.url = reader.result;
                    reader.abort();
                    reader = null;
                };
                reader.readAsDataURL(file);
            },
            changeUserAvatar(){
                console.log(this.avatar);
                if (this.avatar.file === '' || this.avatar.file === undefined)
                    return;
                let formData = new FormData();
                formData.append("avatar", this.avatar.file);
                this.axios.post(this.api.changeAvatar, formData).then(r =>{
                    console.log(r);
                    this.user = r.data.user;
                }).catch(err => {
                    this.$message.error(err.message);
                })
            },
            updateUserName(){
                this.$refs["nameForm"].validate(valid => {
                    if (!valid) return;
                    this.showNameDialog = false;
                    this.updateUser(() => {
                        this.userForUpdate.name = undefined;
                    });
                })
            },
            updateUserPassword(){
                this.$refs["passwordForm"].validate(valid => {
                    if (!valid) return;
                    this.showPasswordDialog = false;
                    this.updateUser(() => {
                        this.userForUpdate.password = undefined;
                    });
                })
            },
            updateUser(callback){
                this.axios.post(this.api.updateUserInfoUrl, this.userForUpdate).then(r => {
                    if (r.data.status === 1){
                        this.user = r.data.user;
                        console.log(this.user);
                        this.$message.info(r.data.msg);
                    }else{
                        this.$message.warning(r.data.msg);
                    }
                    callback();
                }).catch(err => {
                    this.$message.error(err.message);
                })
            }
        },
    }
</script>

<style scoped>

    .information-form{
        text-align: left;
        margin: 0 0 30px 0;
    }

    .label{
        font-weight: bold;
    }

    .select-button{
        border-width: 0;
        margin-left: 40%;
        color: white;
        width: 70px;
        margin-bottom: 20px;
    }

</style>
