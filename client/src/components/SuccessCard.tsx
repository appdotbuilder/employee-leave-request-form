import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, MapPinIcon, FileTextIcon, CheckCircleIcon } from 'lucide-react';
import type { EmployeeLeaveRequest } from '../../../server/src/schema';

interface SuccessCardProps {
  request: EmployeeLeaveRequest;
  onNewRequest: () => void;
}

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

export function SuccessCard({ request, onNewRequest }: SuccessCardProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳' },
      'Approved': { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' },
      'Rejected': { color: 'bg-red-100 text-red-800 border-red-300', icon: '❌' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];
    
    return (
      <Badge variant="outline" className={`${config.color} font-medium px-3 py-1`}>
        <span className="mr-1">{config.icon}</span>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm success-bounce">
      <CardHeader className="text-center space-y-4 pb-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircleIcon className="w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Request Submitted Successfully! 🎉
          </CardTitle>
          <p className="text-gray-600">Your leave request has been processed and is now in the system</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Request Summary Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Request Summary
            </h3>
            {getStatusBadge(request.status)}
          </div>
          
          {/* ID Share - Highlighted */}
          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Request ID:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono text-gray-800 border">
                  {request.id_share}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(request.id_share)}
                  className="text-xs h-7 px-2 hover:bg-blue-50"
                >
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Save this ID for future reference and tracking</p>
          </div>

          {/* Request Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee</p>
                  <p className="text-gray-900 font-semibold">{request.employee_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">🏢</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department/Grade</p>
                  <p className="text-gray-900 font-semibold">{request.department_grade}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Leave Date</p>
                  <p className="text-gray-900 font-semibold">{formatDate(request.leave_date)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-gray-900 font-semibold">{request.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Time Schedule</p>
                  <p className="text-gray-900 font-semibold">
                    {request.time_out} - {request.time_back}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Submitted</p>
                  <p className="text-gray-900 font-semibold">{formatDate(request.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Reason for Leave</p>
            <p className="text-gray-900 leading-relaxed">{request.reason}</p>
          </div>
        </div>

        {/* Next Steps Information */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <span>📋</span>
            What's Next?
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Your request will be reviewed by your supervisor</li>
            <li>• You'll receive an email notification about the status update</li>
            <li>• Use your Request ID ({request.id_share}) for any inquiries</li>
          </ul>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onNewRequest}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          <span className="mr-2">➕</span>
          Submit Another Request
        </Button>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact HR at <span className="font-semibold">hr@company.com</span> or ext. 1234
          </p>
        </div>
      </CardContent>
    </Card>
  );
}