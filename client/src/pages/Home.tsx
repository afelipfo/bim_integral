import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { 
  BarChart3, Map, Brain, Users, Building2, MessageSquare, 
  ArrowRight, CheckCircle2, TrendingUp, AlertCircle, Sparkles,
  Zap, Shield, Globe
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: stats } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="container mx-auto px-4 py-20">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              <div className="mb-12 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-8">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">Plataforma BIM de Nueva Generación</span>
                </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Plataforma BIM
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Medellín
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl leading-relaxed">
              Plataforma integral para gestión de proyectos de infraestructura de Medellín con metodología BIM, 
              analítica avanzada e inteligencia artificial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/50 transition-all hover:scale-105">
                    <a href={getLoginUrl()}>
                      Comenzar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-600 text-white hover:bg-white/10 backdrop-blur-sm">
                    Ver Demo
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-4xl">
                <StatBadge number="99.9%" label="Uptime" />
                <StatBadge number="50K+" label="Proyectos" />
                <StatBadge number="24/7" label="Soporte" />
                <StatBadge number="150+" label="Países" />
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24">
              <ModuleCard
                icon={<BarChart3 className="h-7 w-7" />}
                title="Analítica de Datos"
                description="Dashboards interactivos con métricas en tiempo real y análisis predictivo de costos"
                gradient="from-blue-500/20 to-cyan-500/20"
                iconColor="text-blue-400"
                delay="0"
              />
              <ModuleCard
                icon={<Building2 className="h-7 w-7" />}
                title="BIM Core"
                description="Visor 3D avanzado, gestión de versiones y coordinación multidisciplinaria"
                gradient="from-cyan-500/20 to-teal-500/20"
                iconColor="text-cyan-400"
                delay="100"
              />
              <ModuleCard
                icon={<Map className="h-7 w-7" />}
                title="Analítica Geográfica"
                description="Visualización geoespacial inteligente y análisis de sitio en tiempo real"
                gradient="from-green-500/20 to-emerald-500/20"
                iconColor="text-green-400"
                delay="200"
              />
              <ModuleCard
                icon={<Brain className="h-7 w-7" />}
                title="Inteligencia Artificial"
                description="Detección automática de colisiones y análisis predictivo con ML"
                gradient="from-purple-500/20 to-pink-500/20"
                iconColor="text-purple-400"
                delay="300"
              />
              <ModuleCard
                icon={<MessageSquare className="h-7 w-7" />}
                title="Comunicaciones"
                description="Chat en tiempo real, gestión de RFIs y sistema de notificaciones"
                gradient="from-orange-500/20 to-red-500/20"
                iconColor="text-orange-400"
                delay="400"
              />
              <ModuleCard
                icon={<Users className="h-7 w-7" />}
                title="Empleabilidad"
                description="Gestión de talento, capacitación y certificaciones profesionales"
                gradient="from-yellow-500/20 to-orange-500/20"
                iconColor="text-yellow-400"
                delay="500"
              />
            </div>

            {/* Features Section */}
            <div className="mt-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Potencia tu Flujo de Trabajo
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Herramientas diseñadas para maximizar la eficiencia y colaboración
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Zap className="h-8 w-8 text-yellow-400" />}
                  title="Rendimiento Extremo"
                  description="Procesamiento en tiempo real con latencia ultra baja para proyectos de cualquier escala"
                />
                <FeatureCard
                  icon={<Shield className="h-8 w-8 text-blue-400" />}
                  title="Seguridad Enterprise"
                  description="Encriptación end-to-end y cumplimiento con estándares internacionales"
                />
                <FeatureCard
                  icon={<Globe className="h-8 w-8 text-green-400" />}
                  title="Colaboración Global"
                  description="Equipos distribuidos trabajando juntos sin barreras geográficas"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <span className="text-white font-bold text-xl">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bienvenido, {user?.name || 'Usuario'}
              </h1>
              <p className="text-gray-400">
                Dashboard principal de tu plataforma BIM integral
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Proyectos Activos"
            value={stats?.totalProjects || 0}
            icon={<Building2 className="h-6 w-6" />}
            gradient="from-blue-500 to-cyan-500"
            trend="+12%"
          />
          <StatsCard
            title="Issues Abiertos"
            value={stats?.activeIssues || 0}
            icon={<AlertCircle className="h-6 w-6" />}
            gradient="from-orange-500 to-red-500"
            trend="-8%"
          />
          <StatsCard
            title="Tareas Completadas"
            value={stats?.completedTasks || 0}
            icon={<CheckCircle2 className="h-6 w-6" />}
            gradient="from-green-500 to-emerald-500"
            trend="+24%"
          />
          <StatsCard
            title="Miembros del Equipo"
            value={stats?.teamMembers || 0}
            icon={<Users className="h-6 w-6" />}
            gradient="from-purple-500 to-pink-500"
            trend="+5%"
          />
        </div>

        {/* Quick Access Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAccessCard
            to="/analytics"
            icon={<BarChart3 className="h-8 w-8" />}
            title="Analítica de Datos"
            description="Ver dashboards y métricas"
            gradient="from-blue-500/20 to-cyan-500/20"
            iconColor="text-blue-400"
          />
          <QuickAccessCard
            to="/bim"
            icon={<Building2 className="h-8 w-8" />}
            title="Modelos BIM"
            description="Gestionar modelos 3D"
            gradient="from-cyan-500/20 to-teal-500/20"
            iconColor="text-cyan-400"
          />
          <QuickAccessCard
            to="/geographic"
            icon={<Map className="h-8 w-8" />}
            title="Analítica Geográfica"
            description="Visualizar proyectos en mapa"
            gradient="from-green-500/20 to-emerald-500/20"
            iconColor="text-green-400"
          />
          <QuickAccessCard
            to="/ai"
            icon={<Brain className="h-8 w-8" />}
            title="Inteligencia Artificial"
            description="Análisis y asistente IA"
            gradient="from-purple-500/20 to-pink-500/20"
            iconColor="text-purple-400"
          />
          <QuickAccessCard
            to="/communications"
            icon={<MessageSquare className="h-8 w-8" />}
            title="Comunicaciones"
            description="Chat y colaboración"
            gradient="from-orange-500/20 to-red-500/20"
            iconColor="text-orange-400"
          />
          <QuickAccessCard
            to="/empleabilidad"
            icon={<Users className="h-8 w-8" />}
            title="Empleabilidad"
            description="Gestión de talento"
            gradient="from-yellow-500/20 to-orange-500/20"
            iconColor="text-yellow-400"
          />
        </div>
      </div>
    </div>
  );
}

function StatBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
      <div className="text-3xl font-bold text-white mb-1">{number}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function ModuleCard({ 
  icon, 
  title, 
  description, 
  gradient,
  iconColor,
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string;
  iconColor: string;
  delay: string;
}) {
  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className={`${iconColor} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  gradient,
  trend 
}: { 
  title: string; 
  value: number; 
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

function QuickAccessCard({ 
  to, 
  icon, 
  title, 
  description,
  gradient,
  iconColor
}: { 
  to: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <Link href={to}>
      <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className={`${iconColor} transform group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
