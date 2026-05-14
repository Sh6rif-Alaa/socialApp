import { z } from "zod";
import { createPostSchema, getPostsSchema, likePostSchema, updatePostSchema } from "./post.validation";

export type createPostType = z.infer<typeof createPostSchema.body>
export type getPostsQueryType = z.infer<typeof getPostsSchema.query>
export type likePostParamsType = z.infer<typeof likePostSchema.params>
export type updatePostParamsType = z.infer<typeof updatePostSchema.params>
export type updatePostBodyType = z.infer<typeof updatePostSchema.body>