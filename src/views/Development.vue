<template>
    <div class="Development">
        <p class="title">开发接口</p>
        <p>本系统提供基于HTTP协议的API，任何应用程序都可以接入本系统的API，使用本系统提供的行为识别服务。</p>
        <br>
        <p class="title">令牌管理</p>
        <el-row class="information-form">
            <el-col :span="2"><span class="label">密钥:</span></el-col>
            <el-col :span="4"><span>{{user.secretKey}}</span></el-col>
            <el-col :span="2">
                <span @click="showConfirmDialog = true" class="text-button">重置</span>
            </el-col>
            <el-col :span="6">
                <span style="font-size: 12px;color: coral">重置密钥可以清空所有令牌</span>
            </el-col>
        </el-row>
        <el-dialog
                title="警告"
                center
                :append-to-body="true"
                :visible.sync="showConfirmDialog"
                width="30%">
            <span>重置密钥将会清空令牌</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showConfirmDialog = false">取 消</el-button>
                <el-button type="primary" @click="resetSecretKey">确 定</el-button>
            </span>
        </el-dialog>
        <br>
        <el-button size="small" type="primary" @click="newToken={};showAddTokenDialog=true;">添加令牌</el-button>
        <el-dialog :visible.sync="showAddTokenDialog"
                   width="400px"
                   center
                   :append-to-body="true"
                   title="新增Token">
            <el-form ref="token-form" :rules="rules" :model="newToken" label-position="left" label-width="100px">
                <el-form-item label="过期时间：" prop="expireTime">
                    <el-date-picker
                            v-model="newToken.expireTime"
                            type="date"
                            placeholder="选择日期"
                            :picker-options="pickDateOptions"
                            format="yyyy 年 MM 月 dd 日">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注：" prop="note">
                    <el-input v-model="newToken.note" style="width: 88%">
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showAddTokenDialog = false">取 消</el-button>
                <el-button type="primary" @click="addToken">创 建</el-button>
            </span>
        </el-dialog>
        <br><br>
        <el-table
                :data="tokens"
                :default-sort = "{prop: 'createTime', order: 'descending'}"
                border style="width: 95%;" size="medium" max-height="400px">
            <el-table-column
                    label="令牌">
                <template slot-scope="scope">
                    <el-button type="text" @click="copyToken(scope.row)">拷贝此令牌</el-button>
                </template>
            </el-table-column>
            <el-table-column
                    prop="createTime"
                    sortable
                    label="创建时间">
            </el-table-column>
            <el-table-column
                    prop="expireTime"
                    sortable
                    label="过期时间">
            </el-table-column>
            <el-table-column
                    prop="validTime"
                    label="有效时长">
            </el-table-column>
            <el-table-column
                    prop="note"
                    label="备注">
            </el-table-column>
        </el-table>
        <br>
        <p class="title">说明</p>
        <br><br><br><br>
    </div>
</template>

<script>
    export default {
        name: "Development",
        data(){
            return{
                user: {secretKey: ''},
                tokens: [
                    {id: 1, content: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjEyMzQ1NiIsImV4cCI6MTYxMTQ3MTQ0NCwidXNlcm5hbWUiOiJyYWluIn0.yCziur8mvYUL8_59JLw2JMaMGFrCtH9OCrf-l6CWBIo',
                        createTime: '2021-1-1', expireTime: '2022-1-1', note: '注解'}
                    ],
                newToken: {id: 1, content: '', createTime: '2021-1-1', expireTime: '2022-1-1', note: '注解'},
                showAddTokenDialog: false,
                pickDateOptions:{
                    disabledDate(time) {
                        return time.getTime() < Date.now();
                    },
                },
                rules:{
                    expireTime:[
                        {required: true, message: '请选择一个有效的日期', trigger: 'blur'},
                    ],
                    note:[
                        {required: true, message: '备注不能为空', trigger: 'blur'}
                    ]
                },
                showConfirmDialog: false
            }
        },
        created(){
            this.axios.get(this.api.currentUserUrl).then(r => {
                if (r.data.status === 1){
                    this.user = r.data.user;
                }else{
                    this.$message.error(r.data.msg);
                }
            })
            this.getAllToken();
        },
        methods:{
            copyToken(row){
                const content = row.content;
                const input = document.createElement("input");
                input.setAttribute("value", content);
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                console.log(input.value);
                document.body.removeChild(input);
                this.$message.info("成功拷贝到剪切板");
            },
            formatDate(date){
                return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDay();
            },
            getAllToken(){
                this.axios.get(this.api.getAllTokensUrl).then(r => {
                    if (r.data.status === 1){
                        const tokens = r.data.tokens;
                        for (let i = 0; i < tokens.length; i++){
                            const expireTime = new Date(tokens[i].expireTime);
                            const createTime = new Date(tokens[i].createTime);
                            tokens[i].validTime = Math.round((expireTime - createTime) / 86400000) + "天";
                            tokens[i].expireTime = this.formatDate(expireTime);
                            tokens[i].createTime = this.formatDate(createTime);
                        }
                        this.tokens = tokens;
                    }else{
                        this.$message.error(r.data.msg);
                    }
                })
            },
            resetSecretKey(){
                this.axios.get(this.api.resetSecretKeyUrl).then(r => {
                    if (r.data.status === 1){
                        this.user.secretKey = r.data.secretKey;
                        this.$message.info("成功重置当前密钥");
                        this.getAllToken();
                    }else{
                        this.$message.error(r.data.msg);
                    }
                })
                this.showConfirmDialog = false;
            },
            addToken(){
                this.$refs["token-form"].validate((valid) => {
                    if (!valid)
                        this.$message.info("请完善表单信息");
                    this.showAddTokenDialog = false;
                    this.axios.post(this.api.addTokenUrl, this.newToken).then(r => {
                        console.log(r);
                        if (r.data.status === 1){
                            this.getAllToken();
                            this.$message.info("创建令牌成功");
                        }else{
                            this.$message.warning(r.data.msg);
                        }
                    })
                });
            }
        }
    }
</script>

<style scoped>

    .Development{
        text-align: left;
    }

</style>
