export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
	role: "tenant" | "landlord" | "admin";
	avatar?: string;
	bio?: string;
  created_at?: string;
  email_verified?: boolean;
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

export interface ViewingRequest {
  id: number;
  property_id: number;
  user_id: number;
  landlord_id: number;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
  // Joined fields
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  landlord_name?: string;
  landlord_email?: string;
  landlord_phone?: string;
  property_title?: string;
  property_location?: string;
  property_images?: string[];
  property_price?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  recipient_id: number;
  property_id?: number;
  content: string;
  read_at?: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  recipient_name?: string;
  property_title?: string;
  property_images?: string[];
}

export interface Conversation {
  conversation_id: number;
  updated_at: string;
  other_user_id: number;
  other_user_name: string;
  other_user_role: "tenant" | "landlord" | "admin";
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}
