<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>诊断信息</el-breadcrumb-item>
			<el-breadcrumb-item>诊断管理</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getDiagnosisList">
						<el-button slot="append" icon="el-icon-search" @click="getDiagnosisList"></el-button>
					</el-input>	
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">增加诊断</el-button>
				</el-col>
				
			</el-row>
			<!-- 诊断列表 -->
			<el-table :data="diagnosisList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="疾病代码" prop="diseasesCode"></el-table-column>
				<el-table-column label="疾病名称" prop="diseasesName"></el-table-column>
				<el-table-column label="操作">
					 <template slot-scope="scope">
						<el-button type="primary" @click="detail(scope.row)">查看</el-button>
						<el-button type="primary" @click="edit(scope.row)">编辑</el-button>
						<el-button type="danger"  @click="deleteMessage(scope.row.diagnosisId)">删除</el-button>
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
		<!-- 新增诊断 -->
		<el-dialog :title="dialogTitle" :visible.sync="addDialogVisible" width="50%">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="诊断类型" prop="diagnosisType">
					<el-input v-model="addForm.diagnosisType"></el-input>
				</el-form-item>
				<el-form-item label="疾病代码" prop="diseasesCode">
					<el-input v-model="addForm.diseasesCode"></el-input>
				</el-form-item>
				<el-form-item label="疾病标识" prop="diseasesId">
					<el-input v-model="addForm.diseasesId"></el-input>
				</el-form-item>
				<el-form-item label="疾病名称" prop="diseasesName">
					<el-input v-model="addForm.diseasesName"></el-input>
				</el-form-item>
				<el-form-item label="拼音码" prop="pinyinCode">
					<el-input v-model="addForm.pinyinCode"></el-input>
				</el-form-item>
			</el-form>
			<!-- 内容底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addDiagnosis" v-if="editDialogButton === false">确 定</el-button>
				<el-button type="primary" @click="editDiagnosis" v-if="editDialogButton === true">确 定</el-button>
			</span>
		
		</el-dialog>
		<!-- 查看诊断 -->
		<el-dialog :title="detailDiagnosis[3].data" :visible.sync="detailDialogVisible" width="50%" center="">
			<el-table :data="detailDiagnosis" border stripe>
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
			this.getDiagnosisList();
		},
		data() {
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				diagnosisList:[],//诊断列表
				total: 0,//总记录数
				addDialogVisible: false,// 控制对话框显示/隐藏
				detailDialogVisible: false,
				editDialogButton:false,
				dialogTitle: '增加诊断',
				// 创建表单项目
				addForm: {
					diagnosisId:0,
					diagnosisType:'',
					diseasesCode:'',
					diseasesId:null,
					diseasesName:'',
					pinyinCode:'',
				},
				// 验证规则
				addFormRules: {
					diagnosisType:{
						required: true,
						message: '请输入诊断类型',
						trigger: 'blur'
					},
					diseasesCode:{
						required: true,
						message: '请输入疾病代码',
						trigger: 'blur'
					},
					diseasesId:{
						required: true,
						message: '请输入疾病标识',
						trigger: 'blur'
					},
					diseasesName:{
						required: true,
						message: '请输入疾病名称',
						trigger: 'blur'
					},
					pinyinCode:{
						required: true,
						message: '请输入拼音码',
						trigger: 'blur'
					},
				},
				detailDiagnosis:[
					{
						name:'诊断类型',
						data:''
					},
					{
						name:'疾病代码',
						data:''
					},
					{
						name:'疾病标识',
						data:null
					},
					{
						name:'疾病名称',
						data:''
					},
					{
						name:'拼音码',
						data:''
					},
				],
				flag:0
			}
		},
		methods:{
			//获取所有诊断
			async getDiagnosisList(){
				const {data:res} = await this.$http.get("allDiagnosis",{
					params:this.queryInfo
				});
				this.total = res.number; // 总个数
				this.diagnosisList = res.data;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getDiagnosisList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getDiagnosisList(); // 数据发生改变重新申请数据
			},
			showAddDialog(){
				this.dialogTitle = "增加诊断";
				this.editDialogButton = false;
				this.addDialogVisible = true;
				if(this.flag==1){
					this.addForm = {
						diagnosisId:0,
						diagnosisType:'',
						diseasesCode:'',
						diseasesId:null,
						diseasesName:'',
						pinyinCode:'',
					}
					this.$refs.addFormRef.resetFields();
				}
			},
			//创建
			addDiagnosis(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("addDiagnosis",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getDiagnosisList();
				})
			},
			async detail(diagnosis) {
				this.detailDiagnosis[0].data = diagnosis.diagnosisType;
				this.detailDiagnosis[1].data = diagnosis.diseasesCode;
				this.detailDiagnosis[2].data = diagnosis.diseasesId;
				this.detailDiagnosis[3].data = diagnosis.diseasesName;
				this.detailDiagnosis[4].data = diagnosis.pinyinCode;
				this.detailDialogVisible= true;
			},
			edit(diagnosis) {
				this.dialogTitle = "修改诊断";
				this.editDialogButton = true;
				this.addDialogVisible = true;
				if(this.flag == 1) {
					this.$refs.addFormRef.resetFields();
				}
				this.flag = 1;
				this.addForm.diagnosisId = diagnosis.diagnosisId;
				this.addForm.diagnosisType = diagnosis.diagnosisType;
				this.addForm.diseasesCode = diagnosis.diseasesCode;
				this.addForm.diseasesId = diagnosis.diseasesId;
				this.addForm.diseasesName = diagnosis.diseasesName;
				this.addForm.pinyinCode = diagnosis.pinyinCode;
			},
			editDiagnosis(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("editDiagnosis",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getDiagnosisList();
				})
			},
			deleteMessage(diagnosisId){
				this.$confirm('此操作将永久删除该诊断, 是否继续?', '提示', {
				  confirmButtonText: '确定',
				  cancelButtonText: '取消',
				  type: 'warning'
				}).then((action) => {
					if(action == 'confirm'){
						this.deleteDiagnosis(diagnosisId)
					}
				  
				}).catch(() => {
				  this.$message({
				    type: 'info',
				    message: '已取消删除'
				  });          
				});
			},
			async deleteDiagnosis(diagnosisId) {
				console.log("delete")
				this.addForm.diagnosisId = diagnosisId;
				const {data:res} = await this.$http.post("deleteDiagnosis",this.addForm);
				if (res != "success"){
					return this.$message.error("操作失败");
				}
				this.$message.success("操作成功");
				this.getDiagnosisList();
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
