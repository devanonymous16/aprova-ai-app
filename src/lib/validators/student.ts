// src/lib/validators/student.ts
import { z } from "zod";

// --- Schema de Edição (já existente) ---
const brPhoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
export const editStudentSchema = z.object({
  profile_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  student_date_of_birth: z.date({ required_error: "Data de nascimento é obrigatória.", invalid_type_error: "Data inválida." }),
  student_phone_number: z.string().regex(brPhoneRegex, { message: "Formato de telefone inválido." }).optional().or(z.literal('')),
  student_confirmed: z.boolean().default(false),
});
export type EditStudentFormValues = z.infer<typeof editStudentSchema>;


// --- NOVO Schema de Adição/Convite ---
// Função simples para validar CPF (apenas formato básico XXX.XXX.XXX-XX)
// Uma validação real de dígito verificador seria mais robusta
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export const addStudentSchema = z.object({
  cpf: z.string()
    .regex(cpfRegex, { message: "Formato de CPF inválido (use XXX.XXX.XXX-XX)." })
    .transform((val) => val.replace(/[^\d]/g, '')), // Remove a máscara antes de validar o tamanho
    // .length(11, { message: "CPF deve conter 11 dígitos." }), // Comentado por enquanto, transform pode falhar antes
  email: z.string().email({ message: "Email inválido." }),
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
});

export type AddStudentFormValues = z.infer<typeof addStudentSchema>;