import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Map, ArrowLeft, MapPin, Building2, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { MapView } from "@/components/Map";

export default function Geographic() {
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  
  const { data: projects } = trpc.projects.list.useQuery();

  const handleMapReady = useCallback((googleMap: google.maps.Map) => {
    setMap(googleMap);
    setMapReady(true);

    // Add markers for projects with location data
    if (projects) {
      const newMarkers: google.maps.Marker[] = [];
      
      projects.forEach(project => {
        if (project.latitude && project.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: project.latitude, lng: project.longitude },
            map: googleMap,
            title: project.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: getStatusColor(project.status || 'planning'),
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${project.name}</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 8px;">${project.description || 'Sin descripción'}</p>
                <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                  <span style="background: ${getStatusColor(project.status || 'planning')}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${project.status?.toUpperCase()}
                  </span>
                </div>
                <p style="font-size: 12px; color: #666;">
                  ${project.city ? `${project.city}, ${project.country}` : 'Ubicación no especificada'}
                </p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(googleMap, marker);
          });

          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          const position = marker.getPosition();
          if (position) bounds.extend(position);
        });
        googleMap.fitBounds(bounds);
      }
    }
  }, [projects]);

  const projectsWithLocation = projects?.filter(p => p.latitude && p.longitude) || [];
  const projectsWithoutLocation = projects?.filter(p => !p.latitude || !p.longitude) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Map className="h-8 w-8 text-green-500" />
              Analítica Geográfica
            </h1>
            <p className="text-gray-600">
              Visualización y análisis geoespacial de proyectos BIM
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Proyectos Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{projects?.length || 0}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Con Ubicación</p>
                  <p className="text-3xl font-bold text-gray-900">{projectsWithLocation.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">En Progreso</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projects?.filter(p => p.status === 'construction' || p.status === 'design').length || 0}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mapa de Proyectos</CardTitle>
            <CardDescription>
              Visualización geográfica de {projectsWithLocation.length} proyecto(s) con ubicación definida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full rounded-lg overflow-hidden border">
              <MapView 
                initialCenter={{ lat: 6.2442, lng: -75.5812 }}
                initialZoom={12}
                onMapReady={handleMapReady} 
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Planificación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Diseño</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Construcción</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-sm text-gray-600">En Espera</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectsWithLocation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Geolocalizados</CardTitle>
                <CardDescription>{projectsWithLocation.length} proyecto(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectsWithLocation.map((project, index) => (
                    <div key={`geo-${index}`} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {project.city}, {project.country}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeClass(project.status || 'planning')}>
                        {project.status?.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {projectsWithoutLocation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sin Geolocalización</CardTitle>
                <CardDescription>{projectsWithoutLocation.length} proyecto(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectsWithoutLocation.map((project, index) => (
                    <div key={`no-geo-${index}`} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Ubicación no definida
                        </p>
                      </div>
                      <Badge variant="outline">
                        {project.status?.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    planning: '#3B82F6',
    design: '#EAB308',
    construction: '#F97316',
    completed: '#22C55E',
    on_hold: '#6B7280',
  };
  return colors[status] || '#6B7280';
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    planning: 'bg-blue-100 text-blue-700',
    design: 'bg-yellow-100 text-yellow-700',
    construction: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    on_hold: 'bg-gray-100 text-gray-700',
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
}
