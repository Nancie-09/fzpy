<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
			<el-breadcrumb-item>账户信息</el-breadcrumb-item>
			<el-breadcrumb-item>修改密码</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 列表主体 -->
		<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
			<el-form-item label="密码" prop="password">
				<el-input type="password" v-model="addForm.password" autocomplete="off" style="width: 300px;"></el-input>
			</el-form-item>
			<el-form-item label="确认密码" prop="checkPassword">
				<el-input type="password" v-model="addForm.checkPassword" autocomplete="off" style="width: 300px;"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addAccout">确 定</el-button>
			</el-form-item>
		</el-form>
		
	</div>
</template>

<script>
	export default{
		created() {
			this.doctor = JSON.parse(window.sessionStorage.getItem("doctor"))
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
				doctor:{},
				// 创建表单项目
				addForm: {
					doctorId:0,
					password:'',
					checkPassword:''
				},
				// 验证规则
				addFormRules: {
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
			}
		},
		methods:{
			
			//创建
			addAccout(){
				this.$refs.addFormRef.validate(async valid=>{
					console.log(valid);
					if( !valid ) 
						return;
					// 发起请求
					const {data:res} = await this.$http.post("editDoctorPassword",{
						doctorId: this.doctor.doctorId,
						password: this.addForm.password
					});
					if (res != "success"){
						return this.$message.error("操作失败");
					}
					this.$message.success("修改成功");
				})
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
