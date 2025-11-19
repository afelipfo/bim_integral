import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, ArrowLeft, TrendingUp, DollarSign, 
  Calendar, AlertTriangle, CheckCircle2, Clock,
  Download, Filter, RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: summary } = trpc.analytics.projectSummary.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );
  const { data: metrics } = trpc.analytics.projectMetrics.useQuery(
    { projectId: selectedProjectId!, days: timeRange },
    { enabled: !!selectedProjectId }
  );

  const costData = metrics?.map(m => ({
    date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    costo: m.budgetSpent || 0,
    presupuesto: m.budgetRemaining || 0,
  })) || [];

  const issuesByType = summary ? [
    { name: 'Abiertos', value: summary.stats.openIssues },
    { name: 'Críticos', value: summary.stats.criticalIssues },
    { name: 'Detectados por IA', value: summary.stats.aiDetectedIssues },
  ] : [];

  const progressData = metrics?.map(m => ({
    date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    progreso: m.completionPercentage || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/50">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                Analítica de Datos
              </h1>
              <p className="text-gray-400 text-lg">
                Visualización y análisis de métricas de proyectos BIM
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Seleccionar Proyecto</CardTitle>
            <CardDescription className="text-gray-400">Elige un proyecto para ver sus métricas y análisis</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4 flex-wrap">
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
            <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value))}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedProjectId && summary ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Issues Totales"
                value={summary.stats.totalIssues}
                icon={<AlertTriangle className="h-6 w-6" />}
                gradient="from-orange-500 to-red-500"
                trend="+12%"
              />
              <MetricCard
                title="Issues Abiertos"
                value={summary.stats.openIssues}
                icon={<Clock className="h-6 w-6" />}
                gradient="from-yellow-500 to-orange-500"
                trend="-5%"
              />
              <MetricCard
                title="Modelos BIM"
                value={summary.stats.totalModels}
                icon={<BarChart3 className="h-6 w-6" />}
                gradient="from-blue-500 to-cyan-500"
                trend="+8%"
              />
              <MetricCard
                title="Presupuesto"
                value={`${summary.stats.budgetUtilization.toFixed(1)}%`}
                icon={<CheckCircle2 className="h-6 w-6" />}
                gradient="from-green-500 to-emerald-500"
                trend="+15%"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Cost Analysis */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Análisis de Costos
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Comparación de costos vs presupuesto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={costData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="costo" stroke="#3b82f6" strokeWidth={2} name="Costo Real" />
                      <Line type="monotone" dataKey="presupuesto" stroke="#10b981" strokeWidth={2} name="Presupuesto" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Issues Distribution */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Distribución de Issues
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Estado actual de issues del proyecto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={issuesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {issuesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  Progreso del Proyecto
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Evolución del progreso en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="progreso" fill="#3b82f6" name="Progreso %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16 text-center">
              <BarChart3 className="h-20 w-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {projects?.length === 0 
                  ? "No tienes proyectos aún. Crea uno para comenzar."
                  : "Selecciona un proyecto para ver sus métricas y análisis"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  gradient,
  trend 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  gradient: string;
  trend: string;
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
        <div className="flex items-end justify-between">
          <span className="text-4xl font-bold text-white">{value}</span>
          <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
