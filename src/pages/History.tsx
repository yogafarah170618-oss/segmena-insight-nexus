import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calendar, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadHistory {
  id: string;
  file_name: string;
  uploaded_at: string;
  customers_count: number;
  transactions_count: number;
}

const History = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasOrphanedData, setHasOrphanedData] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [location.key]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await loadUploadHistory();
      await checkOrphanedData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("upload_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setUploadHistory(data || []);
    } catch (error: any) {
      toast({
        title: "Gagal memuat riwayat",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkOrphanedData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", session.user.id)
        .is("upload_id", null)
        .limit(1);

      if (error) throw error;
      setHasOrphanedData((data || []).length > 0);
    } catch (error: any) {
      console.error("Error checking orphaned data:", error);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: transError } = await supabase
        .from("transactions")
        .delete()
        .eq("upload_id", historyId)
        .eq("user_id", session.user.id);

      if (transError) throw transError;

      const { error: segError } = await supabase
        .from("customer_segments")
        .delete()
        .eq("upload_id", historyId)
        .eq("user_id", session.user.id);

      if (segError) throw segError;

      const { error: histError } = await supabase
        .from("upload_history")
        .delete()
        .eq("id", historyId)
        .eq("user_id", session.user.id);

      if (histError) throw histError;

      toast({
        title: "Berhasil!",
        description: "Data berhasil dihapus.",
      });

      await loadUploadHistory();
      await checkOrphanedData();
    } catch (error: any) {
      toast({
        title: "Gagal menghapus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: transError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", session.user.id);

      if (transError) throw transError;

      const { error: segError } = await supabase
        .from("customer_segments")
        .delete()
        .eq("user_id", session.user.id);

      if (segError) throw segError;

      const { error: histError } = await supabase
        .from("upload_history")
        .delete()
        .eq("user_id", session.user.id);

      if (histError) throw histError;

      toast({
        title: "Berhasil!",
        description: "Semua data berhasil dihapus.",
      });

      await loadUploadHistory();
      await checkOrphanedData();
    } catch (error: any) {
      toast({
        title: "Gagal menghapus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteAllDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Riwayat Upload</h1>
        <p className="text-muted-foreground">
          Kelola riwayat upload data Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Upload Data</CardTitle>
              <CardDescription>
                Daftar file yang pernah Anda upload
              </CardDescription>
            </div>
            {(uploadHistory.length > 0 || hasOrphanedData) && (
              <Button
                variant="destructive"
                onClick={() => setDeleteAllDialogOpen(true)}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Semua Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {uploadHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasOrphanedData ? (
                <div className="space-y-4">
                  <p>Tidak ada riwayat upload, tetapi ada data lama di sistem.</p>
                  <p className="text-sm">
                    Gunakan tombol "Hapus Semua Data" untuk menghapus data lama ini.
                  </p>
                </div>
              ) : (
                <p>Belum ada riwayat upload</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {uploadHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{history.file_name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(history.uploaded_at), "PPp", {
                            locale: idLocale,
                          })}
                        </span>
                        <span>{history.customers_count} customers</span>
                        <span>{history.transactions_count} transaksi</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedHistoryId(history.id);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat Upload?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus semua data yang terkait dengan upload ini,
              termasuk transaksi dan segmentasi customer. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedHistoryId && handleDeleteHistory(selectedHistoryId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus SEMUA data Anda termasuk transaksi,
              segmentasi customer, dan riwayat upload. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
