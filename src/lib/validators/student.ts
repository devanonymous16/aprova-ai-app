// src/lib/validators/student.ts
import { z } from "zod";

const brPhoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const editStudentSchema = z.object({
  profile_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  student_date_of_birth: z.date({ required_error: "Data de nascimento é obrigatória.", invalid_type_error: "Data inválida." }),
  student_phone_number: z.string().regex(brPhoneRegex, { message: "Formato de telefone inválido." }).optional().or(z.literal('')),
  // student_confirmed: z.boolean().default(false), // <<-- REMOVIDO
});
export type EditStudentFormValues = z.infer<typeof editStudentSchema>;

// Schema de Adição/Convite (sem alterações)
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const addStudentSchema = z.object({
  cpf: z.string()
    .regex(cpfRegex, { message: "Formato de CPF inválido (use XXX.XXX.XXX-XX)." })
    .transform((val) => val.replace(/[^\d]/g, '')),
  email: z.string().email({ message: "Email inválido." }),
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
});
export type AddStudentFormValues = z.infer<typeof addStudentSchema>;