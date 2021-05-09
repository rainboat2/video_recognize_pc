<template>
    <div class="Frame">
        <div class="head">
            <span class="logo" @click="goToHomePage">行为分类系统</span>
            <span class="collapse-button">
                <i :class="collapseButtonClass" @click="handleCollapse"></i>
            </span>
            <span class="photo">
                <el-dropdown @command="handleCommand">
                <template v-if="isLogin()">
                    <el-avatar :src="avatarPath" :size="40"></el-avatar>
                    <el-dropdown-menu>
                        <el-dropdown-item command="login">登陆（测试用）</el-dropdown-item>
                        <el-dropdown-item command="personalInfo">个人信息</el-dropdown-item>
                        <el-dropdown-item command="logout">注销</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
                <template v-else>
                    <el-avatar :src="avatarPath" :size="40"></el-avatar>
                    <el-dropdown-menu>
                        <el-dropdown-item command="to-login">前往登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            </span>
            <span class="user-name">
                您好，{{user.name}}！
            </span>
        </div>
        <el-menu
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                :router="true"
                :default-active="this.$route.path"
                :collapse-transition="true"
                :collapse="isCollapse"
                class="el-menu-vertical-demo">
            <el-menu-item
                    v-for="item in navItem"
                    :index="item.index"
                    :key="item.id">
                <i :class="item.icon"></i>
                <span slot="title">{{item.name}}</span>
            </el-menu-item>
        </el-menu>
        <div :class="containerClass">
            <router-view/>
        </div>
        <upload-card ref="upload-card"></upload-card>
    </div>
</template>

<script>
    import UploadCard from "@/components/UploadCard";
    export default {
        name: "Frame",
        components: {UploadCard},
        data(){
            return {
                navItem:[
                    {id: 1, index: '/homepage', icon: 'el-icon-s-home', name: '首页'},
                    {id: 2, index: '/video/management', icon: 'el-icon-video-play', name: '视频管理'},
                    {id: 3, index: '/online/recognize', icon: 'el-icon-view', name: '在线识别'},
                    {id: 4, index: '/development', icon: 'el-icon-monitor', name: '开发接口'},
                    {id: 5, index: '/personal/information', icon: 'el-icon-user', name: '个人信息'}
                ],
                isCollapse: false,
                collapseButtonClass: 'el-icon-s-fold',
                containerClass: 'main-container-unfold',
                user: {name: '游客', imagePath: 'default.png'},
                userPhoto: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
            }
        },
        created() {
            this.axios.get(this.api.currentUserUrl).then(r => {
                if (r.data.status === 1){
                    this.user = r.data.user;
                }else{
                    this.$message.error(r.data.msg);
                }
            })
        },
        computed:{
            avatarPath: function(){
                return this.api.resPath + '/' + this.user.imagePath;
            }
        },
        methods: {
            handleCollapse(){
                this.isCollapse = ! this.isCollapse;
                this.collapseButtonClass = (this.isCollapse)? 'el-icon-s-unfold' : 'el-icon-s-fold';
                this.containerClass = (this.isCollapse)? 'main-container-fold' : 'main-container-unfold';
            },
            handleCommand(command){
                switch (command) {
                    case 'logout':
                        this.axios.get(this.api.logoutUrl).then(r => {
                            if (r.data.status === 1){
                                localStorage.setItem("isLogin", "false");
                                this.$router.push("/login");
                            } else
                                this.$message.error("退出登陆失败");
                        }).catch(error =>{
                            this.$message.error(error.message);
                        });
                        break;
                    case 'personalInfo':
                        this.$router.push("/personal/information");
                        break;
                    case 'login':
                        this.axios.get(this.api.loginUrl, {
                            "params": {email: '1049696130@qq.com', password: '123456asd'}
                        }).then(r => {
                            const state = r.data.status;
                            if (state === 1){
                                // 存储登陆状态
                                localStorage.setItem("isLogin", "true");
                                this.$message.info("成功登陆");
                            }else if (state === 0){
                                this.$message.warning(r.data.msg);
                            }else{
                                this.$message.warning("未知的状态码");
                            }
                        }).catch(error => {
                            this.$message.error(error.message);
                        })
                        break;
                    case 'to-login':
                        this.$router.push("/login");
                        break;
                    default:
                        this.$message.error("unreachable command");
                }
            },
            isLogin:function(){
                let isLogin = localStorage.getItem("isLogin");
                if (isLogin === undefined)
                    isLogin = false
                return isLogin === "true";
            },
            uploadVideo(videoFile, parentDirectoryId, callback){
                // 调用upload-card子组件，完成对视频文件的上传
                this.$refs['upload-card'].uploadVideo(videoFile, parentDirectoryId, callback);
            },
            goToHomePage(){
                this.$router.push("/homepage");
            }
        }
    }
</script>

<style scoped>

    .head{
        width: 100%;
        height: 56px;
        background-color: rgb(39, 46, 52);
    }

    .main-container-fold, .main-container-unfold{
        position: fixed;
        top: 56px;
        height: calc(100vh - 56px);
        overflow: auto;
        transition: 0.4s;
        padding: 20px;
    }

    .main-container-unfold{
        left: 250px;
        width: calc(100% - 250px);
    }

    .main-container-fold{
        left: 64px;
        width: calc(100% - 64px);
    }

    .el-menu-vertical-demo:not(.el-menu--collapse) {
        width: 250px;
        height: calc(100vh - 56px);
        top: 56px;
        position: fixed;
    }

    .el-menu--collapse{
        height: calc(100vh - 56px);
    }

    .logo{
        color: white;
        float: left;
        font-size: 22px;
        width: 250px;
        height: 45px;
        padding-top: 11px;
        border: rgb(100, 100, 100) solid;
        border-width: 0 1px 0 0;
        cursor: pointer;
    }

    .collapse-button{
        color: white;
        float: left;
        font-size: 26px;
        width: 56px;
        height: 48px;
        padding-top:8px;
        border: rgb(100, 100, 100) solid;
        border-width: 0 1px 0 0;
        cursor: pointer;
    }

    .photo{
        float: right;
        margin-top: 8px;
        margin-right: 20px;
        cursor: pointer;
    }

    .user-name{
        float: right;
        color: white;
        margin-right: 10px;
        margin-top: 15px;
    }
</style>
