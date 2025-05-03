// src/components/manager/EditStudentForm.tsx
"use client"; // Necessário para react-hook-form

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Para o campo 'confirmed'
import { DatePicker } from "@/components/ui/date-picker"; // Nosso componente DatePicker
import { toast } from "sonner"; // Para feedback
import { Loader2 } from 'lucide-react';

// Importa o schema e o tipo dos detalhes do aluno
import { editStudentSchema, EditStudentFormValues } from "@/lib/validators/student"; // Ajuste o path se necessário
import { StudentDetailsData } from '@/hooks/manager/useStudentDetails'; // Ajuste o path se necessário

interface EditStudentFormProps {
  studentDetails: StudentDetailsData; // Recebe os dados atuais
  // onSubmitSuccess?: () => void; // Callback opcional para quando salvar com sucesso
}

export default function EditStudentForm({ studentDetails }: EditStudentFormProps) {
  // Estado para controlar o loading do submit
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // 1. Define o formulário.
  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      profile_name: studentDetails.profile_name ?? "",
      // Converte a string de data do DB para um objeto Date, ou undefined se inválida/nula
      student_date_of_birth: studentDetails.student_date_of_birth
         ? new Date(studentDetails.student_date_of_birth + 'T00:00:00Z') // Adiciona T00:00:00Z para tratar como UTC
         : undefined, // Use undefined se não houver data inicial
      student_phone_number: studentDetails.student_phone_number ?? "",
      student_confirmed: studentDetails.student_confirmed ?? false,
    },
  });

  // 2. Define o handler de submissão.
  async function onSubmit(values: EditStudentFormValues) {
    setIsSubmitting(true);
    console.log("Dados do formulário para salvar:", values);

    // --- TODO: Implementar Lógica de Atualização no Supabase ---
    // 1. Chamar uma função (ex: Supabase Edge Function ou RPC) que:
    //    - Recebe studentId e os 'values'.
    //    - Atualiza a tabela 'profiles' com profile_name.
    //    - Atualiza a tabela 'students' com date_of_birth, phone_number, confirmed.
    //    - Garante que o manager tem permissão (verificação na função ou RLS de update).
    // 2. Tratar sucesso e erro.

    // Exemplo de simulação
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Simulação de salvamento concluída.");
    toast.success("Dados do aluno atualizados com sucesso! (Simulação)");
    // onSubmitSuccess?.(); // Chama callback se houver

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo Nome */}
        <FormField
          control={form.control}
          name="profile_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do aluno..." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Data de Nascimento */}
        <FormField
          control={form.control}
          name="student_date_of_birth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Nascimento</FormLabel>
              <DatePicker
                value={field.value ?? null} // Passa Date ou null
                onChange={(date) => field.onChange(date)} // Recebe Date ou undefined
                placeholder="Selecione a data de nascimento"
                disabled={isSubmitting}
              />
              <FormMessage className="mt-1"/>
            </FormItem>
          )}
        />

        {/* Campo Telefone */}
        <FormField
          control={form.control}
          name="student_phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} disabled={isSubmitting} />
              </FormControl>
               <FormDescription>
                  Formato sugerido: (XX) XXXXX-XXXX
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Confirmado */}
        <FormField
           control={form.control}
           name="student_confirmed"
           render={({ field }) => (
             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
               <div className="space-y-0.5">
                 <FormLabel>Aluno Confirmado?</FormLabel>
                 <FormDescription>
                   Indica se o cadastro do aluno foi verificado/confirmado.
                 </FormDescription>
               </div>
               <FormControl>
                 <Switch
                   checked={field.value}
                   onCheckedChange={field.onChange}
                   disabled={isSubmitting}
                 />
               </FormControl>
             </FormItem>
           )}
         />

        {/* Botão Salvar */}
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </div>
      </form>
    </Form>
  );
}