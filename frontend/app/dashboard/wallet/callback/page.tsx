"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

// useSearchParams() requires a Suspense boundary so the page can
// opt out of full static prerendering during `next build`.
function WalletCallbackInner() {
    const router = useRouter();

    const params = useSearchParams();

    const { verifyDeposit } = useWallet();

    useEffect(() => {
        async function verify() {
            const reference =
                params.get("reference");

            if (!reference) {
                router.replace("/dashboard/wallet");
                return;
            }

            try {
                await verifyDeposit(reference);

                router.replace(
                    "/dashboard/wallet?success=true",
                );
            } catch {
                router.replace(
                    "/dashboard/wallet?failed=true",
                );
            }
        }

        verify();
    }, [params, router, verifyDeposit]);

    return (
        <div className="flex h-screen items-center justify-center">
            Verifying payment...
        </div>
    );
}

export default function WalletCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    Verifying payment...
                </div>
            }
        >
            <WalletCallbackInner />
        </Suspense>
    );
}
