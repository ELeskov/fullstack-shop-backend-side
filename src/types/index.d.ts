import { User } from '@prisma/generated/client'

declare global {
  namespace Express {
    interface Request {
      user: Omit<User, 'password'>
    }
  }
}
