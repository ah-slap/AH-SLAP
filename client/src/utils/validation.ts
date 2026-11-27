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


// Reusable error-object type: keys match the form's field names, values are error strings
export type FormErrors<T> = Partial<Record<keyof T, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


//Validation function for register form
export function validateRegisterForm(values: RegisterFormValues): FormErrors<RegisterFormValues> {
    const errors: FormErrors<RegisterFormValues> = {};

    if(!values.fullName.trim()) {
        errors.fullName = 'Full name is required';
    }
    if(!values.email.trim()) {
        errors.email = 'Email is required';
    } else if(!emailRegex.test(values.email)) {
        errors.email = 'Invalid email format';
    }

    if(!values.password) {
        errors.password = 'Password is required';
    }
    if(values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
}


//Validation function for login form
export function validateLoginForm(values: LoginFormValues): FormErrors<LoginFormValues> {
    const errors: FormErrors<LoginFormValues> = {};
    if(!values.email.trim()) {
        errors.email = 'Email is required';
    } else if(!emailRegex.test(values.email)) {
        errors.email = 'Invalid email format';
    }
    if(!values.password) {
        errors.password = 'Password is required';
    }
    return errors;
}