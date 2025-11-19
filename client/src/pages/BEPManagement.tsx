import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  FileText, ArrowLeft, Plus, CheckCircle2, 
  Clock, Archive, FileCheck, Users, Calendar
} from "lucide-react";
import { Link } from "wouter";

export default function BEPManagement() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: beps } = trpc.bep.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );
  const { data: activeBEP } = trpc.bep.active.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-300 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/50">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                BIM Execution Plan (BEP)
              </h1>
              <p className="text-gray-400 text-lg">
                Gestión de Planes de Ejecución BIM según ISO 19650
              </p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo BEP
            </Button>
          </div>
        </div>

        {/* Project Selector */}
        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Seleccionar Proyecto</CardTitle>
            <CardDescription className="text-gray-400">Elige un proyecto para gestionar su BEP</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedProjectId?.toString() || ""} 
              onValueChange={(value) => setSelectedProjectId(Number(value))}
            >
              <SelectTrigger className="w-full md:w-96 bg-white/5 border-white/10 text-white">
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

        {selectedProjectId ? (
          <>
            {/* Active BEP */}
            {activeBEP && (
              <Card className="mb-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border-indigo-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                        BEP Activo - Versión {activeBEP.version}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Plan de ejecución actual del proyecto
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      ACTIVO
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<FileCheck className="h-5 w-5 text-indigo-400" />}
                      label="Nivel de Información"
                      value={activeBEP.levelOfInformation || "No especificado"}
                    />
                    <InfoItem
                      icon={<Users className="h-5 w-5 text-purple-400" />}
                      label="Lead Appointed Party"
                      value={activeBEP.leadAppointedParty || "No asignado"}
                    />
                    <InfoItem
                      icon={<Calendar className="h-5 w-5 text-blue-400" />}
                      label="Aprobado"
                      value={activeBEP.approvedAt ? new Date(activeBEP.approvedAt).toLocaleDateString('es-ES') : "Pendiente"}
                    />
                    <InfoItem
                      icon={<FileText className="h-5 w-5 text-green-400" />}
                      label="CDE"
                      value={activeBEP.commonDataEnvironment || "No configurado"}
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Ver Detalles Completos
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Descargar PDF
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* BEP History */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Historial de Versiones</CardTitle>
                <CardDescription className="text-gray-400">
                  Todas las versiones del BEP del proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {beps && beps.length > 0 ? (
                    beps.map((bep, index) => (
                      <BEPCard key={`bep-${index}`} bep={bep} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-4">
                        No hay BEPs creados para este proyecto
                      </p>
                      <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primer BEP
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ISO 19650 Compliance */}
            <Card className="mt-8 bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Cumplimiento ISO 19650</CardTitle>
                <CardDescription className="text-gray-400">
                  Requisitos y estándares internacionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ComplianceItem
                    title="Information Requirements"
                    status="complete"
                    description="Requisitos de información definidos"
                  />
                  <ComplianceItem
                    title="Level of Information Need"
                    status="complete"
                    description="LOI especificado para cada disciplina"
                  />
                  <ComplianceItem
                    title="Common Data Environment"
                    status="partial"
                    description="CDE configurado parcialmente"
                  />
                  <ComplianceItem
                    title="Task Team Leaders"
                    status="complete"
                    description="Líderes asignados por disciplina"
                  />
                  <ComplianceItem
                    title="Deliverables Matrix"
                    status="partial"
                    description="Matriz de entregables en progreso"
                  />
                  <ComplianceItem
                    title="Milestones & Timeline"
                    status="pending"
                    description="Hitos pendientes de definición"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16 text-center">
              <FileText className="h-20 w-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {projects?.length === 0 
                  ? "No tienes proyectos aún. Crea uno para comenzar."
                  : "Selecciona un proyecto para gestionar su BEP"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

function BEPCard({ bep }: { bep: any }) {
  const statusConfig = {
    draft: { color: "bg-gray-500", icon: <Clock className="h-4 w-4" />, label: "Borrador" },
    approved: { color: "bg-blue-500", icon: <CheckCircle2 className="h-4 w-4" />, label: "Aprobado" },
    active: { color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" />, label: "Activo" },
    archived: { color: "bg-gray-600", icon: <Archive className="h-4 w-4" />, label: "Archivado" },
  };

  const config = statusConfig[bep.status as keyof typeof statusConfig];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold">Versión {bep.version}</span>
            <Badge className={`${config.color} text-white`}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
          </div>
          <p className="text-sm text-gray-400">
            Creado: {new Date(bep.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
            Ver
          </Button>
          {bep.status === 'draft' && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Aprobar
            </Button>
          )}
        </div>
      </div>
      
      {bep.levelOfInformation && (
        <div className="text-sm text-gray-300 mb-2">
          LOI: <span className="text-white font-semibold">{bep.levelOfInformation}</span>
        </div>
      )}
      
      {bep.leadAppointedParty && (
        <div className="text-sm text-gray-300">
          LAP: <span className="text-white">{bep.leadAppointedParty}</span>
        </div>
      )}
    </div>
  );
}

function ComplianceItem({ 
  title, 
  status, 
  description 
}: { 
  title: string; 
  status: 'complete' | 'partial' | 'pending'; 
  description: string;
}) {
  const statusConfig = {
    complete: { color: "text-green-400", icon: <CheckCircle2 className="h-5 w-5" /> },
    partial: { color: "text-yellow-400", icon: <Clock className="h-5 w-5" /> },
    pending: { color: "text-gray-400", icon: <Clock className="h-5 w-5" /> },
  };

  const config = statusConfig[status];

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-start gap-3 mb-2">
        <div className={config.color}>{config.icon}</div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
