import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  AlertTriangle, ArrowLeft, Filter, Download, 
  CheckCircle2, XCircle, Clock, Eye, Users
} from "lucide-react";
import { Link } from "wouter";

export default function ClashDetection() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: clashes } = trpc.clashes.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );
  const { data: stats } = trpc.clashes.stats.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const filteredClashes = clashes?.filter(clash => {
    if (filterSeverity !== "all" && clash.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && clash.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/50">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                Clash Detection
              </h1>
              <p className="text-gray-400 text-lg">
                Detección y gestión de colisiones entre modelos BIM
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Exportar Reporte
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Ejecutar Detección
              </Button>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Seleccionar Proyecto</CardTitle>
            <CardDescription className="text-gray-400">Elige un proyecto para analizar colisiones</CardDescription>
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

        {selectedProjectId && stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Colisiones Totales"
                value={stats.total}
                icon={<AlertTriangle className="h-6 w-6" />}
                gradient="from-orange-500 to-red-500"
                subtitle={`${stats.active} activas`}
              />
              <StatCard
                title="Críticas"
                value={stats.critical}
                icon={<XCircle className="h-6 w-6" />}
                gradient="from-red-500 to-pink-500"
                subtitle="Requieren atención inmediata"
              />
              <StatCard
                title="Resueltas"
                value={stats.resolved}
                icon={<CheckCircle2 className="h-6 w-6" />}
                gradient="from-green-500 to-emerald-500"
                subtitle={`${((stats.resolved / stats.total) * 100 || 0).toFixed(1)}% del total`}
              />
              <StatCard
                title="Tipo Hard"
                value={stats.byType.hard}
                icon={<AlertTriangle className="h-6 w-6" />}
                gradient="from-purple-500 to-indigo-500"
                subtitle="Colisiones físicas"
              />
            </div>

            {/* Clash Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Distribución por Tipo</CardTitle>
                  <CardDescription className="text-gray-400">
                    Clasificación de colisiones detectadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ClashTypeRow label="Hard Clash" value={stats.byType.hard} total={stats.total} color="bg-red-500" />
                  <ClashTypeRow label="Soft Clash" value={stats.byType.soft} total={stats.total} color="bg-orange-500" />
                  <ClashTypeRow label="Clearance" value={stats.byType.clearance} total={stats.total} color="bg-yellow-500" />
                  <ClashTypeRow label="Duplicate" value={stats.byType.duplicate} total={stats.total} color="bg-blue-500" />
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Distribución por Severidad</CardTitle>
                  <CardDescription className="text-gray-400">
                    Priorización de colisiones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ClashTypeRow label="Crítica" value={stats.critical} total={stats.total} color="bg-red-600" />
                  <ClashTypeRow label="Alta" value={stats.high} total={stats.total} color="bg-orange-500" />
                  <ClashTypeRow label="Media" value={stats.medium} total={stats.total} color="bg-yellow-500" />
                  <ClashTypeRow label="Baja" value={stats.low} total={stats.total} color="bg-green-500" />
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="pt-6">
                <div className="flex gap-4 flex-wrap">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Severidad</label>
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Estado</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="new">Nuevo</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="reviewed">Revisado</SelectItem>
                        <SelectItem value="resolved">Resuelto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clashes List */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Lista de Colisiones</CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredClashes?.length || 0} colisiones encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredClashes && filteredClashes.length > 0 ? (
                    filteredClashes.map((clash, index) => (
                      <ClashCard key={`clash-${index}`} clash={clash} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">
                        {clashes?.length === 0 
                          ? "¡No se encontraron colisiones! El modelo está limpio."
                          : "No hay colisiones que coincidan con los filtros seleccionados."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-20 w-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {projects?.length === 0 
                  ? "No tienes proyectos aún. Crea uno para comenzar."
                  : "Selecciona un proyecto para ver las colisiones detectadas"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  gradient,
  subtitle 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  gradient: string;
  subtitle: string;
}) {
  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden group hover:bg-white/10 transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-400">{title}</span>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-20 text-white`}>
            {icon}
          </div>
        </div>
        <div className="mb-2">
          <span className="text-4xl font-bold text-white">{value}</span>
        </div>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function ClashTypeRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm text-white font-semibold">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ClashCard({ clash }: { clash: any }) {
  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  const statusIcons = {
    new: <Clock className="h-4 w-4" />,
    active: <AlertTriangle className="h-4 w-4" />,
    reviewed: <Eye className="h-4 w-4" />,
    resolved: <CheckCircle2 className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    ignored: <XCircle className="h-4 w-4" />,
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${severityColors[clash.severity as keyof typeof severityColors]}`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold">
                {clash.element1Type || 'Elemento 1'} ↔ {clash.element2Type || 'Elemento 2'}
              </span>
              <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                {clash.clashType}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              {clash.element1Discipline} vs {clash.element2Discipline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${severityColors[clash.severity as keyof typeof severityColors]} text-white`}>
            {clash.severity}
          </Badge>
          <Badge variant="outline" className="border-white/20 text-gray-300">
            {statusIcons[clash.status as keyof typeof statusIcons]}
            <span className="ml-1">{clash.status}</span>
          </Badge>
        </div>
      </div>
      
      {clash.distance && (
        <div className="text-sm text-gray-400 mb-2">
          Distancia: <span className="text-white font-mono">{clash.distance.toFixed(3)}m</span>
        </div>
      )}
      
      {clash.notes && (
        <p className="text-sm text-gray-300 mb-3">{clash.notes}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Detectado: {new Date(clash.runDate).toLocaleDateString('es-ES')}
          {clash.detectedBy && ` por ${clash.detectedBy}`}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
            <Eye className="h-4 w-4 mr-1" />
            Ver en 3D
          </Button>
          {clash.status !== 'resolved' && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Resolver
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
