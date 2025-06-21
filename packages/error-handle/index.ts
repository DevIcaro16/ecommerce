//Classe que conterá os tratamentos a cerca dos erros da aplicação

export class AppError extends Error {

    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details: any;

    //Construtor com as props que serão necessárias para o tratamento do erro
    constructor(message: string, statusCode: number, isOperational = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    };

};


//Classes que tratarão de cada erro em especifico

//Not Found
export class NotFoundError extends AppError {
    constructor(message = "Recurso não encontrado!") {
        super(message, 404);
    }
};

//Validation Error
export class ValidationError extends AppError {
    constructor(message = "Dados da requisição inválidos!", details?: any) {
        super(message, 400, details);
    }
};

//Auth Error
export class AuthError extends AppError {
    constructor(message = "Sem Autorização!") {
        super(message, 401);
    }
};

//Forbidden Error
export class ForbiddenError extends AppError {
    constructor(message = "Acesso Negado!") {
        super(message, 401);
    }
};

//Database Error
export class DatabaseError extends AppError {
    constructor(message = "Erro na base de dados!", details?: any) {
        super(message, 500, true, details);
    }
};

//RateLimit Error
export class RateLimitErrorError extends AppError {
    constructor(message = "Muitas requisições foram realizadas, por favor aguarde!", details?: any) {
        super(message, 429);
    }
};

