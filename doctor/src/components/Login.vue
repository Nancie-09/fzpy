<template>
	<div class="login-container">
		<!-- 登陆块 -->
		<div class="login-box">
			<!-- 头像 -->
			<div class="avator-box">
				<img src="../assets/logo.png" />
			</div>
			<!-- 表单区域 -->
			<el-form :rules="loginRules"
				ref="loginFormRef" 
				:model="loginForm" 
				class="login-form"
				label-width="0">
				<!-- 手机号 -->
				<el-form-item prop="doctorPhone">
					<el-input 
						v-model="loginForm.doctorPhone" 
						prefix-icon="iconfont icon-login"></el-input>
				</el-form-item>
				<!-- 密码 -->
				<el-form-item prop="password">
					<el-input 
						v-model="loginForm.password"
						prefix-icon="iconfont icon-mima"
						type="password"></el-input>
				</el-form-item>
				<!-- 按钮 -->
				<el-form-item class="button">
					<el-button 
						type="primary"
						@click="login">登录</el-button>
					<el-button 
						type="info" 
						@click="resetLoginForm">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default{
		data() {
			return{
				//表单数据对象
				loginForm: {
					doctorPhone:'',
					password:''
				},
				//验证规则
				loginRules: {
					//校验用户名
					doctorPhone: [
						{
							require: true,
							message: '请输入手机号',
							trigger: 'blur'//失去焦点事件
						},//必填项验证
					],
					//校验密码
					password: [
						{
							require: true,
							message: '请输入密码',
							trigger: 'blur'//失去焦点事件
						},
					]
				},
			}
		},
		methods:{
			//重置表单内容
			resetLoginForm(){
				this.$refs.loginFormRef.resetFields();
			},
			//登录方法
			login(){
				//验证校验规则
				this.$refs.loginFormRef.validate(async valid=>{
					//验证失败
					if(!valid){
						return
					}
					//访问后台
					const {data:res} = await this.$http.post("loginDoctorByPhone",this.loginForm)
					if(res.flag == 'ok'){
						this.$message.success("登录成功！");//信息提示
						//存储doctor对象
						window.sessionStorage.setItem("doctor",JSON.stringify(res.data));
						this.$router.push({path:"/home"});//页面路由跳转
					}else{
						this.$message.error(res.flag);//错误提示
					}
				});
			}
		}
		
		
	}
</script>

<style lang="less" scoped>
	.login-container{
		background-color: #2b4b6b;
		height: 100%;
	}
	.login-box{
		width: 450px;
		height: 300px;
		background-color: #fff;
		border-radius: 3px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
		
		.avator-box{
			width: 130px;
			height: 130px;
			border: 1px solid #0ee;
			border-radius: 50%;
			padding: 5px;
			box-shadow: 0 0 2px #ddd;
			position: absolute;
			left: 50%;
			transform: translate(-50%,-50%);
			background-color: #eee;
			
			img{
				width: 100%;
				height: 100%;
				border-radius: 50%;
				background-color: #eee;
			}
		}
		
	}
	.button{
		display: flex;
		justify-content: flex-end;
	}
	.login-form{
		position: absolute;
		bottom: 0%;
		width: 100%;
		padding: 0 10px;
		box-sizing: border-box;
	}
</style>
