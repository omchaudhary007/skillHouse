import { Iuser } from "../../models/user/userModel";

export interface IUserService {
    register(userData: Partial<Iuser>): Promise<{ status: number; message: string }>;
    verifyOtpAndCreateUser(email: string, otp: string, userData: Partial<Iuser>): Promise<{ status: number; message: string }>;
    resendOtp(email: string): Promise<{ status: number; message: string }>;
    login(email: string, password: string): Promise<{
        status: number;
        message: string;
        accessToken?: string,
        refreshToken?: string
        role?: string,
        user?: {
            id: string;
            name: string;
            email: string;
            status: string;
            profilePic?: string;
        };
    }>;
    googleLogin(token: string, role: "client" | "freelancer"): Promise<{
        status: number;
        message: string;
        accessToken: string;
        refreshToken: string;
        role: string;
        user: {
            id: string;
            name: string;
            email: string;
            profilePic: string;
            status: string;
        };
    }>;
    refreshAccessToken(token: string): Promise<string>;
    resetPassword(email: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ status: number; message: string }>;
    sendResetPasswordLink(email: string): Promise<{ message: string }>;
    resetPasswordWithToken(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }>
};