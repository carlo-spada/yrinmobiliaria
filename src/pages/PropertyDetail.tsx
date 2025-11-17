import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/utils/LanguageContext";
import { useProperty, useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input-enhanced";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/PropertyCard";
import { ShareButtons } from "@/components/ShareButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
import {
  ArrowLeft,
  Bed,
  Bath,
  Car,
  Maximize,
  MapPin,
  MessageCircle,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { data: property } = useProperty(id || '');
  const { data: properties = [] } = useProperties();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t.properties.noResults}</h1>
          <Button onClick={() => navigate("/propiedades")} variant="primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "es" ? "Volver al catálogo" : "Back to catalog"}
          </Button>
        </div>
      </div>
    );
  }

  const similarProperties = properties
    .filter(
      (p) =>
        p.id !== property.id &&
        p.status === "disponible" &&
        (p.type === property.type || p.location.zone === property.location.zone)
    )
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(language === "es" ? "Enlace copiado" : "Link copied");
  };

  const handleWhatsApp = () => {
    const message = `${language === "es" ? "Hola, estoy interesado en" : "Hi, I'm interested in"}: ${property.title[language]}`;
    window.open(`https://wa.me/5219511234567?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form:", formData);
    alert(language === "es" ? "Mensaje enviado" : "Message sent");
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white"
            onClick={prevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white"
            onClick={nextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
          <div className="max-w-6xl w-full px-4">
            <img
              src={property.images[selectedImageIndex]}
              alt={property.title[language]}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <p className="text-white text-center mt-4">
              {selectedImageIndex + 1} / {property.images.length}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/propiedades")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === "es" ? "Volver al catálogo" : "Back to catalog"}
        </Button>

        {/* Image Gallery */}
        <div className="mb-8">
          <div
            className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={property.images[selectedImageIndex]}
              alt={property.title[language]}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md">
              {selectedImageIndex + 1} / {property.images.length}
            </div>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title[language]} ${index + 1}`}
                className={`h-20 w-28 object-cover rounded-md cursor-pointer transition-all ${
                  selectedImageIndex === index
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Location */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{property.title[language]}</h1>
                <Badge variant={property.operation === "venta" ? "default" : "secondary"}>
                  {property.operation === "venta"
                    ? language === "es"
                      ? "Venta"
                      : "Sale"
                    : language === "es"
                    ? "Renta"
                    : "Rent"}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {property.location.neighborhood}, {property.location.zone}
                </span>
              </div>
              <p className="text-4xl font-bold text-primary">
                ${property.price.toLocaleString()}
                {property.operation === "renta" && (
                  <span className="text-lg text-muted-foreground">
                    /{language === "es" ? "mes" : "month"}
                  </span>
                )}
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {language === "es" ? "Descripción" : "Description"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description[language]}
              </p>
            </div>

            {/* Features Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {language === "es" ? "Características" : "Features"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.bedrooms && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "es" ? "Recámaras" : "Bedrooms"}
                      </p>
                      <p className="font-semibold">{property.features.bedrooms}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "es" ? "Baños" : "Bathrooms"}
                    </p>
                    <p className="font-semibold">{property.features.bathrooms}</p>
                  </div>
                </div>
                {property.features.parking && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "es" ? "Estacionamiento" : "Parking"}
                      </p>
                      <p className="font-semibold">{property.features.parking}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Maximize className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "es" ? "Construcción" : "Construction"}
                    </p>
                    <p className="font-semibold">{property.features.constructionArea} m²</p>
                  </div>
                </div>
                {property.features.landArea && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Maximize className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "es" ? "Terreno" : "Land"}
                      </p>
                      <p className="font-semibold">{property.features.landArea} m²</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {language === "es" ? "Amenidades" : "Amenities"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {language === "es" ? "Ubicación" : "Location"}
              </h2>
              <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">{property.location.zone}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "es"
                      ? "Ubicación aproximada por privacidad"
                      : "Approximate location for privacy"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">
                  {language === "es"
                    ? "¿Interesado en esta propiedad?"
                    : "Interested in this property?"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label={language === "es" ? "Nombre" : "Name"}
                    placeholder={language === "es" ? "Tu nombre" : "Your name"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label={language === "es" ? "Correo" : "Email"}
                    type="email"
                    placeholder={language === "es" ? "tu@email.com" : "your@email.com"}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    label={language === "es" ? "Teléfono" : "Phone"}
                    type="tel"
                    placeholder="(951) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {language === "es" ? "Mensaje" : "Message"}
                    </label>
                    <Textarea
                      placeholder={
                        language === "es"
                          ? "Me gustaría obtener más información..."
                          : "I would like to get more information..."
                      }
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full">
                    {language === "es" ? "Enviar mensaje" : "Send message"}
                  </Button>
                </form>

                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Link to={`/agendar?propertyId=${property.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      {language === "es" ? "Agendar visita" : "Schedule visit"}
                    </Button>
                  </Link>
                  <div className="w-full">
                    <ShareButtons 
                      title={property.title[language]}
                      description={property.description[language]}
                      variant="default"
                    />
                  </div>
                  <FavoriteButton propertyId={property.id} variant="button" className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">
              {language === "es" ? "Propiedades similares" : "Similar properties"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title[language]}
                  location={`${prop.location.neighborhood}, ${prop.location.zone}`}
                  price={prop.price.toLocaleString()}
                  image={prop.images[0]}
                  bedrooms={prop.features.bedrooms}
                  bathrooms={prop.features.bathrooms}
                  area={prop.features.constructionArea}
                  featured={prop.featured}
                  status={
                    prop.status === "disponible"
                      ? prop.operation === "venta"
                        ? "sale"
                        : "rent"
                      : "sold"
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
