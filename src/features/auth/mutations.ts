import { supabase } from "@/lib/supabase/client";

/** Sign in with email + password. */
export async function signInWithPassword({
	email,
	password,
}: {
	email: string;
	password: string;
}) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	if (error) throw error;
	return data;
}

/** Register a new account. With email confirmations disabled, this auto-signs in. */
export async function signUp({
	email,
	password,
}: {
	email: string;
	password: string;
}) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;
	return data;
}

/** Sign out the current user. */
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

/** Send a password reset email (contains a 6-digit OTP). */
export async function resetPasswordForEmail({ email }: { email: string }) {
	const { error } = await supabase.auth.resetPasswordForEmail(email);
	if (error) throw error;
}

/**
 * Verify a recovery OTP. On success Supabase establishes a recovery session
 * which lets us call `updateUser({ password })` to set a new password.
 */
export async function verifyRecoveryOtp({
	email,
	token,
}: {
	email: string;
	token: string;
}) {
	const { data, error } = await supabase.auth.verifyOtp({
		email,
		token,
		type: "recovery",
	});
	if (error) throw error;
	return data;
}

/** Update the current user's password. */
export async function updateUserPassword({ password }: { password: string }) {
	const { data, error } = await supabase.auth.updateUser({ password });
	if (error) throw error;
	return data;
}
