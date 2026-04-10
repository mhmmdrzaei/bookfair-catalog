export type PaymentMethod = "Venmo" | "Zelle" | "Cash" | "Other";

export type OrganizationSummary = {
  id: string;
  name: string;
  created_at: string;
};

export type MemberSummary = {
  id: number;
  user_id: string;
  role: "owner" | "member";
  created_at: string;
  profiles: {
    email: string;
  } | null;
};

export type InviteSummary = {
  id: string;
  email: string;
  created_at: string;
  accepted_at: string | null;
};

export type AccountSummary = {
  id: string;
  name: string;
  created_at: string;
};

export type InventoryItemSummary = {
  id: string;
  title: string;
  image_path: string | null;
  info: string;
  price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type StockMovementSummary = {
  id: string;
  delta: number;
  note: string;
  created_at: string;
  created_by?: string;
  profiles?: {
    email: string;
  } | null;
};

export type SaleSummary = {
  id: string;
  payment_method: PaymentMethod;
  account: string;
  account_id?: string | null;
  sale_group_id?: string | null;
  amount: string;
  quantity: number;
  created_at: string;
  created_by?: string;
  profiles?: {
    email: string;
  } | null;
};

export type AccountTransferSummary = {
  id: string;
  from_account_snapshot: string;
  to_account_snapshot: string;
  payment_method: PaymentMethod;
  amount: string;
  note: string;
  created_at: string;
};
