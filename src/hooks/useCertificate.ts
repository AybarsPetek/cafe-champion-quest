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

      // Set background with a subtle gradient effect using rectangles
      doc.setFillColor(249, 250, 251);
      doc.rect(0, 0, 297, 210, "F");

      // Outer border
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(2);
      doc.rect(15, 15, 267, 180);

      // Inner decorative border
      doc.setDrawColor(165, 180, 252);
      doc.setLineWidth(0.5);
      doc.rect(20, 20, 257, 170);

      // Decorative corner elements
      doc.setFillColor(99, 102, 241);
      [
        [20, 20], [267, 20], [20, 180], [267, 180]
      ].forEach(([x, y]) => {
        doc.circle(x, y, 3, "F");
      });

      // Title with decorative underline
      doc.setFontSize(42);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATE", 148.5, 50, { align: "center" });
      
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(1);
      doc.line(100, 55, 197, 55);

      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text("This certifies that", 148.5, 70, { align: "center" });

      // User name with decorative box
      doc.setFillColor(240, 242, 255);
      doc.roundedRect(50, 77, 197, 18, 2, 2, "F");
      
      doc.setFontSize(24);
      doc.setTextColor(99, 102, 241);
      doc.setFont("helvetica", "bold");
      doc.text(userName, 148.5, 89, { align: "center" });

      // Course completion text
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.text("has successfully completed the course", 148.5, 107, {
        align: "center",
      });

      // Course name with emphasis
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      
      // Handle long course names by splitting into multiple lines if needed
      const maxWidth = 220;
      const lines = doc.splitTextToSize(courseName, maxWidth);
      const startY = 120;
      lines.forEach((line: string, index: number) => {
        doc.text(line, 148.5, startY + (index * 8), { align: "center" });
      });

      // Date and certificate number in a box
      const infoY = startY + (lines.length * 8) + 15;
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.roundedRect(70, infoY, 157, 25, 2, 2, "FD");
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      
      const issueDate = new Date(issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      doc.text(`Issue Date: ${issueDate}`, 148.5, infoY + 10, { align: "center" });
      doc.text(`Certificate No: ${certificateNumber}`, 148.5, infoY + 18, {
        align: "center",
      });

      // Signature line
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.8);
      doc.line(115, 170, 182, 170);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Authorized Signature", 148.5, 176, { align: "center" });

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
