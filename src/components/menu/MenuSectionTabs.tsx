import { Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "../common/Button";
import type { MenuSection } from "../../types";
import { useTranslation } from "react-i18next";

interface MenuSectionTabsProps {
  sections: MenuSection[];
  activeId: string | null;
  onSelect: (sectionId: string) => void;
  onAdd: () => void;
  onEdit: (section: MenuSection) => void;
  onDelete: (section: MenuSection) => void;
}

export function MenuSectionTabs({
  sections,
  activeId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: MenuSectionTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="my-5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="inline-flex h-10 overflow-hidden rounded-md border border-slate-200 bg-white"
            >
              <button
                className={`px-4 text-sm font-semibold ${activeId === section.id ? "bg-forest-700 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                onClick={() => onSelect(section.id)}
              >
                {section.name}
              </button>
              <button
                className="border-l border-slate-200 px-2 text-slate-500 hover:bg-slate-50"
                aria-label="Edit section"
                onClick={() => onEdit(section)}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                className="border-l border-slate-200 px-2 text-red-600 hover:bg-red-50"
                aria-label="Delete section"
                onClick={() => onDelete(section)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={onAdd}
        >
          {t("pages.menu.addSection")}
        </Button>
      </div>
    </div>
  );
}
