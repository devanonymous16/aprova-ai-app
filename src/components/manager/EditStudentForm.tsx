// src/components/manager/EditStudentForm.tsx
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch"; // Removido
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

import { editStudentSchema, EditStudentFormValues } from "@/lib/validators/student";
import { StudentDetailsData } from '@/hooks/manager/useStudentDetails';

interface EditStudentFormProps {
  studentDetails: StudentDetailsData;
  studentId: string;
}

export default function EditStudentForm({ studentDetails, studentId }: EditStudentFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      profile_name: studentDetails.profile_name ?? "",
      student_date_of_birth: studentDetails.student_date_of_birth
         ? new Date(studentDetails.student_date_of_birth + 'Z')
         : undefined,
      student_phone_number: studentDetails.student_phone_number ?? "",
    },
  });

  async function onSubmit(values: EditStudentFormValues) {
    setIsSubmitting(true);
    console.log("Dados do formulário para salvar (sem confirmed):", values);
    const formattedDob = values.student_date_of_birth
       ? values.student_date_of_birth.toISOString().split('T')[0]
       : null;

    try {
        console.log("Chamando RPC update_student_details_by_manager (sem confirmed)...");
        const { error: rpcError } = await supabase.rpc('update_student_details_by_manager', {
            p_student_id: studentId,
            p_profile_name: values.profile_name,
            p_student_date_of_birth: formattedDob,
            p_student_phone_number: values.student_phone_number || null,
        });

        if (rpcError) throw rpcError;

        console.log("RPC executada com sucesso.");
        toast.success("Dados do aluno atualizados com sucesso!");
        await queryClient.invalidateQueries({ queryKey: ['studentDetails', studentId] });
        console.log("Query 'studentDetails' invalidada.");

    } catch (error: any) {
        console.error("Erro ao salvar dados do aluno:", error);
        toast.error("Falha ao atualizar dados.", {
            description: error.message || 'Ocorreu um erro inesperado.',
        });
    } finally {
        setIsSubmitting(false);
    }
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
        /> {/* FECHADO */}

        {/* Campo Data de Nascimento */}
        <FormField
          control={form.control}
          name="student_date_of_birth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Nascimento</FormLabel>
              <DatePicker
                value={field.value ?? null}
                onChange={(date) => field.onChange(date)}
                placeholder="Selecione a data de nascimento"
                disabled={isSubmitting}
              />
              <FormMessage className="mt-1"/>
            </FormItem>
          )}
        /> {/* FECHADO */}

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
        /> {/* FECHADO */}

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