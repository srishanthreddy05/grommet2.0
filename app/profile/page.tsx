"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { onValue, ref, update } from "firebase/database";
import OrderCard, { type ProfileOrder } from "@/components/profile/OrderCard";

type UserProfileRecord = {
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
};

type StockRecord = {
  name?: string;
  imageUrl?: string;
  displayImage?: string;
  mainImage?: string;
  price?: number;
};

type RawOrderItem = {
  productId?: string;
  name?: string;
  image?: string;
  price?: number;
  quantity?: number;
};

type RawOrder = {
  userId?: string;
  items?: RawOrderItem[];
  products?: Array<{ productId?: string; quantity?: number }>;
  totalAmount?: number;
  totalPrice?: number;
  status?: string;
  createdAt?: number;
};

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

function normalizeStatus(status: string | undefined): string {
  const normalized = String(status || "pending").toLowerCase();
  return STATUS_ORDER.includes(normalized) ? normalized : "pending";
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfileRecord>({});
  const [stockMap, setStockMap] = useState<Record<string, StockRecord>>({});
  const [orders, setOrders] = useState<ProfileOrder[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    const unsub = onValue(
      userRef,
      (snap) => {
        const raw = (snap.val() || {}) as UserProfileRecord;
        setProfile(raw);
        setName(raw.name || raw.displayName || user.displayName || "");
        setPhone(raw.phone || "");
        setProfileLoading(false);
      },
      () => setProfileLoading(false)
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const stockRef = ref(db, "stock");
    const unsub = onValue(stockRef, (snap) => {
      if (!snap.exists()) {
        setStockMap({});
        return;
      }
      setStockMap(snap.val() as Record<string, StockRecord>);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const ordersRef = ref(db, "orders");
    const unsub = onValue(
      ordersRef,
      (snap) => {
        if (!snap.exists()) {
          setOrders([]);
          setOrdersLoading(false);
          return;
        }

        const entries = Object.entries(snap.val() as Record<string, RawOrder>);
        const mapped = entries
          .map(([id, raw]) => {
            const fromItems = Array.isArray(raw.items) ? raw.items : [];
            const fromProducts = Array.isArray(raw.products) ? raw.products : [];

            const items =
              fromItems.length > 0
                ? fromItems.map((item) => ({
                    productId: String(item?.productId || ""),
                    name: String(item?.name || ""),
                    image: String(item?.image || ""),
                    price: Number(item?.price || 0),
                    quantity: Number(item?.quantity || 0),
                  }))
                : fromProducts.map((item) => {
                    const productId = String(item?.productId || "");
                    const product = stockMap[productId];
                    return {
                      productId,
                      name: String(product?.name || productId || "Unknown Product"),
                      image: String(product?.imageUrl || product?.displayImage || product?.mainImage || ""),
                      price: Number(product?.price || 0),
                      quantity: Number(item?.quantity || 0),
                    };
                  });

            const totalAmountFromItems = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return {
              id,
              userId: String(raw.userId || ""),
              createdAt: Number(raw.createdAt || Date.now()),
              status: normalizeStatus(raw.status),
              totalAmount: Number(raw.totalAmount || raw.totalPrice || totalAmountFromItems || 0),
              items,
            };
          })
          .filter((order) => order.userId === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt)
          .map(({ userId: _userId, ...order }) => order);

        setOrders(mapped);
        setOrdersLoading(false);
      },
      () => setOrdersLoading(false)
    );

    return () => unsub();
  }, [user, stockMap]);

  const displayName = useMemo(() => {
    return name || profile.name || profile.displayName || user?.displayName || "User";
  }, [name, profile, user]);

  const displayEmail = useMemo(() => {
    return profile.email || user?.email || "No email";
  }, [profile.email, user?.email]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const cleanedPhone = phone.trim();
      await update(ref(db, `users/${user.uid}`), {
        name: name.trim(),
        phone: cleanedPhone,
        mobile: cleanedPhone,
      });
      setPhone(cleanedPhone);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || profileLoading || ordersLoading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-brand-gray-400">Loading profile...</div>;
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-20 mb-6 rounded-2xl border border-brand-gray-100 bg-white/95 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-brand-gray-100">
              {profile.photoURL || user.photoURL ? (
                <Image src={profile.photoURL || user.photoURL || ""} alt={displayName} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserCircle2 className="h-9 w-9 text-brand-gray-400" />
                </div>
              )}
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold">My Profile</h1>
              <p className="text-sm text-brand-gray-500">{displayName}</p>
              <p className="text-xs text-brand-gray-400">{displayEmail}</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.replace("/login");
                }}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-brand-gray-300 px-4 py-2 text-sm font-semibold"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(profile.name || profile.displayName || user.displayName || "");
                  setPhone(profile.phone || "");
                }}
                className="rounded-full border border-brand-gray-300 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="rounded-full bg-brand-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-gray-600">Name</label>
            <input
              value={name}
              disabled={!isEditing}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-brand-gray-200 px-3 py-2.5 text-sm disabled:bg-brand-gray-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-gray-600">Phone</label>
            <input
              type="tel"
              value={phone}
              disabled={!isEditing}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-brand-gray-200 px-3 py-2.5 text-sm disabled:bg-brand-gray-50"
            />
          </div>
        </div>
      </div>

      <section id="my-orders" className="rounded-2xl border border-brand-gray-100 bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-display text-2xl font-bold">My Orders</h2>

        {orders.length === 0 ? (
          <p className="text-sm text-brand-gray-400">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
