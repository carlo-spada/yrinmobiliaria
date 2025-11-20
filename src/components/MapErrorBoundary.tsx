import { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  language: "es" | "en";
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Map error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { language } = this.props;
      return (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">
              {language === "es" ? "Error al cargar el mapa" : "Error loading map"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "es"
                ? "No pudimos cargar el mapa. Puedes ver las propiedades en formato de lista."
                : "We couldn't load the map. You can view properties in list format."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                {language === "es" ? "Reintentar" : "Retry"}
              </Button>
            <Button variant="outline" asChild>
              <Link to="/propiedades" replace>
                {language === "es" ? "Ver lista" : "View list"}
              </Link>
            </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
