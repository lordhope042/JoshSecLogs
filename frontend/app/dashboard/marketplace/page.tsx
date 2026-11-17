"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import ServiceGrid from "@/components/marketplace/ServiceGrid";
import BuySummary from "@/components/marketplace/BuySummary";
import PurchaseModal from "@/components/marketplace/PurchaseModal";

import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import type { Provider } from "@/services/marketplace";

export default function MarketplacePage() {
  const router = useRouter();

  const [provider, setProvider] = useState<Provider>("FIVESIM");
  const [country, setCountry] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedActivationType, setSelectedActivationType] = useState("");
  const [selectedActivationLabel, setSelectedActivationLabel] = useState("");
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [purchaseKey, setPurchaseKey] = useState("");
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
    loadCountries(provider);
    loadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  =====================================
      PROVIDER CHANGE
  =====================================
  Switching provider means the whole country/service catalog changes
  underneath — 5sim and GrizzySMS use entirely different country and
  service codes, so any prior selection is no longer valid and must
  be cleared before reloading the country list for the new provider.
  */

  async function handleProvider(value: Provider) {
    setProvider(value);

    setCountry("");
    setSelectedService("");
    setSelectedActivationType("");
    setSelectedActivationLabel("");
    setSelectedServiceName("");
    setSelectedPrice(0);

    await loadCountries(value);
  }

  /*
  =====================================
      COUNTRY CHANGE
  =====================================
  */

  async function handleCountry(value: string) {
    setCountry(value);

    setSelectedService("");
    setSelectedActivationType("");
    setSelectedActivationLabel("");
    setSelectedServiceName("");
    setSelectedPrice(0);

    await Promise.all([
      loadProducts(value, provider),
      loadPrices(value, provider),
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
    price: number,
    label?: string,
    serviceName?: string,
  ) {
    setSelectedService(service);
    setSelectedActivationType(activationType);
    setSelectedActivationLabel(label ?? activationType);
    setSelectedServiceName(serviceName ?? service);
    setSelectedPrice(price);
    setPurchaseKey(
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

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
        provider,
        country,
        operator: selectedActivationType,
        product: selectedService,
      }, purchaseKey);

      await loadBalance();

      setModalOpen(false);
      setPurchaseKey("");

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
        provider={provider}
        country={country}
        service={selectedService}
        onProviderChange={handleProvider}
        onCountryChange={handleCountry}
        onServiceChange={setSelectedService}
      />

      <div className="grid gap-8 xl:grid-cols-4">

        <div className="xl:col-span-3">

          <ServiceGrid
            prices={prices}
            selectedService={selectedService}
            provider={provider}
            onBuy={handleBuy}
            loading={loading}
          />

        </div>

        <BuySummary
        wallet={balance}
        country={country}
        service={selectedService}
        serviceName={selectedServiceName}
        activationType={selectedActivationType}
        activationLabel={selectedActivationLabel}
        price={selectedPrice}
        />

      </div>

      <PurchaseModal
        open={modalOpen}
        loading={buying}
        wallet={balance}
        provider={provider}
        country={country}
        service={selectedService}
        serviceName={selectedServiceName}
        activationType={selectedActivationType}
        activationLabel={selectedActivationLabel}
        price={selectedPrice}
        onClose={() => setModalOpen(false)}
        onConfirm={purchase}
      />

    </div>
  );
}
