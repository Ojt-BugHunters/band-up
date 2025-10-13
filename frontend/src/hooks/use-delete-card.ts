"use client"

import { useMutation } from "@tanstack/react-query"
import { fetchWrapper, throwIfError } from "@/lib/api"
import { toast } from "sonner"

interface DeleteCardPayload {
  cardId: string
}

export function useDeleteCard() {
  return useMutation({
    mutationFn: async ({ cardId }: DeleteCardPayload) => {
      const response = await fetchWrapper(`/quizlet/deck/card/${cardId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      })

      await throwIfError(response)
      return response.json()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
