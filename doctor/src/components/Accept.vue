<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>问诊信息</el-breadcrumb-item>
			<el-breadcrumb-item>未完成</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getAcceptList">
						<el-button slot="append" icon="el-icon-search" @click="getAcceptList"></el-button>
					</el-input>	
				</el-col>
			</el-row>
			<!-- 问诊列表 -->
			<el-table :data="acceptList" border stripe @row-click="detail">
				<el-table-column type="index"></el-table-column>
				<el-table-column label="病人姓名" prop="personName" width="100"></el-table-column>
				<el-table-column label="病人性别" prop="personGenderName" width="80"></el-table-column>
				<el-table-column label="病人年龄" prop="personAge" width="80"></el-table-column>
				<el-table-column label="申请药品" prop="drugNames"></el-table-column>
				<el-table-column label="申请时间" prop="createTime" :formatter="getLastDate" width="160"></el-table-column>
				<el-table-column label="状态" prop="consultStatus" :formatter="status" width="80"></el-table-column>
				<el-table-column label="操作" width="120">
					 <template slot-scope="scope">
						<el-button type="primary">完成接诊</el-button>
						<!-- <el-button type="primary" @click="detail(scope.row)">查看</el-button> -->
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
		<!-- 查看问诊 -->
		<el-dialog title="患者详情" :visible.sync="detailDialogVisible" width="45%" @close="detailDialogClose" center="">
			<div class="state">
				<div class="content">
					<span class="title">申请时间：</span>
				    <span> {{getFormatDate(patientInfo.createTime)}}</span>
				    <span class="info" style="color: #FFA500;font-weight: bold;">待完成</span>
				</div>		
			</div>
			<div style="border: 5px solid #e9e9e9;"></div>
			<div class="state">
				<div class="content">
					<span class="title">问诊人</span>
				    <span class="info">{{patientInfo.personName}} {{patientInfo.personGenderName}} {{patientInfo.personAge}}岁</span>
				</div>		
			</div>
			<div style="border: 1px solid #F5F5F5;"></div>
			<div class="state">
				<div class="content" style="display: flex;flex-direction: column;">
					<span class="title">所需药品</span>
				    <div style="display: inline;margin: 5px 0">
						<el-tag v-for="(item,index) in drugList"  type="success" style="margin-right: 5px;">{{item}}</el-tag>
					</div>
				</div>		
			</div>
			<div style="border: 5px solid #e9e9e9;"></div>
			<div class="state" style="height: 20px;">
				<div class="content">
					<span class="title">历史诊断</span>
				    <span class="info">{{patientInfo.diagnosis}}</span>
				</div>		
			</div>
			<div style="border: 1px solid #F5F5F5;"></div>
			<div class="state">
				<div class="content" style="display: flex;flex-direction: column;">
					<span class="title">病情描述：</span>
				    <span style="margin-top: 10px;">{{patientInfo.question}}</span>
				</div>		
			</div>
			<div style="border: 5px solid #e9e9e9;" v-if="hasPicture"></div>
			<div class="state"  v-if="hasPicture">
				<div class="content">
					<span class="title">病情图片：</span>
					<div style="display: flex;flex-direction: row; margin-top: 10px;">
						<el-image v-for="(item,index) in picture" style="width: 80px; height: 80px; margin-right: 5px;" :src="item" :preview-src-list="picture"></el-image>
					</div>			    
				</div>		
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="detail(patientInfo)">查看处方</el-button>
			</span>
		</el-dialog>
		<!-- 查看药品 -->
		<!-- <el-dialog :title="detailDrug[1].data" :visible.sync="detailDialogVisible" width="50%" append-to-body>
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
		</el-dialog> -->
		
	</div>
</template>

<script>
	export default{
		created() {
			this.doctor = JSON.parse(window.sessionStorage.getItem("doctor"))
			this.getAcceptList();
		},
		data() {
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				doctor:null,
				acceptList:[],//问诊列表
				total: 0,//总记录数
				detailDialogVisible: false,
				patientInfo:{},
				drugList:[],
				picture:[],
				hasPicture:true,
			}
		},
		methods:{
			//上线状态
			status: function(row, column) {
				return "待完成";
			},
			//获取所有药品
			async getAcceptList(){
				console.log(this.doctor.doctorId)
				const {data:res} = await this.$http.get("selectDoctorConsult",{
					params:{
						doctorId:this.doctor.doctorId,
						query:this.queryInfo.query,
						pageNum: this.queryInfo.pageNum,
						pageSize: this.queryInfo.pageSize
					}
				});
				console.log(this.queryInfo)
				console.log(res)
				this.acceptList = res.acceptList;
				this.total = res.acceptNumber;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getAcceptList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getAcceptList(); // 数据发生改变重新申请数据
			},
			getLastDate: function(row,column) {
			    var date = new Date(row.createTime);
			    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
			    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
				var hours = date.getHours() < 10 ? "0" + date.getHours :date.getHours();
				var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
				var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
			    return date.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
			},
			detail(consult){
				this.detailDialogVisible= true;
				console.log(consult)
				this.patientInfo = consult;
				this.drugList=consult.drugNames.split(',')
				this.picture=consult.photoIds.split(',')
				if(this.picture.length==0||consult.photoIds=== ""){
					this.hasPicture = false;
				}
				console.log(this.picture)
				
			},
			detailDialogClose(){
				this.detailDialogVisible= false;
			},
			getFormatDate(time){
				let date = new Date(time)
				var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
				var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
				return date.getFullYear() + '-' + month + '-' + day;
			},
		}
		
	}
</script>

<style lang="less" scoped>
	.el-breadcrumb{
		margin-bottom: 15px;
		font-size: 17px;
	}
</style>
