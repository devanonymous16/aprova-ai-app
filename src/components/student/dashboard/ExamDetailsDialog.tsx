
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import React from "react";

interface ExamDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  type: "ranking" | "time";
}

export default function ExamDetailsDialog({ open, onClose, type }: ExamDetailsDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-2">
          {type === "ranking" ? "Ranking de acertos por tópico" : "Tempo praticando por tópico"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          (Visualização detalhada {type === "ranking" ? "do ranking por tópicos" : "do tempo praticado por tópico"} será exibida aqui...)
        </p>
        
        {/* Demonstração simples de como ficaria a visualização */}
        <div className="space-y-2 my-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Tópico {item}</span>
              <span>{type === "ranking" ? `#${Math.floor(Math.random() * 20) + 1} de 124` : `${Math.floor(Math.random() * 10) + 1}h ${Math.floor(Math.random() * 60)}min`}</span>
            </div>
          ))}
        </div>
        
        <Button onClick={onClose} className="mt-4">
          Fechar
        </Button>
      </div>
    </div>
  );
}
