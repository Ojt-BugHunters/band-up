"use client"

import { useMutation } from "@tanstack/react-query"
import { fetchWrapper, throwIfError } from "@/lib/api"
import { toast } from "sonner"
import { Card } from "@/lib/api/dto/flashcard"

interface UpdateCardPayload {
  cardId: string
  front: string
  back: string
}

export function useUpdateCard() {
  return useMutation<Card, Error, UpdateCardPayload>({
    mutationFn: async ({ cardId, front, back }: UpdateCardPayload) => {
      const response = await fetchWrapper(`/quizlet/deck/card/${cardId}/update`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front,
          back,
        }),
      })

      await throwIfError(response)
      return response.json() as Promise<Card>
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
