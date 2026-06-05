import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { History } from "lucide-react";
import { sendKitchenCommand, undoKitchenCommand } from "../api/kitchen";
import { updateOrderStatus } from "../api/orders";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { KitchenQueue } from "../components/kitchen/KitchenQueue";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useKitchen } from "../hooks/useKitchen";
import { queryClient } from "../queryClient";
import { useSocketStore } from "../store/socketStore";
import { formatTime } from "../utils/format";

export function Kitchen() {
  const { data, isLoading } = useKitchen();
  const addNotification = useSocketStore((state) => state.addNotification);
  const [history, setHistory] = useState<Array<{ id: string; command: string; at: string }>>([]);
  const commandMutation = useMutation({
    mutationFn: ({ orderId, command }: { orderId: string; command: string }) =>
      command === "UNDO"
        ? undoKitchenCommand()
        : command === "READY"
          ? updateOrderStatus(orderId, "READY")
          : sendKitchenCommand({ orderId, type: command as "PREPARE" | "CANCEL" | "EXPEDITE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["kitchen", "queue"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });

  if (isLoading) return <Spinner />;

  const onCommand = (orderId: string, command: string) => {
    const event = { id: orderId, command, at: new Date().toISOString() };
    setHistory((items) => [event, ...items].slice(0, 20));
    commandMutation.mutate({ orderId, command }, {
      onSuccess: () => {
        addNotification({
          title: `Kitchen command: ${command}`,
          message: `${orderId} command accepted.`,
          tone: command === "CANCEL" ? "danger" : "success"
        });
      },
      onError: () => {
        addNotification({
          title: `Kitchen command failed`,
          message: `${orderId} command was not accepted.`,
          tone: "danger"
        });
      }
    });
  };

  return (
    <PageWrapper title="Kitchen" subtitle="Active queue, command history, allergy alerts, and prep status.">
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <KitchenQueue orders={data ?? []} onCommand={onCommand} />
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-forest-700" />
            <h2 className="font-bold text-slate-950">Command history</h2>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No commands yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((event, index) => (
                <div key={`${event.id}-${event.command}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-950">{event.command} • {event.id}</p>
                  <p className="text-slate-500">{formatTime(event.at)}</p>
                </div>
              ))}
            </div>
          )}
          <Button className="mt-4 w-full" variant="secondary" onClick={() => setHistory([])}>
            Clear history
          </Button>
        </aside>
      </div>
    </PageWrapper>
  );
}
