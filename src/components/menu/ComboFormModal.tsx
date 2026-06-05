import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { MenuItem, MenuSection } from "../../types";

const comboSchema = z.object({
  name: z.string().min(2, "Combo nomi required"),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Narx required"),
  sectionId: z.string().min(1, "Bo'lim required"),
  imageUrl: z.string().optional(),
  allergensText: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export type ComboFormValues = Omit<
  z.infer<typeof comboSchema>,
  "allergensText"
> & {
  allergens: string[];
  comboItemIds: string[];
};

export function ComboFormModal({
  open,
  sections,
  menuItems,
  defaultSectionId,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  sections: MenuSection[];
  menuItems: MenuItem[];
  defaultSectionId?: string | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ComboFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof comboSchema>>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      sectionId: "",
      imageUrl: "",
      allergensText: "",
      isAvailable: true,
    },
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedItems = useMemo(() => menuItems, [menuItems]);

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        description: "",
        basePrice: 0,
        sectionId: defaultSectionId ?? sections[0]?.id ?? "",
        imageUrl: "",
        allergensText: "",
        isAvailable: true,
      });
      setSelectedIds([]);
    }
  }, [defaultSectionId, open, reset, sections]);

  return (
    <Modal title="Yangi combo" open={open} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          onSubmit({
            ...values,
            allergens: values.allergensText
              ? values.allergensText
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],
            comboItemIds: selectedIds,
          }),
        )}
      >
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Nomi *</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-xs text-red-600">{errors.name.message}</span>
          )}
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Tavsif</span>
          <textarea
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            rows={3}
            {...register("description")}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Narx *</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              type="number"
              {...register("basePrice")}
            />
            {errors.basePrice && (
              <span className="text-xs text-red-600">
                {errors.basePrice.message}
              </span>
            )}
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Bo'lim *</span>
            <select
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              {...register("sectionId")}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            {errors.sectionId && (
              <span className="text-xs text-red-600">
                {errors.sectionId.message}
              </span>
            )}
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Rasm URL</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            {...register("imageUrl")}
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Allergenlar</span>
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            placeholder="masalan: nuts, dairy"
            {...register("allergensText")}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" {...register("isAvailable")} />
          Hozircha faol
        </label>
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Combo itemlar *
          </div>
          <div className="max-h-60 space-y-2 overflow-auto rounded-md border border-slate-200 p-3">
            {sortedItems.length === 0 ? (
              <p className="text-sm text-slate-500">
                Hozircha tanlanadigan item yo'q.
              </p>
            ) : (
              sortedItems.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(event) =>
                        setSelectedIds((current) =>
                          event.target.checked
                            ? [...current, item.id]
                            : current.filter((id) => id !== item.id),
                        )
                      }
                    />
                    <span className="truncate font-semibold text-slate-950">
                      {item.name}
                    </span>
                  </span>
                  <span className="text-slate-500">
                    {item.sectionName ?? item.category}
                  </span>
                </label>
              ))
            )}
          </div>
          {selectedIds.length === 0 && (
            <p className="mt-2 text-xs text-red-600">
              Kamida bitta item tanlang.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={loading || selectedIds.length === 0}>
            {loading ? "Yaratilmoqda..." : "Yaratish"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
