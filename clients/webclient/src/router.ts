import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';
import {store} from './store';

Vue.use(VueRouter);

const routes = [
    {
        path: "/welcome",
        name: "welcome",
        component: () => import ("./views/Welcome.vue")
    },
    {
        path: "/user",
        name: "user",
        component: () => import ("./views/Users.vue"),
        children: [
            {
              path: 'profile',
              name: 'userProfile',
              component: () => import ("./components/Users/Profile.vue")
            },
            {
                path: 'calendar',
                name: 'userCalendar',
                component: () => import ("./components/Users/UserCalendar.vue")
            },
            {
                path: 'invoice',
                name: 'invoice',
                component: () => import ("./components/Users/Invoice.vue")
            },
            {
                path: 'info',
                name: 'info',
                component: () => import ("./components/Users/Information.vue")
            }
        ]
    },
    {
        path: "/registrer",
        name: "register",
        component: () => import ("./views/RegisterAccount.vue")
    },
    {
        path: "/admin",
        name: "admin",
        beforeEnter: (to: Route, from: Route, next: Function) => {
            if (to.name == 'admin' && !store.getters.userprofile.isVendor) {
                next({ name: 'welcome' });
            } else {
                next(); 
            }
        },
        component: () => import ("./views/Admin.vue"),
        children: [
            {
              path: 'profile',
              name: 'adminProfile',
              component: () => import ("./components/Admin/Profile.vue")
            },
            {
                path: 'calendar',
                name: 'adminCalendar',
                component: () => import ("./components/Admin/AdminCalendar.vue")
            },
            {
                path: 'payments',
                name: 'payments',
                component: () => import ("./components/Admin/Payments.vue")
            },
            {
                path: 'customers',
                name: 'customers',
                component: () => import ("./components/Admin/Customers.vue")
            }
        ]
    },
    {   path: '*',
        redirect: '/welcome' }
];


const router = new VueRouter({
    mode: 'history',
    routes
});

router.beforeEach((to, from, next) => {
    if (to.path !== '/velkommen') {
        next();
    } else if (!store.getters.token) {
        next({ name: 'welcome' });
    } else {
        next();
    } 
});



export default router;