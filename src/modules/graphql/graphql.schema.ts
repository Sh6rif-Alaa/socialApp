import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import userFields from '../users/graphql/user.fields'

const gql_schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQuery',
        description: "query info",
        fields: {
            ...userFields.quary(),
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutation',
        description: "mutation info",
        fields: {
            ...userFields.mutation(),
        }
    })
})


export default gql_schema