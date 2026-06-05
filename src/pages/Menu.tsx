import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ToggleLeft, ToggleRight } from "lucide-react";
import {
  createCombo,
  createMenuItem,
  createMenuSection,
  deleteMenuSection,
  getMenuItems,
  getMenuSections,
  updateMenuItem,
  updateMenuSection,
} from "../api/menu";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ConfirmDeleteModal } from "../components/common/ConfirmDeleteModal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import {
  ComboFormModal,
  type ComboFormValues,
} from "../components/menu/ComboFormModal";
import { MenuItemForm } from "../components/menu/MenuItemForm";
import { MenuSectionTabs } from "../components/menu/MenuSectionTabs";
import {
  SectionFormModal,
  type SectionFormValues,
} from "../components/menu/SectionFormModal";
import { queryClient } from "../queryClient";
import { useAuthStore } from "../store/authStore";
import type { MenuSection } from "../types";
import { formatCurrency } from "../utils/format";

export function Menu() {
  const { t } = useTranslation();
  const branchId = useAuthStore((state) => state.branchId);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(
    null,
  );
  const [deletingSection, setDeletingSection] = useState<MenuSection | null>(
    null,
  );
  const [disabledIds, setDisabledIds] = useState<string[]>([]);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const sectionsQuery = useQuery({
    queryKey: ["menu-sections", branchId],
    queryFn: () => getMenuSections(branchId!),
    enabled: Boolean(branchId),
  });
  const sections = sectionsQuery.data ?? [];

  const activeSectionId = sectionId ?? sections[0]?.id ?? null;
  const { data, isLoading } = useQuery({
    queryKey: ["menu", branchId, activeSectionId],
    queryFn: () => getMenuItems(branchId!, activeSectionId ?? undefined),
    enabled: Boolean(branchId && activeSectionId),
  });
  const allItemsQuery = useQuery({
    queryKey: ["menu-items", branchId],
    queryFn: () => getMenuItems(branchId!),
    enabled: Boolean(branchId),
  });
  const createMutation = useMutation({
    mutationFn: (values: { name: string; price: number; sectionId: string }) =>
      createMenuItem(branchId!, {
        name: values.name,
        description: "",
        basePrice: values.price,
        sectionId: values.sectionId,
        allergens: [],
        isAvailable: true,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["menu", branchId] }),
  });
  const comboMutation = useMutation({
    mutationFn: (values: ComboFormValues) =>
      createCombo(branchId!, {
        name: values.name,
        description: values.description,
        basePrice: values.basePrice,
        sectionId: values.sectionId,
        imageUrl: values.imageUrl,
        allergens: values.allergens,
        isAvailable: values.isAvailable,
        comboItemIds: values.comboItemIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", branchId] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", branchId] });
      setComboModalOpen(false);
    },
  });
  const availabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      updateMenuItem(branchId!, id, { isAvailable }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["menu", branchId] }),
  });
  const sectionMutation = useMutation({
    mutationFn: (values: SectionFormValues) =>
      editingSection
        ? updateMenuSection(branchId!, editingSection.id, values)
        : createMenuSection(branchId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections", branchId] });
      setSectionModalOpen(false);
      setEditingSection(null);
    },
  });
  const deleteSectionMutation = useMutation({
    mutationFn: (id: string) => deleteMenuSection(branchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections", branchId] });
      queryClient.invalidateQueries({ queryKey: ["menu", branchId] });
      setDeletingSection(null);
      setSectionId(null);
    },
  });
  const menu = data ?? [];
  const visibleMenu = useMemo(
    () =>
      menu.filter(
        (item) =>
          !activeSectionId ||
          item.sectionId === activeSectionId ||
          !item.sectionId,
      ),
    [menu, activeSectionId],
  );

  if (!branchId)
    return (
      <PageWrapper
        title={t("pages.menu.title")}
        subtitle={t("pages.menu.branchRequired")}
      >
        <div />
      </PageWrapper>
    );
  if (isLoading || sectionsQuery.isLoading) return <Spinner />;

  return (
    <PageWrapper
      title={t("pages.menu.title")}
      subtitle={t("pages.menu.subtitle")}
    >
      <MenuItemForm
        sections={sections}
        onSubmit={(values) => createMutation.mutate(values)}
      />
      <MenuSectionTabs
        sections={sections}
        activeId={activeSectionId}
        onSelect={setSectionId}
        onAdd={() => setSectionModalOpen(true)}
        onEdit={(section) => {
          setEditingSection(section);
          setSectionModalOpen(true);
        }}
        onDelete={setDeletingSection}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleMenu.map((item) => {
          const available = item.available && !disabledIds.includes(item.id);
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <img
                className="h-44 w-full object-cover"
                src={item.image}
                alt=""
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">{item.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  <Badge tone={available ? "green" : "red"}>
                    {available ? t("pages.menu.available") : t("pages.menu.off")}
                  </Badge>
                </div>
                <p className="mt-4 text-lg font-bold text-forest-700">
                  {formatCurrency(item.price)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.allergens.length === 0 ? (
                    <Badge>{t("pages.menu.noAllergens")}</Badge>
                  ) : (
                    item.allergens.map((allergen) => (
                      <Badge key={allergen} tone="yellow">
                        {allergen}
                      </Badge>
                    ))
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    icon={
                      available ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )
                    }
                    onClick={() => {
                      setDisabledIds((ids) =>
                        ids.includes(item.id)
                          ? ids.filter((id) => id !== item.id)
                          : [...ids, item.id],
                      );
                      availabilityMutation.mutate({
                        id: item.id,
                        isAvailable: !available,
                      });
                    }}
                  >
                    {t("pages.menu.toggle")}
                  </Button>
                  <Button variant="ghost">{t("common.edit")}</Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {sections
        .find((section) => section.id === activeSectionId)
        ?.name.toLowerCase()
        .includes("combo") && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">{t("pages.menu.comboBuilder")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("pages.menu.comboHelp")}
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => setComboModalOpen(true)}
          >
            {t("pages.menu.createCombo")}
          </Button>
        </section>
      )}
      <SectionFormModal
        open={sectionModalOpen}
        section={editingSection}
        loading={sectionMutation.isPending}
        onClose={() => {
          setSectionModalOpen(false);
          setEditingSection(null);
        }}
        onSubmit={(values) => sectionMutation.mutate(values)}
      />
      <ComboFormModal
        open={comboModalOpen}
        sections={sections}
        menuItems={allItemsQuery.data ?? []}
        defaultSectionId={activeSectionId}
        loading={comboMutation.isPending}
        onClose={() => setComboModalOpen(false)}
        onSubmit={(values) => comboMutation.mutate(values)}
      />
      <ConfirmDeleteModal
        open={Boolean(deletingSection)}
        title={t("pages.menu.deleteSection")}
        message={t("pages.menu.deleteSectionMessage", { name: deletingSection?.name ?? "" })}
        loading={deleteSectionMutation.isPending}
        onClose={() => setDeletingSection(null)}
        onConfirm={() =>
          deletingSection && deleteSectionMutation.mutate(deletingSection.id)
        }
      />
    </PageWrapper>
  );
}
