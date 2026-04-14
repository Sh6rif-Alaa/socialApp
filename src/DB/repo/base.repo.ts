import { QueryOptions, UpdateQuery } from "mongoose";
import { HydratedDocument, ProjectionType, QueryFilter } from "mongoose";
import { Model } from "mongoose";

abstract class BaseRepo<TDoc> {
    constructor(protected readonly model: Model<TDoc>) { }

    async create(data: Partial<TDoc>): Promise<HydratedDocument<TDoc>> {
        return this.model.create(data)
    }

    async findById(id: string) {
        return this.model.findById(id)
    }

    async findOne(
        {
            filter,
            projection,
            options
        }: {
            filter?: QueryFilter<TDoc>,
            projection?: ProjectionType<TDoc> | null | undefined,
            options?: QueryOptions<TDoc>
        }) {
        return this.model.findOne(filter, projection, { ...options })
    }

    async findOneAndUpdate(
        {
            filter,
            update,
            options
        }: {
            filter?: QueryFilter<TDoc>,
            update?: UpdateQuery<TDoc>,
            options?: QueryOptions<TDoc>
        }) {
        return this.model.findOneAndUpdate(filter, update, { ...options })
    }
}

export default BaseRepo