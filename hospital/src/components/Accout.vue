<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>账户信息</el-breadcrumb-item>
			<el-breadcrumb-item>后台账户</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getAccoutList">
						<el-button slot="append" icon="el-icon-search" @click="getAccoutList"></el-button>
					</el-input>	
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">增加账户</el-button>
				</el-col>
				
			</el-row>
			<!-- 账户列表 -->
			<el-table :data="accoutList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="用户名" prop="name"></el-table-column>
				<el-table-column label="操作">
					 <template slot-scope="scope">
						<el-button type="primary" @click="detail(scope.row)">查看</el-button>
						<el-button type="danger"  @click="deleteMessage(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			
			 <!-- 分页 -->
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pageNum"
				:page-sizes="[1, 2, 5, 100]"
				:page-size="queryInfo.pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total">
			</el-pagination>
		</el-card>
		<!-- 新增账户 -->
		<el-dialog :title="dialogTitle" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="用户名" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input type="password" v-model="addForm.password" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="确认密码" prop="checkPassword">
					<el-input type="password" v-model="addForm.checkPassword" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<!-- 内容底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addAccout">确 定</el-button>
			</span>
		
		</el-dialog>
		<!-- 查看账户信息 -->
		<el-dialog :title="detailAccout[0].data" :visible.sync="detailDialogVisible" width="50%" append-to-body="true">
			<el-table :data="detailAccout" border stripe>
				<el-table-column
					prop="name"
					label='标签'>
				</el-table-column>
				<el-table-column
					prop="data"
					label="内容">
				</el-table-column>
			</el-table>
		</el-dialog>
		
	</div>
</template>

<script>
	export default{
		created() {
			this.getAccoutList();
		},
		data() {
			var validatePass = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请输入密码'));
				} 
				else {
					if (this.addForm.checkPassword !== '') {
						this.$refs.addFormRef.validateField('checkPassword');
					}	
					callback();
				}
			};
			var validatePass2 = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请再次输入密码'));
				} 
				else if (value !== this.addForm.password) {
					callback(new Error('两次输入密码不一致!'));
				} 
				else {
					callback();
				}
			};
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				accoutList:[],//账户列表
				total: 0,//总记录数
				addDialogVisible: false,// 控制对话框显示/隐藏
				detailDialogVisible: false,
				dialogTitle: '增加账户',
				// 创建表单项目
				addForm: {
					id:0,
					name:'',
					password:'',
					checkPassword:''
				},
				// 验证规则
				addFormRules: {
					name:[
						{
							required: true,
							message: '请输入用户名',
							trigger: 'blur'
						},
						{
							min: 5,
							max: 10,
							message: '长度在5-10个字符',
							trigger: 'blur'
						}//长度验证
					],
					password:[
						{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							validator: validatePass, 
							trigger: 'blur'
						},
						{
							min: 6,
							max: 20,
							message: '长度在6-20个字符',
							trigger: 'blur'
						}//长度验证
					],
					checkPassword:[
						{
							required: true,
							message: '请输入确认密码',
							trigger: 'blur'
						},
						{
							validator: validatePass2, 
							trigger: 'blur'
						}
					]
				},
				detailAccout:[
					{
						name:'用户名',
						data:''
					},
					{
						name:'密码',
						data:''
					},
				]
			}
		},
		methods:{
			//获取所有账户
			async getAccoutList(){
				const {data:res} = await this.$http.get("allAdmin",{
					params:this.queryInfo
				});
				this.total = res.number; // 总个数
				this.accoutList = res.data;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getAccoutList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getAccoutList(); // 数据发生改变重新申请数据
			},
			showAddDialog(){
				this.dialogTitle = "增加账户";
				this.addDialogVisible = true;
			},
			//创建
			addAccout(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("register",this.addForm);
					if (res != "注册成功"){
						return this.$message.error(res);
					}
					this.$message.success(res);
					this.addDialogVisible = false;
					this.getAccoutList();
				})
			},
			addDialogClose(){
				this.$refs.addFormRef.resetFields();
			},
			async detail(accout) {
				this.detailAccout[0].data = accout.name;
				this.detailAccout[1].data = accout.password;
				this.detailDialogVisible= true;
			},
			deleteMessage(id){
				this.$confirm('此操作将永久删除该账户, 是否继续?', '提示', {
				  confirmButtonText: '确定',
				  cancelButtonText: '取消',
				  type: 'warning'
				}).then((action) => {
					if(action == 'confirm'){
						this.deleteAccout(id)
					}
				}).catch(() => {
				  this.$message({
				    type: 'info',
				    message: '已取消删除'
				  });          
				});
			},
			async deleteAccout(id) {
				this.addForm.id = id;
				const {data:res} = await this.$http.post("deleteAdmin",this.addForm);
				if (res != "success"){
					return this.$message.error("操作失败");
				}
				this.$message.success("操作成功");
				this.getAccoutList();
			}
		}
		
	}
</script>

<style lang="less" scoped>
	.el-breadcrumb{
		margin-bottom: 15px;
		font-size: 17px;
	}
</style>
