import { useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBranch, deleteBranch, getBranches, updateBranch } from "../api/branches";
import { BranchFormModal, type BranchFormValues } from "../components/branches/BranchFormModal";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ConfirmDeleteModal } from "../components/common/ConfirmDeleteModal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import { queryClient } from "../queryClient";
import type { Branch } from "../types";

export function Branches() {
  const [editing, setEditing] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState<Branch | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["branches"], queryFn: getBranches });

  const saveMutation = useMutation({
    mutationFn: (values: BranchFormValues) => editing ? updateBranch(editing.id, values) : createBranch(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setFormOpen(false);
      setEditing(null);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setDeleting(null);
    }
  });

  if (isLoading) return <Spinner />;

  return (
    <PageWrapper
      title="Filiallar"
      subtitle="Restoran filiallari ro'yxati va sozlamalari."
      action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>Yangi filial</Button>}
    >
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.2fr_1.4fr_1fr_110px_120px] gap-4 border-b border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          <span>Nomi</span>
          <span>Manzil</span>
          <span>Telefon</span>
          <span>Holat</span>
          <span>Amal</span>
        </div>
        {(data ?? []).map((branch) => (
          <div key={branch.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_110px_120px] gap-4 border-b border-slate-100 p-4 text-sm last:border-b-0">
            <span className="font-semibold text-slate-950">{branch.name}</span>
            <span className="text-slate-600">{branch.address}</span>
            <span className="text-slate-600">{branch.phone}</span>
            <span><Badge tone={branch.active ? "green" : "slate"}>{branch.active ? "Aktiv" : "Arxiv"}</Badge></span>
            <span className="flex gap-2">
              <Button size="icon" variant="secondary" aria-label="Edit branch" onClick={() => { setEditing(branch); setFormOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
              <Button size="icon" variant="danger" aria-label="Delete branch" onClick={() => setDeleting(branch)}><Trash2 className="h-4 w-4" /></Button>
            </span>
          </div>
        ))}
      </section>
      <BranchFormModal open={formOpen} branch={editing} loading={saveMutation.isPending} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={(values) => saveMutation.mutate(values)} />
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        title="Filialni o'chirmoqchimisiz?"
        message={`"${deleting?.name ?? ""}" filialini o'chirsangiz barcha bog'liq ma'lumotlar arxivlanadi.`}
        loading={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </PageWrapper>
  );
}
