<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>问诊信息</el-breadcrumb-item>
			<el-breadcrumb-item>已完成</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-card>
			<el-row :gutter="25">
				<!-- 搜索区域 -->
				<el-col :span="10">
					<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getFinishList">
						<el-button slot="append" icon="el-icon-search" @click="getFinishList"></el-button>
					</el-input>	
				</el-col>
			</el-row>
			<!-- 问诊列表 -->
			<el-table :data="finishList" border stripe @row-click="detailConsult">
				<el-table-column type="index"></el-table-column>
				<el-table-column label="病人姓名" prop="personName" width="100"></el-table-column>
				<el-table-column label="病人性别" prop="consultId" width="80"></el-table-column>
				<el-table-column label="病人年龄" prop="personAge" width="80"></el-table-column>
				<el-table-column label="申请药品" prop="drugNames"></el-table-column>
				<el-table-column label="申请时间" prop="createTime" :formatter="getLastDate" width="160"></el-table-column>
				<el-table-column label="状态" prop="consultStatus" :formatter="status" width="80"></el-table-column>
				<el-table-column label="操作" width="120" @click.native.stop>
					 <template slot-scope="scope">
						<el-button type="primary"  @click.stop="detail(scope.row)">查看处方</el-button>
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
		<!-- 查看处方 -->
		<el-dialog title="电子处方" :visible.sync="detailDialogVisible" width="40%" @close="detailDialogClose" center="">
			<div>
				<div class="prescrption-header">
					<div>{{prescrption.org.orgName}}</div>
					<div>处方笺</div>
					<div class="prescrption-type">{{getTypeName()}}</div>
				</div>
				<div class="person-content">
					<div>
						<div>姓名 {{prescrption.person.name}}</div>
						<div>性别 {{prescrption.person.sex}}</div>
						<div>年龄 {{prescrption.person.age}}岁</div>
						<div>日期 {{getFormatDate(prescrption.createTime)}}</div>
					</div>
					<div>
						<div>身份证号 {{prescrption.person.identity}}</div>
						<div>手机号 {{prescrption.person.phone}}</div>
					</div>
				</div>
				<div class="drug-content">
					<div class="drug-header">Rp</div>
					<div class="drug-item" v-for="(item,index) in prescrption.drugs">
						<div>
							<div class="drug-item-name">{{item.drugName}}</div>
							<div class="drug-item-usage">
								用法：{{item.dose+item.doseUnit}}/次 {{item.frequencyName}} {{item.usageName}} 
							</div>
						</div>
						<div>{{item.quantity+item.packUnit}}</div>
					</div>
					<div class="drug-prize">药费：<span>¥ {{getTotalPrice()}}</span> 元</div>
				</div>
				<div class="prescrption-footer">
					<div class="doctor-content">
						处方医师：{{prescrption.doctor.doctorName}}<br>
						审核医师：<br>
						发药医师：
					</div>
					<div>盖章：</div>
				</div>
				<div class="prescrption-tips">{{tips}}</div>
			</div>
		</el-dialog>
		<!-- 查看问诊 -->
		<el-dialog title="患者详情" :visible.sync="detailConsultDialogVisible" width="45%" @close="detailConsultDialogClose" center="">
			<div class="state">
				<div class="content">
					<span class="title">申请时间：</span>
				    <span> {{getFormatDate(patientInfo.createTime)}}</span>
				    <span class="info" style="color: #FFA500;font-weight: bold;">已完成</span>
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
		
		
	</div>
</template>

