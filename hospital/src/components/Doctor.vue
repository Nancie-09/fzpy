<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>医生信息</el-breadcrumb-item>
			<el-breadcrumb-item>医生管理</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getDoctorList">
						<el-button slot="append" icon="el-icon-search" @click="getDoctorList"></el-button>
					</el-input>	
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">增加医生</el-button>
				</el-col>
				
			</el-row>
			<!-- 医生列表 -->
			<el-table :data="doctorList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="机构名称" prop="orgName"></el-table-column>
				<el-table-column label="科室名称" prop="deptName"></el-table-column>
				<el-table-column label="医生姓名" prop="doctorName"></el-table-column>
				<el-table-column label="操作">
					 <template slot-scope="scope">
						<el-button type="primary" @click="detail(scope.row)">查看</el-button>
						<el-button type="primary" @click="edit(scope.row)">编辑</el-button>
						<el-button type="danger"  @click="deleteMessage(scope.row.doctorId)">删除</el-button>
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
		<!-- 新增医生 -->
		<el-dialog :title="dialogTitle" :visible.sync="addDialogVisible" width="50%">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="医生姓名" prop="doctorName">
					<el-input v-model="addForm.doctorName"></el-input>
				</el-form-item>
				<el-form-item label="机构id" prop="orgId">
					<el-input v-model="addForm.orgId"></el-input>
				</el-form-item>
				<el-form-item label="机构名称" prop="orgName">
					<el-input v-model="addForm.orgName"></el-input>
				</el-form-item>
				<el-form-item label="科室id" prop="deptId">
					<el-input v-model="addForm.deptId"></el-input>
				</el-form-item>
				<el-form-item label="科室名称" prop="deptName">
					<el-input v-model="addForm.deptName"></el-input>
				</el-form-item>
				<el-form-item label="头像" prop="avatarUrl">
					<el-input v-model="addForm.avatarUrl"></el-input>
				</el-form-item>
				<el-form-item label="职称代码" prop="levelCode">
					<el-input v-model="addForm.levelCode"></el-input>
				</el-form-item>
				<el-form-item label="职称" prop="levelName">
					<el-input v-model="addForm.levelName"></el-input>
				</el-form-item>
				<el-form-item label="手机号" prop="doctorPhone">
					<el-input v-model="addForm.doctorPhone"></el-input>
				</el-form-item>
			</el-form>
			<!-- 内容底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addDoctor" v-if="editDialogButton === false">确 定</el-button>
				<el-button type="primary" @click="editDoctor" v-if="editDialogButton === true">确 定</el-button>
			</span>
		
		</el-dialog>
		<!-- 查看医生 -->
		<el-dialog :title="detailDoctor[0].data" :visible.sync="detailDialogVisible" width="50%" append-to-body>
			<el-table :data="detailDoctor" border stripe height="400">
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
			this.getDoctorList();
		},
		data() {
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				doctorList:[],//医生列表
				total: 0,//总记录数
				addDialogVisible: false,// 控制对话框显示/隐藏
				detailDialogVisible: false,
				editDialogButton:false,
				dialogTitle: '增加医生',
				// 创建表单项目
				addForm: {
					doctorId:0,
					doctorName:'',
					orgId:null,
					orgName:'',
					deptId:null,
					deptName:'',
					avatarUrl:'',
					levelCode:'',
					levelName:'',
					doctorPhone:''
				},
				// 验证规则
				addFormRules: {
					doctorName:{
						required: true,
						message: '请输入医生姓名',
						trigger: 'blur'
					},
					orgId:{
						required: true,
						message: '请输入机构id',
						trigger: 'blur'
					},
					orgName:{
						required: true,
						message: '请输入机构名称',
						trigger: 'blur'
					},
					deptId:{
						required: true,
						message: '请输入科室id',
						trigger: 'blur'
					},
					deptName:{
						required: true,
						message: '请输入科室名称',
						trigger: 'blur'
					},
					doctorPhone:{
						required: true,
						message: '请输入医生手机号',
						trigger: 'blur'
					}
				},
				detailDoctorDemo:[
					{
						name:'医生姓名',
						data:''
					},
					{
						name:'机构id',
						data:''
					},
					{
						name:'机构名称',
						data:null
					},
					{
						name:'科室id',
						data:''
					},
					{
						name:'科室名称',
						data:''
					},
					{
						name:'头像',
						data:''
					},
					{
						name:'职称代码',
						data:''
					},
					{
						name:'职称',
						data:''
					},
					{
						name:'手机号',
						data:''
					}
				],
				detailDoctor:[
					{
						name:'医生姓名',
						data:''
					}
				],
				flag:0
			}
		},
		methods:{
			//获取所有医生
			async getDoctorList(){
				const {data:res} = await this.$http.get("allDoctor",{
					params:this.queryInfo
				});
				this.total = res.number; // 总个数
				this.doctorList = res.data;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getDoctorList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getDoctorList(); // 数据发生改变重新申请数据
			},
			showAddDialog(){
				this.dialogTitle = "增加医生";
				this.editDialogButton = false;
				this.addDialogVisible = true;
				if(this.flag==1){
					this.addForm = {
						doctorId:0,
						doctorName:'',
						orgId:null,
						orgName:'',
						deptId:null,
						deptName:'',
						avatarUrl:'',
						levelCode:'',
						levelName:'',
						doctorPhone:''
					}
					this.$refs.addFormRef.resetFields();
				}
			},
			//创建
			addDoctor(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("addDoctor",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getDoctorList();
				})
			},
			async detail(doctor) {
				Object.assign(this.detailDoctor, this.detailDoctorDemo);
				this.detailDoctor[0].data = doctor.doctorName;
				this.detailDoctor[1].data = doctor.orgId;
				this.detailDoctor[2].data = doctor.orgName;
				this.detailDoctor[3].data = doctor.deptId;
				this.detailDoctor[4].data = doctor.deptName;
				this.detailDoctor[5].data = doctor.avatarUrl;
				this.detailDoctor[6].data = doctor.levelCode;
				this.detailDoctor[7].data = doctor.levelName;
				this.detailDoctor[8].data = doctor.doctorPhone;
				for(var i = 5;i < this.detailDoctor.length; i++){
					if(this.detailDoctor[i].data===''||this.detailDoctor[i].data==='undefined'||this.detailDoctor[i].data===null){
						this.detailDoctor.splice(i,1); 
						i--;
					}
				}
				this.detailDialogVisible= true;
			},
			edit(doctor) {
				this.dialogTitle = "修改医生";
				this.editDialogButton = true;
				this.addDialogVisible = true;
				if(this.flag == 1) {
					this.$refs.addFormRef.resetFields();
				}
				this.flag = 1;
				this.addForm.doctorId = doctor.doctorId;
				this.addForm.doctorName = doctor.doctorName;
				this.addForm.orgId = doctor.orgId;
				this.addForm.orgName = doctor.orgName;
				this.addForm.deptId = doctor.deptId;
				this.addForm.deptName = doctor.deptName;
				this.addForm.avatarUrl = doctor.avatarUrl;
				this.addForm.levelCode = doctor.levelCode;
				this.addForm.levelName = doctor.levelName;
				this.addForm.doctorPhone = doctor.doctorPhone;
			},
			editDoctor(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("editDoctor",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getDoctorList();
				})
			},
			deleteMessage(doctorId){
				this.$confirm('此操作将永久删除该医生, 是否继续?', '提示', {
				  confirmButtonText: '确定',
				  cancelButtonText: '取消',
				  type: 'warning'
				}).then((action) => {
					if(action == 'confirm'){
						this.deleteDoctor(doctorId)
					}
				}).catch(() => {
				  this.$message({
				    type: 'info',
				    message: '已取消删除'
				  });          
				});
			},
			async deleteDoctor(doctorId) {
				console.log("delete")
				this.addForm.doctorId = doctorId;
				const {data:res} = await this.$http.post("deleteDoctor",this.addForm);
				if (res != "success"){
					return this.$message.error("操作失败");
				}
				this.$message.success("操作成功");
				this.getDoctorList();
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
