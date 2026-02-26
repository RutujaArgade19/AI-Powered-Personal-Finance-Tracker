import { useState, useEffect, useCallback } from 'react'
import { txAPI } from '../utils/api'
import type { Transaction } from '../types'

export function useTransactions(filters?: { category?: string; month?: number; year?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await txAPI.list(filters)
      setTransactions(data)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }, [filters?.category, filters?.month, filters?.year])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (tx: {
    description: string
    amount: number
    category?: string
    date: string
    notes?: string
  }) => {
    const { data } = await txAPI.create(tx)
    setTransactions((prev) => [data, ...prev])
    return data as Transaction
  }

  const deleteTransaction = async (id: number) => {
    await txAPI.delete(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    deleteTransaction,
  }
}
