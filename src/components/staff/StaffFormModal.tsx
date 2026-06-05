import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { Role, StaffUser } from "../../types";

const staffSchema = z.object({
  name: z.string().min(2, "Ism required"),
  email: z.string().email("Email required"),
  password: z.string().optional(),
  role: z.enum([
    "SUPER_ADMIN",
    "BRANCH_MANAGER",
    "RECEPTIONIST",
    "SERVER",
    "CASHIER",
  ]),
  branchId: z.string().optional().or(z.literal("")),
}).superRefine((values, ctx) => {
  if (values.password && values.password.length < 6) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "Parol kamida 6 belgidan iborat bo'lsin" });
  }
});

export type StaffFormValues = z.infer<typeof staffSchema>;

export function StaffFormModal({
  open,
  staff,
  branches,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  staff?: StaffUser | null;
  branches: Array<{ id: string; name: string }>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: StaffFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "SERVER",
      branchId: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: staff?.name ?? "",
        email: staff?.email ?? "",
        password: "",
        role: staff?.role ?? "SERVER",
        branchId: staff?.branchId ?? "",
      });
    }
  }, [open, reset, staff]);

  return (
    <Modal title={staff ? "Xodimni tahrirlash" : "Yangi xodim"} open={open} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Ism *</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-xs text-red-600">{errors.name.message}</span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Email *</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-600">{errors.email.message}</span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">{staff ? "Yangi parol" : "Parol *"}</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-red-600">
              {errors.password.message}
            </span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Rol *</span>
          <select
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            {...register("role")}
          >
            {(
              [
                "SUPER_ADMIN",
                "BRANCH_MANAGER",
                "RECEPTIONIST",
                "SERVER",
                "CASHIER",
              ] as Role[]
            ).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && (
            <span className="text-xs text-red-600">{errors.role.message}</span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Filial</span>
          <select
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            {...register("branchId")}
          >
            <option value="">Tayin qilinmagan</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
