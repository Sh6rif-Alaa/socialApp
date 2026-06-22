import { HydratedDocument, ProjectionType, QueryFilter, QueryOptions, UpdateQuery } from "mongoose";
import { Model } from "mongoose";

export interface PaginationResult<TDoc> {
    docs: HydratedDocument<TDoc>[]
    total: number
    page: number
    limit: number
    totalPages: number
}

abstract class BaseRepo<TDoc> {
    constructor(protected readonly model: Model<TDoc>) { }

    async create(data: Partial<TDoc>): Promise<HydratedDocument<TDoc>> {
        return this.model.create(data)
    }

    async findById(id: string): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findById(id)
    }

    async find(
        filter?: QueryFilter<TDoc>,
        projection?: ProjectionType<TDoc> | null | undefined,
        options?: QueryOptions<TDoc>
    ): Promise<HydratedDocument<TDoc>[]> {
        return this.model.find(filter, projection, options)
    }

    async findPaginated({
        filter,
        projection,
        options,
        page,
        limit
    }: {
        filter?: QueryFilter<TDoc>,
        projection?: ProjectionType<TDoc> | null | undefined,
        options?: QueryOptions<TDoc>,
        page?: number,
        limit?: number
    } = {}): Promise<PaginationResult<TDoc>> {
        page = page || 1
        limit = limit || 10
        const skip = (page - 1) * limit
        const [docs, total] = await Promise.all([
            this.model.find(filter, projection, { ...options, skip, limit }),
            this.model.countDocuments(filter)
        ])
        return { docs, total, page, limit, totalPages: Math.ceil(total / limit) }
    }

    async countDocuments(filter?: QueryFilter<TDoc>): Promise<number> {
        return this.model.countDocuments(filter)
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
        }): Promise<HydratedDocument<TDoc> | null> {
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
        }): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findOneAndUpdate(filter, update, { returnDocument: 'after', ...options })
    }

    async findByIdAndDelete(id: string): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findByIdAndDelete(id)
    }
}

export default BaseRepo