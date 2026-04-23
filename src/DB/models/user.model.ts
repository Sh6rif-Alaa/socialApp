import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum";

export interface IUser {
    firstName: string
    lastName: string
    userName?: string
    email: string
    password: string
    age: number
    confirmed?: boolean
    phone?: string | undefined
    address?: string | undefined
    gender: GenderEnum
    role: RoleEnum
    provider: ProviderEnum
    profilePicture?: {
        public_id?: string
        secure_url: string
    }
    changeCredential?: Date
    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: function (): boolean {
            return this.provider === ProviderEnum.google ? false : true
        },
        minlength: 3,
        maxlength: 25,
    },
    lastName: {
        type: String,
        required: function (): boolean {
            return this.provider === ProviderEnum.google ? false : true
        },
        minlength: 3,
        maxlength: 25,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: function (): boolean {
            return this.provider === ProviderEnum.google ? false : true
        },
        minlength: 6,
    },
    age: {
        type: Number,
        required: function (): boolean {
            return this.provider === ProviderEnum.google ? false : true
        },
        min: 16,
        max: 80
    },
    gender: {
        type: String,
        enum: GenderEnum,
        default: GenderEnum.male,
    },
    role: {
        type: String,
        enum: RoleEnum,
        default: RoleEnum.user,
    },
    provider: {
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.system,
    },
    profilePicture: {
        public_id: String,
        secure_url: String
    },
    phone: String,
    address: String,
    confirmed: Boolean,
    changeCredential: Date
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.virtual('userName')
    .get(function () {
        return `${this.firstName} ${this.lastName}`
    }).set(function (v: string) {
        const [firstName, lastName] = v.split(' ') as [string, string]
        this.firstName = firstName
        this.lastName = lastName
    })

const userModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default userModel