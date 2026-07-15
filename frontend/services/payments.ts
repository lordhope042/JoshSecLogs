import api from "@/lib/axios";

export const PaymentsAPI = {
  /*
  =====================================
      INITIALIZE PAYMENT
  =====================================
  */

  initialize(
    amount: number,
  ) {
    return api.post(
      "/payments/initialize",
      {
        amount,
      },
    );
  },

  /*
  =====================================
      VERIFY PAYMENT
  =====================================
  */

  verify(
    reference: string,
  ) {
    return api.post(
      "/payments/verify",
      {
        reference,
      },
    );
  },

  /*
  =====================================
      PAYMENT HISTORY
  =====================================
  */

  history() {
    return api.get("/payments");
  },

  /*
  =====================================
      SINGLE PAYMENT
  =====================================
  */

  payment(
    reference: string,
  ) {
    return api.get(
      `/payments/${reference}`,
    );
  },

  /*
  =====================================
      INITIALIZE + REDIRECT
  =====================================
  */

  async redirect(
    amount: number,
  ) {
    const { data } =
      await this.initialize(
        amount,
      );

    if (
      !data?.authorizationUrl
    ) {
      throw new Error(
        "Unable to initialize payment.",
      );
    }

    window.location.assign(
      data.authorizationUrl,
    );
  },
};