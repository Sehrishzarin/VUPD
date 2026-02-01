import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function MultiDatePicker({ dates = [], onSelect, disabled, className, maxTagCount = "responsive" }) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dateIndex = dates.findIndex(d => format(new Date(d), 'yyyy-MM-dd') === dateStr);
    
    let newDates;
    if (dateIndex >= 0) {
      // Remove date if already selected
      newDates = dates.filter((_, i) => i !== dateIndex);
    } else {
      // Add date
      newDates = [...dates, selectedDate];
    }
    
    onSelect(newDates);
  }

  const removeDate = (dateToRemove) => {
    const newDates = dates.filter(d => format(new Date(d), 'yyyy-MM-dd') !== format(new Date(dateToRemove), 'yyyy-MM-dd'));
    onSelect(newDates);
  }

  const displayDates = maxTagCount === "responsive" 
    ? dates.slice(0, 3)
    : dates.slice(0, maxTagCount);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal min-h-[40px] h-auto",
            dates.length === 0 && "text-muted-foreground",
            className
          )}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <div className="flex flex-wrap gap-1 flex-1">
            {dates.length === 0 ? (
              <span>Select multiple dates</span>
            ) : (
              <>
                {displayDates.map((date, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {format(new Date(date), 'MMM dd')}
                    <button
                      type="button"
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDate(date);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {dates.length > displayDates.length && (
                  <Badge variant="secondary" className="text-xs">
                    +{dates.length - displayDates.length} more
                  </Badge>
                )}
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dates[dates.length - 1]}
          onSelect={handleSelect}
          disabled={disabled}
          defaultMonth={dates[0] || new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

