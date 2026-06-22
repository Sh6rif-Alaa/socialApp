import * as z from 'zod'
import { createGroupChatSchema } from "./chat.validation";

export type createGroupChatType = z.infer<typeof createGroupChatSchema.body>
