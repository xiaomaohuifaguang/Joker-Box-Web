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
      path: '/dynamicForm/:id/:version',
      name: 'dynamicForm_edit',
      component: () => import('@/views/main/dynamicForm/IndexView.vue'),
      meta: { title: '动态表单', requiresAuth: true, onlyLogin: true },
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
          meta: { title: '个人空间', requiresAuth: true, onlyLogin: true },
        },
        {
          path: 'process',
          name: 'process',
          component: () => import('@/views/main/process/IndexView.vue'),
          meta: { title: '流程审批', requiresAuth: true, onlyLogin: true },
        },
        {
          path: 'ganDaShi',
          name: 'ganDaShi',
          component: () => import('@/views/main/ganDaShi/IndexView.vue'),
          meta: { title: '干大事论坛', requiresAuth: true, onlyLogin: true },
        },
        {
          path: 'ganDaShi/:username',
          name: 'ganDaShi_by_username',
          component: () => import('@/views/main/ganDaShi/IndexView.vue'),
          meta: { title: '干大事论坛', requiresAuth: true, onlyLogin: true },
        },
        {
          path: 'ganDaShi/:username/:id',
          name: 'ganDaShi_view',
          component: () => import('@/views/main/ganDaShi/PostViewView.vue'),
          meta: { title: '干大事论坛', requiresAuth: true, onlyLogin: true },
        },
        {
          path: '403',
          name: 'main-403',
          component: () => import('@/views/common/403.vue'),
          meta: { title: '403' },
        },
        {
          path: 'tools/jsonFormat',
          name: 'tools-jsonFormat',
          component: () => import('@/views/main/tools/JsonFormatView.vue'),
          meta: { title: '工具箱|JSON', requiresAuth: true, onlyLogin: true },
        },
        {
          path: 'tools/signInCard',
          name: 'tools-signInCard',
          component: () => import('@/views/common/Doing.vue'),
          meta: { title: '工具箱|签到卡', requiresAuth: true, onlyLogin: true },
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
          component: () => import('@/views/common/Doing.vue'),
          meta: { title: 'NotFound', requiresAuth: false },
        },
        {
          path: '403',
          name: 'console-403',
          component: () => import('@/views/common/403.vue'),
          meta: { title: '403', requiresAuth: false },
        },
        {
          path: '',
          name: 'console-index',
          component: () => import('@/views/console/IndeView.vue'),
          meta: { title: '控制台', requiresAuth: false },
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
          path: 'dynamicForm-manager',
          name: 'dynamicForm-manager',
          component: () => import('@/views/console/dynamicForm/IndexView.vue'),
          meta: { title: '表单管理' },
        },
        {
          path: 'process-manager',
          name: 'process-manager',
          component: () => import('@/views/console/processManager/IndexView.vue'),
          meta: { title: '流程管理' },
        },
        {
          path: 'settings/system-manager',
          name: 'system-manager',
          component: () => import('@/views/common/Doing.vue'),
          meta: { title: '系统设置', requiresAuth: false },
        },
        {
          path: 'system/system-prompt',
          name: 'system-prompt',
          component: () => import('@/views/console/system/prompt/IndexView.vue'),
          meta: { title: '系统提示' },
        },
        {
          path: 'mail-manager',
          name: 'mail-manager',
          component: () => import('@/views/console/mail/IndexView.vue'),
          meta: { title: '邮件记录' },
        },
        {
          path: 'crawler-task-manager',
          name: 'crawler-task-manager',
          component: () => import('@/views/console/crawlerTask/IndexView.vue'),
          meta: { title: '爬虫任务' },
        },
        {
          path: 'ai/model-manager',
          name: 'ai-model-manager',
          component: () => import('@/views/console/ai/model/IndexView.vue'),
          meta: { title: '模型管理' },
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
  if (token == null) {
    // return "/";
  }

  if (to.meta.requiresAuth) {
    // 此路由需要授权，请检查是否已登录
    let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
    if (token && token != null) {
      // return true;
      if (!to.meta.onlyLogin && !userInfo().authPaths.includes(to.path)) {
        if (to.path !== '/console') {
          return '/404'
        } else {
          return '/console/404'
        }
      }
    } else {
      // 如果没有，则重定向到登录页面
      return '/404'
      // return {
      //   path: '/login',
      //   // 保存我们所在的位置，以便以后再来
      //   query: { redirect: to.fullPath },
      // }
    }
  }

  if (to.meta.admin) {
    // 此路由需要admin角色
    let token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN)
    if (token && token != null) {
      if (!userInfo().admin) {
        return '/403';
      }
    } else {
      return '/404'
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
