import { Messages } from "../../constants/messageConstants";
import { HttpStatus } from "../../constants/statusContstants"; 
import { createHttpError } from "../../utils/httpError"; 
import { IUserRepository } from "../../interfaces/user/IUserRepository";
import { Iuser } from "../../models/user/userModel";
import { deleteOtp, generateOtp, sendOtp, storeOtp, verifyOtp } from "../../utils/otp";
import { hashPassword, comparePassword } from "../../utils/password";
import { IUserService } from "../../interfaces/user/IUserService";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { verifyGoogleToken } from "../../utils/googleAuth";
import { IProfileRepository } from "../../interfaces/freelancer/profile/IProfileRepository";
import { IProfileRepositoryClient } from "../../interfaces/client/profile/IProfileRepository";
import { deleteResetToken, generateAndStoreResetToken, verifyResetToken } from "../../utils/resetPassToken";

export class UserService implements IUserService {
    private userRepository: IUserRepository;
    private freelancerRepository: IProfileRepository;
    private clientRepository: IProfileRepositoryClient

    constructor(userRepository: IUserRepository, freelancerRepository: IProfileRepository, clientRepository: IProfileRepositoryClient) {
        this.userRepository = userRepository;
        this.freelancerRepository = freelancerRepository;
        this.clientRepository = clientRepository
    }

    async register(userData: Partial<Iuser>): Promise<{ status: number; message: string }> {
        const existingUser = await this.userRepository.findByEmail(userData.email!);
        if (existingUser) {
            throw createHttpError(HttpStatus.CONFLICT, Messages.USER_EXIST);
        }
        if (userData.role === "admin") {
            throw createHttpError(HttpStatus.FORBIDDEN, Messages.ADMIN_REGISTER_FORBIDDEN);
        }

        const otp = generateOtp();
        await sendOtp(userData.email!, otp);
        await storeOtp(userData.email!, otp);

        return { status: HttpStatus.OK, message: Messages.OTP_SENT };
    };

