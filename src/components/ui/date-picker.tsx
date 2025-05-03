// src/components/ui/date-picker.tsx
"use client" // Necessário se usar hooks do React como useState/useEffect

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"; // Importa locale pt-BR
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | null; // Aceita Date ou null
  onChange: (date: Date | undefined) => void; // Callback com Date ou undefined
  placeholder?: string;
  className?: string;
  disabled?: boolean | ((date: Date) => boolean); // Pode desabilitar datas específicas
}

export function DatePicker({ value, onChange, placeholder = "Selecione uma data", className, disabled }: DatePickerProps) {
  // Lida com value sendo null/undefined internamente para o Calendar
  const selectedDate = value instanceof Date ? value : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal", // Ajustado para largura total
            !value && "text-muted-foreground",
            className // Permite classes externas
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: ptBR }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => onChange(date)} // Passa o Date ou undefined
          initialFocus
          locale={ptBR} // Define locale pt-BR
          disabled={disabled} // Passa a prop disabled
        />
      </PopoverContent>
    </Popover>
  )
}