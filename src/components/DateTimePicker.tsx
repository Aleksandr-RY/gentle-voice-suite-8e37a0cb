import { useState, useEffect } from "react";
import { format, addDays, startOfDay, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  slot_duration_minutes: number;
}

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const generateSlots = (startTime: string, endTime: string, duration: number): string[] => {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  for (let m = startMin; m + duration <= endMin; m += duration) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const endM = m + duration;
    const endH = Math.floor(endM / 60);
    const endMn = endM % 60;
    slots.push(
      `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}–${String(endH).padStart(2, "0")}:${String(endMn).padStart(2, "0")}`
    );
  }
  return slots;
};

const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("work_schedule")
      .select("*")
      .then(({ data }) => {
        if (data) setSchedule(data as Schedule[]);
      });
  }, []);

  const workingDays = schedule.filter((s) => s.is_working_day).map((s) => s.day_of_week);

  const isDisabledDay = (date: Date) => {
    if (date < startOfDay(new Date())) return true;
    if (date > addDays(new Date(), 31)) return true;
    const dow = getDay(date);
    return !workingDays.includes(dow);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      setSlots([]);
      return;
    }
    const dow = getDay(date);
    const daySchedule = schedule.find((s) => s.day_of_week === dow);
    if (daySchedule && daySchedule.is_working_day) {
      setSlots(generateSlots(daySchedule.start_time, daySchedule.end_time, daySchedule.slot_duration_minutes));
    } else {
      setSlots([]);
    }
  };

  const handleSlotClick = (slot: string) => {
    if (!selectedDate) return;
    const formatted = `${format(selectedDate, "dd.MM.yyyy", { locale: ru })} ${slot}`;
    onChange(formatted);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value || "Выберите дату и время"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start" side="bottom" sideOffset={4}>
        <div className="flex flex-col sm:flex-row max-h-[70vh] overflow-y-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDisabledDay}
            locale={ru}
            className={cn("p-3 pointer-events-auto")}
          />
          {selectedDate && slots.length > 0 && (
            <div className="border-t sm:border-t-0 sm:border-l border-border p-3 max-h-[200px] sm:max-h-[300px] overflow-y-auto min-w-[140px]">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {format(selectedDate, "d MMMM", { locale: ru })}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => handleSlotClick(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
