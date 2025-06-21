import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handle';

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const {
        name,
        email,
        password,
        phone_number,
        country
    } = data;

    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        throw new ValidationError(`Preencha os campos Obrigatórios!`);
    }
}