<template>
	<el-container class="home_container">
		<el-header>
			<div>
				<img src="../assets/logo.png" alt="">
			</div>
			<span>复诊配药医生平台</span>
			<el-button type="info" @click="logout">退出</el-button>
		</el-header>
		<el-container>
			<el-aside width="200px">
				<el-menu 
					background-color="#545c64"
					text-color="#fff"
					active-text-color="#409eff"
					:router="true"
					:default-active="activePath">
					<el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id" text-color="#fff">
						<template slot="title">
							<span>{{item.title}}</span>
						</template>
						<el-menu-item  
							:index="it.path+''" 
							v-for="it in item.subMenuList" 
							:key="it.id"
							@click="saveNavState(it.path)">
							<template slot="title" >
								<span>{{it.title}}</span>
							</template>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
	export default{
		data() {
			return{
				menuList:[],
				doctor:{},
				activePath:'/welcome'
			}
		},
		created() {
			this.doctor = JSON.parse(window.sessionStorage.getItem("doctor"))
			this.getMenuList();
			this.activePath = window.sessionStorage.getItem("activePath");
			window.addEventListener('setItem', ()=> {
			    this.getMenuList();
			})
		},
		methods:{
			logout(){
				window.sessionStorage.clear();//清除session
				this.$router.push("/login");//回到首页
			},
			// 获取导航菜单
			async getMenuList(){
				const {data:res} = await this.$http.get("menus");
				console.log(res);
				if(res.flag!=200) 
					return this.$message.error("读取菜单失败！");
				this.menuList = res.menus.splice(4,1);
			},
			//保存导航的路径
			saveNavState(activePath){
				window.sessionStorage.setItem("activePath",activePath);
				this.activePath = activePath
			}
			
		}
	}
</script>

<style lang="less" scoped>
	.el-header{
		background-color: #373d41;
		display: flex;
		justify-content: space-between;/* 左右贴边 */
		padding-left: 0%;
		color: #fff;
		font-size: 20px;
		align-items: center;
		
		
	}
	.home_container{
		height: 100%;
	}
	.el-menu{
		height: 100%;
		border-right: none;
	}
	img{
		width: 55px;
		height: 55px;
	}
	

</style>
