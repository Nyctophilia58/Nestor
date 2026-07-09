export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
	role: "tenant" | "landlord" | "admin";
	avatar?: string;
	bio?: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  type: "rent" | "sale";
  category: "apartment" | "house" | "office";
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  user_id: number;
  owner_name?: string;
  owner_phone?: string;
  created_at: string;
}

export interface FavouriteState {
  ids: number[];
  add: (id: number) => void;
  remove: (id: number) => void;
  set: (ids: number[]) => void;
}
