import { redirect } from "@tanstack/react-router";
import { AuthService } from "@/services/authService";

/**
 * Route guard that redirects to /login if user is not authenticated.
 * Use in route beforeLoad hook.
 * 
 * @example
 * export const Route = createFileRoute("/dashboard")({
 *   beforeLoad: requireAuth,
 *   component: Dashboard,
 * });
 */
export const requireAuth = async () => {
  // Only check on client side
  if (typeof window === "undefined") {
    return;
  }
  
  if (!AuthService.isAuthenticated()) {
    throw redirect({
      to: "/login",
      replace: true,
    });
  }
};

/**
 * Route guard that redirects to "/" if user is already authenticated.
 * Use in /login and /registro routes to prevent authenticated users from accessing them.
 * 
 * @example
 * export const Route = createFileRoute("/login")({
 *   beforeLoad: redirectIfAuthenticated,
 *   component: Login,
 * });
 */
export const redirectIfAuthenticated = async () => {
  // Only check on client side
  if (typeof window === "undefined") {
    return;
  }
  
  if (AuthService.isAuthenticated()) {
    throw redirect({
      to: "/",
      replace: true,
    });
  }
};
