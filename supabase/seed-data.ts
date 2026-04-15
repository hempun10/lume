export interface SeedUser {
	email: string;
	password: string;
	displayName: string;
	dateOfBirth: string;
	gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
	region?: string;
	interests: string[];
}

export const seedUsers: SeedUser[] = [
	{
		email: "user-a@example.com",
		password: "password123",
		displayName: "Alice",
		dateOfBirth: "2000-03-15",
		gender: "female",
		region: "New York",
		interests: ["Music", "Travel", "Photography", "Cooking"],
	},
	{
		email: "user-b@example.com",
		password: "password123",
		displayName: "Bob",
		dateOfBirth: "1998-07-22",
		gender: "male",
		region: "London",
		interests: ["Gaming", "Technology", "Anime", "Fitness"],
	},
];
