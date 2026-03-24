import { useEffect, useRef } from "react";
import { Instagram } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { useContactSettings } from "@/hooks/useContactSettings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const InstagramEmbed = ({ postUrl }: { postUrl: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Clean URL to get embed URL
    let cleanUrl = postUrl.split("?")[0];
    if (!cleanUrl.endsWith("/")) cleanUrl += "/";
    const embedUrl = `${cleanUrl}embed/captioned/`;

    // Use DOM APIs instead of innerHTML to prevent XSS
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.className = "w-full border-0 rounded-lg overflow-hidden";
    iframe.style.cssText = "min-height: 480px; max-width: 540px;";
    iframe.setAttribute("allowtransparency", "true");
    iframe.scrolling = "no";
    iframe.setAttribute("frameborder", "0");
    iframe.loading = "lazy";
    containerRef.current.replaceChildren(iframe);
  }, [postUrl]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center"
    />
  );
};

const InstagramSection = () => {
  const { data: posts, isLoading } = useInstagramPosts();
  const { data: contactSettings } = useContactSettings();

  const instagramUrl = contactSettings?.instagram_url;

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[480px] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts?.length) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Bizi Instagram'da Takip Edin
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Güncel paylaşımlarımızı, kahve tariflerini ve eğitim içeriklerimizi kaçırmayın
          </p>
        </div>

        <div className={`grid gap-6 justify-items-center ${
          posts.length === 1 ? "md:grid-cols-1 max-w-xl mx-auto" :
          posts.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" :
          "md:grid-cols-3"
        }`}>
          {posts.map((post) => (
            <div key={post.id} className="w-full max-w-[540px]">
              <InstagramEmbed postUrl={post.post_url} />
            </div>
          ))}
        </div>

        {instagramUrl && (
          <div className="text-center mt-10">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-[#E1306C] text-[#E1306C] hover:bg-[#E1306C] hover:text-white"
              asChild
            >
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
                Instagram Sayfamız
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default InstagramSection;
