import { Model, PopulateOptions } from "mongoose";

export const create = async ({ data, model }: { data: Record<string, any>, model: Model<any> }) => {
    return await model.create(data)
}

export const aggregate = async ({ pipeline = [], model }: { pipeline?: any[], model: Model<any> }) => {
    return await model.aggregate(pipeline)
}

export const find = async ({ filter = {}, model, options = {} }: { filter?: Record<string, any>, model: Model<any>, options?: Record<string, any> }) => {
    const doc = model.find(filter, options)
    if (options.populate) doc.populate(options.populate)
    if (options.skip) doc.skip(options.skip)
    if (options.limit) doc.limit(options.limit)
    return await doc.exec()
}

export const findOne = async ({ filter = {}, model, options = {} }: { filter?: Record<string, any>, model: Model<any>, options?: Record<string, any> }) => {
    const doc = model.findOne(filter, options)
    if (options.populate) doc.populate(options.populate)
    if (options.skip) doc.skip(options.skip)
    if (options.limit) doc.limit(options.limit)
    return await doc.exec()
}

export const findById = async ({ model, id, populate = [], select = "" }: { model: Model<any>, id: any, populate?: PopulateOptions[], select?: string }) => {
    return await model.findById(id).populate(populate).select(select)
}

export const findOneAndUpdate = async ({ model, filter = {}, update, options = {}, select = "" }: { model: Model<any>, filter?: Record<string, any>, update: Record<string, any>, options?: Record<string, any>, select?: string }) => {
    return await model.findOneAndUpdate(filter, update, options).select(select)
}

export const deleteOne = async ({ model, filter }: { model: Model<any>, filter: Record<string, any> }) => {
    return await model.deleteOne(filter)
}

export const deleteMany = async ({ model, filter }: { model: Model<any>, filter: Record<string, any> }) => {
    return await model.deleteMany(filter)
}