import { z } from "zod";
import { signInSchema, signUpSchemaBody } from "./auth.validation";

export type signUpType = z.infer<typeof signUpSchemaBody>

export type signInType = z.infer<typeof signInSchema.body>