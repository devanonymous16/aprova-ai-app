
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import React from "react";

interface ExamDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  type: "ranking" | "time";
}

export default function ExamDetailsDialog({ open, onClose, type }: ExamDetailsDialogProps) {
  const title = type === "ranking" 
    ? "Ranking de acertos por tópico" 
    : "Tempo praticando por tópico";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            (Visualização detalhada {type === "ranking" ? "do ranking por tópicos" : "do tempo praticado por tópico"} será exibida aqui...)
          </p>
          
          {/* Demonstração simples de como ficaria a visualização */}
          <div className="space-y-2 my-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Tópico {item}</span>
                <span>
                  {type === "ranking" 
                    ? `#${Math.floor(Math.random() * 20) + 1} de 124` 
                    : `${Math.floor(Math.random() * 10) + 1}h ${Math.floor(Math.random() * 60)}min`}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
