import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { MenuItem, OrderItem } from "../../types";
import { formatCurrency } from "../../utils/format";

export function ReplaceMealModal({
  open,
  item,
  menu,
  loading,
  onClose,
  onSubmit
}: {
  open: boolean;
  item: OrderItem | null;
  menu: MenuItem[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (newMenuItemId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const filteredMenu = useMemo(
    () => menu.filter((menuItem) => menuItem.id !== item?.menuItemId && menuItem.name.toLowerCase().includes(query.toLowerCase())),
    [item?.menuItemId, menu, query]
  );

  return (
    <Modal title="Taomni almashtirish" open={open} onClose={onClose}>
      {item && (
        <div className="space-y-4">
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700"><span className="font-semibold">Joriy taom:</span> {item.name}</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className="focus-ring w-full rounded-md border border-slate-200 py-2 pl-9 pr-3" placeholder="Qidirish..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="max-h-72 space-y-2 overflow-auto">
            {filteredMenu.map((menuItem) => (
              <label key={menuItem.id} className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 p-3 text-sm hover:bg-slate-50">
                <span className="flex items-center gap-3">
                  <input type="radio" name="newMenuItemId" value={menuItem.id} checked={selectedId === menuItem.id} onChange={(event) => setSelectedId(event.target.value)} />
                  <span className="font-semibold text-slate-950">{menuItem.name}</span>
                </span>
                <span className="text-slate-600">{formatCurrency(menuItem.price)}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
            <Button disabled={!selectedId || loading} onClick={() => onSubmit(selectedId)}>{loading ? "Almashtirilmoqda..." : "Almashtirish"}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
