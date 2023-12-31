import { Request, Response, NextFunction } from 'express'

export const checkUserLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.cookies && req.cookies.authToken) {
    return res.status(400).json({ message: 'User already logged in.' })
  }
  next()
}
