import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

const DatePicker = ({ onDateSelect, onCancel, defaultDate }) => {
  const [selectedDate, setSelectedDate] = useState(
    defaultDate ? defaultDate : undefined
  );

  const handleOk = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select End Date</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleOk} disabled={!selectedDate}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatePicker;