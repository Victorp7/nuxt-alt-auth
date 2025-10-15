import AuthModule from '..'

export default defineNuxtConfig({
    modules: [
        AuthModule as any,
        "@nuxt-alt/http",
        "@nuxt-alt/proxy",
    ],
    auth: {
        strategies: {
            discord: {
                clientId: '',
                clientSecret: '',
            }
        }
    },
});
