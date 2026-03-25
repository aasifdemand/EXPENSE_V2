import { z } from "zod";

export const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters").max(100, "Description too long"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  departmentId: z.string().min(1, "Please select a department"),
  subDepartmentId: z.string().min(1, "Please select a category"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  paymentType: z.enum(["CASH", "CARD", "UPI", "OTHERS"]).optional(),
  proof: z.any().optional(),
});

export const validateStep = (step, data) => {
  let fieldsToValidate = [];
  if (step === 1) fieldsToValidate = ["description", "date"];
  if (step === 2) fieldsToValidate = ["departmentId", "subDepartmentId"];
  if (step === 3) fieldsToValidate = ["amount"];

  const stepSchema = z.object(
    Object.fromEntries(
      fieldsToValidate.map((field) => [field, expenseSchema.shape[field]])
    )
  );

  const result = stepSchema.safeParse(data);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((issue) => {
      errors[issue.path[0]] = issue.message;
    });
    return { success: false, errors };
  }
  return { success: true, errors: {} };
};

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Please select a department"),
  role: z.enum(["user", "admin", "superadmin"]),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  name: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const budgetSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  company: z.string().min(1, "Please select a company"),
});
