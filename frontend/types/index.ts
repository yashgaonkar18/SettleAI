export type Finding = {
  type: string;
  evidence: string;
  explanation: string;
  severity: "low" | "medium" | "high" | string;
};

export type Analysis = {
  case_id: string;
  risk_level: string;
  findings: Finding[];
  unknowns: string[];
  recommended_actions: string[];
  summary?: string;
  analysis_metadata?: {
    rule_engine_used: boolean;
    llm_used: boolean;
    llm_status: "success" | "unavailable" | "disabled" | string;
  };
};

export type Investigation = {
  case_id: string;
  risk_level: string;
  message: string;
  findings: Finding[];
  unknowns: string[];
  recommended_actions: string[];
  created_at: string | null;
};

export type Transaction = {
  id: string;
  order_id: string;
  case_id: string | null;
  status: string;
  amount: string;
  currency: string;
  item_name: string;
  payer_email: string | null;
  payer_name: string | null;
  risk_level_at_checkout: string | null;
  warnings_acknowledged: boolean;
  created_at: string | null;
  captured_at: string | null;
};

export type Stats = {
  total_investigations: number;
  risk_distribution: {
    high_concern: number;
    needs_verification: number;
    no_obvious_signals_detected: number;
  };
  top_threat_types: { type: string; count: number }[];
};

export const DEMO_PRESETS = [
  {
    title: "Fake PayPal Invoice Alert",
    tag: "High Concern",
    tagColor: "bg-red-50 text-red-700 border-red-200",
    message:
      "INVOICE #9821 PAID: $789.99 for Bitcoin Purchase has been processed from your PayPal balance. If you did not authorize this charge, call our PayPal fraud prevention department immediately at +1-800-555-0199 to dispute.",
  },
  {
    title: "Advance-Payment Courier Scam",
    tag: "High Concern",
    tagColor: "bg-red-50 text-red-700 border-red-200",
    message:
      "I want to purchase the camera you posted! I will arrange a courier pickup today, but you must pay an advance courier insurance fee of $120 upfront via Western Union or Friends & Family. This will be refunded upon delivery.",
  },
  {
    title: "Urgent Phishing Link",
    tag: "High Concern",
    tagColor: "bg-red-50 text-red-700 border-red-200",
    message:
      "URGENT: Your PayPal account will be suspended within 15 minutes due to unauthorized activity. Verify your identity immediately by clicking: https://bit.ly/paypal-verify-auth",
  },
  {
    title: "Harmless Friend Transfer",
    tag: "No Obvious Signals",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    message:
      "Hey Jordan, thanks for grabbing dinner yesterday! Here is the $32.50 for my half of the split. Let me know when you receive it!",
  },
];

export function readable(value: string) {
  return value.replaceAll("_", " ");
}
