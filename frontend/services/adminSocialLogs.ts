import api from "@/lib/axios";

export const AdminSocialLogsAPI = {
  /*
  =====================================
      ALL
  =====================================
  */

  all() {
    return api.get("/social-logs");
  },

  /*
  =====================================
      CREATE
  =====================================
  */

  create(data: any) {
    return api.post("/social-logs", data);
  },

  /*
  =====================================
      UPDATE
  =====================================
  */

  update(
    id: string,
    data: any,
  ) {
    return api.patch(
      `/social-logs/${id}`,
      data,
    );
  },

  /*
  =====================================
      DELETE
  =====================================
  */

  delete(id: string) {
    return api.delete(
      `/social-logs/${id}`,
    );
  },
};