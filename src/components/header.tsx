
"use client";

import { Calendar as CalendarIcon, Filter, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { professionals, sessionTypes } from "@/lib/data";
import { format } from "date-fns";
import { ca } from 'date-fns/locale';

type AppHeaderProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  filters: { professional: string; sessionType: string };
  onFiltersChange: (filters: { professional: string; sessionType: string }) => void;
  onAssistantClick: () => void;
};

export function AppHeader({ selectedDate, onDateChange, filters, onFiltersChange, onAssistantClick }: AppHeaderProps) {
    const handleProfessionalChange = (value: string) => {
        onFiltersChange({ ...filters, professional: value });
    };

    const handleSessionTypeChange = (value: string) => {
        onFiltersChange({ ...filters, sessionType: value });
    };

  return (
    <header className="flex-shrink-0 border-b bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md">
      <div className="p-4 lg:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-xl font-bold tracking-tight">Agenda FisioActiva</h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
                <p className="text-sm text-blue-100">Desenvolupat per</p>
                <a href="https://www.procevia.es" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:underline">
                    Procevia
                </a>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="text-foreground" onClick={onAssistantClick}>
                    <Mic className="h-4 w-4" />
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal text-foreground">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "PPP", { locale: ca })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && onDateChange(date)}
                            initialFocus
                            locale={ca}
                        />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="text-foreground">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 space-y-4 text-foreground">
                        <h4 className="font-medium leading-none">Filtres</h4>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Professional</label>
                            <Select value={filters.professional} onValueChange={handleProfessionalChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tots els professionals" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tots els professionals</SelectItem>
                                    {professionals.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Tipus de Sessió</label>
                            <Select value={filters.sessionType} onValueChange={handleSessionTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Totes les sessions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Totes les sessions</SelectItem>
                                    {sessionTypes.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      </div>
    </header>
  );
}
