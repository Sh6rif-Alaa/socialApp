import admin from "firebase-admin";
import env from "../../config/config.service";

class NotificationService {
    private readonly client: admin.app.App = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(env.SERVICE_ACCOUNT_KEY))
    })
    constructor() { }

    async sendNotification({
        token,
        data
    }: {
        token: string,
        data: { title: string, body: string }
    }) {
        return await this.client.messaging().send({ token, data });
    }

    async sendNotifications({
        tokens,
        data
    }: {
        tokens: string[],
        data: { title: string, body: string }
    }) {
        return await Promise.all(tokens.map(token => this.sendNotification({ token, data })))
    }
}

export default new NotificationService()