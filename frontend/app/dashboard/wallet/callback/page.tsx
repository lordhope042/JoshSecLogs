"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

export default function WalletCallbackPage() {
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
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            Verifying payment...
        </div>
    );
}