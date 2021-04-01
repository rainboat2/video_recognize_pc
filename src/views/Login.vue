<template>
    <div class="Login">
        <el-row class="head">
            <el-col :span="6">
                <span class="logo">行为识别系统</span>
            </el-col>
            <el-col :span="4" :offset="14" class="hello">你好，游客！</el-col>
        </el-row>

        <el-card id="login-card"
                 v-show="showLoginOrRegisterCard"
                 :body-style="{ padding: '15px'}"
                 shadow="always">
            <h1>登陆</h1>
            <el-form label-width="60px" label-position="left" :rules="rules" ref="loginForm" :model="user">
                <el-form-item label="邮箱" :inline="true" prop="email">
                    <el-input v-model="user.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="user.password" placeholder="请输入密码" show-password></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button style="width: 100%" type="primary" @click="login" >登录</el-button>
                </el-form-item>

                <el-form-item label-width="0">
                    <el-link type="primary" style="float:left;" @click="switchCard">还没有账号？点击这里注册吧!</el-link>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card id="register-card"
                 :body-style="{ padding: '15px'}"
                 v-show="!showLoginOrRegisterCard"
                 shadow="always">
            <h1>注册</h1>
            <el-form label-width="60px" label-position="left" :rules="rules" ref="registerForm" :model="registerData">
                <el-form-item label="邮箱" :inline="true" prop="email">
                    <el-input v-model="registerData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>

                <el-form-item label="密码" :inline="true" prop="password">
                    <el-input v-model="registerData.password" placeholder="请输入密码" show-password></el-input>
                </el-form-item>

                <el-form-item label="电话" :inline="true" prop="phone">
                    <el-input v-model="registerData.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>

                <el-form-item label="昵称" :inline="true" prop="name">
                    <el-input v-model="registerData.name" placeholder="请输入昵称"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button style="width: 100%" type="primary" @click="register" >注册</el-button>
                </el-form-item>

                <el-form-item label-width="0">
                    <el-link type="primary" style="float:left;" @click="switchCard">已经注册？点击前往登陆！</el-link>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data(){
            const email = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
            const phone = /^1[3|4|5|7|8][0-9]{9}$/;
            const password =  /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{5,16}$/;
            const checkEmail = (rule, value, callback)=>{
                if (email.test(value) === true){
                    callback();
                }else {
                    callback(new Error("邮箱格式错误！"));
                }
            };
            const checkPhone = (rule, value, callback)=>{
                if (phone.test(value) === true){
                    callback();
                }else {
                    callback(new Error("手机号格式错误"));
                }
            };
            const checkPassword = (rule, value, callback) => {
                if (password.test(value) === true){
                    callback();
                }else{
                    callback("密码长度应为5-16个字符，且由数字和字母组成！");
                }
            };
            return{
                user: {email: '', password: ''},
                registerData: {email: '', password: '', phone: '', name: ''},
                showLoginOrRegisterCard: false,
                rules:{
                    email:[
                        {required: true, message: '邮箱不能为空', trigger: 'blur'},
                        {validator: checkEmail, trigger: 'blur'}
                    ],
                    password:[
                        {required: true, message: '密码不能为空', trigger: 'blur'},
                        {validator: checkPassword, trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message: '昵称不能为空', trigger: 'blur'},
                        {min: 2, max: 16, message: '昵称长度应在2～16个字符之间', trigger: 'blur'}
                    ],
                    phone: [
                        {required: true, message: '电话不能为空', trigger: 'blur'},
                        {validator: checkPhone, trigger: 'blur'}
                    ],
                }
            }
        },
        methods:{
            switchCard(){
              this.showLoginOrRegisterCard = ! this.showLoginOrRegisterCard;
            },
            login(){
                console.log(this.user);
                this.$refs['loginForm'].validate((valid) => {
                    if (!valid){
                        this.$message.warning("请正确填写信息");
                        return;
                    }
                    this.axios.get(this.api.loginUrl, {"params": this.user}).then(r => {
                        console.log(r);
                        const state = r.data.status;
                        if (state === 1){
                            // 存储登陆状态
                            localStorage.setItem("isLogin", "true");
                            this.$router.push("/homepage");
                        }else if (state === 0){
                            this.$message.warning(r.data.msg);
                        }else{
                            this.$message.warning("未知的状态码");
                        }
                    }).catch(error => {
                        console.log(error);
                        this.$message.error(error.message);
                    })
                });
            },
            register(){
                this.$refs['registerForm'].validate(valid => {
                    if (!valid){
                        this.$message.warning("请正确填写信息");
                        return;
                    }
                    this.axios.post(this.api.registerUrl, this.registerData).then(r => {
                        const status = r.data.status;
                        if (status === 1){
                            this.$message.info("注册成功，前往登陆页面");
                            this.user.email = this.registerData.email;
                            this.user.password = this.registerData.password;
                            this.switchCard();
                        }else{
                            this.$message.error(r.data.msg);
                        }
                    }).catch(error => {
                        this.$message.error(error.message);
                    });
                })
            }
        }
    }
</script>

<style scoped>

    .Login{
        position: fixed;
        width: 100%;
        height: calc(100vh);
        background-image: url("../assets/LoginBackgroundImage.jpg");
        overflow: auto;
        background-size: 100% 100%;
    }

    .head{
        width: 100%;
        height: 56px;
        background-color: rgb(39, 46, 52);
    }

    .logo{
        color: white;
        float: left;
        font-size: 22px;
        margin-top: 12px;
        margin-left: 15px;
    }

    .hello{
        color: white;
        margin-top: 15px;
    }

    #login-card{
        float: left;
        margin-top: 10%;
        margin-left: 35%;
        margin-bottom: 5%;
        height: 380px;
        width: 30%;
        min-width: 350px;
    }

    #register-card{
        float: left;
        margin-top: 7%;
        margin-left: 33%;
        height: 500px;
        width: 34%;
        min-width: 400px;
    }

</style>
