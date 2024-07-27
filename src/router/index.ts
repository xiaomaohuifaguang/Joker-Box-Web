import CONSTANTS from '@/utils/constants';
import { createRouter, createWebHistory } from 'vue-router'
import { getToken, http } from '@/utils'
import { saveUserInfo } from '@/utils'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/SignInView.vue') ,
      meta: { title: '注册' },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/main/HomeView.vue') ,
      meta: { title: '主页' },
      children:[
        { 
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/views/common/NotFound.vue'), 
          meta: { title: 'NotFound' },
        },
        {
          path: '',
          name: 'main_home',
          component: () => import('@/views/main/MainView.vue'),
          meta: { title: '主页' },
        },
        {
          path: 'fileServer',
          name: 'main_fileServer',
          component: () => import('@/views/main/fileServer/FileServerView.vue'),
          meta: { title: '主页' },
        }
      ]
    },
    {
      path: '/my',
      name: 'my',
      component: () => import('@/views/my/HomeView.vue') ,
      meta: { title: '我的' },
      children:[
        { 
          path: '/:pathMatch(my.*)*',
          name: 'MyNotFound',
          component: () => import('@/views/common/NotFound.vue'), 
          meta: { title: 'NotFound' },
        },
        {
          path: '',
          name: 'my_home',
          component: () => import('@/views/my/MainView.vue'),
          meta: { title: '我的' },
        }
      ]
    },
    {
      path: '/console',
      name: 'console',
      component: () => import('@/views/console/HomeView.vue'),
      meta: { title: '控制台' },
      children:[
        { 
          path: ':pathMatch(.*)*',
          name: 'consoleNotFound',
          component: () => import('@/views/common/NotFound.vue'),
          meta: { title: 'NotFound' },
        },
        {
          path: '',
          name: 'console_main_home',
          component: () => import('@/views/console/MainView.vue'),
          meta: { title: '主页' },
        },
        {
          path: 'auth/userManager',
          name: 'console_auth_user_manager',
          component: () => import('@/views/console/auth/user/UserManagerView.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'auth/roleManager',
          name: 'console_auth_role_manager',
          component: () => import('@/views/console/auth/role/RoleManagerView.vue'),
          meta: { title: '角色管理' },
        },
        {
          path: 'auth/apiManager',
          name: 'console_auth_api_manager',
          component: () => import('@/views/console/auth/api/ApiManagerView.vue'),
          meta: { title: '角色管理' },
        }
      ]
    }
  ]
})

router.beforeEach((to, from) => {
  if (to.meta.title) {
    document.title = CONSTANTS.SYSTEM.NAME+' | '+to.meta.title;
  }

  const token = getToken()
  if(to.name === 'login' || to.name === 'signin') {
    if(token && token != null){
      return "/";
    }else{
      return true;
    }
  }else{
    http.result({
      server: 'AUTH',
      url: '/auth/userInfo',
      method: 'POST',
      success(result){
        saveUserInfo(result.data)
      }
    })
  }

  return token && token !=null ? true : "/login";
  
})


export default router
