import type { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { supabase } from "@/lib/supabase/client";

interface AuthContextValue {
	session: Session | null;
	user: User | null;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
	session: null,
	user: null,
	isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session);

			if (event === "INITIAL_SESSION") {
				setIsLoading(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	return (
		<AuthContext value={{ session, user: session?.user ?? null, isLoading }}>
			{children}
		</AuthContext>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
