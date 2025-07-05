import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handle';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendEmail';
import { NextFunction, Request, Response } from 'express';
import { AuthErrorMessages } from './enum-error-msgs/error-messages';
import prisma from "../../../../packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const {
        name,
        email,
        password,
        phone_number,
        country
    } = data;

    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        throw new ValidationError(AuthErrorMessages.REQUIRED_FIELDS);
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError(AuthErrorMessages.INVALID_EMAIL_FORMAT);
    }
}

export const checkEmail = async (email: string) => {

    const existing = await prisma.users.findUnique({ where: { email } });

    if (existing) {
        throw new ValidationError(AuthErrorMessages.EXISTING_USER);
    }

    return true;
}

export const checkOtpRestrictions = async (email: string) => {

    const emailLock = await redis.get(`otp_lock:${email}`);
    const emailSpamLock = await redis.get(`otp_spam_lock:${email}`);
    const emailCoolDown = await redis.get(`otp_cooldown:${email}`);

    if (emailLock) {
        throw new ValidationError(AuthErrorMessages.ACCOUNT_LOCKED);
    }

    if (emailSpamLock) {
        throw new ValidationError(AuthErrorMessages.TOO_MANY_OTP_REQUESTS);
    }

    if (emailCoolDown) {
        throw new ValidationError(AuthErrorMessages.OTP_COOLDOWN);
    }

}

export const trackOtpRequests = async (email: string) => {

    const otpRequestKey = await redis.get(`otp_request_count:${email}`) || "0";
    let otpRequests = parseInt(otpRequestKey);

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
        throw new ValidationError(AuthErrorMessages.TOO_MANY_OTP_REQUESTS);
    }

    await redis.set(`otp_request_count:${email}`, otpRequests + 1, "EX", 3600);

};

export const sendOtp = async (
    name: string,
    email: string,
    template: string,
) => {

    const smtpEmail = process.env.SMTP_USER || 'icaroip15@gmail.com';

    const otp = crypto.randomInt(1000, 9999).toString();
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
    await sendEmail(email, "Verifique seu E-mail!", template, { name, otp, smtpEmail });
};

export const verifyOtp = async (
    email: string,
    otp: string
) => {

    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
        throw new ValidationError(AuthErrorMessages.OTP_INVALID_OR_EXPIRED);
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const otpAttempts = await redis.get(failedAttemptsKey);
    const failedAttempts = parseInt(otpAttempts || "0");

    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            //mais de 2 tentativas, bloqueia por 30m
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
            await redis.del(`otp:${email}`, failedAttemptsKey);
            throw new ValidationError(AuthErrorMessages.ACCOUNT_LOCKED);
        }

        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
        throw new ValidationError(
            AuthErrorMessages.INVALID_OTP + `${2 - failedAttempts} tentativas restantes!`
        );
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);

};

export const handleForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
    userType: "user" | "seller"
) => {
    try {

        const { email } = req.body;

        if (!email) throw new ValidationError(AuthErrorMessages.REQUIRED_EMAIL);

        const user = userType === "user" && await prisma.users.findUnique({ where: { email } });

        if (!user) throw new ValidationError(`${userType} não encontrado!`);

        //restrições OTP
        await checkOtpRestrictions(email);
        await trackOtpRequests(email);

        //Gerando OTP e envio de Email
        await sendOtp(email, user.name, "forgot-password-user-email");

        res.status(200).json({
            success: true,
            message: AuthErrorMessages.SEND_OTP_EMAIL
        });

    } catch (error) {
        return next(error);
    }
}


export const verifyForgotPasswordOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return next(new ValidationError("Email e OTP são obrigatórios!"));
        }

        await verifyOtp(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP verificado. Agora você pode alterar sua senha!'
        });

    } catch (error) {
        return next(error);
    }
}