import api from "./axios";

export const addHour = async (data: any) => {
  await api.post("/member/hour-log", data);
};
