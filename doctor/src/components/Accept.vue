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
						<el-button type="primary" @click.stop="finish(scope.row)">完成接诊</el-button>
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
				<div class="consult-content">
					<span class="consult-title">申请时间：</span>
				    <span> {{getFormatDate(patientInfo.createTime)}}</span>
				    <span class="info" style="color: #FFA500;font-weight: bold;">待完成</span>
				</div>		
			</div>
			<div style="border: 5px solid #e9e9e9;"></div>
			<div class="state">
				<div class="consult-content">
					<span class="consult-title">问诊人</span>
				    <span class="info">{{patientInfo.personName}} {{patientInfo.personGenderName}} {{patientInfo.personAge}}岁</span>
				</div>		
			</div>
			<div style="border: 1px solid #F5F5F5;"></div>
			<div class="state">
				<div class="consult-content" style="display: flex;flex-direction: column;">
					<span class="consult-title">所需药品</span>
				    <div style="display: inline;margin: 5px 0">
						<el-tag v-for="(item,index) in drugList"  type="success" style="margin-right: 5px;">{{item}}</el-tag>
					</div>
				</div>		
			</div>
			<div style="border: 5px solid #e9e9e9;"></div>
			<div class="state" style="height: 20px;">
				<div class="consult-content">
					<span class="consult-title">历史诊断</span>
				    <span class="info">{{patientInfo.diagnosis}}</span>
				</div>		
			</div>
			<div style="border: 1px solid #F5F5F5;"></div>
			<div class="state">
				<div class="consult-content" style="display: flex;flex-direction: column;">
					<span class="consult-title">病情描述：</span>
				    <span style="margin-top: 10px;">{{patientInfo.question}}</span>
				</div>		
			</div>
			<div style="border: 5px solid #e9e9e9;" v-if="hasPicture"></div>
			<div class="state"  v-if="hasPicture">
				<div class="consult-content">
					<span class="consult-title">病情图片：</span>
					<div style="display: flex;flex-direction: row; margin-top: 10px;">
						<el-image v-for="(item,index) in picture" style="width: 80px; height: 80px; margin-right: 5px;" :src="item" :prediv-src-list="picture"></el-image>
					</div>			    
				</div>		
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="showPrescription">处方</el-button>
				<el-button type="infor" @click="finish(patientInfo)">完成接诊</el-button>
			</span>
		</el-dialog>
		<!-- 处方 -->
		<el-dialog title="处方" :visible.sync="prescriptionDialogVisible" width="42%" append-to-body center="">
			<div class="content" >
				<div class="tip" style="margin-bottom: 20px; background-color: #E7E1CD; padding: 3px 0;">
					<span style="padding-left: 10px;">患者所需药品</span>
					<span v-for="(item,index) in drugList" style="padding: 0 5px; color: #55A532;">{{item}}</span>			
				</div>
				<div class="pres">
				    <div class="title" >
						<div style="flex: 1;">
							<img src="../assets/drug.png" style="width: 20px;height: 20px; margin: auto 0;margin-right: 5px;"></img>
							<span>西药方</span>		
						</div>						
						<div style="margin-right: 30px;" @click="addDrug">
							<i class="el-icon-plus" style="margin-right: 5px;"></i>
							<span style="color: #2979ff;">新增药品</span>
						</div>						
					</div>							
					<div class="drups" v-for="(item,index) in prescriptionDrugList" style="display: flex;flex-direction: column;">
						<div style="display: inline;margin:10px 0px 0px 30px;">
							<span>{{item.drugName}}({{item.packUnit}})</span>
							<span style="float: right;margin-right: 15px;">{{item.quantity}}</span>
						</div>
						<div style="display: inline; margin: 10px 0px 0px 40px;">
							<span>{{item.specification}}</span>
							<img src="../assets/delete.png" style="width: 20px;height: 20px;margin-right: 15px; float: right;"  @click="deleteDrug(index)"></img>
						</div>
						
						<span style="font-size: 10px;margin: 10px 0px 20px 30px;">用法：{{item.frequencyName}}  {{item.usageName}}</span>
					    <div style="border: #F5F5F5 solid 3px;" v-if="prescriptionDrugList.length>1"></div>
					</div>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-tooltip class="item" effect="dark" :content="toolTip" placement="bottom" :disabled="toolDisabled">
					<div style="width:98px; margin: 0 auto;">
						<el-button :type="buttonType" :disabled="buttonDisabled" @click="addPres">提交处方</el-button>
					</div>
				</el-tooltip>
			</span>
		</el-dialog>
		<el-dialog title="新增药品" :visible.sync="addDrugDialogVisible" width="38%" append-to-body center="">
			<el-row :gutter="25" style="margin: 0 0 10px; ">
				<!-- 搜索区域 -->
				<el-input placeholder="请输入搜索内容" v-model="query" clearable @clear="getDrugList">
					<el-button slot="append" icon="el-icon-search" @click="getDrugList" ></el-button>
				</el-input>	
			</el-row>
			<div class="tip" style=" background-color: #E9E9E9; padding: 3px 0;">
				<span style="padding-left: 10px;">搜索结果（{{drugNumber}}条）</span>
			</div>
			<!-- 问诊列表 -->
			<el-table :data="drugs" border stripe @row-click="drugSetting" height="320">
				<el-table-column type="index"></el-table-column>
				<el-table-column label="药品名称" prop="drugName"></el-table-column>
				<el-table-column label="剂量" prop="dose">
					<template slot-scope="scope">
						{{scope.row.dose}}{{scope.row.doseUnit}}
					</template>
				</el-table-column>
				<el-table-column label="产地" prop="factoryName"></el-table-column>
			</el-table>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDrugDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addDrugDialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="药品设置" :visible.sync="drugSettingDialogVisible" width="35%" append-to-body center="" @close="drugSettingDialogClose">
			<el-form ref="addDrugFormRef" :model="addDrugForm" label-width="100px">
				<el-form-item label="药品" required>
					<el-select v-model="addDrugForm.drugName" @change="changeDrug($event)">
						<el-option v-for="(item,index) in drugs" 
						:value="{
							drugId: item.drugId,
							drugName: item.drugName,
							specification: item.specification,
							price: item.price,
							dose: item.dose,
							doseUnit: item.doseUnit,
							packUnit: item.packUnit}">
							<label>{{item.drugName}} {{item.specification}}</label>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item required>
					<span slot="label">剂量（{{addDrugForm.doseUnit}})</span>
					<el-input-number v-model="addDrugForm.dose" :min="drug.dose" :step="drug.dose" ></el-input-number>
				</el-form-item>
				<el-form-item label="频次" required >
					<el-select v-model="addDrugForm.frequencyName" placeholder="请选择" @change="changeFrequency($event)" filterable >
						<el-option v-for="(item,index) in frequencyList"  :label="item.itemNameAbbr" :value="{itemName: item.itemNameAbbr,itemCode:item.itemCode}"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="用法" required filterable >
					<el-select v-model="addDrugForm.usageName" placeholder="请选择" @change="changeUsage($event)" filterable >
						<el-option v-for="(item,index) in usageList" :label="item.itemName" :value="{itemName: item.itemName,itemCode:item.itemCode}"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="用药天数(天)" required>
					<el-input-number v-model="addDrugForm.takeDays" :min="1" ></el-input-number>
				</el-form-item>
				<el-form-item required>
					<span slot="label">总量（{{addDrugForm.packUnit}})</span>
					<el-input-number v-model="addDrugForm.quantity" :min="1" ></el-input-number>
				</el-form-item>
				<el-form-item label="备注" >
				    <el-input type="textarea" v-model="addDrugForm.remark"></el-input>
				  </el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer" style="display: flex; flex-direction: row;justify-content: center;">
				<el-button @click="drugSettingDialogVisible = false">取 消</el-button>
				<el-tooltip class="item" effect="dark" :content="settingToolTip" placement="bottom" :disabled="settingToolDisabled" style="margin-left: 10px;line-height: 40px;">
					<div style="width:73.89px; ">
						<el-button type="primary" :disabled="addSettingButtonDisabled" @click="addDrugSetting">确 定</el-button>
					</div>
				</el-tooltip>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default{
		created() {
			this.doctor = JSON.parse(window.sessionStorage.getItem("doctor"))
			this.getAcceptList();
			this.getUFList()
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
				query:'',
				doctor:null,
				acceptList:[],//问诊列表
				total: 0,//总记录数
				detailDialogVisible: false,
				patientInfo:{},
				drugList:[],
				picture:[],
				hasPicture:true,
				frequencyList:[],
				usageList:[],
				prescriptionDialogVisible: false,
				prescriptionDrugList:[],
				addDrugDialogVisible: false,
				buttonType: "info",
				buttonDisabled: true,
				toolTip:"处方未增加药品，无法提交",
				toolDisabled: false,
				drugs:[],
				drugSettingDialogVisible: false,
				drug:{},
				drugNumber:0,
				addDrugForm:{
					orgId:0, 
					prescriptionId:0,
					drugId:0,
					drugName:'',
					specification:'',
					dose:0,
					doseUnit:'',
					frequencyCode:0,
					frequencyName:null,
					usageCode:0,
					usageName:null,
					takeDays:0,
					quantity:0,
					price:0,
					packUnit:'',
					groupNumber:0,
					sortNumber:0,
					remark:''
				},
				flag: 0,
				addSettingButtonDisabled:true,
				settingToolTip:'必填项不能为空',
				settingToolDisabled:false,
				consultPre:[]
			}
		},
		methods:{
			//上线状态
			status: function(row, column) {
				return "待完成";
			},
			//获取所有未完成问诊
			async getAcceptList(){
				const {data:res} = await this.$http.get("selectDoctorConsult",{
					params:{
						doctorId:this.doctor.doctorId,
						query:this.queryInfo.query,
						pageNum: this.queryInfo.pageNum,
						pageSize: this.queryInfo.pageSize
					}
				});
				this.acceptList = res.acceptList;
				this.total = res.acceptNumber;
			},
			async getDrugList(){
				const {data:res} = await this.$http.get("allDrug",{
					params:{
						query:this.query,
						pageNum: 1,
						pageSize: -1
					}
				});
				this.drugs = res.data
				this.drugNumber = res.number
			},
			async getUFList(){
				const {data:res1} = await this.$http.get("getFrequency");
				this.frequencyList = res1.data
				const {data:res2} = await this.$http.get("getUsage");
				this.usageList = res2.data
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
			async showPrescription(){
				const {data:res} = await this.$http.post("acceptConsult",this.patientInfo);
				if (res != "success"){
					return this.$message.error("接诊失败");
				}
				this.$message.success("已接诊");
				this.prescriptionDialogVisible = true;
			},
			detail(consult){
				this.detailDialogVisible= true;
				this.patientInfo = consult;
				this.drugList=consult.drugNames.split(',')
				this.picture=consult.photoIds.split(',')
				if(this.picture.length==0||consult.photoIds=== ""){
					this.hasPicture = false;
				}
				for(let item of this.consultPre){
					if(item.consultId == consult.consultId) {
						this.prescriptionDrugList = item.drugs
					}
				}
				if(this.prescriptionDrugList.length == 0){
					this.buttonType = "info"
					this.buttonDisabled = true
					this.toolTip="处方味增加药品，无法提交"
					this.toolDisabled = false
				}
				else if(this.prescriptionDrugList.commitFlag == 1){
					this.buttonType = "info"
					this.buttonDisabled = true
					this.toolTip="处方已提交，无法重复提交，请完成接诊"
					this.toolDisabled = false
				}
				else{
					this.buttonType = "primary"
					this.buttonDisabled = false
					this.toolTip="处方味增加药品，无法提交"
					this.toolDisabled = true
				}
			},
			detailDialogClose(){
				let flag = 1
				for(let item of this.consultPre){
					if(item.consultId == this.patientInfo.consultId) {
						flag = 0
					}
				}
				if(flag == 1) {
					this.consultPre.push({
						consultId: this.patientInfo.consultId,
						commitFlag:0,
						drugs:this.prescriptionDrugList
					})
				}
				this.prescriptionDrugList = []
				this.detailDialogVisible= false;
			},
			getFormatDate(time){
				let date = new Date(time)
				var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
				var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
				return date.getFullYear() + '-' + month + '-' + day;
			},
			finish(consult){
				let flag = 0
				for(let item of this.consultPre){
					if(item.consultId == consult.consultId && item.commitFlag == 1) {
						flag = 1
					}
				}
				if(flag == 1){
					this.finishConsult(consult)
				}
				else{
					this.$confirm('该问诊还未开具处方, 是否继续?', '提示', {
					  confirmButtonText: '确定',
					  cancelButtonText: '取消',
					  type: 'warning'
					}).then((action) => {
						if(action == 'confirm'){
							this.finishConsult(consult)
						}
					}).catch(() => {
					  this.$message({
					    type: 'info',
					    message: '已取消'
					  });          
					});
				}
			},
			async finishConsult(consult){
				const {data:res} = await this.$http.post("finishConsult",consult)
				if(res == 'success'){
					this.$message.success("完成接诊");//信息提示
					this.detailDialogVisible = false;
					this.getAcceptList();
				}else{
					this.$message.error("操作失败");//错误提示
				}
			},
			deleteDrug(index){
				this.$confirm('此操作将永久删除该药品, 是否继续?', '提示', {
				  confirmButtonText: '确定',
				  cancelButtonText: '取消',
				  type: 'warning'
				}).then((action) => {
					if(action == 'confirm'){
						this.prescriptionDrugList.splice(index,1);
						if(this.prescriptionDrugList.length == 0){
							this.buttonType = "info"
							this.buttonDisabled = true
							this.toolTip="处方味增加药品，无法提交"
							this.toolDisabled = false
						}
					}
				}).catch(() => {
				  this.$message({
				    type: 'info',
				    message: '已取消删除'
				  });          
				});
			},
			addDrug(){
				this.addDrugDialogVisible = true;
			},
			drugSetting(drug){
				this.drugSettingDialogVisible = true;
				if(this.flag == 1){
					this.addDrugForm = {
						orgId:0, 
						prescriptionId:0,
						drugId:0,
						drugName:'',
						specification:'',
						dose:0,
						doseUnit:'',
						frequencyCode:0,
						frequencyName:null,
						usageCode:0,
						usageName:null,
						takeDays:0,
						quantity:0,
						price:0,
						packUnit:'',
						groupNumber:0,
						sortNumber:0,
						remark:''
					}
					this.$refs.addDrugFormRef.resetFields();
				}
				this.flag = 1
				this.drug = drug
				this.addDrugForm.drugId = drug.drugId
				this.addDrugForm.drugName = drug.drugName
				this.addDrugForm.specification = drug.specification
				this.addDrugForm.price = drug.price
				this.addDrugForm.dose = drug.dose
				this.addDrugForm.doseUnit = drug.doseUnit
				this.addDrugForm.packUnit = drug.packUnit
				this.addDrugForm.groupNumber = 1;
				this.addDrugForm.orgId = this.doctor.orgId
			},
			drugSettingDialogClose(){
			  this.$refs.addDrugFormRef.resetFields();// 重置表单项
			  this.settingToolDisabled = false;
			  this.addSettingButtonDisabled = true;
			},
			addDrugSetting(){
				this.prescriptionDrugList.push(this.addDrugForm)
				if(this.prescriptionDrugList.length > 0){
					this.buttonType = "primary"
					this.buttonDisabled = false
					this.toolDisabled = true
				}
				this.drugSettingDialogVisible = false
				this.$refs.addDrugFormRef.resetFields();
			},
			changeUsage(event){
				this.addDrugForm.usageCode = event.itemCode
				this.addDrugForm.usageName = event.itemName
				if(this.addDrugForm.usageName==null||this.addDrugForm.frequencyName==null){
					this.settingToolDisabled = false;
					this.addSettingButtonDisabled = true;
				}
				else{
					this.settingToolDisabled = true;
					this.addSettingButtonDisabled = false;
				}
			},
			changeFrequency(event){
				this.addDrugForm.frequencyCode = event.itemCode
				this.addDrugForm.frequencyName = event.itemName
				if(this.addDrugForm.usageName==null||this.addDrugForm.frequencyName==null){
					this.settingToolDisabled = false;
					this.addSettingButtonDisabled = true;
				}
				else{
					this.settingToolDisabled = true;
					this.addSettingButtonDisabled = false;
				}
			},
			changeDrug(drug){
				this.addDrugForm.drugId = drug.drugId
				this.addDrugForm.drugName = drug.drugName
				this.addDrugForm.specification = drug.specification
				this.addDrugForm.price = drug.price
				this.addDrugForm.dose = drug.dose
				this.addDrugForm.doseUnit = drug.doseUnit
				this.addDrugForm.packUnit = drug.packUnit
				this.drug = event
			},
			async addPres(){
				const {data:res} = await this.$http.post("addPrescription",{
					orgId:this.patientInfo.orgId,
					userId:this.patientInfo.createUserId,
					consultId:this.patientInfo.consultId,
					prescriptionType: '1',
					doctorId:this.patientInfo.doctorId,
					doctorName:this.patientInfo.doctorName								
				});
				if (res.flag != "success"){
					return this.$message.error("操作失败");
				}
				let id = res.data.prescriptionId
				let drugsList = [];
				let flag = 1
				for(let item of this.consultPre){
					if(item.consultId == this.patientInfo.consultId) {
						flag = 0;
						drugsList = item.drugs;
						item.commitFlag = 1;
					}
				}
				if(flag == 1) {
					this.consultPre.push({
						consultId: this.patientInfo.consultId,
						commitFlag: 1,
						drugs: this.prescriptionDrugList
					})
					drugsList = this.prescriptionDrugList
				}
				let i = 1;
				for(let item of drugsList){
					item.prescriptionId = id,
					item.sortNumber = i;
					i++;
					console.log("item",item)
					const {data:res1} = await this.$http.post("addPrescriptionDrug",item);
					if (res1 != "success"){
						return this.$message.error("操作失败");
					}
				}
				const {data:res2} = await this.$http.get("editPrescription",{
					params:{
						prescriptionId: id
					}
				});
				if (res2 != "success"){
					return this.$message.error("操作失败");
				}
				this.$message.success("操作成功");
				this.prescriptionDialogVisible = false
				this.buttonType = "info"
				this.buttonDisabled = true
				this.toolTip="处方已提交，无法重复提交，请完成接诊"
				this.toolDisabled = false
				this.getAcceptList();
			},
		}
		
	}
</script>

<style lang="less" scoped>
	.el-breadcrumb{
		margin-bottom: 15px;
		font-size: 17px;
	}
	.consult-title{
		color: grey;
	}
	.state{
		padding: 10px 0;
	}
	.info{
		float: right;
	}
	.content{
		background-color: white;
		padding: 10px 20px;
	}
	.pres{
		border: 1px solid #ecf5ff;
		border-radius: 10px;
		overflow: hidden;
	}
	.title{
		height: 50px;
		background: #ECF5FF;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-left: 10px;
	}
</style>
