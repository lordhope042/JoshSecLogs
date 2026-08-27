import api from "@/lib/axios";

export type PocketFiBank = "kuda" | "saveheaven";

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
  listVirtualAccounts() {
    return api.get<VirtualAccount[]>("/payments/virtual-accounts");
  },

  createVirtualAccount(bank: PocketFiBank, phone: string) {
    return api.post<VirtualAccount>("/payments/virtual-accounts", {
      bank,
      phone,
    });
  },
};