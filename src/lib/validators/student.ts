// src/lib/validators/student.ts (Exemplo)
import { z } from "zod";

// Função helper para validar telefone (exemplo simples, pode melhorar)
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Exemplo E.164 simplificado
const brPhoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; // Exemplo BR

export const editStudentSchema = z.object({
  // De profiles
  profile_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  // avatar_url: z.string().url({ message: "URL do avatar inválida." }).optional().or(z.literal('')), // Para depois

  // De students
  student_date_of_birth: z.date({
      required_error: "Data de nascimento é obrigatória.",
      invalid_type_error: "Data inválida.",
  }), // react-hook-form + shadcn/ui DatePicker geralmente trabalham com Date objects
  student_phone_number: z.string()
      .regex(brPhoneRegex, { message: "Formato de telefone inválido." }) // Exemplo de validação
      .optional() // Tornar opcional se permitido
      .or(z.literal('')), // Permite string vazia se for opcional
  student_confirmed: z.boolean().default(false), // Campo booleano
});

export type EditStudentFormValues = z.infer<typeof editStudentSchema>;