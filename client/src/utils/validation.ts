export interface RegisterFormValues {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
}

export interface LoginFormValues {
    email: string;
    password: string;
}

