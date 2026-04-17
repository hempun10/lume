/**
 * Would You Rather prompt bank.
 *
 * Prompts are light, Gen-Z friendly, conversation-starting.
 * No politics, no NSFW, no "serious trauma" picks. If you're adding
 * new ones, keep the vibe: low-stakes, personality-revealing, fun.
 *
 * Ordering is shuffled per game seed so both clients get the same
 * sequence without sharing DB state.
 */

export interface WYRPrompt {
	left: string;
	right: string;
}

export const WYR_PROMPTS: WYRPrompt[] = [
	{ left: "Never use headphones again", right: "Never use speakers again" },
	{
		left: "Be stuck in a group chat that never ends",
		right: "Have no group chats at all",
	},
	{
		left: "Always know when someone's lying",
		right: "Always get away with lying",
	},
	{ left: "Have a photographic memory", right: "Never forget a face" },
	{
		left: "Fly but only 1 foot off the ground",
		right: "Be invisible but only to dogs",
	},
	{
		left: "Live without music",
		right: "Live without movies and TV shows",
	},
	{
		left: "Be fluent in every language",
		right: "Be a master of every instrument",
	},
	{
		left: "Only use dark mode forever",
		right: "Only use light mode forever",
	},
	{
		left: "Have unlimited battery on your phone",
		right: "Have unlimited wifi everywhere",
	},
	{
		left: "Always be 10 minutes late",
		right: "Always be 20 minutes early",
	},
	{
		left: "Know how you die",
		right: "Know when you die",
	},
	{
		left: "Have a rewind button for your life",
		right: "Have a pause button for your life",
	},
	{
		left: "Be the funniest person in the room",
		right: "Be the smartest person in the room",
	},
	{
		left: "Never be able to lie",
		right: "Never be believed when you tell the truth",
	},
	{
		left: "Have a personal chef",
		right: "Have a personal driver",
	},
	{
		left: "Go back to age 5 with your current memories",
		right: "Know your true love's every thought",
	},
	{
		left: "Only eat sweet food",
		right: "Only eat savory food",
	},
	{
		left: "Live in a treehouse",
		right: "Live on a houseboat",
	},
	{
		left: "Have free coffee forever",
		right: "Have free pizza forever",
	},
	{
		left: "Never have to sleep",
		right: "Never have to eat",
	},
	{
		left: "Be famous on TikTok",
		right: "Be respected on LinkedIn",
	},
	{
		left: "Text only in lowercase forever",
		right: "Text only in uppercase forever",
	},
	{
		left: "Have Spotify recommendations read your mind",
		right: "Have your FYP perfectly curated",
	},
	{
		left: "Be able to teleport but only where you've been before",
		right: "Be able to time travel but only to where you've never been",
	},
	{
		left: "Wake up not knowing what day it is",
		right: "Wake up not knowing where you are",
	},
	{
		left: "Have autotune in real life",
		right: "Have subtitles appear when people speak",
	},
	{
		left: "Give up coffee forever",
		right: "Give up streaming services forever",
	},
	{
		left: "Be a little bit famous",
		right: "Be anonymous but rich",
	},
	{
		left: "Be the best friend of someone famous",
		right: "Be famous but have no friends",
	},
	{
		left: "Never be able to skip ads",
		right: "Never be able to skip intros",
	},
	{
		left: "Have a tail",
		right: "Have wings you can't fly with",
	},
	{
		left: "Read everyone's mind for a day",
		right: "Live their best day for a day",
	},
	{
		left: "Control fire but badly",
		right: "Control water but only when it's raining",
	},
	{
		left: "Always win at rock paper scissors",
		right: "Always know the next song to play",
	},
	{
		left: "Have a photographic memory for names",
		right: "Never get lost again",
	},
	{
		left: "Live 100 years in the past",
		right: "Live 100 years in the future",
	},
	{
		left: "Have Wi-Fi anywhere but it's slow",
		right: "Have fast Wi-Fi but only at home",
	},
	{
		left: "Lose all your photos",
		right: "Lose all your saved messages",
	},
	{
		left: "Be able to talk to animals",
		right: "Be able to talk to plants",
	},
	{
		left: "Only listen to one album forever",
		right: "Only watch one movie forever",
	},
];
