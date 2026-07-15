// useCountries.ts
import { useEffect, useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";

interface Country {
  id: string;
  iso: string;
  name: string;
  prefix: string;
  flag: string | null;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await MarketplaceAPI.countries();
        
        // Extract data from response
        let countryData = response?.data || response || [];
        
        // Ensure it's an array
        if (!Array.isArray(countryData)) {
          countryData = Object.values(countryData);
        }
        
        // Filter out invalid entries and sort by name
        const validCountries = countryData
          .filter((country: any) => country && typeof country === 'object' && country.name)
          .sort((a: any, b: any) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
          });
        
        setCountries(validCountries);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch countries:", err);
        setError(err.message || "Failed to load countries");
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return {
    countries,
    loading,
    error,
  };
}