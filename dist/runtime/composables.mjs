import { useNuxtApp } from "#imports";
export const useAuth = () => useNuxtApp().$auth;
