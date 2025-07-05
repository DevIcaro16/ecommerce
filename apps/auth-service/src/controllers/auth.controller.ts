import { NextFunction, Request, Response } from "express";
import { checkEmail, checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { AuthError, ValidationError } from "../../../../packages/error-handle";
import { AuthErrorMessages } from "../utils/enum-error-msgs/error-messages";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

//Registro de um novo Usuário
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {

    try {

        validateRegistrationData(req.body, "user");

        const { name, email } = req.body;

        checkEmail(email);

        await checkOtpRestrictions(email);
        await trackOtpRequests(email);
        await sendOtp(name, email, "user-activation-email");

        res.status(200).json({
            message: AuthErrorMessages.SEND_OTP_EMAIL,
        });

    } catch (error) {
        return next(error);
    }

}

//Verificação de Email de um novo Usuário
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, otp, password, name } = req.body;

        if (!email || !otp || !password || !name) {
            return next(new ValidationError(AuthErrorMessages.REQUIRED_FIELDS));
        }

        checkEmail(email);

        await verifyOtp(email, otp);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com Sucesso!'
        });

    } catch (error) {
        return next(error);
    }
}

//Login de um Usuário
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError(AuthErrorMessages.REQUIRED_FIELDS));
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) return next(new AuthError(AuthErrorMessages.NOT_EXISTING_USER));

        //Verificando o hash da senha criptografada
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            return next(new AuthError(AuthErrorMessages.INVALID_PASS));
        }

        //Gerando access token e refresh token
        const accessToken = jwt.sign(
            {
                id: user.id,
                role: "user"
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m",
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
                role: "user"
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d",
            }
        );

        //Gravando o refresh token e o access token em cookies (httpOnly secure)
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            success: true,
            message: 'Login realizado com Sucesso!',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        });

    } catch (error) {
        return next(error);
    }
};

//Recuperação de senha
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, 'user');
};

//Verificando código OTP da recuperação de senha
export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next);
};

//resetando senha do Usuário
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return next(new ValidationError(AuthErrorMessages.REQUIRED_FIELDS));
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) return next(new AuthError(AuthErrorMessages.NOT_EXISTING_USER));

        //Verificando o hash da senha criptografada
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);

        if (!isSamePassword) {
            return next(new AuthError(AuthErrorMessages.SAME_PASS));
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: {
                email: email
            },
            data: {
                password: hashedPassword
            }
        });


        res.status(200).json({
            success: true,
            message: 'Senha alterada com Sucesso!'
        });

    } catch (error) {
        return next(error);
    }
};