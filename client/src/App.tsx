import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon } from 'lucide-react';
import { EmployeeLeaveForm } from '@/components/EmployeeLeaveForm';
import { SuccessCard } from '@/components/SuccessCard';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
// Type-only imports for better TypeScript compliance
import type { CreateEmployeeLeaveRequestInput, EmployeeLeaveRequest } from '../../server/src/schema';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<EmployeeLeaveRequest | null>(null);

  const handleSubmit = async (formData: CreateEmployeeLeaveRequestInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.createEmployeeLeaveRequest.mutate(formData);
      setSubmittedRequest(response);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to create leave request:', error);
      // In a real app, you'd show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRequest = () => {
    setIsSubmitted(false);
    setSubmittedRequest(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {isSubmitted && submittedRequest ? (
        <SuccessCard 
          request={submittedRequest} 
          onNewRequest={handleNewRequest} 
        />
      ) : (
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Employee Leave Request Form
              </CardTitle>
              <p className="text-gray-600 text-sm leading-relaxed">
                Please fill out all required fields to submit your leave request. 
                <br />
                All information will be reviewed by your supervisor.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="mobile-padding">
            <EmployeeLeaveForm onSubmit={handleSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default App;