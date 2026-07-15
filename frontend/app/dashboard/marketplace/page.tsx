"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import ServiceGrid from "@/components/marketplace/ServiceGrid";
import BuySummary from "@/components/marketplace/BuySummary";
import PurchaseModal from "@/components/marketplace/PurchaseModal";

import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";

export default function MarketplacePage() {
  const router = useRouter();

  const [country, setCountry] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedActivationType, setSelectedActivationType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    countries,
    products,
    prices,
    loading,
    buying,
    buy,
    loadCountries,
    loadProducts,
    loadPrices,
  } = useMarketplace();

  const { balance, loadBalance } = useWallet();

  /*
  =====================================
      INITIAL LOAD
  =====================================
  */

  useEffect(() => {
    loadCountries();
    loadBalance();
  }, []);

  /*
  =====================================
      COUNTRY CHANGE
  =====================================
  */

  async function handleCountry(value: string) {
    setCountry(value);

    setSelectedService("");
    setSelectedActivationType("");
    setSelectedPrice(0);

    await Promise.all([
      loadProducts(value),
      loadPrices(value),
    ]);
  }

  /*
  =====================================
      BUY
  =====================================
  */

  function handleBuy(
    service: string,
    activationType: string,
    price: number
  ) {
    setSelectedService(service);
    setSelectedActivationType(activationType);
    setSelectedPrice(price);

    setModalOpen(true);
  }

  /*
  =====================================
      PURCHASE
  =====================================
  */

  async function purchase() {
    try {
      await buy({
        country,
        operator: selectedActivationType,
        product: selectedService,
      });

      await loadBalance();

      setModalOpen(false);

      router.push("/dashboard/orders");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">

      <MarketplaceHeader
        countries={countries}
        products={products}
        country={country}
        service={selectedService}
        onCountryChange={handleCountry}
        onServiceChange={setSelectedService}
      />

      <div className="grid gap-8 xl:grid-cols-4">

        <div className="xl:col-span-3">

          <ServiceGrid
            prices={prices}
            selectedService={selectedService}
            onBuy={handleBuy}
            loading={loading}
          />

        </div>

        <BuySummary
          wallet={balance}
          country={country}
          service={selectedService}
          activationType={selectedActivationType}
          price={selectedPrice}
        />

      </div>

      <PurchaseModal
        open={modalOpen}
        loading={buying}
        wallet={balance}
        country={country}
        service={selectedService}
        activationType={selectedActivationType}
        price={selectedPrice}
        onClose={() => setModalOpen(false)}
        onConfirm={purchase}
      />

    </div>
  );
}