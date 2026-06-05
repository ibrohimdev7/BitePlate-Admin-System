import { useEffect, useMemo, useState } from "react";
import { CreditCard, Printer, ReceiptText } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getBillByTable, payBill } from "../api/billing";
import { BillView } from "../components/billing/BillView";
import { Button } from "../components/common/Button";
import { PageWrapper } from "../components/layout/PageWrapper";
import { queryClient } from "../queryClient";
import { useTables } from "../hooks/useTables";
import { useSocketStore } from "../store/socketStore";
import type { Bill } from "../types";

const getBillTotal = (bill: Bill) => {
  const subtotal = bill.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = subtotal * bill.discountRate;
  const tax = (subtotal - discount) * bill.taxRate;
  return bill.total ?? subtotal - discount + tax + bill.tip;
};

export function Billing() {
  const [tableId, setTableId] = useState("");
  const [splitCount, setSplitCount] = useState(2);
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "SPLIT">(
    "CARD",
  );
  const addNotification = useSocketStore((state) => state.addNotification);
  const tablesQuery = useTables();
  const tables = tablesQuery.data ?? [];
  const selectedTable = useMemo(
    () => tables.find((table) => table.id === tableId) ?? null,
    [tableId, tables],
  );
  const billingLabel = selectedTable ? `#${selectedTable.number}` : tableId;
  useEffect(() => {
    if (!tableId && tables[0]) {
      setTableId(tables[0].id);
    }
  }, [tableId, tables]);
  const billQuery = useQuery({
    queryKey: ["bill", tableId],
    queryFn: () =>
      getBillByTable(selectedTable?.id ?? tableId, selectedTable?.number),
    enabled: Boolean(tableId),
  });
  const paymentMutation = useMutation({
    mutationFn: (bill: Bill) =>
      payBill(bill.id!, {
        paymentMethod,
        tipAmount,
        splitCount: paymentMethod === "SPLIT" ? splitCount : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tables"] });
      void queryClient.invalidateQueries({ queryKey: ["bill", tableId] });
    },
  });

  const confirmPayment = () => {
    if (!billQuery.data?.id) {
      addNotification({
        title: "Bill topilmadi",
        message: `Table ${billingLabel} uchun to'lovni tasdiqlab bo'lmadi.`,
        tone: "warning",
      });
      return;
    }
    paymentMutation.mutate(billQuery.data, {
      onSuccess: () => {
        addNotification({
          title: "Payment confirmed",
          message: `Table ${billingLabel} moved to CLEARED.`,
          tone: "success",
        });
      },
      onError: () => {
        addNotification({
          title: "Payment failed",
          message: `Table ${billingLabel} payment was not accepted.`,
          tone: "danger",
        });
      },
    });
  };

  return (
    <PageWrapper
      title="Billing"
      subtitle="Bill lookup, tip, split payment, print preview, and table clearing."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-slate-950">Lookup</h2>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Table</span>
            <select
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              value={tableId}
              onChange={(event) => setTableId(event.target.value)}
            >
              <option value="">Stol tanlang</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  #{table.number} - {table.capacity} seats
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-semibold text-slate-700">Split count</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              min={1}
              type="number"
              value={splitCount}
              onChange={(event) =>
                setSplitCount(Math.max(1, Number(event.target.value)))
              }
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-semibold text-slate-700">Tip amount</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              min={0}
              type="number"
              value={tipAmount}
              onChange={(event) =>
                setTipAmount(Math.max(0, Number(event.target.value)))
              }
            />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["CASH", "CARD", "SPLIT"] as const).map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </Button>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              icon={<CreditCard className="h-4 w-4" />}
              onClick={confirmPayment}
            >
              Confirm payment
            </Button>
            <Button variant="secondary" icon={<Printer className="h-4 w-4" />}>
              Print preview
            </Button>
          </div>
        </section>
        <div>
          {billQuery.data && (
            <BillView bill={billQuery.data} splitCount={splitCount} />
          )}
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-forest-700" />
              <h2 className="font-bold text-slate-950">Payment form</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Selected method: {paymentMethod}. Receipt export is ready for
              backend PDF generation.
            </p>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
