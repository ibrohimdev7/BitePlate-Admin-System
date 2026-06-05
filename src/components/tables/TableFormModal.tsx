import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { RestaurantTable } from "../../types";
import { useTranslation } from "react-i18next";

const tableSchema = z.object({
  number: z.coerce.number().int().positive("Stol raqami required"),
  capacity: z.coerce.number().int().positive("Sig'im required"),
});

export type TableFormValues = z.infer<typeof tableSchema>;

export function TableFormModal({
  open,
  table,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  table?: RestaurantTable | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: TableFormValues) => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: { number: 1, capacity: 4 },
  });

  useEffect(() => {
    if (open) {
      reset({ number: table?.number ?? 1, capacity: table?.capacity ?? 4 });
    }
  }, [open, reset, table]);

  return (
    <Modal title={table ? t("pages.tables.editTitle") : t("pages.tables.createTitle")} open={open} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">{t("pages.tables.number")} *</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            type="number"
            {...register("number")}
          />
          {errors.number && (
            <span className="text-xs text-red-600">
              {errors.number.message}
            </span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">{t("pages.tables.capacityLabel")} *</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            type="number"
            {...register("capacity")}
          />
          {errors.capacity && (
            <span className="text-xs text-red-600">
              {errors.capacity.message}
            </span>
          )}
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
