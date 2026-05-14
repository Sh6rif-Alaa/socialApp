import mongoose from "mongoose";
import { FriendStatus, GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum";
import { Types } from "mongoose";

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
    friends: {
        user: Types.ObjectId,
        status: FriendStatus
    }[]
    changeCredential?: Date
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
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
    friends: {
        type: [{
            user: {
                type: Types.ObjectId,
                ref: 'User'
            },
            status: {
                type: String,
                enum: FriendStatus,
                default: FriendStatus.pending
            }
        }],
        default: []
    },
    phone: String,
    address: String,
    confirmed: Boolean,
    changeCredential: Date,
    deletedAt: Date
}, {
    timestamps: true,
    strictQuery: false,
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

// // 1
// userSchema.pre('validate', function () {
//     console.log('before validation')
// })

// // 2
// userSchema.post('validate', function () {
//     console.log('after validation')
// })

// // 3
// userSchema.pre('save', function () {
//     console.log('before saving', this)
// })

// // 4
// userSchema.post('save', function () {
//     console.log('after saving', this)
// })

userSchema.pre('findOne', function () {
    console.log('befor findOne')
    const { paranoid, ...rest } = this.getQuery() as Partial<IUser> & { paranoid?: boolean }
    if (paranoid === false)
        this.setQuery(rest as any)
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } } as any)
})

// const userModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
const userModel = (mongoose.models.User || mongoose.model<IUser>('User', userSchema)) as mongoose.Model<IUser>

export default userModel