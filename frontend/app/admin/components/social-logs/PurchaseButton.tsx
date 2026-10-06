"use client";

import {
  ArrowRight,
  Loader2,
  ShoppingCart,
} from "lucide-react";

interface Props {
  price: number;
  loading?: boolean;
  onPurchase: () => void;
}

export default function PurchaseButton({
  price,
  loading = false,
  onPurchase,
}: Props) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onPurchase}
      className="
        group mt-8 w-full overflow-hidden
        rounded-2xl
        bg-gradient-to-r
        from-orange-500
        to-orange-600
        p-[1px]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-2xl
        hover:shadow-orange-500/30

        disabled:cursor-not-allowed
        disabled:opacity-70
        disabled:hover:translate-y-0
      "
    >
      <div
        className="
          flex items-center justify-between
          rounded-2xl
          bg-gradient-to-r
          from-orange-500
          to-orange-600
          px-6 py-4
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-xl
              bg-white/15
              backdrop-blur
            "
          >
            {loading ? (
              <Loader2
                size={22}
                className="animate-spin"
              />
            ) : (
              <ShoppingCart
                size={22}
                className="
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
              />
            )}
          </div>

          <div className="text-left">
            <p className="text-xs uppercase tracking-wider text-orange-100">
              Secure Checkout
            </p>

            <h3 className="text-lg font-bold">
              {loading
                ? "Processing Purchase..."
                : "Buy Account"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-orange-100">
              Total
            </p>

            <p className="text-2xl font-extrabold">
              ₦{price.toLocaleString()}
            </p>
          </div>

          {!loading && (
            <ArrowRight
              size={22}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          )}
        </div>
      </div>
    </button>
  );
}