"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { fetchWrapper, throwIfError } from "@/lib/api"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { DeckCard } from "@/lib/api/dto/flashcard"

const baseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cards: z
    .array(
      z.object({
        cardId: z.string().optional(),
        front: z.string().min(1, "Front side is required"),
        back: z.string().min(1, "Back side is required"),
      }),
    )
    .min(1, "At least one card is required"),
  public: z.boolean(),
  password: z.string().optional(),
})

export const editDeckSchema = baseSchema.superRefine((values, ctx) => {
  if (!values.public) {
    const password = values.password?.trim()
    if (!password || password.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 4 characters for private decks",
        path: ["password"],
      })
    }
  }
})

export type EditDeckFormValues = z.infer<typeof editDeckSchema>

export function useEditDeck(deckId: string) {
  const [initialDeck, setInitialDeck] = useState<DeckCard | null>(null)

  const form = useForm<EditDeckFormValues>({
    resolver: zodResolver(editDeckSchema),
    defaultValues: {
      title: "",
      description: "",
      public: true,
      password: "",
      cards: [
        {
          cardId: "",
          front: "",
          back: "",
        },
      ],
    },
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedDeck = window.localStorage.getItem(`deck:${deckId}`)
    if (!storedDeck) {
      return
    }

    try {
      const parsedDeck = JSON.parse(storedDeck) as DeckCard
      setInitialDeck(parsedDeck)
      form.reset({
        title: parsedDeck.title ?? "",
        description: parsedDeck.description ?? "",
        public: parsedDeck.public ?? true,
        password: "",
        cards: parsedDeck.cards?.length
          ? parsedDeck.cards.map((card) => ({
              cardId: card.id,
              front: card.front,
              back: card.back,
            }))
          : [
              {
                cardId: "",
                front: "",
                back: "",
              },
            ],
      })
    } catch (error) {
      console.error("Failed to parse stored deck:", error)
    }
  }, [deckId, form])

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof editDeckSchema>) => {
      const { cards: _cards, ...deckPayload } = values

      const response = await fetchWrapper(`/quizlet/deck/${deckId}/update`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deckPayload),
      })

      await throwIfError(response)
      return response.json()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return {
    form,
    mutation,
    initialDeck,
  }
}
