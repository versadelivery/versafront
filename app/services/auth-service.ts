import api from "../lib/api";
import { API_ENDPOINTS } from "../constants/api";
import { LoginData, RegisterData } from "../types";

export const registerShop = async (data: RegisterData) => {
  try {
    const response = await api.post(API_ENDPOINTS.SHOPS, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};