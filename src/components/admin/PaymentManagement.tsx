import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, CreditCard, Building2, Star } from "lucide-react";
import {
  useBankSettings,
  useCreateBankSetting,
  useUpdateBankSetting,
  useDeleteBankSetting,
  usePricingPlans,
  useCreatePricingPlan,
  useUpdatePricingPlan,
  useDeletePricingPlan,
} from "@/hooks/usePaymentSettings";

const PaymentManagement = () => {
  const { data: bankSettings } = useBankSettings();
  const { data: pricingPlans } = usePricingPlans();

  const createBankSetting = useCreateBankSetting();
  const updateBankSetting = useUpdateBankSetting();
  const deleteBankSetting = useDeleteBankSetting();

  const createPricingPlan = useCreatePricingPlan();
  const updatePricingPlan = useUpdatePricingPlan();
  const deletePricingPlan = useDeletePricingPlan();

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [bankFormData, setBankFormData] = useState({
    bank_name: "",
    account_holder: "",
    iban: "",
    additional_info: "",
    is_active: true,
  });

  const [pricingFormData, setPricingFormData] = useState({
    name: "",
    description: "",
    price: 0,
    duration_months: 1,
    features: "",
    is_popular: false,
    is_active: true,
    order_index: 0,
  });

  const resetBankForm = () => {
    setSelectedBank(null);
    setBankFormData({
      bank_name: "",
      account_holder: "",
      iban: "",
      additional_info: "",
      is_active: true,
    });
  };

  const resetPricingForm = () => {
    setSelectedPlan(null);
    setPricingFormData({
      name: "",
      description: "",
      price: 0,
      duration_months: 1,
      features: "",
      is_popular: false,
      is_active: true,
      order_index: 0,
    });
  };

  const handleBankSubmit = () => {
    if (selectedBank) {
      updateBankSetting.mutate({ id: selectedBank.id, ...bankFormData });
    } else {
      createBankSetting.mutate(bankFormData);
    }
    setBankDialogOpen(false);
    resetBankForm();
  };

  const handlePricingSubmit = () => {
    const featuresArray = pricingFormData.features
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    if (selectedPlan) {
      updatePricingPlan.mutate({
        id: selectedPlan.id,
        ...pricingFormData,
        features: featuresArray,
      });
    } else {
      createPricingPlan.mutate({
        ...pricingFormData,
        features: featuresArray,
      });
    }
    setPricingDialogOpen(false);
    resetPricingForm();
  };

  const openEditBank = (bank: any) => {
    setSelectedBank(bank);
    setBankFormData({
      bank_name: bank.bank_name,
      account_holder: bank.account_holder,
      iban: bank.iban,
      additional_info: bank.additional_info || "",
      is_active: bank.is_active,
    });
    setBankDialogOpen(true);
  };

  const openEditPricing = (plan: any) => {
    setSelectedPlan(plan);
    const featuresStr = Array.isArray(plan.features) ? plan.features.join("\n") : "";
    setPricingFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      duration_months: plan.duration_months,
      features: featuresStr,
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      order_index: plan.order_index,
    });
    setPricingDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Ödeme Ayarları
        </CardTitle>
        <CardDescription>Banka bilgilerini ve fiyatlandırma planlarını yönetin</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bank" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Banka Bilgileri
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Fiyatlandırma
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetBankForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Banka Hesabı
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedBank ? "Banka Bilgisi Düzenle" : "Yeni Banka Hesabı"}</DialogTitle>
                    <DialogDescription>Havale/EFT için banka hesap bilgilerini girin</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bank_name">Banka Adı</Label>
                      <Input
                        id="bank_name"
                        placeholder="Örn: Ziraat Bankası"
                        value={bankFormData.bank_name}
                        onChange={(e) => setBankFormData({ ...bankFormData, bank_name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="account_holder">Hesap Sahibi</Label>
                      <Input
                        id="account_holder"
                        placeholder="Ad Soyad / Şirket Adı"
                        value={bankFormData.account_holder}
                        onChange={(e) => setBankFormData({ ...bankFormData, account_holder: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        value={bankFormData.iban}
                        onChange={(e) => setBankFormData({ ...bankFormData, iban: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="additional_info">Ek Bilgi (Opsiyonel)</Label>
                      <Textarea
                        id="additional_info"
                        placeholder="Açıklama kısmına yazılacak not, şube bilgisi vb."
                        value={bankFormData.additional_info}
                        onChange={(e) => setBankFormData({ ...bankFormData, additional_info: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Aktif</Label>
                      <Switch
                        id="is_active"
                        checked={bankFormData.is_active}
                        onCheckedChange={(checked) => setBankFormData({ ...bankFormData, is_active: checked })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBankDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleBankSubmit}>Kaydet</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banka</TableHead>
                  <TableHead>Hesap Sahibi</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankSettings && bankSettings.length > 0 ? (
                  bankSettings.map((bank: any) => (
                    <TableRow key={bank.id}>
                      <TableCell className="font-medium">{bank.bank_name}</TableCell>
                      <TableCell>{bank.account_holder}</TableCell>
                      <TableCell className="font-mono text-sm">{bank.iban}</TableCell>
                      <TableCell>
                        {bank.is_active ? (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs">Aktif</span>
                        ) : (
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">Pasif</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditBank(bank)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBankSetting.mutate(bank.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Henüz banka hesabı eklenmemiş
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetPricingForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Fiyat Planı
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedPlan ? "Fiyat Planı Düzenle" : "Yeni Fiyat Planı"}</DialogTitle>
                    <DialogDescription>Abonelik veya kurs fiyat planı oluşturun</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="plan_name">Plan Adı</Label>
                      <Input
                        id="plan_name"
                        placeholder="Örn: Premium Üyelik"
                        value={pricingFormData.name}
                        onChange={(e) => setPricingFormData({ ...pricingFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="plan_description">Açıklama</Label>
                      <Textarea
                        id="plan_description"
                        placeholder="Plan açıklaması"
                        value={pricingFormData.description}
                        onChange={(e) => setPricingFormData({ ...pricingFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="plan_price">Fiyat (₺)</Label>
                        <Input
                          id="plan_price"
                          type="number"
                          step="0.01"
                          value={pricingFormData.price}
                          onChange={(e) => setPricingFormData({ ...pricingFormData, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration_months">Süre (Ay)</Label>
                        <Input
                          id="duration_months"
                          type="number"
                          value={pricingFormData.duration_months}
                          onChange={(e) => setPricingFormData({ ...pricingFormData, duration_months: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="features">Özellikler (Her satıra bir özellik)</Label>
                      <Textarea
                        id="features"
                        placeholder="Tüm kurslara erişim&#10;Sertifika hakkı&#10;Forum erişimi"
                        rows={4}
                        value={pricingFormData.features}
                        onChange={(e) => setPricingFormData({ ...pricingFormData, features: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="order_index">Sıralama</Label>
                      <Input
                        id="order_index"
                        type="number"
                        value={pricingFormData.order_index}
                        onChange={(e) => setPricingFormData({ ...pricingFormData, order_index: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_popular">Popüler Plan</Label>
                      <Switch
                        id="is_popular"
                        checked={pricingFormData.is_popular}
                        onCheckedChange={(checked) => setPricingFormData({ ...pricingFormData, is_popular: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active_plan">Aktif</Label>
                      <Switch
                        id="is_active_plan"
                        checked={pricingFormData.is_active}
                        onCheckedChange={(checked) => setPricingFormData({ ...pricingFormData, is_active: checked })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPricingDialogOpen(false)}>İptal</Button>
                    <Button onClick={handlePricingSubmit}>Kaydet</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Adı</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Süre</TableHead>
                  <TableHead>Popüler</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingPlans && pricingPlans.length > 0 ? (
                  pricingPlans.map((plan: any) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell className="font-semibold">₺{plan.price}</TableCell>
                      <TableCell>{plan.duration_months} ay</TableCell>
                      <TableCell>
                        {plan.is_popular && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs">Aktif</span>
                        ) : (
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">Pasif</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditPricing(plan)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePricingPlan.mutate(plan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Henüz fiyat planı eklenmemiş
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentManagement;
