'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/client/lib/utils'
import { Button } from '@/client/components/ui/button'
import { Calendar } from '@/client/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/client/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  granularity?: 'day' | 'minute'
  previewFormat?: 'default' | 'short'
}

export function DateTimePicker({
  value,
  onChange,
  granularity = 'minute',
  previewFormat = 'default',
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [selectedHour, setSelectedHour] = React.useState<string>(value ? format(value, 'HH') : '12')
  const [selectedMinute, setSelectedMinute] = React.useState<string>(value ? format(value, 'mm') : '00')

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setSelectedHour(format(value, 'HH'))
      setSelectedMinute(format(value, 'mm'))
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && granularity === 'minute') {
      const newDate = new Date(date)
      newDate.setHours(parseInt(selectedHour))
      newDate.setMinutes(parseInt(selectedMinute))
      onChange?.(newDate)
    } else {
      onChange?.(date)
    }
  }

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour)
    setSelectedMinute(minute)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hour))
      newDate.setMinutes(parseInt(minute))
      onChange?.(newDate)
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const showDateFormat = () => {
    if (previewFormat === 'short') {
      return granularity === 'minute' ? "MM/dd/yyyy 'at' HH:mm" : 'MM/dd/yyyy'
    }
    return granularity === 'minute' ? "PPP 'at' HH:mm" : 'PPP'
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, showDateFormat())
          ) : (
            <span>Pick a date{granularity === 'minute' ? ' and time' : ''}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={{ before: new Date() }}
          initialFocus
        />
        {granularity === 'minute' && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <Select value={selectedHour} onValueChange={(hour) => handleTimeChange(hour, selectedMinute)}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-lg font-semibold">:</span>
              <Select value={selectedMinute} onValueChange={(minute) => handleTimeChange(selectedHour, minute)}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
