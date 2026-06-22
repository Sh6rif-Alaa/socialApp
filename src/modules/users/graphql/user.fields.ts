import { GraphQLString, GraphQLList, GraphQLNonNull } from 'graphql'
import { UserType } from './user.type'
import { createUserArgs, updateUserProfileArgs } from './user.args'
import userService from '../user.service'
import { decodeTokenAndFetchUser } from '../../../common/middleware/authentication'
import env from '../../../config/config.service'
import { authorization_gql } from '../../../common/middleware/authorization'
import { RoleEnum } from '../../../common/enum/user.enum'
import { validation_gql } from '../../../common/middleware/validation'
import { signUpSchema } from '../../auth/auth.validation'
import { deleteUserSchema, updateProfileSchema } from '../user.validation'

class UserFields {
    constructor() { }

    quary = () => {
        return {
            getUsers: {
                type: new GraphQLList(UserType),
                resolve: (_parent: any, _args: any, _context: any) => {
                    return userService.getUsersGql()
                }
            },

            getUserById: {
                type: UserType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) }
                },
                resolve: async (_parent: any, args: any) => {
                    return userService.getUserByIdGql(args.id)
                }
            }
        }
    }

    mutation = () => {
        return {
            createUser: {
                type: UserType,
                args: createUserArgs,
                resolve: async (_parent: any, args: any) => {
                    await validation_gql(signUpSchema.body, args)
                    return await userService.createUserGql(args)
                }
            },

            updateUserProfile: {
                type: UserType,
                args: updateUserProfileArgs,
                resolve: async (_parent: any, args: any, context: any) => {
                    await validation_gql(updateProfileSchema.body, args)
                    const { user } = await decodeTokenAndFetchUser(context.req.headers.authorization, env.TOKEN_KEY)
                    await authorization_gql([RoleEnum.user, RoleEnum.admin], user.role)
                    return await userService.updateUserProfileGql(args, user._id)
                }
            },

            deleteUser: {
                type: UserType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) }
                },
                resolve: async (_parent: any, args: any, context: any) => {
                    await validation_gql(deleteUserSchema.body, args)
                    const { user } = await decodeTokenAndFetchUser(context.req.headers.authorization, env.TOKEN_KEY)
                    await authorization_gql([RoleEnum.user, RoleEnum.admin], user.role)
                    return await userService.deleteUserGql(args.id)
                }
            }
        }
    }
}

export default new UserFields()