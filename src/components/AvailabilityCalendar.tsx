import { useState, useEffect, useMemo } from "react";
import {
  format,
  addDays,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  slot_duration_minutes: number;
}

interface AvailabilityCalendarProps {
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

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const AvailabilityCalendar = ({ value, onChange }: AvailabilityCalendarProps) => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("work_schedule").select("*").then(({ data }) => {
      if (data) setSchedule(data as Schedule[]);
    });

    supabase
      .from("applications")
      .select("preferred_time")
      .not("preferred_time", "is", null)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string[]> = {};
        data.forEach((app) => {
          const pt = app.preferred_time;
          if (!pt) return;
          const parts = pt.split(" ");
          if (parts.length >= 2) {
            const dateKey = parts[0];
            const slot = parts.slice(1).join(" ");
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(slot);
          }
        });
        setBookedSlots(map);
      });
  }, []);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayStatus = (date: Date): "free" | "partial" | "full" | "off" | "past" => {
    if (isBefore(date, startOfDay(new Date())) && !isToday(date)) return "past";
    if (date > addDays(new Date(), 31)) return "off";

    const dow = getDay(date);
    const daySchedule = schedule.find((s) => s.day_of_week === dow);
    if (!daySchedule || !daySchedule.is_working_day) return "off";

    const totalSlots = generateSlots(daySchedule.start_time, daySchedule.end_time, daySchedule.slot_duration_minutes);
    const dateKey = format(date, "dd.MM.yyyy");
    const booked = bookedSlots[dateKey] || [];
    const bookedCount = booked.length;

    if (bookedCount === 0) return "free";
    if (bookedCount >= totalSlots.length) return "full";
    return "partial";
  };

  const handleDateClick = (date: Date) => {
    const status = getDayStatus(date);
    if (status === "past" || status === "off" || status === "full") return;

    setSelectedDate(date);
    const dow = getDay(date);
    const daySchedule = schedule.find((s) => s.day_of_week === dow);
    if (!daySchedule) return;

    const allSlots = generateSlots(daySchedule.start_time, daySchedule.end_time, daySchedule.slot_duration_minutes);
    const dateKey = format(date, "dd.MM.yyyy");
    const booked = bookedSlots[dateKey] || [];
    setAvailableSlots(allSlots.filter((s) => !booked.includes(s)));
  };

  const handleSlotClick = (slot: string) => {
    if (!selectedDate) return;
    onChange(`${format(selectedDate, "dd.MM.yyyy")} ${slot}`);
  };

  const firstDayOffset = useMemo(() => {
    const dow = getDay(days[0]);
    return dow === 0 ? 6 : dow - 1;
  }, [days]);

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          disabled={isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(new Date()))}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm font-semibold capitalize text-foreground">
          {format(currentMonth, "LLLL yyyy", { locale: ru })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid — compact */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const status = getDayStatus(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const clickable = status !== "past" && status !== "off" && status !== "full";

          const statusColors: Record<string, string> = {
            free: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/60",
            partial: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200/60",
            full: "bg-red-50 text-red-300 border-red-200/40",
            off: "text-muted-foreground/30 border-transparent",
            past: "text-muted-foreground/25 border-transparent",
          };

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={!clickable}
              className={cn(
                "w-full aspect-square rounded-md text-xs font-medium border transition-all duration-150",
                "flex items-center justify-center",
                statusColors[status],
                !clickable && "cursor-not-allowed",
                isSelected && clickable && "ring-2 ring-primary ring-offset-1 shadow-sm",
                isToday(day) && "font-bold"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-0.5">
        {[
          { cls: "bg-emerald-50 border-emerald-200", label: "Свободно" },
          { cls: "bg-amber-50 border-amber-200", label: "Частично" },
          { cls: "bg-red-50 border-red-200", label: "Занято" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={cn("w-2.5 h-2.5 rounded-sm border", cls)} />
            {label}
          </div>
        ))}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium text-foreground mb-2">
            {format(selectedDate, "d MMMM, EEEE", { locale: ru })}
          </p>
          {availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {availableSlots.map((slot) => {
                const isChosen = value === `${format(selectedDate, "dd.MM.yyyy")} ${slot}`;
                return (
                  <Button
                    key={slot}
                    type="button"
                    variant={isChosen ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs h-7 px-2.5 rounded-md transition-all duration-150",
                      isChosen && "shadow-sm"
                    )}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {slot}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Нет свободных окон</p>
          )}
        </div>
      )}

      {/* Selected value chip */}
      {value && (
        <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span className="text-xs font-medium">{value} выбрано</span>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
