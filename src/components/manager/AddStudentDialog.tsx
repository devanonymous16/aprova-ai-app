// src/components/manager/AddStudentDialog.tsx
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addStudentSchema, AddStudentFormValues } from "@/lib/validators/student"; // Importa schema

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onStudentAdded?: () => void; // Callback para futuro refresh
}

export default function AddStudentDialog({ isOpen, onOpenChange }: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      cpf: "",
      email: "",
      name: "",
    },
  });

  async function onSubmit(values: AddStudentFormValues) {
    setIsSubmitting(true);
    console.log("Dados do formulário de adição/convite:", values);
    // Remover máscara do CPF ANTES de enviar (já feito no transform do Zod)
    const cleanCpf = values.cpf; // Zod já removeu a máscara
    console.log("CPF Limpo:", cleanCpf);


    // --- TODO: Implementar Lógica de Backend (RPC/Edge Function) ---
    // 1. Chamar função `add_or_invite_student_by_cpf` passando:
    //    cpf: cleanCpf
    //    email: values.email
    //    name: values.name
    //    organization_id: (precisa obter do manager logado)
    // 2. Tratar resposta (aluno adicionado vs. convite enviado vs. erro)

    // Simulação
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.3; // Simula sucesso/erro aleatório
    if (success) {
        console.log("Simulação de adição/convite bem-sucedida.");
        toast.success("Operação iniciada.", { description: "Aluno existente adicionado ou convite enviado para novo aluno."});
        form.reset(); // Limpa o formulário
        onOpenChange(false); // Fecha o modal
        // onStudentAdded?.(); // Chama callback de refresh
    } else {
         console.error("Simulação de erro ao adicionar/convidar.");
         toast.error("Falha na operação", { description: "Não foi possível adicionar ou convidar o aluno."});
    }

    setIsSubmitting(false);
  }

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
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => ( // Precisa passar o field original para onChange funcionar
                <FormItem>
                  <FormLabel>CPF do Aluno</FormLabel>
                  <FormControl>
                    {/* Usa field.value para exibir, mas o onChange customizado */}
                    <Input
                       placeholder="000.000.000-00"
                       {...field} // Mantém outras props do field
                       onChange={handleCpfChange} // Usa o handler customizado
                       value={field.value} // Garante que o valor com máscara seja exibido
                       disabled={isSubmitting}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <DialogFooter>
              {/* DialogClose é útil para fechar sem submeter */}
              <DialogClose asChild>
                 <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
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