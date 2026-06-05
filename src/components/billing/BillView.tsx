import type { Bill } from "../../types";
import { formatCurrency } from "../../utils/format";

export function BillView({ bill, splitCount }: { bill: Bill; splitCount: number }) {
  const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * bill.discountRate;
  const tax = (subtotal - discount) * bill.taxRate;
  const total = subtotal - discount + tax + bill.tip;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Bill</p>
          <h2 className="text-xl font-bold text-slate-950">Table #{bill.tableNumber}</h2>
        </div>
        <p className="text-sm font-semibold text-forest-700">{bill.orderIds.join(", ")}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {bill.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3 text-sm">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Discount strategy</dt><dd>-{formatCurrency(discount)}</dd></div>
        <div className="flex justify-between"><dt>Tax</dt><dd>{formatCurrency(tax)}</dd></div>
        <div className="flex justify-between"><dt>Tip</dt><dd>{formatCurrency(bill.tip)}</dd></div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950">
          <dt>Total</dt><dd>{formatCurrency(total)}</dd>
        </div>
        <div className="flex justify-between text-forest-700">
          <dt>Per person</dt><dd>{formatCurrency(total / splitCount)}</dd>
        </div>
      </dl>
    </section>
  );
}
