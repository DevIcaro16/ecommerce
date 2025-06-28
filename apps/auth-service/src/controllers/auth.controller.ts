import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handle";
import { AuthErrorMessages } from "../utils/enum-error-msgs/error-messages";

//Registro de um novo Usuário
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {

    try {

        validateRegistrationData(req.body, "user");

        const { name, email } = req.body;

        const existing = await prisma.users.findUnique({ where: { email } });

        if (existing) {
            return next(new ValidationError("Usuário já existente com esse E-mail!"));
        }

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