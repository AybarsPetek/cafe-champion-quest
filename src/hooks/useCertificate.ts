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

      // Generate PDF - TheCompany Coffee Academy branded certificate
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Warm cream background
      doc.setFillColor(254, 252, 248);
      doc.rect(0, 0, 297, 210, "F");

      // Coffee brown outer border
      doc.setDrawColor(139, 90, 43);
      doc.setLineWidth(3);
      doc.rect(10, 10, 277, 190);

      // Golden inner border
      doc.setDrawColor(196, 155, 80);
      doc.setLineWidth(1.5);
      doc.rect(15, 15, 267, 180);

      // Decorative corner coffee beans (circles)
      doc.setFillColor(139, 90, 43);
      [[20, 20], [272, 20], [20, 190], [272, 190]].forEach(([x, y]) => {
        doc.circle(x, y, 4, "F");
        doc.setFillColor(196, 155, 80);
        doc.circle(x, y, 2, "F");
        doc.setFillColor(139, 90, 43);
      });

      // Header - Company Name
      doc.setFontSize(16);
      doc.setTextColor(139, 90, 43);
      doc.setFont("helvetica", "bold");
      doc.text("THECOMPANY COFFEE ACADEMY", 148.5, 35, { align: "center" });

      // Coffee cup icon (decorative line)
      doc.setDrawColor(196, 155, 80);
      doc.setLineWidth(1);
      doc.line(100, 40, 197, 40);

      // Main Title
      doc.setFontSize(38);
      doc.setTextColor(62, 39, 22);
      doc.setFont("helvetica", "bold");
      doc.text("BASARI SERTIFIKASI", 148.5, 58, { align: "center" });

      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(139, 90, 43);
      doc.setFont("helvetica", "normal");
      doc.text("Bu belge, asagida belirtilen kisinin", 148.5, 72, { align: "center" });

      // User name with decorative box
      doc.setFillColor(254, 247, 235);
      doc.setDrawColor(196, 155, 80);
      doc.setLineWidth(0.8);
      doc.roundedRect(45, 78, 207, 20, 3, 3, "FD");
      
      doc.setFontSize(26);
      doc.setTextColor(139, 90, 43);
      doc.setFont("helvetica", "bold");
      doc.text(userName, 148.5, 92, { align: "center" });

      // Course completion text
      doc.setFontSize(12);
      doc.setTextColor(100, 80, 60);
      doc.setFont("helvetica", "normal");
      doc.text("asagidaki egitimi basariyla tamamladigini belgeler:", 148.5, 108, {
        align: "center",
      });

      // Course name with emphasis
      doc.setFontSize(20);
      doc.setTextColor(62, 39, 22);
      doc.setFont("helvetica", "bold");
      
      // Handle long course names
      const maxWidth = 220;
      const lines = doc.splitTextToSize(courseName, maxWidth);
      const startY = 122;
      lines.forEach((line: string, index: number) => {
        doc.text(line, 148.5, startY + (index * 9), { align: "center" });
      });

      // Date and certificate number box
      const infoY = startY + (lines.length * 9) + 12;
      doc.setFillColor(254, 252, 248);
      doc.setDrawColor(196, 155, 80);
      doc.setLineWidth(0.5);
      doc.roundedRect(75, infoY, 147, 22, 2, 2, "FD");
      
      doc.setFontSize(10);
      doc.setTextColor(100, 80, 60);
      doc.setFont("helvetica", "normal");
      
      const issueDate = new Date(issuedAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      doc.text(`Verilme Tarihi: ${issueDate}`, 148.5, infoY + 8, { align: "center" });
      doc.text(`Sertifika No: ${certificateNumber}`, 148.5, infoY + 16, {
        align: "center",
      });

      // Signature line
      doc.setDrawColor(139, 90, 43);
      doc.setLineWidth(0.8);
      doc.line(105, 175, 192, 175);
      doc.setFontSize(10);
      doc.setTextColor(100, 80, 60);
      doc.text("Akademi Muduru", 148.5, 182, { align: "center" });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 130, 110);
      doc.text("TheCompany Coffee Academy - Profesyonel Barista Egitim Programi", 148.5, 195, { align: "center" });

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
