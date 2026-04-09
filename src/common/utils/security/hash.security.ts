import { compareSync, hashSync } from "bcrypt";
import env from "../../../config/config.service";

export const Hash = ({ plainText, salt = env.SALT_ROUNDS }: { plainText: string, salt?: string }) => {
    return hashSync(plainText, Number(salt));
}

export const Compare = ({ plainText, hash }: { plainText: string, hash: string }) => {
    return compareSync(plainText, hash);
}