import { AuthMethod } from '@prisma/generated/enums'

export interface ICreateUser {
  name: string
  email: string
  password?: string
  picture: string
  method: AuthMethod
}