    async verifyOtpAndCreateUser(email: string, otp: string, userData: Partial<Iuser>): Promise<{ status: number; message: string }> {
        const isValidOtp = await verifyOtp(email, otp);
    
        if (!isValidOtp.success) {
            throw createHttpError(HttpStatus.BAD_REQUEST, isValidOtp.message || 'Otp validation fail in service');
        }
        console.log("here data is: ",userData,email,otp)
        if (!userData.password) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.PASSWORD_REQUIRED);
        }
    
        userData.password = await hashPassword(userData.password);
    
        const user = await this.userRepository.create(userData as Iuser);
    
        await deleteOtp(email);
    
        if (userData.role === "freelancer") {
            console.log("Creating Freelancer Profile for:", email);
            await this.freelancerRepository.create({
                userId: user.id,
                firstName: user.name,
                title: "",
                bio: "",
                profilePic: "",
                skills: [],
                jobCategory: null,
                city: "",
                state: "",
                country: "",
                zip: "",
                language: [],
                portfolio: [],
                education: { college: "", course: "" },
                experienceLevel: "Beginner",
                employmentHistory: []
            });
        }

        if (userData.role === "client") {
            await this.clientRepository.create({
                userId: user.id,
                firstName: user.name,
                city: "",
                state: "",
                profilePic: "",
            })
        }
        return { status: HttpStatus.CREATED, message: Messages.SIGNUP_SUCCESS };
    }

    async resendOtp(email: string): Promise<{ status: number; message: string }> {
        await deleteOtp(email)
        const newOtp = generateOtp()
        sendOtp(email, newOtp)
        await storeOtp(email, newOtp)
        return {status: HttpStatus.OK, message: Messages.OTP_SENT}
    };

    async login(email: string, password: string): Promise<{
        status: number;
        message: string;
        accessToken?: string;
        refreshToken?: string;
        role?: string,
        user?: { 
            id: string;
            name: string;
            email: string;
            status: string;
            profilePic?: string;
        };
    }> {
        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.USER_NOT_FOUND)
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.INVALID_CREDENTIALS)
        }
        
        if (user.status === 'blocked') {
            throw createHttpError(HttpStatus.FORBIDDEN, Messages.USER_BLOCKED)
        }
        const accessToken = generateAccessToken(user.id.toString(), user.role);
        const refreshToken = generateRefreshToken(user.id.toString(), user.role)

        return {
            status: HttpStatus.OK,
            message: Messages.LOGIN_SUCCESS,
            accessToken,
            refreshToken,
            role: user.role,
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                status: user.status,
                profilePic: user.profilePic || "",
            },
        }
    };

    async refreshAccessToken(token: string): Promise<string> {
        const decoded = verifyRefreshToken(token);
        if (!decoded){
            throw createHttpError(HttpStatus.UNAUTHORIZED, Messages.INVALID_TOKEN)
        }
        const accessToken = generateAccessToken(decoded.id, decoded.role)
        return accessToken
    };

    //Google Auth
    async googleLogin(token: string, role: "client" | "freelancer") {
        const googleUser = await verifyGoogleToken(token);
        if (!googleUser || !googleUser.email || !googleUser.name) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, Messages.INVALID_GOOGLE_TOKEN);
        }
    
        let user = await this.userRepository.findByEmail(googleUser.email);

        console.log("Google Login User Data:", user);
        
        if (!user) {
            user = await this.userRepository.create({
                name: googleUser.name,
                email: googleUser.email,
                profilePic: googleUser.profilePic || "",
                role,
                status: "active",
                password: "",
                isGoogleAuth: true
            } as Iuser);                        
        }
        
        console.log("User status before returning:", user.status);
    
        if (user.status === "blocked") {
            throw createHttpError(HttpStatus.FORBIDDEN, Messages.USER_BLOCKED);
        }
    
        const accessToken = generateAccessToken(user.id.toString(), user.role);
        const refreshToken = generateRefreshToken(user.id.toString(), user.role);
    
        if (user.role === "freelancer") {
            const existingFreelancer = await this.freelancerRepository.findByUserId(user.id.toString())
            if (!existingFreelancer) {
                await this.freelancerRepository.create({
                    userId: user.id,
                    firstName: user.name,
                    title: "",
                    bio: "",
                    profilePic: googleUser.profilePic,
                    skills: [],
                    jobCategory: null,
                    city: "",
                    state: "",
                    country: "",
                    zip: "",
                    language: [],
                    profileCompleted: false,
                    portfolio: [],
                    education: { college: "", course: "" },
                    experienceLevel: "Beginner",
                    employmentHistory: []
                });
            }
        }

        if (user.role === "client") {
            const existingClient = await this.clientRepository.findByUserId(user.id.toString());
            if (!existingClient) {
                await this.clientRepository.create({
                    userId: user.id,
                    firstName: user.name,
                    city: "",
                    state: "",
                    profilePic: "",
                })
            }
        };

        return {
            status: HttpStatus.OK,
            message: Messages.LOGIN_SUCCESS,
            accessToken,
            refreshToken,
            role: user.role,
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                status: user.status || "active",
            },
        };
    };
    
    async resetPassword(email: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ status: number; message: string }> {
        const user = await this.userRepository.findByEmail(email);
    
        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.USER_NOT_FOUND);
        }
    
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.CURRENT_PASSWORD_WRONG);
        }
    
        if (newPassword !== confirmPassword) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.PASSWORD_NOT_MATCH);
        }
    
        const hashedPassword = await hashPassword(newPassword);
    
        await this.userRepository.updatePassword(email, hashedPassword);
    
        return { status: HttpStatus.OK, message: Messages.PASSWORD_RESET_SUCCESS };
    };    

    async sendResetPasswordLink(email: string): Promise<{ message: string; }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.USER_NOT_FOUND)
        }

        if (user.isGoogleAuth) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.GOOGLE_ACCOUNT)
        }

        await generateAndStoreResetToken(email);

        return {message: Messages.RESET_LINK_SENT}
    };

    async resetPasswordWithToken(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string; }> {
        if (!token) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.RESET_TOKEN_REQUIRED)
        }

        if (newPassword !== confirmPassword) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.PASSWORD_NOT_MATCH)
        }

        const email = await verifyResetToken(token);
        if (!email) {
            throw createHttpError(HttpStatus.BAD_REQUEST, Messages.RESET_TOKEN_INVALID)
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.USER_NOT_FOUND);
        }

        const hashedPassword = await hashPassword(newPassword);
        await this.userRepository.updatePassword(email, hashedPassword);

        await deleteResetToken(token);

        return { message: Messages.PASSWORD_RESET_SUCCESS };
    };
};