<script>
	export default{
		created() {
			this.doctor = JSON.parse(window.sessionStorage.getItem("doctor"))
			this.getFinishList();
		},
		data() {
			return{
				//查询信息实体
				queryInfo:{
					query:'',//查询信息
					pageNum: 1,//当前页
					pageSize: 5 //每页最大数
				},
				finishList:[],//问诊列表
				total: 0,//总记录数
				doctor:null,
				detailDialogVisible: false,
				detailConsultDialogVisible: false,
				tips:'*药师温馨提示：请遵医嘱服药！处方当日有效！',
				prescrption:{
					createTime:null,
					type:null,
					org:{
						orgId:null,
						orgName:null
					},
					doctor:{
						doctorId:null,
						doctorName:null
					},
					person:{
						name:null,//person_name(consult_ask)
						sex:null,//person_gender_name(consult_ask)
						age:null,//person_age(consult_ask)
						phone:null,//person_phone_no(consult_ask)
						identity:null,//person_card_id(consult_ask)
					},
					drugs:[]
				},
				patientInfo:{},
				drugList:[],
				picture:[],
				hasPicture:true,
			}
		},
		methods:{
			//上线状态
			status: function(row, column) {
				return "已完成";
			},
			//获取所有药品
			async getFinishList(){
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
				this.finishList = res.finishList;
				this.total = res.finishNumber;
			},
			// 监听pageSize改变的事件
			handleSizeChange(newSize) {
			  this.queryInfo.pageSize = newSize;
			  this.getFinishList(); // 数据发生改变重新申请数据
			},
			// 监听pageNum改变的事件
			handleCurrentChange(newPage) {
			  this.queryInfo.pageNum = newPage;
			  this.getFinishList(); // 数据发生改变重新申请数据
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
			detailConsult(consult){
				this.detailConsultDialogVisible= true;
				console.log(consult)
				this.patientInfo = consult;
				this.drugList=consult.drugNames.split(',')
				this.picture=consult.photoIds.split(',')
				if(this.picture.length==0||consult.photoIds=== ""){
					this.hasPicture = false;
				}
				console.log(this.picture)
				
			},
			detailConsultDialogClose(){
				this.detailConsultDialogVisible= false;
			},
			async detail(consult) {
				const {data:res} = await this.$http.get("selectPrescriptionByConsult",{
					params:{
						consultId:consult.consultId
					}
				})
				console.log("detailInfo")
				let prescriptionInfo = res.data;
				let prescription = {
					createTime:prescriptionInfo.createTime,
					type:prescriptionInfo.prescriptionType,
					org:{
						orgId:consult.orgId,
						orgName:consult.orgName
					},
					doctor:{
						doctorId:consult.doctorId,
						doctorName:consult.doctorName
					},
					person:{
						name:consult.personName,//person_name(consult_ask)
						sex:consult.personGenderName,//person_gender_name(consult_ask)
						age:consult.personAge,//person_age(consult_ask)
						phone:consult.personPhoneNo,//person_phone_no(consult_ask)
						identity:consult.personCardId,//person_card_id(consult_ask)
					},
				}
				console.log(prescription)
				const {data:res2} = await this.$http.get("selectPrescriptionDrugByPrescription",{
					params:{
						prescriptionId:prescriptionInfo.prescriptionId
					}
				});
				console.log("detailDrugs")
				prescription.drugs = res2.data;
				console.log(prescription)
				this.prescrption = prescription
				this.detailDialogVisible= true;
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
			getTotalPrice(){
				let total = 0.00;
				for(let item of this.prescrption.drugs){
					total = total+item.price*item.quantity;
					console.log(item)
				}
				return total.toFixed(2);
			},
			getTypeName(){
				let type = this.prescrption.type
				if(type==1){
					return '西药处方';
				}
				else if(type==2){
					return '中成药处方';
				}else if(type==3){
					return '中草药处方';
				}
			},
		}
		
	}
</script>

<style scoped lang="less">
	.el-breadcrumb{
		margin-bottom: 15px;
		font-size: 17px;
	}
	.prescrption-header{
		font-size: 20px;
		text-align: center;
		position: relative;
	}
	.prescrption-type{
		font-size: 18px;
		position: absolute;
		width: 50px;
		border: 1px solid #333333;
		color: #b1b1b1;
		top: 60%;
		left: 80%;
	}
	.person-content{
		padding: 30px 0 20px;
	}
	.person-content>div{
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
	}
	.drug-content{
		border-top: #000 3px solid;
		padding: 20px 0;
		font-size: 16px;
	}
	.drug-header{
		font-size: 19px;
	}
	.drug-item{
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 10px 0;
		padding-bottom: 0;
		color: #585858;
	}
	.drug-prize{
		text-align: right;
	}
	.drug-prize span{
		color: #e6895c;
	}
	.drug-item-usage{
		color: #b1b1b1;
	}
	.prescrption-footer{
		display: flex;
		justify-content: space-between;
		padding-right: 80px;
		font-size: 16px;
	}
	.doctor-content{
		line-height: 30px;
	}
	.prescrption-tips{
		color: #b1b1b1;
		text-align: center;
		padding: 50px 0;
	}
	.title{
		color: grey;
	}
	.state{
		padding: 10px 0;
	}
	.info{
		float: right;
	}
</style>
