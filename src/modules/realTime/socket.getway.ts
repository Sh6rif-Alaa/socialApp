import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import { decodeTokenAndFetchUser } from "../../common/middleware/authentication"
import redisService from "../../common/services/redis.service"
import env from "../../config/config.service"
import chatGatway from "../chat/realTime/chat.gatway"

class SocketGetWay {
    constructor() { }

    initIO = async (httpServer: HttpServer) => {
        const io = new Server(httpServer, {
            cors: {
                origin: '*'
            }
        })

        io.use(async (socket, next) => {
            try {
                const { authorization } = socket.handshake.auth
                const { user } = await decodeTokenAndFetchUser(authorization as string, env.TOKEN_KEY)
                socket.data.user = user
                next()
            } catch (error: any) {
                next(new Error(error?.message || 'Authentication failed'))
            }
        })

        io.on('connection', async (socket) => {
            console.log('a user connected', socket.id)

            await redisService.storeUserSocket({ userId: socket.data.user._id, socketId: socket.id })

            await chatGatway.registerEvent(socket, io)

            socket.on('disconnect', async () => {
                console.log('a user disconnected', socket.id)
                await redisService.removeUserSocket({ userId: socket.data.user._id, socketId: socket.id })
            })

            socket.on('message', (data, cb) => {
                console.log(data)
                cb('hi hi')
            })
        })

        io.of('/admin').on('connection', (socket) => {
            console.log('a admin user connected', socket.id)

            socket.on('disconnect', () => {
                console.log('a admin user disconnected', socket.id)
            })

            socket.on('message', (data, cb) => {
                console.log(data)
                cb('hi hi from admin')
            })
        })
    }
}

export default new SocketGetWay()