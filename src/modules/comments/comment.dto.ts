import { z } from "zod";
import { createCommentSchema } from "./comment.validation";

export type createCommentType = z.infer<typeof createCommentSchema.body>
