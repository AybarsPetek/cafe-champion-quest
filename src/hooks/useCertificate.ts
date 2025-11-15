import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export const useCertificate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateCertificate = useMutation({
    mutationFn: async ({
      userId,
      courseId,
      userName,
      courseName,
    }: {
      userId: string;
      courseId: string;
      userName: string;
      courseName: string;
    }) => {
      // Check if certificate already exists
      const { data: existingCert } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      let certificateNumber: string;
      let issuedAt: string;

      if (existingCert) {
        certificateNumber = existingCert.certificate_number;
        issuedAt = existingCert.issued_at;
      } else {
        // Generate unique certificate number
        const { data: funcData, error: funcError } = await supabase.rpc(
          "generate_certificate_number"
        );

        if (funcError) throw funcError;
        certificateNumber = funcData;

        // Insert certificate record
        const { data, error } = await supabase
          .from("certificates")
          .insert({
            user_id: userId,
            course_id: courseId,
            certificate_number: certificateNumber,
          })
          .select()
          .single();

        if (error) throw error;
        issuedAt = data.issued_at;
      }

      // Generate PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Set background color
      doc.setFillColor(249, 250, 251);
      doc.rect(0, 0, 297, 210, "F");

      // Border
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(3);
      doc.rect(10, 10, 277, 190);

      // Inner decorative border
      doc.setDrawColor(165, 180, 252);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 267, 180);

      // Title
      doc.setFontSize(36);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Sertifika", 148.5, 45, { align: "center" });

      // Subtitle
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text("Bu Sertifika Şunu Onaylar:", 148.5, 60, { align: "center" });

      // User name
      doc.setFontSize(28);
      doc.setTextColor(99, 102, 241);
      doc.setFont("helvetica", "bold");
      doc.text(userName, 148.5, 85, { align: "center" });

      // Course completion text
      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.text("aşağıdaki eğitimi başarıyla tamamlamıştır:", 148.5, 100, {
        align: "center",
      });

      // Course name
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(courseName, 148.5, 115, { align: "center" });

      // Date and certificate number
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      
      const issueDate = new Date(issuedAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      doc.text(`Tarih: ${issueDate}`, 148.5, 145, { align: "center" });
      doc.text(`Sertifika No: ${certificateNumber}`, 148.5, 155, {
        align: "center",
      });

      // Signature line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(110, 175, 187, 175);
      doc.setFontSize(10);
      doc.text("Eğitmen İmzası", 148.5, 182, { align: "center" });

      // Save PDF
      doc.save(`sertifika-${certificateNumber}.pdf`);

      return { certificateNumber, issuedAt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast({
        title: "Sertifika Oluşturuldu! 🎉",
        description: "Sertifikanız başarıyla indirildi.",
      });
    },
    onError: (error) => {
      console.error("Certificate generation error:", error);
      toast({
        title: "Hata",
        description: "Sertifika oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  return { generateCertificate };
};
