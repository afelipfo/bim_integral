import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Building2, Upload, Eye, Layers, ArrowLeft, 
  FileText, Download, Calendar, User
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function BIMCore() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: models } = trpc.bimModels.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const disciplineColors: Record<string, string> = {
    architecture: "bg-blue-100 text-blue-700",
    structural: "bg-green-100 text-green-700",
    mep: "bg-orange-100 text-orange-700",
    civil: "bg-purple-100 text-purple-700",
    landscape: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-cyan-500" />
                BIM Core
              </h1>
              <p className="text-gray-600">
                Gestión de modelos 3D y coordinación multidisciplinaria
              </p>
            </div>
            <Button 
              onClick={() => toast.info("Función de carga en desarrollo")}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir Modelo
            </Button>
          </div>
        </div>

        {/* Project Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seleccionar Proyecto</CardTitle>
            <CardDescription>Elige un proyecto para gestionar sus modelos BIM</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedProjectId?.toString() || ""} 
              onValueChange={(value) => setSelectedProjectId(Number(value))}
            >
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project, index) => (
                  <SelectItem key={`project-${index}`} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Models List */}
        {selectedProjectId && (
          <>
            {models && models.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {models.map((model, index) => (
                  <Card key={`model-${index}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <Layers className="h-5 w-5 text-cyan-500" />
                            {model.name}
                          </CardTitle>
                          <CardDescription>
                            {model.description || "Sin descripción"}
                          </CardDescription>
                        </div>
                        <Badge className={disciplineColors[model.discipline]}>
                          {model.discipline}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>Tipo: {model.fileType || 'N/A'}</span>
                          <span className="ml-auto">
                            {model.fileSize ? `${(model.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Subido: {new Date(model.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>Versión: {model.version}</span>
                          {model.isLatest && (
                            <Badge variant="outline" className="ml-auto">Última versión</Badge>
                          )}
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => toast.info("Visor 3D en desarrollo")}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Modelo
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(model.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No hay modelos BIM en este proyecto
                  </p>
                  <Button onClick={() => toast.info("Función de carga en desarrollo")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Primer Modelo
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Discipline Legend */}
            {models && models.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Disciplinas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge className={disciplineColors.architecture}>Arquitectura</Badge>
                    <Badge className={disciplineColors.structural}>Estructural</Badge>
                    <Badge className={disciplineColors.mep}>MEP</Badge>
                    <Badge className={disciplineColors.civil}>Civil</Badge>
                    <Badge className={disciplineColors.landscape}>Paisajismo</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedProjectId && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {projects?.length === 0 
                  ? "No tienes proyectos aún. Crea uno para comenzar."
                  : "Selecciona un proyecto para ver sus modelos BIM"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
