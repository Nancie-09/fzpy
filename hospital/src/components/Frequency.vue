<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>药品信息</el-breadcrumb-item>
			<el-breadcrumb-item>药品频次</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getFrequencyList">
						<el-button slot="append" icon="el-icon-search" @click="getFrequencyList"></el-button>
					</el-input>	
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">增加频次</el-button>
				</el-col>
				
			</el-row>
			<!-- 频次列表 -->
			<el-table :data="frequencyList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="频次名称" prop="itemName"></el-table-column>
				<el-table-column label="频次缩写" prop="itemNameAbbr"></el-table-column>
				<el-table-column label="操作">
					 <template slot-scope="scope">
						<el-button type="primary" @click="detail(scope.row)">查看</el-button>
						<el-button type="primary" @click="edit(scope.row)">编辑</el-button>
						<el-button type="danger"  @click="deleteMessage(scope.row.itemCode)">删除</el-button>
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
		<!-- 新增频次 -->
		<el-dialog :title="dialogTitle" :visible.sync="addDialogVisible" width="50%">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="频次名称" prop="itemName">
					<el-input v-model="addForm.itemName"></el-input>
				</el-form-item>
				<el-form-item label="频次缩写" prop="itemNameAbbr">
					<el-input v-model="addForm.itemNameAbbr"></el-input>
				</el-form-item>
			</el-form>
			<!-- 内容底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addFrequency" v-if="editDialogButton === false">确 定</el-button>
				<el-button type="primary" @click="editFrequency" v-if="editDialogButton === true">确 定</el-button>
			</span>
		
		</el-dialog>
		<!-- 查看频次 -->
		<el-dialog :title="detailFrequency[0].data" :visible.sync="detailDialogVisible" width="50%" append-to-body>
			<el-table :data="detailFrequency" border stripe>
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
			this.getFrequencyList();
		},
		data() {
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				frequencyList:[],//频次列表
				total: 0,//总记录数
				addDialogVisible: false,// 控制对话框显示/隐藏
				detailDialogVisible: false,
				editDialogButton:false,
				dialogTitle: '增加频次',
				// 创建表单项目
				addForm: {
					itemCode:0,
					itemName:'',
					itemNameAbbr:''
				},
				// 验证规则
				addFormRules: {
					itemName:{
						required: true,
						message: '请输入频次名称',
						trigger: 'blur'
					},
					itemNameAbbr:{
						required: true,
						message: '请输入频次缩写',
						trigger: 'blur'
					}
				},
				detailFrequency:[
					{
						name:'频次名称',
						data:''
					},
					{
						name:'频次缩写',
						data:''
					},
				],
				flag:0
			}
		},
		methods:{
			//获取所有频次
			async getFrequencyList(){
				const {data:res} = await this.$http.get("allFrequency",{
					params:this.queryInfo
				});
				this.total = res.number; // 总个数
				this.frequencyList = res.data;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getFrequencyList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getFrequencyList(); // 数据发生改变重新申请数据
			},
			showAddDialog(){
				this.dialogTitle = "增加频次";
				this.editDialogButton = false;
				this.addDialogVisible = true;
				if(this.flag==1){
					this.addForm = {
						itemCode:0,
						itemName:'',
						itemNameAbbr:''
					}
					this.$refs.addFormRef.resetFields();
				}
			},
			//创建
			addFrequency(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("addFrequency",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getFrequencyList();
				})
			},
			async detail(frequency) {
				this.detailFrequency[0].data = frequency.itemName;
				this.detailFrequency[1].data = frequency.itemNameAbbr;
				this.detailDialogVisible= true;
			},
			edit(frequency) {
				this.dialogTitle = "修改频次";
				this.editDialogButton = true;
				this.addDialogVisible = true;
				if(this.flag == 1) {
					this.$refs.addFormRef.resetFields();
				}
				this.flag = 1;
				this.addForm.itemCode = frequency.itemCode;
				this.addForm.itemName = frequency.itemName;
				this.addForm.itemNameAbbr = frequency.itemNameAbbr;
			},
			editFrequency(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("editFrequency",this.addForm);
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("操作成功");
					this.addDialogVisible = false;
					this.getFrequencyList();
				})
			},
			deleteMessage(itemCode){
				this.$confirm('此操作将永久删除该频次, 是否继续?', '提示', {
				  confirmButtonText: '确定',
				  cancelButtonText: '取消',
				  type: 'warning'
				}).then((action) => {
					if(action == 'confirm'){
						this.deleteFrequency(itemCode)
					}
				}).catch(() => {
				  this.$message({
				    type: 'info',
				    message: '已取消删除'
				  });          
				});
			},
			async deleteFrequency(itemCode) {
				this.addForm.itemCode = itemCode;
				const {data:res} = await this.$http.post("deleteFrequency",this.addForm);
				if (res != "success"){
					return this.$message.error("操作失败");
				}
				this.$message.success("操作成功");
				this.getFrequencyList();
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
