export enum AuthErrorMessages {

    ACCOUNT_LOCKED = "Conta bloqueada devido a várias tentativas falhadas, Tente novamente em 30 Minutos!",
    TOO_MANY_OTP_REQUESTS = "Muitas requisições OTP realizadas!, Por favor, espere 1 hora para tentar novamente.",
    OTP_COOLDOWN = "Por favor, espere 1 minuto para solicitar um novo código OTP.",

    WEAK_PASSWORD = "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.",
    INVALID_PHONE_FORMAT = "Formato de telefone inválido!",
    INVALID_COUNTRY = "País inválido!",

    REQUIRED_FIELDS = "Preencha os campos Obrigatórios!",
    INVALID_EMAIL_FORMAT = "Formato de E-mail Inválido!",
    ERROR_CREATE_USER = "Ocorreu um problema ao criar o Usuário!",
    INVALID_CREDENTIALS = "E-mail ou senha inválidos!",
    INVALID_PASS = "Senha inválida!",
    SAME_PASS = "Nova senha não pode ser igual a anterior!",
    REQUIRED_EMAIL = "Email é obrigatório!",

    USER_NOT_FOUND = "Usuário não encontrado!",
    EXISTING_USER = "Usuário já existente com esse E-mail!",
    NOT_EXISTING_USER = "Usuário não encontrado com esse Email!",
    ACCOUNT_NOT_VERIFIED = "Conta não verificada. Verifique seu e-mail!",


    INVALID_OTP = "Código OTP Inválido. ",
    OTP_EXPIRED = "Código OTP expirado!",
    OTP_INVALID_OR_EXPIRED = "Código OTP Inválido ou Expirado!",
    OTP_ALREADY_USED = "Código OTP já foi utilizado!",
    SEND_OTP_EMAIL = "Códito OTP enviado ao E-mail. Por favor verifique sua conta!"
} 