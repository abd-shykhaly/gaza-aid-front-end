export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  type: "HAVE" | "NEED";
  type_ar?: string;
  item_name: string;
  category: "food" | "water" | "medical" | "baby" | "power" | "other";
  category_ar?: string;
  quantity: string;
  area: "North Gaza" | "Gaza City" | "Deir Al-Balah" | "Khan Younis" | "Rafah";
  area_ar?: string;
  description?: string;
  status: "active" | "completed";
  created_at: string;
  username?: string;
}

export interface Match {
  id: number;
  post_id: number;
  helper_id: number;
  created_at: string;
  username?: string;
  action_type?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
  };
  token: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}
