import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
})

export type CreateDeckFormValues = z.infer<typeof createDeckSchema>

export function useCreateDeck() {
  const form = useForm<CreateDeckFormValues>({
    resolver: zodResolver(createDeckSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const onSubmit = async (data: CreateDeckFormValues) => {
    try {
      console.log("Deck data:", data)
      // TODO: Add your API call here to create the deck
      // Example: await createDeck(data)

      // Reset form after successful submission
      form.reset()
    } catch (error) {
      console.error("Error creating deck:", error)
    }
  }

  return {
    form,
    onSubmit,
  }
}
