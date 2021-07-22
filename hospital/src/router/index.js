import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue' 
import Home from '../components/Home.vue' 
import Welcome from '../components/Welcome.vue' 
import Diagnosis from '../components/Diagnosis.vue'
import Doctor from '../components/Doctor.vue'
import Frequency from '../components/Frequency.vue'
import Usage from '../components/Usage.vue'
import Drug from '../components/Drug.vue'
import Accout from '../components/Accout.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		redirect: '/login'
	},
	{
		path: '/login',
		component: Login
	},
	{
		path: '/home',
		component: Home,
		redirect: '/welcome',
		children:[
			{ path: '/welcome',	component: Welcome },
			{ path: '/diagnosis', component: Diagnosis },
			{ path: '/doctor', component: Doctor },
			{ path: '/frequency', component: Frequency },
			{ path: '/usage', component: Usage },
			{ path: '/drug', component: Drug },
			{ path: '/accout', component: Accout }
		]
	}
]

const router = new VueRouter({
  routes
})
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location,onResolve,onReject){
	if(onResolve||onReject) return originalPush.call(this,location,onResolve,onReject)
	return originalPush.call(this,location).catch(err=>err)
}

//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
	//to:将要访问
	//from:从哪访问
	//next:接着干的事情 next(url)重定向到url，next()继续访问to路径
	if(to.path == "/login")
		return next();
	//获取student
	const flag = window.sessionStorage.getItem("admin");
	if(!flag) return next("/login");//无值，返回登录页面
	next();//符合要求，放行
})

export default router
