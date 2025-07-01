import { Request, Response, NextFunction } from "express";

export interface IUserController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>
    verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>
    resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>
    login(req: Request, res: Response, next: NextFunction): Promise<void>
    refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>
    resetPasswordWithToken(req: Request, res: Response, next: NextFunction): Promise<void>
};