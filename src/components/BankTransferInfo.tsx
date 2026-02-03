import { Copy, Building2, CreditCard, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface BankTransferInfoProps {
  amount?: number;
  description?: string;
}

const BankTransferInfo = ({ amount, description }: BankTransferInfoProps) => {
  const { toast } = useToast();

  const bankInfo = {
    bankName: "Ziraat Bankası",
    accountHolder: "The Company Coffee Academy",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    branch: "Kadıköy Şubesi",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    toast({
      title: "Kopyalandı",
      description: `${label} panoya kopyalandı.`,
    });
  };

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
      <CardContent className="pt-6 space-y-4">
        {amount && (
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/30 mb-6">
            <p className="text-sm text-muted-foreground">Ödenecek Tutar</p>
            <p className="text-2xl font-bold text-primary">
              {amount.toLocaleString("tr-TR")} ₺
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Banka Adı</p>
                <p className="font-medium">{bankInfo.bankName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Hesap Sahibi</p>
                <p className="font-medium">{bankInfo.accountHolder}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankInfo.accountHolder, "Hesap sahibi")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">IBAN</p>
                <p className="font-medium font-mono text-sm">{bankInfo.iban}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankInfo.iban, "IBAN")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Şube</p>
                <p className="font-medium">{bankInfo.branch}</p>
              </div>
            </div>
          </div>
        </div>

        {description && (
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg border">
            <p className="text-sm font-medium mb-1">Açıklama</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
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
