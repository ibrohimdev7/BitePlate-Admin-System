import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { Branch } from "../../types";

const branchSchema = z.object({
  name: z.string().min(2, "Filial nomi required"),
  address: z.string().min(2, "Manzil required"),
  phone: z.string().min(6, "Telefon required")
});

export type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormModalProps {
  open: boolean;
  branch?: Branch | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => void;
}

export function BranchFormModal({ open, branch, loading, onClose, onSubmit }: BranchFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: "", address: "", phone: "" }
  });

  useEffect(() => {
    reset({
      name: branch?.name ?? "",
      address: branch?.address ?? "",
      phone: branch?.phone ?? ""
    });
  }, [branch, open, reset]);

  return (
    <Modal title={branch ? "Filialni tahrirlash" : "Yangi filial qo'shish"} open={open} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {[
          ["name", "Filial nomi *"],
          ["address", "Manzil *"],
          ["phone", "Telefon *"]
        ].map(([name, label]) => (
          <label key={name} className="block text-sm">
            <span className="font-semibold text-slate-700">{label}</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" {...register(name as keyof BranchFormValues)} />
            {errors[name as keyof BranchFormValues] && <span className="text-xs text-red-600">{errors[name as keyof BranchFormValues]?.message}</span>}
          </label>
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saqlanmoqda..." : "Saqlash"}</Button>
        </div>
      </form>
    </Modal>
  );
}
