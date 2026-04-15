import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { AuthInput } from "@/features/auth/components/auth-input";

interface FormInputBaseProps {
	/** Field name — must match a key in the form schema. */
	name: string;
	/** Label text displayed above the control. */
	label: string;
	/** Optional suffix after the label (e.g. "(optional)"). */
	labelSuffix?: string;
	/** Helper text shown below the control, above validation errors. */
	description?: string;
	/** Extra className applied to the FormItem wrapper. */
	className?: string;
}

interface FormInputDefaultProps extends FormInputBaseProps {
	/** Lucide icon rendered on the left side of the input (required when not using children). */
	icon: LucideIcon;
	type?: string;
	placeholder?: string;
	autoComplete?: string;
	disabled?: boolean;
	/** Pass max for date inputs, etc. */
	max?: string;
	/** No custom children — renders the default styled input. */
	children?: never;
}

interface FormInputCustomProps extends FormInputBaseProps {
	/**
	 * Render function for custom controls (Select, Calendar, TagSelector, etc.).
	 * Receives the react-hook-form field object.
	 */
	children: (
		field: ControllerRenderProps<FieldValues, FieldPath<FieldValues>>,
	) => ReactNode;
	icon?: never;
	type?: never;
	placeholder?: never;
	autoComplete?: never;
	disabled?: never;
	max?: never;
}

type FormInputProps = FormInputDefaultProps | FormInputCustomProps;

/**
 * Generic form field component that eliminates FormField/FormItem/FormLabel/
 * FormControl/FormMessage boilerplate.
 *
 * Uses `useFormContext()` — must be rendered inside a `<Form>` provider.
 *
 * @example Default — renders a styled AuthInput:
 * ```tsx
 * <FormInput name="email" label="Email" icon={Mail} placeholder="you@example.com" />
 * ```
 *
 * @example Custom — render any control via children:
 * ```tsx
 * <FormInput name="gender" label="Gender">
 *   {(field) => (
 *     <Select value={field.value} onValueChange={field.onChange}>
 *       <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="male">Male</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   )}
 * </FormInput>
 * ```
 */
export function FormInput(props: FormInputProps) {
	const { control } = useFormContext();
	const { name, label, labelSuffix, description, className, children } = props;

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					<FormLabel className="text-sm font-[600]">
						{label}
						{labelSuffix && (
							<span className="font-normal text-muted-foreground">
								{" "}
								{labelSuffix}
							</span>
						)}
					</FormLabel>
					{description && <FormDescription>{description}</FormDescription>}
					<FormControl>
						{children ? (
							children(field)
						) : (
							<AuthInput
								icon={(props as FormInputDefaultProps).icon}
								type={(props as FormInputDefaultProps).type ?? "text"}
								placeholder={(props as FormInputDefaultProps).placeholder}
								autoComplete={(props as FormInputDefaultProps).autoComplete}
								disabled={(props as FormInputDefaultProps).disabled}
								max={(props as FormInputDefaultProps).max}
								{...field}
							/>
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
