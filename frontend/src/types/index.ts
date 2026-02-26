export interface User {
  id: number
  email: string
  full_name: string
}

export interface Transaction {
  id: number
  description: string
  amount: number
  category: string
  is_income: boolean
  is_anomaly: boolean
  date: string
  notes?: string
}

export interface MonthlyStat {
  month: string
  total: number
}

export interface Summary {
  current_month: {
    total_spent: number
    total_income: number
    net: number
  }
  by_category: Record<string, number>
  monthly_trend: MonthlyStat[]
  anomaly_count: number
}

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Income'
  | 'Other'

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Entertainment: '#ec4899',
  Bills: '#ef4444',
  Health: '#10b981',
  Income: '#22c55e',
  Other: '#6b7280',
}
