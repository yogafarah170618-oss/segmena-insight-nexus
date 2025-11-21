import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Please upload a CSV file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Please upload a CSV file");
    }
  };

  const handleProcess = () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Data processed successfully!");
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Upload Your Data</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload transaksi pelanggan dalam format CSV untuk mendapatkan insight mendalam
          </p>
        </div>

        {/* Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`glass-card-strong rounded-3xl p-12 transition-all duration-300 ${
            isDragging ? "glow-effect scale-105" : ""
          }`}
        >
          <div className="text-center">
            {!file ? (
              <>
                <UploadIcon className="w-20 h-20 mx-auto mb-6 text-primary animate-pulse" />
                <h3 className="text-2xl font-bold mb-4">Drop your CSV file here</h3>
                <p className="text-muted-foreground mb-8">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild className="bg-gradient-primary hover:opacity-90 glow-effect">
                    <span>Browse Files</span>
                  </Button>
                </label>
              </>
            ) : (
              <div className="space-y-6">
                <CheckCircle className="w-20 h-20 mx-auto text-secondary animate-scale-in" />
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setFile(null)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Format Info */}
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4">Format Data yang Diperlukan</h3>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong className="text-foreground">customer_id:</strong> ID unik pelanggan
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong className="text-foreground">transaction_date:</strong> Tanggal transaksi (YYYY-MM-DD)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong className="text-foreground">transaction_amount:</strong> Nominal transaksi (angka)
              </div>
            </div>
          </div>
        </div>

        {/* Process Button */}
        {file && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-gradient-primary hover:opacity-90 glow-effect text-lg px-12 py-6"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Process Data"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
