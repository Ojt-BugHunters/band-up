"use client"

import { useMutation } from "@tanstack/react-query"
import { fetchWrapper, throwIfError } from "@/lib/api"
import { toast } from "sonner"
import { Card } from "@/lib/api/dto/flashcard"

interface CreateCardPayload {
  deckId: string
  cards: Array<{
    front: string
    back: string
  }>
}

export function useCreateCard() {
  return useMutation<Card[], Error, CreateCardPayload>({
    mutationFn: async ({ deckId, cards }: CreateCardPayload) => {
      const response = await fetchWrapper(`/quizlet/deck/${deckId}/card/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cards),
      })

      await throwIfError(response)
      return response.json() as Promise<Card[]>
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
