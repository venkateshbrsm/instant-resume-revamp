import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FileUploadSectionProps {
  onFileProcessed: (file: File) => void;
  onBack: () => void;
}

export function FileUploadSection({ onFileProcessed, onBack }: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const isValidFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    
    // Check for .doc files specifically to show helpful error
    if (file.name.toLowerCase().endsWith('.doc')) {
      toast({
        title: "File not supported",
        description: "Legacy .doc files are not supported. Please save your document as .docx, PDF, or text format and try again.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return false;
    }

    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!isValidFile(file)) return;

    setUploadedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate file processing with progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsProcessing(false);
            onFileProcessed(file);
            toast({
              title: "Resume uploaded successfully!",
              description: "Your AI-enhanced preview is ready."
            });
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Upload Your Current Resume
          </h2>
          <p className="text-lg text-muted-foreground">
            Supported formats: PDF, DOCX, TXT (Max 10MB)
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Resume Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isProcessing ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
                  ${isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/20'
                  }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-accent mx-auto" />
                    <div>
                      <p className="font-semibold text-lg">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        Drag and drop your resume here
                      </p>
                      <p className="text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Processing Your Resume</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI is analyzing and enhancing your resume...
                  </p>
                  <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={onBack}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}