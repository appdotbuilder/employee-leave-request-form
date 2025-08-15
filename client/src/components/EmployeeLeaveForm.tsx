import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, AlertCircleIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import type { CreateEmployeeLeaveRequestInput, DepartmentGrade, Status, Location } from '../../../server/src/schema';

// Simple date formatting function
const formatDate = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

interface EmployeeLeaveFormProps {
  onSubmit: (data: CreateEmployeeLeaveRequestInput) => Promise<void>;
  isLoading: boolean;
}

export function EmployeeLeaveForm({ onSubmit, isLoading }: EmployeeLeaveFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state with proper typing
  const [formData, setFormData] = useState<CreateEmployeeLeaveRequestInput>({
    employee_name: '',
    department_grade: 'G8',
    status: 'Pending',
    leave_date: new Date(),
    location: 'Mambal',
    reason: '',
    time_out: '',
    time_back: ''
  });

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_name.trim()) {
      newErrors.employee_name = 'Employee name is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.time_out) {
      newErrors.time_out = 'Time out is required';
    }

    if (!formData.time_back) {
      newErrors.time_back = 'Time back is required';
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (formData.time_out && !timeRegex.test(formData.time_out)) {
      newErrors.time_out = 'Please enter time in HH:MM format';
    }

    if (formData.time_back && !timeRegex.test(formData.time_back)) {
      newErrors.time_back = 'Please enter time in HH:MM format';
    }

    // Validate that time_back is after time_out
    if (formData.time_out && formData.time_back && formData.time_out >= formData.time_back) {
      newErrors.time_back = 'Return time must be after departure time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        employee_name: '',
        department_grade: 'G8',
        status: 'Pending',
        leave_date: new Date(),
        location: 'Mambal',
        reason: '',
        time_out: '',
        time_back: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ID Share - Read Only */}
      <div className="space-y-2">
        <Label htmlFor="id-share" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          ID Share
        </Label>
        <Input
          id="id-share"
          value="Auto-generated upon submission"
          readOnly
          className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed rounded-lg"
        />
        <p className="text-xs text-gray-500">This will be automatically generated when you submit the form</p>
      </div>

      {/* Employee Name */}
      <div className="space-y-2">
        <Label htmlFor="employee-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Employee Name *
        </Label>
        <Input
          id="employee-name"
          value={formData.employee_name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, employee_name: e.target.value }));
            if (errors.employee_name) setErrors((prev: Record<string, string>) => ({ ...prev, employee_name: '' }));
          }}
          placeholder="Enter your full name"
          required
          className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-colors ${
            errors.employee_name ? 'border-red-500' : ''
          }`}
        />
        {errors.employee_name && (
          <Alert variant="destructive" className="py-2">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription className="text-xs">{errors.employee_name}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Department/Grade and Status - Two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Department / Grade *
          </Label>
          <Select
            value={formData.department_grade}
            onValueChange={(value: DepartmentGrade) =>
              setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, department_grade: value }))
            }
          >
            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="G8">G8</SelectItem>
              <SelectItem value="G9">G9</SelectItem>
              <SelectItem value="G10">G10</SelectItem>
              <SelectItem value="G11">G11</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Status *
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value: Status) =>
              setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="Approved">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Approved
                </div>
              </SelectItem>
              <SelectItem value="Rejected">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Rejected
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leave Date and Location - Two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Leave Date *
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg hover:bg-blue-50"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                {formData.leave_date ? formatDate(formData.leave_date) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.leave_date}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, leave_date: date }));
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPinIcon className="w-3 h-3 text-blue-500" />
            Location *
          </Label>
          <Select
            value={formData.location}
            onValueChange={(value: Location) =>
              setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, location: value }))
            }
          >
            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mambal">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-3 h-3 text-gray-500" />
                  Mambal
                </div>
              </SelectItem>
              <SelectItem value="Sembung G">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-3 h-3 text-gray-500" />
                  Sembung G
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Out and Time Back - Two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time-out" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ClockIcon className="w-3 h-3 text-blue-500" />
            Time Out *
          </Label>
          <Input
            id="time-out"
            type="time"
            value={formData.time_out}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, time_out: e.target.value }));
              if (errors.time_out) setErrors((prev: Record<string, string>) => ({ ...prev, time_out: '' }));
            }}
            required
            className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${
              errors.time_out ? 'border-red-500' : ''
            }`}
          />
          {errors.time_out && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">{errors.time_out}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-back" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ClockIcon className="w-3 h-3 text-blue-500" />
            Time Back *
          </Label>
          <Input
            id="time-back"
            type="time"
            value={formData.time_back}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, time_back: e.target.value }));
              if (errors.time_back) setErrors((prev: Record<string, string>) => ({ ...prev, time_back: '' }));
            }}
            required
            className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${
              errors.time_back ? 'border-red-500' : ''
            }`}
          />
          {errors.time_back && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">{errors.time_back}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Reason *
        </Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormData((prev: CreateEmployeeLeaveRequestInput) => ({ ...prev, reason: e.target.value }));
            if (errors.reason) setErrors((prev: Record<string, string>) => ({ ...prev, reason: '' }));
          }}
          placeholder="Please provide a detailed reason for your leave request..."
          required
          rows={4}
          className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg resize-none custom-scrollbar ${
            errors.reason ? 'border-red-500' : ''
          }`}
        />
        {errors.reason && (
          <Alert variant="destructive" className="py-2">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription className="text-xs">{errors.reason}</AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-gray-500">Please be specific about the nature and duration of your leave</p>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Submitting Request...
          </div>
        ) : (
          <>
            <UserIcon className="w-4 h-4 mr-2" />
            Submit Leave Request
          </>
        )}
      </Button>
    </form>
  );
}