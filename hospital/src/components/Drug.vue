<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>药品信息</el-breadcrumb-item>
			<el-breadcrumb-item>药品管理</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getDrugList">
						<el-button slot="append" icon="el-icon-search" @click="getDrugList"></el-button>
					</el-input>	
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">增加药品</el-button>
				</el-col>
				
			</el-row>
			<!-- 药品列表 -->
			<el-table :data="drugList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="商品名称" prop="tradeName"></el-table-column>
				<el-table-column label="操作">
					 <template slot-scope="scope">
						<el-button type="primary" @click="detail(scope.row)">查看</el-button>
						<el-button type="primary" @click="edit(scope.row)">编辑</el-button>
						<el-button type="danger"  @click="deleteMessage(scope.row.drugId)">删除</el-button>
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
		<!-- 新增药品 -->
		<el-dialog :title="dialogTitle" :visible.sync="addDialogVisible" width="50%" >
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="药品名称" prop="drugName">
					<el-input v-model="addForm.drugName"></el-input>
				</el-form-item>
				<el-form-item label="商品名称" prop="tradeName">
					<el-input v-model="addForm.tradeName"></el-input>
				</el-form-item>
				<el-form-item label="拼音码" prop="pinyinCode">
					<el-input v-model="addForm.pinyinCode"></el-input>
				</el-form-item>
				<el-form-item label="药品规格" prop="specification">
					<el-input v-model="addForm.specification"></el-input>
				</el-form-item>
				<el-form-item label="包装单位" prop="packUnit">
					<el-input v-model="addForm.packUnit"></el-input>
				</el-form-item>
				<el-form-item label="药品单价" prop="price">
					<el-input v-model="addForm.price"></el-input>
				</el-form-item>
				<el-form-item label="剂量" prop="dose">
					<el-input v-model="addForm.dose"></el-input>
				</el-form-item>
				<el-form-item label="剂量单位" prop="doseUnit">
					<el-input v-model="addForm.doseUnit"></el-input>
				</el-form-item>
				<el-form-item label="产地" prop="factoryName">
					<el-input v-model="addForm.factoryName"></el-input>
				</el-form-item>
				<el-form-item label="批准文号" prop="approvalNumber">
					<el-input v-model="addForm.approvalNumber"></el-input>
				</el-form-item>
			</el-form>
			<!-- 内容底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addDrug" v-if="editDialogButton === false">确 定</el-button>
				<el-button type="primary" @click="editDrug" v-if="editDialogButton === true">确 定</el-button>
			</span>
		
		</el-dialog>
		<!-- 查看药品 -->
		<el-dialog :title="detailDrug[1].data" :visible.sync="detailDialogVisible" width="50%" append-to-body>
			<el-table :data="detailDrug" border stripe height="400">
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
			this.getDrugList();
		},
		data() {
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				drugList:[],//药品列表
				total: 0,//总记录数
				addDialogVisible: false,// 控制对话框显示/隐藏
				detailDialogVisible: false,
				editDialogButton:false,
				dialogTitle: '增加药品',
				// 创建表单项目
				addForm: {
					drugId:0,
					drugName:'',
					tradeName:'',
					pinyinCode:'',
					specification:'',
					packUnit:'',
					price:null,
					dose:null,
					doseUnit:'',
					factoryName:'',
					approvalNumber:''
				},
				// 验证规则
				addFormRules: {
					drugName:{
						required: true,
						message: '请输入药品名称',
						trigger: 'blur'
					},
					tradeName:{
						required: true,
						message: '请输入商品名称',
						trigger: 'blur'
					},
					pinyinCode:{
						required: true,
						message: '请输入拼音码',
						trigger: 'blur'
					},
					specification:{
						required: true,
						message: '请输入药品规格',
						trigger: 'blur'
					},
					packUnit:{
						required: true,
						message: '请输入包装单位',
						trigger: 'blur'
					},
					price:{
						required: true,
						message: '请输入药品单价',
						trigger: 'blur'
					},
					dose:{
						required: true,
						message: '请输入剂量',
						trigger: 'blur'
					},
					doseUnit:{
						required: true,
						message: '请输入剂量单位',
						trigger: 'blur'
					},
				},
				detailDrugDemo:[
					{
						name:'药品名称',
						data:''
					},
					{
						name:'商品名称',
						data:''
					},
					{
						name:'拼音码',
						data:null
					},
					{
						name:'药品规格',
						data:''
					},
					{
						name:'包装单位',
						data:''
					},
					{
						name:'药品单价',
						data:null
					},
					{
						name:'剂量',
						data:null
					},
					{
						name:'剂量单位',
						data:''
					},
					{
						name:'产地',
						data:''
					},
					{
						name:'批准文号',
						data:''
					}
				],
				detailDrug:[
					{
						name:'药品名称',
						data:''
					},
					{
						name:'商品名称',
						data:''
					}
				],
				flag:0
			}
		},
		methods:{
			//获取所有药品
			async getDrugList(){
				const {data:res} = await this.$http.get("allDrug",{
					params:this.queryInfo
				});
				this.total = res.number; // 总个数
				this.drugList = res.data;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getDrugList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getDrugList(); // 数据发生改变重新申请数据
			},
			showAddDialog(){
				this.dialogTitle = "增加药品";
				this.editDialogButton = false;
				this.addDialogVisible = true;
				if(this.flag==1){
					this.addForm = {
						drugId:0,
						drugName:'',
						tradeName:'',
						pinyinCode:'',
						specification:'',
						packUnit:'',
						price:null,
						dose:null,
						doseUnit:'',
						factoryName:'',
						approvalNumber:''
					},
					this.$refs.addFormRef.resetFields();
				}
			},
			//创建
			addDrug(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("addDrug",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getDrugList();
				})
			},
			async detail(drug) {
				Object.assign(this.detailDrug, this.detailDrugDemo);
				this.detailDrug[0].data = drug.drugName;
				this.detailDrug[1].data = drug.tradeName;
				this.detailDrug[2].data = drug.pinyinCode;
				this.detailDrug[3].data = drug.specification;
				this.detailDrug[4].data = drug.packUnit;
				this.detailDrug[5].data = drug.price;
				this.detailDrug[6].data = drug.dose;
				this.detailDrug[7].data = drug.doseUnit;
				this.detailDrug[8].data = drug.factoryName;
				this.detailDrug[9].data = drug.approvalNumber;
				for(var i = 8;i < this.detailDrug.length; i++){
					if(this.detailDrug[i].data===''||this.detailDrug[i].data==='undefined'||this.detailDrug[i].data===null){
						this.detailDrug.splice(i,1); 
						i--;
					}
				}
				this.detailDialogVisible= true;
			},
			edit(drug) {
				this.dialogTitle = "修改药品";
				this.editDialogButton = true;
				this.addDialogVisible = true;
				if(this.flag == 1) {
					this.$refs.addFormRef.resetFields();
				}
				this.flag = 1;
				this.addForm.drugId = drug.drugId;
				this.addForm.drugName = drug.drugName;
				this.addForm.tradeName = drug.tradeName;
				this.addForm.pinyinCode = drug.pinyinCode;
				this.addForm.specification = drug.specification;
				this.addForm.packUnit = drug.packUnit;
				this.addForm.price = drug.price;
				this.addForm.dose = drug.dose;
				this.addForm.doseUnit = drug.doseUnit;
				this.addForm.factoryName = drug.factoryName;
				this.addForm.approvalNumber = drug.approvalNumber;
			},
			editDrug(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("editDrug",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getDrugList();
				})
			},
			deleteMessage(drugId){
				this.$confirm('此操作将永久删除该药品, 是否继续?', '提示', {
				  confirmButtonText: '确定',
				  cancelButtonText: '取消',
				  type: 'warning'
				}).then((action) => {
					if(action == 'confirm'){
						this.deleteDrug(drugId)
					}
				}).catch(() => {
				  this.$message({
				    type: 'info',
				    message: '已取消删除'
				  });          
				});
			},
			async deleteDrug(drugId) {
				console.log("delete")
				this.addForm.drugId = drugId;
				const {data:res} = await this.$http.post("deleteDrug",this.addForm);
				if (res != "success"){
					return this.$message.error("操作失败");
				}
				this.$message.success("操作成功");
				this.getDrugList();
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
