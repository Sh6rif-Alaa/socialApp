import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

export const getUserArgs = {
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
}


export const createUserArgs = {
    userName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    cPassword: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
}

export const updateUserProfileArgs = {
    userName: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
    phone: { type: GraphQLString },
}
