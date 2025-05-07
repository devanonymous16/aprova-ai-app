// src/components/manager/AddStudentDialog.tsx
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { z } from "zod"; // Já importado no schema
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // <<-- IMPORTAR CLIENTE SUPABASE
import { useQueryClient } from '@tanstack/react-query';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addStudentSchema, AddStudentFormValues } from "@/lib/validators/student";

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onStudentAdded?: () => void; // Callback para futuro refresh
}

export default function AddStudentDialog({ isOpen, onOpenChange }: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: { cpf: "", email: "", name: "" },
  });

  // --- onSubmit ATUALIZADO PARA CHAMAR A EDGE FUNCTION ---
  async function onSubmit(values: AddStudentFormValues) {
    setIsSubmitting(true);
    const cleanedCpf = values.cpf; // Zod já removeu a máscara
    console.log("[onSubmit AddStudent] Chamando Edge Function 'add-invite-student' com:", {
      cpf: cleanedCpf,
      email: values.email,
      name: values.name,
    });

    try {
      // Chama a Edge Function
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('add-invite-student', {
        body: {
          cpf: cleanedCpf,
          email: values.email,
          name: values.name,
        },
      });

      if (functionError) {
        console.error('[onSubmit AddStudent] Erro ao chamar Edge Function:', functionError);
        // Tenta pegar uma mensagem de erro mais específica do corpo do erro, se existir
        const detail = (functionError as any)?.context?.message || functionError.message;
        throw new Error(detail || 'Erro ao processar a solicitação na função.');
      }

      console.log('[onSubmit AddStudent] Resposta da Edge Function:', functionResponse);
      // Assumindo que a Edge Function retorna um objeto com uma propriedade 'message'
      toast.success(functionResponse.message || "Operação concluída com sucesso!");

      form.reset();
      onOpenChange(false);
      // Invalida a lista de alunos para atualizar a tabela
      await queryClient.invalidateQueries({ queryKey: ['managerStudents'] });
      console.log("[onSubmit AddStudent] Query 'managerStudents' invalidada.");

    } catch (error: any) {
      console.error("[onSubmit AddStudent] Erro:", error);
      toast.error("Falha na operação", {
          description: error.message || "Não foi possível adicionar ou convidar o aluno.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  // --- FIM do onSubmit ---

  // Função para aplicar máscara de CPF enquanto digita
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove não dígitos
      value = value.replace(/^(\d{3})(\d)/, '$1.$2');
      value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');
      if (value.length > 14) value = value.substring(0, 14); // Limita tamanho
      form.setValue('cpf', value, { shouldValidate: true }); // Atualiza com máscara e valida
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
            <DialogTitle>Adicionar ou Convidar Aluno</DialogTitle>
            <DialogDescription>
            Insira o CPF para verificar se o aluno já existe. Preencha os demais dados para adicioná-lo ou enviar um convite.
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* ... FormFields (CPF, Email, Name) ... */}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Processando..." : "Adicionar / Convidar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}