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
    // `this.initialize()` calls `api.post(...)` — the shared axios instance
    // already unwraps the response, so this resolves DIRECTLY to the
    // backend payload (e.g. { success, reference, authorizationUrl, accessCode }).
    // Destructuring `{ data }` off it again was silently producing
    // `data === undefined` whenever the backend didn't nest under `data`,
    // which meant this always threw "Unable to initialize payment." even on
    // a successful call.
    const result: any = await this.initialize(
      amount,
    );

    const authUrl =
      result?.authorizationUrl ??
      result?.data?.authorizationUrl ??
      result?.authorization_url ??
      result?.data?.authorization_url;

    if (!authUrl) {
      throw new Error(
        "Unable to initialize payment.",
      );
    }

    window.location.assign(
      authUrl,
    );
  },
};