import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: Date;
  max?: Date;
  children: React.ReactNode;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

export function DateTimePicker({ value, onChange, min, max, children }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (!value) { setSelectedDate(undefined); return; }
    const d = new Date(value);
    if (isNaN(d.getTime())) return;
    const remainder = d.getMinutes() % 10;
    if (remainder !== 0) d.setMinutes(d.getMinutes() + (10 - remainder), 0, 0);
    setSelectedDate(d);
    setHour(d.getHours());
    setMinute(d.getMinutes());
  }, [value]);

  const emit = (date: Date, h: number, m: number) => {
    const result = new Date(date);
    result.setHours(h, m, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    onChange(`${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}T${pad(h)}:${pad(m)}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    emit(date, hour, minute);
  };

  const handleHourChange = (h: number) => {
    setHour(h);
    if (selectedDate) emit(selectedDate, h, minute);
  };

  const handleMinuteChange = (m: number) => {
    setMinute(m);
    if (selectedDate) emit(selectedDate, hour, m);
  };

  const isDateDisabled = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (min) {
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      if (d < minDay) return true;
    }
    if (max) {
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      if (d > maxDay) return true;
    }
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          initialFocus
          classNames={{
            day_selected: "bg-stone-800 text-white hover:bg-stone-800 hover:text-white focus:bg-stone-800 focus:text-white",
            day_today: "",
          }}
        />
        <div className="border-t border-gray-100 px-3 py-3">
          <p className="text-xs text-gray-400 mb-2">시간 선택</p>
          <div className="flex items-center gap-2">
            <select
              value={hour}
              onChange={(e) => handleHourChange(Number(e.target.value))}
              className="flex-1 h-9 border border-gray-200 rounded text-sm px-2 focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>
              ))}
            </select>
            <select
              value={minute}
              onChange={(e) => handleMinuteChange(Number(e.target.value))}
              className="flex-1 h-9 border border-gray-200 rounded text-sm px-2 focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
