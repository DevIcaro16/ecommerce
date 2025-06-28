import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handle';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendEmail';
import { NextFunction } from 'express';
import { AuthErrorMessages } from './enum-error-msgs/error-messages';

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

export const sendOtp = async (name: string, email: string, template: string,) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
    await sendEmail(email, "Verifique seu E-mail!", template, { name, otp });
}

