import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Users, ArrowLeft, Award, BookOpen, 
  Video, FileText, GraduationCap, Calendar,
  ExternalLink, Star
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Empleabilidad() {
  const { data: resources } = trpc.empleabilidad.trainingResources.useQuery();
  const { data: certifications } = trpc.empleabilidad.myCertifications.useQuery();

  const categoryColors: Record<string, string> = {
    bim_basics: "bg-blue-100 text-blue-700",
    software_training: "bg-green-100 text-green-700",
    methodology: "bg-purple-100 text-purple-700",
    standards: "bg-orange-100 text-orange-700",
    case_study: "bg-pink-100 text-pink-700",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    video: <Video className="h-4 w-4" />,
    article: <FileText className="h-4 w-4" />,
    course: <BookOpen className="h-4 w-4" />,
    webinar: <GraduationCap className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
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
              <Users className="h-8 w-8 text-yellow-600" />
              Empleabilidad
            </h1>
            <p className="text-gray-600">
              Recursos de capacitación y gestión de talento BIM
            </p>
          </div>
        </div>

        {/* My Certifications */}
        {certifications && certifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Mis Certificaciones
              </CardTitle>
              <CardDescription>{certifications.length} certificación(es)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certifications.map((cert, index) => (
                  <div key={`cert-${index}`} className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200">
                    <div className="flex items-start justify-between mb-2">
                      <Award className="h-8 w-8 text-yellow-600" />
                      {cert.credentialUrl && (
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => window.open(cert.credentialUrl!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
                    {cert.issuer && (
                      <p className="text-sm text-gray-600 mb-2">{cert.issuer}</p>
                    )}
                    {cert.issueDate && (
                      <p className="text-xs text-gray-500">
                        Emitida: {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    )}
                    {cert.expiryDate && (
                      <p className="text-xs text-gray-500">
                        Expira: {new Date(cert.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Resources */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Recursos de Capacitación
                </CardTitle>
                <CardDescription>
                  {resources?.length || 0} recursos disponibles
                </CardDescription>
              </div>
              <Button onClick={() => toast.info("Función en desarrollo")}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Agregar Certificación
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {resources && resources.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resources.map((resource, index) => (
                  <Card key={`resource-${index}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {typeIcons[resource.type]}
                          <Badge className={categoryColors[resource.category]}>
                            {resource.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Badge className={difficultyColors[resource.difficulty]}>
                          {resource.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium capitalize">{resource.type}</span>
                        </div>
                        {resource.duration && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duración:</span>
                            <span className="font-medium">{resource.duration} minutos</span>
                          </div>
                        )}
                        <div className="pt-3">
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={() => {
                              if (resource.url) {
                                window.open(resource.url, '_blank');
                              } else {
                                toast.info("URL no disponible");
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acceder al Recurso
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay recursos de capacitación disponibles aún</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Ruta de Aprendizaje BIM
            </CardTitle>
            <CardDescription>Progresa en tu carrera profesional BIM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <LearningPathItem
                level="Básico"
                title="Fundamentos BIM"
                description="Introducción a la metodología BIM, conceptos básicos y terminología"
                completed={false}
              />
              <LearningPathItem
                level="Intermedio"
                title="Software BIM"
                description="Dominio de herramientas como Revit, Navisworks y software de coordinación"
                completed={false}
              />
              <LearningPathItem
                level="Avanzado"
                title="Gestión de Proyectos BIM"
                description="Coordinación multidisciplinaria, estándares y mejores prácticas"
                completed={false}
              />
              <LearningPathItem
                level="Experto"
                title="BIM Manager"
                description="Liderazgo de equipos, implementación BIM y gestión estratégica"
                completed={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LearningPathItem({ 
  level, 
  title, 
  description, 
  completed 
}: { 
  level: string; 
  title: string; 
  description: string; 
  completed: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
          completed ? 'bg-green-500' : 'bg-gray-300'
        }`}>
          {completed ? (
            <Award className="h-6 w-6 text-white" />
          ) : (
            <span className="text-white font-bold">?</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{level}</Badge>
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
