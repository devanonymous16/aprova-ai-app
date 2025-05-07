// src/components/manager/AddStudentDialog.tsx
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription // Adicionado FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addStudentSchema, AddStudentFormValues } from "@/lib/validators/student";

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AddStudentDialog({ isOpen, onOpenChange }: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: { cpf: "", email: "", name: "" },
  });

  async function onSubmit(values: AddStudentFormValues) {
    setIsSubmitting(true);
    const cleanedCpf = values.cpf; // Zod já removeu a máscara
    console.log("[onSubmit AddStudent] Chamando Edge Function 'add-invite-student' com:", {
      cpf: cleanedCpf,
      email: values.email,
      name: values.name,
    });

    try {
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('add-invite-student', {
        body: { cpf: cleanedCpf, email: values.email, name: values.name, },
      });

      if (functionError) {
        console.error('[onSubmit AddStudent] Erro ao chamar Edge Function:', functionError);
        const detail = (functionError as any)?.context?.message || functionError.message;
        throw new Error(detail || 'Erro ao processar a solicitação na função.');
      }

      console.log('[onSubmit AddStudent] Resposta da Edge Function:', functionResponse);
      toast.success(functionResponse.message || "Operação concluída com sucesso!");
      form.reset();
      onOpenChange(false);
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

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/^(\d{3})(\d)/, '$1.$2');
      value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');
      if (value.length > 14) value = value.substring(0, 14);
      form.setValue('cpf', value, { shouldValidate: true });
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
        {/* --- FORMULÁRIO RESTAURADO --- */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Campo CPF */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF do Aluno</FormLabel>
                  <FormControl>
                    <Input
                       placeholder="000.000.000-00"
                       {...field}
                       onChange={handleCpfChange} // Usa o handler customizado
                       value={field.value} // Garante que o valor com máscara seja exibido
                       disabled={isSubmitting}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo Email */}
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Aluno</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="aluno@email.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>
                     Usado para comunicação e convite (se for novo aluno).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo Nome Completo */}
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do aluno" {...field} disabled={isSubmitting} />
                  </FormControl>
                   <FormDescription>
                      Necessário se for um novo aluno.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --- FIM DOS CAMPOS DO FORMULÁRIO --- */}
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