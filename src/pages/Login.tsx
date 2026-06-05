import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/common/Button";
import { useAuthStore } from "../store/authStore";
import { defaultPathForRole } from "../utils/roleCheck";

const loginSchema = z.object({
  email: z.string().email("Email format noto'g'ri"),
  password: z.string().min(8, "Parol kamida 8 belgi")
});

type LoginValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "manager@biteplate.test", password: "password123" }
  });

  if (token && role) {
    return <Navigate to={defaultPathForRole(role)} replace />;
  }

  const onSubmit = async (values: LoginValues) => {
    setError("");
    try {
      await login(values);
      const state = location.state as { from?: { pathname?: string } } | null;
      const nextRole = useAuthStore.getState().role;
      navigate(state?.from?.pathname ?? (nextRole ? defaultPathForRole(nextRole) : "/dashboard"), { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Server xatosi");
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_460px]">
      <section className="hidden bg-[url('https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center lg:block">
        <div className="flex h-full items-end bg-forest-900/55 p-12">
          <div className="max-w-2xl text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">BitePlate Admin</p>
            <h1 className="mt-3 text-5xl font-bold leading-tight">Restaurant operations, live and under control.</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-50">
              Orders, kitchen commands, tables, billing, reservations, and reports in one role-aware workspace.
            </p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-md bg-forest-700 p-3 text-white">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">BitePlate</p>
              <p className="text-sm text-slate-500">Admin panel login</p>
            </div>
          </div>
          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Email</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" {...register("email")} />
            {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-semibold text-slate-700">Password</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" {...register("password")} />
            {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}
          </label>
          <Button className="mt-6 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          <div className="mt-5 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            Demo: manager@biteplate.test / password123
          </div>
        </form>
      </section>
    </main>
  );
}
