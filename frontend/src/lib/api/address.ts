import { request } from "./request";

export const address = {
  async list() {
    return request("/addresses", { method: "GET" });
  },
  async add(data: any) {
    return request("/addresses", { method: "POST", body: JSON.stringify(data) });
  },
  async update(id: number, data: any) {
    return request(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  async remove(id: number) {
    return request(`/addresses/${id}`, { method: "DELETE" });
  },
};
