import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import brewingImage from "@/assets/course-brewing.jpg";
import latteArtImage from "@/assets/course-latte-art.jpg";
import beansImage from "@/assets/course-beans.jpg";

const Courses = () => {
  const courses = [
    {
      id: "1",
      title: "Kahve Demleme Teknikleri",
      description: "Pour-over, French press, AeroPress ve daha fazlası. Her demleme yöntemini profesyonel seviyede öğrenin.",
      image: brewingImage,
      duration: "2 saat 30 dk",
      level: "Başlangıç",
      points: 100,
      progress: 0,
    },
    {
      id: "2",
      title: "Latte Art Uzmanlığı",
      description: "Süt köpürtme ve latte art tekniklerinde uzmanlaşın. Kalp, rozet ve tulip desenlerini öğrenin.",
      image: latteArtImage,
      duration: "3 saat",
      level: "Orta",
      points: 150,
      progress: 35,
    },
    {
      id: "3",
      title: "Kahve Çekirdeği Bilgisi",
      description: "Kahve çeşitlerini, kavurma seviyelerini ve lezzet profillerini keşfedin.",
      image: beansImage,
      duration: "1 saat 45 dk",
      level: "Başlangıç",
      points: 80,
      progress: 0,
    },
    {
      id: "4",
      title: "Espresso Mastery",
      description: "Mükemmel espresso çekimi için gereken tüm teknikleri öğrenin. Öğütme, tamping ve ekstraksiyon.",
      image: brewingImage,
      duration: "4 saat",
      level: "İleri",
      points: 200,
      progress: 0,
    },
    {
      id: "5",
      title: "Müşteri Hizmetleri",
      description: "Profesyonel bir barista olarak müşteri memnuniyetini en üst seviyeye çıkarın.",
      image: latteArtImage,
      duration: "2 saat",
      level: "Başlangıç",
      points: 90,
      progress: 65,
    },
    {
      id: "6",
      title: "Alternatif Demleme Yöntemleri",
      description: "V60, Chemex, Siphon ve Cold Brew gibi özel demleme tekniklerini keşfedin.",
      image: beansImage,
      duration: "3 saat 15 dk",
      level: "Orta",
      points: 120,
      progress: 0,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Eğitim Kütüphanesi</h1>
          <p className="text-lg text-muted-foreground">
            Profesyonel barista olmak için gereken tüm eğitimler
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
