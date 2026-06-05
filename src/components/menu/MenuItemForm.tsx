import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../common/Button";
import { useTranslation } from "react-i18next";

const menuSchema = z.object({
  name: z.string().min(2, "Nom required"),
  price: z.coerce.number().positive("Narx > 0"),
  sectionId: z.string().min(1, "Bo'lim required")
});

type MenuFormValues = z.infer<typeof menuSchema>;

export function MenuItemForm({ sections, onSubmit }: { sections: Array<{ id: string; name: string }>; onSubmit: (values: MenuFormValues) => void }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { sectionId: "" }
  });

  useEffect(() => {
    if (sections[0]) reset((values) => ({ ...values, sectionId: values.sectionId || sections[0].id }));
  }, [sections, reset]);

  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="text-sm">
        <span className="font-semibold text-slate-700">{t("pages.menu.name")}</span>
        <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" {...register("name")} />
        {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
      </label>
      <label className="text-sm">
        <span className="font-semibold text-slate-700">{t("pages.menu.price")}</span>
        <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="number" {...register("price")} />
        {errors.price && <span className="text-xs text-red-600">{errors.price.message}</span>}
      </label>
      <label className="text-sm">
        <span className="font-semibold text-slate-700">{t("pages.menu.section")}</span>
        <select className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" {...register("sectionId")}>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>{section.name}</option>
          ))}
        </select>
        {errors.sectionId && <span className="text-xs text-red-600">{errors.sectionId.message}</span>}
      </label>
      <div className="flex items-end">
        <Button className="w-full" type="submit">{t("pages.menu.addItem")}</Button>
      </div>
    </form>
  );
}
