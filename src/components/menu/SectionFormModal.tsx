import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { MenuSection } from "../../types";
import { useTranslation } from "react-i18next";

const sectionSchema = z.object({
  name: z.string().min(2, "Bo'lim nomi required"),
  displayOrder: z.coerce.number().min(0).optional(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

export function SectionFormModal({
  open,
  section,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  section?: MenuSection | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: SectionFormValues) => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { name: "", displayOrder: 0 },
  });

  useEffect(() => {
    reset({
      name: section?.name ?? "",
      displayOrder: section?.displayOrder ?? 0,
    });
  }, [open, section, reset]);

  return (
    <Modal
      title={section ? t("pages.menu.editSection") : t("pages.menu.newSection")}
      open={open}
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">{t("pages.menu.sectionTitle")}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t("pages.menu.sectionHelp")}
          </p>
        </div>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">{t("pages.menu.sectionName")} *</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-xs text-red-600">{errors.name.message}</span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">{t("pages.menu.displayOrder")}</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            type="number"
            {...register("displayOrder")}
          />
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
