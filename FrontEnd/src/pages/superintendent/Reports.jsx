import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Upload, FileText, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Reports = () => {
  const { getMyDuties, uploadReport, user } = useAuth();
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      dutyId: '',
      title: '',
      comments: '',
    },
  });

  useEffect(() => {
    const fetchDuties = async () => {
      try {
        const data = await getMyDuties();
        const myDuties = Array.isArray(data) ? data : (data.duties || []);
        setDuties(myDuties.filter(d => d.role === 'superintendent'));
      } catch (err) {
        console.error('Failed to fetch duties:', err);
        toast.error('Failed to load duties');
      }
    };
    fetchDuties();
  }, [getMyDuties]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setFileError('Please upload a valid file (PDF, DOC, DOCX, or TXT)');
        setFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('File size must be less than 10MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setFileError('');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const onFinish = async (values) => {
    if (!file) {
      setFileError('Please attach a file');
      setSubmitted(true);
      toast.error("Please attach a file");
      return;
    }

    try {
      setLoading(true);
      const reportData = {
        reportFor: 'duty',
        dutyId: values.dutyId,
        title: values.title,
        comments: values.comments,
        file: file
      };
      
      await uploadReport(reportData);
      toast.success('Report uploaded successfully!');
      form.reset();
      setFile(null);
      setFileError('');
      setSubmitted(false);
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to upload report';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Upload Exam Report</h2>
        <p className="text-gray-600 mt-1">Submit examination reports for assigned duties</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)} className="space-y-6">
              <FormField
                control={form.control}
                name="dutyId"
                rules={{ required: 'Please select an exam duty' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Exam Duty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {duties.length === 0 ? (
                          <SelectItem value="no-duties" disabled>
                            No duties available
                          </SelectItem>
                        ) : (
                          duties.map(d => (
                            <SelectItem key={d._id} value={d._id}>
                              {d.examName} - {format(new Date(d.date), 'MMM dd, yyyy')}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                rules={{ required: 'Report title is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter report title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observations</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Add your observations..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="file-upload">Attach File <span className="text-red-500">*</span></Label>
                <div className="space-y-2">
                  {!file ? (
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                          </div>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (MAX. 10MB)</p>
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex-1 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {(fileError || (submitted && !file)) && (
                    <p className="text-sm text-red-500">
                      {fileError || 'File is required'}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !file} 
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
