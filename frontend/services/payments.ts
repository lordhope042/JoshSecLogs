import api from "@/lib/axios";

export type PocketFiBank = "9psb" | "kuda";

export interface VirtualAccount {
  id: string;
  userId: string;
  bank: PocketFiBank | string;
  accountNumber: string;
  accountName: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export const PaymentsAPI = {
  /*
  =====================================
      LIST VIRTUAL ACCOUNTS
      Returns every virtual account the user already has (0, 1, or 2 —
      one per bank). `api` already unwraps `response.data`, so this
      resolves directly to the array.
  =====================================
  */
  listVirtualAccounts() {
    return api.get<VirtualAccount[]>("/payments/virtual-accounts");
  },

  /*
  =====================================
      CREATE (OR FETCH EXISTING) VIRTUAL ACCOUNT
      `phone` is required by PocketFi the first time an account is
      created for a given bank — safe to resend on subsequent calls,
      it's ignored once an account already exists for that bank.
  =====================================
  */
  createVirtualAccount(bank: PocketFiBank, phone: string) {
    return api.post<VirtualAccount>("/payments/virtual-accounts", {
      bank,
      phone,
    });
  },
};
