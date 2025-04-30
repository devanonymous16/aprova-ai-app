import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// --- ADICIONADO 'User' AO IMPORT ---
import { User, Mail, CalendarDays, Target } from 'lucide-react'; // Ícones básicos

interface StudentDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode; // Recebe conteúdo como children
  title?: string;
  description?: string;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onOpenChange, children, title, description }) => {
   console.log(`[Modal Children Ver] Render. isOpen: ${isOpen}`);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
             {/* Usa o ícone User importado */}
             <User className="h-6 w-6" /> {title || "Detalhes"}
          </DialogTitle>
          {description && (
             <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {/* Renderiza o conteúdo passado como children */}
        {children}
      </DialogContent>
    </Dialog>
  );
};