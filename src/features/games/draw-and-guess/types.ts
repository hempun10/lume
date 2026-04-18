export type DrawablePoint = { x: number; y: number };

export type Drawable = {
	id: string;
	color: string;
	width: number;
	points: DrawablePoint[];
};
