import { createRouter, createWebHistory } from 'vue-router'
import { CONSTANTS, http, saveUserInfo, userInfo } from '@/utils';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/common/Test.vue'),
      meta: { title: '测试' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/MainView.vue'),
      children: [
        {
          path: '/:pathMatch(.*)*',
          name: 'main-notfound',
          component: () => import('@/views/common/NotFound.vue'),
          meta: { title: 'NotFound' },
        },
        {
          path: '',
          name: 'main-index',
          component: () => import('@/views/main/IndeView.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'website',
          name: 'main-website',
          component: () => import('@/views/main/WebsiteView.vue'),
          meta: { title: '网站收藏' },
        },
        {
          path: 'file-server',
          name: 'file-server',
          component: () => import('@/views/main/fileServer/IndexView.vue'),
          meta: { title: '码头', requiresAuth: true, },
        },
        {
          path: 'code-maker',
          name: 'code-maker',
          component: () => import('@/views/main/codeMaker/CodeMakerView.vue'),
          meta: { title: '代码生成器', requiresAuth: true, },
        },
        {
          path: 'person-space',
          name: 'person-space',
          component: () => import('@/views/main/personSpace/IndexView.vue'),
          meta: { title: '个人空间', requiresAuth: true, },
        },
        {
          path: '403',
          name: 'main-403',
          component: () => import('@/views/common/403.vue'),
          meta: { title: '403' },
        }
      ]
    },
    {
      path: '/console',
      name: 'console',
      component: () => import('@/views/ConsoleView.vue'),
      meta: { title: '控制台', requiresAuth: true, admin: true },
      children: [
        {
          path: '/:pathMatch(console.*)*',
          name: 'console-notfound',
          component: () => import('@/views/common/NotFound.vue'),
          meta: { title: 'NotFound' },
        },
        {
          path: '',
          name: 'console-index',
          component: () => import('@/views/console/IndeView.vue'),
          meta: { title: '控制台' },
        },
        {
          path: 'displayBoard',
          name: 'displayBoard-index',
          component: () => import('@/views/console/displayBoard/IndexView.vue'),
          meta: { title: '展板' },
        },
        {
          path: 'authority/user-manager',
          name: 'user-manager',
          component: () => import('@/views/console/userManager/IndexView.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'authority/role-manager',
          name: 'role-manager',
          component: () => import('@/views/console/roleManager/IndexView.vue'),
          meta: { title: '角色管理' },
        },
        {
          path: 'authority/org-manager',
          name: 'org-manager',
          component: () => import('@/views/console/orgManager/IndexView.vue'),
          meta: { title: '机构管理' },
        },
        {
          path: 'api-manager',
          name: 'api-manager',
          component: () => import('@/views/console/apiManager/IndexView.vue'),
          meta: { title: 'API管理' },
        },
        {
          path: 'menu-manager',
          name: 'menu-manager',
          component: () => import('@/views/console/menuManager/IndexView.vue'),
          meta: { title: '菜单管理' },
        },
        {
          path: 'website-manager',
          name: 'website-manager',
          component: () => import('@/views/console/websiteManager/IndexView.vue'),
          meta: { title: '网站管理' },
        },
        {
          path: 'settings/system-manager',
          name: 'system-manager',
          component: () => import('@/views/common/Doing.vue'),
          meta: { title: '系统设置' },
        }
      ]
    }
  ]
})

router.beforeEach((to, from) => {
  console.log('from: ' + from.path + ', to: ' + to.path)

  if (to.meta.title) {
    document.title = CONSTANTS.SYSTEM.NAME + ' | ' + to.meta.title;
  }

  if (to.name === 'login' || to.name === 'register') {
    let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
    if (token && token != null) {
      return "/";
    } else {
      return true;
    }
  }

  let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
  if (token && token != null) {
    console.log('getUserInfo')
    getUserInfo()
  }

  if (to.meta.requiresAuth) {
    // 此路由需要授权，请检查是否已登录
    let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
    if (token && token != null) {
      // return true;
    } else {
      // 如果没有，则重定向到登录页面
      return {
        path: '/login',
        // 保存我们所在的位置，以便以后再来
        query: { redirect: to.fullPath },
      }
    }
  }

  if (to.meta.admin) {
    // 此路由需要admin角色
    let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
    if (token && token != null) {
      if (!userInfo().admin) {
        return '/403';
      }
    }
  }

  return true;


})

async function getUserInfo() {
  http.result({
    url: '/auth/userInfo',
    method: 'POST',
    success(result) {
      saveUserInfo(result.data)
      return userInfo()
    }
  })
}

export default router
