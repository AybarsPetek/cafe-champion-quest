import { Copy, Building2, CreditCard, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useActiveBankSettings } from "@/hooks/usePaymentSettings";

interface BankTransferInfoProps {
  amount?: number;
  description?: string;
}

const BankTransferInfo = ({ amount, description }: BankTransferInfoProps) => {
  const { toast } = useToast();
  const { data: bankSettings, isLoading } = useActiveBankSettings();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    toast({
      title: "Kopyalandı",
      description: `${label} panoya kopyalandı.`,
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!bankSettings || bankSettings.length === 0) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Banka Havale Bilgileri
          </CardTitle>
          <CardDescription>
            Henüz banka hesap bilgisi eklenmemiş.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Banka Havale Bilgileri
        </CardTitle>
        <CardDescription>
          Aşağıdaki hesaba havale/EFT yaparak ödemenizi tamamlayabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {amount && (
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-sm text-muted-foreground">Ödenecek Tutar</p>
            <p className="text-2xl font-bold text-primary">
              {amount.toLocaleString("tr-TR")} ₺
            </p>
          </div>
        )}

        {bankSettings.map((bank: any) => (
          <div key={bank.id} className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Banka Adı</p>
                  <p className="font-medium">{bank.bank_name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Hesap Sahibi</p>
                  <p className="font-medium">{bank.account_holder}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(bank.account_holder, "Hesap sahibi")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="font-medium font-mono text-sm">{bank.iban}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(bank.iban, "IBAN")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {bank.additional_info && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ek Bilgi</p>
                    <p className="font-medium text-sm">{bank.additional_info}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {description && (
          <div className="p-4 bg-secondary/50 rounded-lg border">
            <p className="text-sm font-medium mb-1">Açıklama</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
          <p className="text-sm font-medium text-destructive mb-2">Önemli Bilgiler</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Havale açıklamasına adınızı ve soyadınızı yazınız.</li>
            <li>Ödeme onayı 1-2 iş günü içinde yapılacaktır.</li>
            <li>Dekont görüntüsünü admin ile paylaşmanız işlemi hızlandırır.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankTransferInfo;
