type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

type OrderStatusBadgeProps = {
  status: string;
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function normalizeStatus(status: string): OrderStatus {
  if (status === "confirmed" || status === "shipped" || status === "delivered") {
    return status;
  }
  return "pending";
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalized = normalizeStatus(String(status || "pending").toLowerCase());

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[normalized]}`}>
      {normalized}
    </span>
  );
}
