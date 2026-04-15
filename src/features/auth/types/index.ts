import type {
	ForgotPasswordFormValues,
	LoginFormValues,
	ResetPasswordFormValues,
	SignupFormValues,
} from "../schema";

export interface LoginFormProps {
	onSubmit: (data: LoginFormValues) => Promise<void>;
	error?: string | null;
	onToggleMode: () => void;
}

export interface SignupFormProps {
	onSubmit: (data: SignupFormValues) => Promise<void>;
	error?: string | null;
	onToggleMode: () => void;
}

export interface ForgotPasswordFormProps {
	onSubmit: (data: ForgotPasswordFormValues) => Promise<void>;
	error?: string | null;
	success?: boolean;
}

export interface ResetPasswordFormProps {
	onSubmit: (data: ResetPasswordFormValues) => Promise<void>;
	error?: string | null;
	success?: boolean;
	hasSession: boolean;
}
