import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";
import {
  createStaff,
  deactivateStaff,
  deleteStaff,
  getStaff,
  updateStaff,
} from "../api/staff";
import { getBranches } from "../api/branches";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ConfirmDeleteModal } from "../components/common/ConfirmDeleteModal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import {
  StaffFormModal,
  type StaffFormValues,
} from "../components/staff/StaffFormModal";
import { queryClient } from "../queryClient";
import type { Role, StaffUser } from "../types";

const assignableRoles: Array<{ value: Role; label: string }> = [
  { value: "BRANCH_MANAGER", label: "Filial Menejer" },
  { value: "RECEPTIONIST", label: "Resepshn" },
  { value: "SERVER", label: "Ofitsiant/Server" },
  { value: "CASHIER", label: "Kassir" },
];

export function Staff() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState<StaffUser | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaff,
  });
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });
  const staff = data ?? [];
  const branches = branchesQuery.data ?? [];
  const createMutation = useMutation({
    mutationFn: (values: StaffFormValues) =>
      createStaff({
        ...values,
        password: values.password ?? "",
        branchId: values.branchId || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      setFormOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<StaffFormValues> }) => {
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      return updateStaff(id, { ...payload, branchId: payload.branchId || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setEditing(null);
    },
  });
  const deactivateMutation = useMutation({
    mutationFn: deactivateStaff,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setDeleting(null);
    },
  });

  const updateRole = (id: string, role: Role) => {
    updateMutation.mutate({ id, values: { role } });
  };

  const toggleActive = (id: string) => {
    deactivateMutation.mutate(id);
  };

  if (isLoading || branchesQuery.isLoading) return <Spinner />;

  return (
    <PageWrapper
      title={t("pages.staff.title")}
      subtitle={t("pages.staff.subtitle")}
      action={
        <Button
          icon={<UserPlus className="h-4 w-4" />}
          onClick={() => setFormOpen(true)}
        >
          {t("pages.staff.new")}
        </Button>
      }
    >
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_160px_260px] gap-4 border-b border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {staff.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1.4fr_1fr_160px_260px] gap-4 border-b border-slate-100 p-4 text-sm last:border-b-0"
          >
            <div>
              <p className="font-semibold text-slate-950">{user.name}</p>
              <select
                className="focus-ring mt-2 rounded-md border border-slate-200 px-2 py-1"
                value={user.role}
                onChange={(event) =>
                  updateRole(user.id, event.target.value as Role)
                }
              >
                {assignableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="truncate text-slate-600">{user.email}</span>
            <span>
              <Badge tone={user.active ? "green" : "slate"}>
                {user.active ? "Active" : "Inactive"}
              </Badge>
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(user)}>Edit</Button>
              <Button
                variant={user.active ? "danger" : "secondary"}
                size="sm"
                disabled={!user.active}
                onClick={() => toggleActive(user.id)}
              >
                {user.active ? "Deactivate" : "Inactive"}
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleting(user)}>Delete</Button>
            </div>
          </div>
        ))}
      </section>
      <StaffFormModal
        open={formOpen}
        branches={branches}
        loading={createMutation.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => createMutation.mutate(values)}
      />
      <StaffFormModal
        open={Boolean(editing)}
        staff={editing}
        branches={branches}
        loading={updateMutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={(values) => editing && updateMutation.mutate({ id: editing.id, values })}
      />
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        title="Xodimni o'chirish"
        message={`${deleting?.name ?? ""} xodimini butunlay o'chirmoqchimisiz?`}
        loading={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </PageWrapper>
  );
}
