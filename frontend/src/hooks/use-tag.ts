import { z } from "zod"

export const TagSchema = z.object({
  topics: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
})

export type TagSchemaType = z.infer<typeof TagSchema>

export function useTagSchema() {
  return TagSchema
}
