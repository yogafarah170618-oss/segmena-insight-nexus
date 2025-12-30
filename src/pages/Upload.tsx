import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/auth");
    }
  };

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

  const handleProcess = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }
    
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Silakan login terlebih dahulu");
        navigate("/auth");
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-csv', {
        body: formData,
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Berhasil! ${data.customers} customer di-segmentasi dari ${data.message}`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Gagal memproses file. Pastikan format CSV sesuai.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dotted-bg">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-brutal mb-4">UPLOAD DATA</h1>
          <div className="inline-block bg-secondary px-4 py-1 border-3 border-border shadow-brutal rotate-1">
            <span className="font-mono text-secondary-foreground text-sm">CUSTOMER TRANSACTIONS</span>
          </div>
          <p className="font-mono text-muted-foreground mt-6 max-w-xl mx-auto">
            Upload transaksi pelanggan dalam format CSV untuk mendapatkan insight mendalam
          </p>
        </div>

        {/* Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-3 border-border bg-card shadow-brutal p-12 transition-all ${
            isDragging ? "translate-x-[-4px] translate-y-[-4px] shadow-brutal-lg bg-secondary/10" : ""
          }`}
        >
          <div className="text-center">
            {!file ? (
              <>
                <div className="w-24 h-24 border-3 border-border bg-foreground text-background flex items-center justify-center mx-auto mb-6">
                  <UploadIcon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-brutal mb-2">DROP YOUR CSV FILE HERE</h3>
                <p className="font-mono text-muted-foreground mb-8">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>BROWSE FILES</span>
                  </Button>
                </label>
              </>
            ) : (
              <div className="space-y-6">
                <div className="w-24 h-24 border-3 border-border bg-secondary flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-secondary-foreground" />
                </div>
                <div className="border-3 border-border p-4 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-3 border-border flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-brutal">{file.name}</div>
                      <div className="text-sm font-mono text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Format Info */}
        <div className="border-3 border-border bg-card shadow-brutal p-8">
          <h3 className="text-xl font-brutal mb-6 pb-4 border-b-3 border-border">FORMAT DATA YANG DIPERLUKAN</h3>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-xs font-brutal flex-shrink-0">1</div>
              <div>
                <strong className="font-brutal">customer_id:</strong> ID unik pelanggan 
                <span className="bg-accent text-accent-foreground px-2 py-0.5 ml-2 text-xs">WAJIB</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-xs font-brutal flex-shrink-0">2</div>
              <div>
                <strong className="font-brutal">transaction_date:</strong> Tanggal transaksi (YYYY-MM-DD) 
                <span className="bg-accent text-accent-foreground px-2 py-0.5 ml-2 text-xs">WAJIB</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-xs font-brutal flex-shrink-0">3</div>
              <div>
                <strong className="font-brutal">transaction_amount:</strong> Nominal transaksi (angka) 
                <span className="bg-accent text-accent-foreground px-2 py-0.5 ml-2 text-xs">WAJIB</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-brutal flex-shrink-0">4</div>
              <div>
                <strong className="font-brutal">customer_name:</strong> Nama pelanggan 
                <span className="bg-muted px-2 py-0.5 ml-2 text-xs">OPSIONAL</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 border-3 border-border bg-muted">
            <p className="text-sm font-brutal mb-3">CONTOH FORMAT CSV:</p>
            <code className="text-xs block whitespace-pre font-mono leading-relaxed">
customer_id,transaction_date,transaction_amount,customer_name{'\n'}
CUST001,2024-01-15,500000,Ahmad Wijaya{'\n'}
CUST002,2024-01-16,750000,{'\n'}
CUST003,2024-01-17,250000,Siti Nurhaliza
            </code>
          </div>
        </div>

        {/* Process Button */}
        {file && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleProcess}
              disabled={isProcessing}
              className="text-lg px-12 py-6"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  PROCESSING...
                </>
              ) : (
                "PROCESS DATA"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
