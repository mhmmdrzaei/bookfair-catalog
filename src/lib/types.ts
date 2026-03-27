export type PaymentMethod = "Venmo" | "Zelle" | "Cash" | "Other";

export type OrganizationSummary = {
  id: string;
  name: string;
  created_at: string;
};

export type MemberSummary = {
  id: number;
  role: "owner" | "member";
  created_at: string;
};

export type InviteSummary = {
  id: string;
  email: string;
  created_at: string;
  accepted_at: string | null;
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
};

export type SaleSummary = {
  id: string;
  payment_method: PaymentMethod;
  account: string;
  amount: string;
  quantity: number;
  created_at: string;
};
