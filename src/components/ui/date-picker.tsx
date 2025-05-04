// src/components/ui/date-picker.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar" // Importa o Calendar base
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean | ((date: Date) => boolean);
  fromYear?: number; // <<-- Adiciona prop para ano inicial
  toYear?: number;   // <<-- Adiciona prop para ano final
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Selecione uma data",
    className,
    disabled,
    fromYear = 1900, // <<-- Define um ano inicial padrão razoável
    toYear = new Date().getFullYear() // <<-- Define o ano atual como final padrão
  }: DatePickerProps) {

  const selectedDate = value instanceof Date && !isNaN(value.valueOf()) ? value : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
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
          onSelect={(date) => onChange(date)}
          // --- HABILITA NAVEGAÇÃO POR ANO/MÊS ---
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
          // --- FIM DA HABILITAÇÃO ---
          initialFocus
          locale={ptBR}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}