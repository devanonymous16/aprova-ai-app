
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  email: string;
  onComplete: () => void;
}

export default function CreateProfileDialog({ 
  open, 
  onOpenChange, 
  userId, 
  email,
  onComplete 
}: CreateProfileDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  
  const createUserProfile = async (role: 'admin' | 'manager' | 'student') => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      console.log(`Criando perfil para usuário ${userId} com papel: ${role}`);
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          name: email.split('@')[0],
          role: role
        });
      
      if (error) {
        console.error("Erro ao criar perfil:", error);
        toast.error("Erro ao criar perfil", {
          description: error.message
        });
      } else {
        console.log("Perfil criado com sucesso!");
        toast.success(`Perfil criado com sucesso como ${role}!`);
        onComplete();
      }
    } catch (error: any) {
      console.error("Erro ao criar perfil:", error);
      toast.error("Erro ao criar perfil");
    } finally {
      setIsCreating(false);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Perfil de Usuário</DialogTitle>
          <DialogDescription>
            Parece que seu perfil não foi criado automaticamente. 
            Selecione o tipo de usuário para continuar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button 
            onClick={() => createUserProfile('admin')}
            disabled={isCreating}
            className="bg-red-600 hover:bg-red-700"
          >
            Administrador
          </Button>
          
          <Button 
            onClick={() => createUserProfile('manager')}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Gerente
          </Button>
          
          <Button 
            onClick={() => createUserProfile('student')}
            disabled={isCreating}
          >
            Estudante
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
