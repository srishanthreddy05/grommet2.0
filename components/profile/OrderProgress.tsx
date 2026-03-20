type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

type OrderProgressProps = {
  status: string;
};

const STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

function normalizeStatus(status: string): OrderStatus {
  if (status === "confirmed" || status === "shipped" || status === "delivered") {
    return status;
  }
  return "pending";
}

export default function OrderProgress({ status }: OrderProgressProps) {
  const normalized = normalizeStatus(String(status || "pending").toLowerCase());
  const activeIndex = STEPS.indexOf(normalized);

  return (
    <div className="grid grid-cols-4 gap-2 pt-2">
      {STEPS.map((step, idx) => {
        const done = idx <= activeIndex;
        return (
          <div key={step} className="space-y-1">
            <div className={`h-1.5 rounded-full ${done ? "bg-brand-black" : "bg-brand-gray-200"}`} />
            <p className={`text-[11px] capitalize ${done ? "text-brand-black" : "text-brand-gray-400"}`}>{step}</p>
          </div>
        );
      })}
    </div>
  );
}
