
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { BarChart3, Clock } from "lucide-react";

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
          <DialogTitle className="flex items-center gap-2">
            {type === "ranking" ? (
              <BarChart3 className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {type === "ranking" 
              ? "Veja como você se compara a outros estudantes em cada tópico."
              : "Confira quanto tempo você já dedicou a cada tópico de estudo."}
          </p>
          
          <div className="space-y-2 my-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div 
                key={item} 
                className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Tópico {item}</span>
                <span className={type === "ranking" ? "text-primary font-semibold" : ""}>
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
