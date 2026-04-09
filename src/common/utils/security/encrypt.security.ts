import crypto from 'node:crypto';
import env from '../../../config/config.service';

export function encrypt(text: string) {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(env.ENCRYPT_ALGORITHM, Buffer.from(env.ENCRYPT_KEY), iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')

    encrypted += cipher.final('hex')

    return iv.toString('hex') + ":" + encrypted
}

export function decrypt(cipherText: string) {
    const ivBuffer = Buffer.from(cipherText.split(':')[0]!, 'hex')

    const decipher = crypto.createDecipheriv(env.ENCRYPT_ALGORITHM, Buffer.from(env.ENCRYPT_KEY), ivBuffer)

    let decrypted = decipher.update(cipherText.split(':')[1]!, 'hex', 'utf8')

    decrypted += decipher.final('utf8')

    return decrypted
}