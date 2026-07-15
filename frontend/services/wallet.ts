import api from "@/lib/axios";

export const WalletAPI = {
  /*
  =====================================
      WALLET
  =====================================
  */

  balance() {
    return api.get("/wallet");
  },

  /*
  =====================================
      TRANSACTIONS
  =====================================
  */

  transactions() {
    return api.get(
      "/wallet/transactions",
    );
  },

  transaction(
    reference: string,
  ) {
    return api.get(
      `/wallet/transactions/${reference}`,
    );
  },

  /*
  =====================================
      REFRESH
  =====================================
  */

  refresh() {
    return Promise.all([
      this.balance(),
      this.transactions(),
    ]);
  },
};