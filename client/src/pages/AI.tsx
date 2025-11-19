import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { 
  Brain, ArrowLeft, Sparkles, AlertTriangle, 
  CheckCircle2, Clock, MessageSquare, Send
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function AI() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: analyses } = trpc.ai.analyses.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const runClashDetection = trpc.ai.runClashDetection.useMutation({
    onSuccess: () => {
      toast.success("Análisis de colisiones iniciado");
    },
    onError: () => {
      toast.error("Error al iniciar análisis");
    },
  });

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: String(data.response) }]);
    },
    onError: () => {
      toast.error("Error al procesar mensaje");
    },
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    chatMutation.mutate({ 
      message: chatMessage,
      projectId: selectedProjectId || undefined,
    });
    setChatMessage("");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    processing: <Sparkles className="h-4 w-4 animate-spin" />,
    completed: <CheckCircle2 className="h-4 w-4" />,
    failed: <AlertTriangle className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
              <Brain className="h-8 w-8 text-purple-500" />
              Inteligencia Artificial
            </h1>
            <p className="text-gray-600">
              Análisis inteligente y asistente virtual para proyectos BIM
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Proyecto</CardTitle>
                <CardDescription>Elige un proyecto para análisis IA</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedProjectId?.toString() || ""} 
                  onValueChange={(value) => setSelectedProjectId(Number(value))}
                >
                  <SelectTrigger className="w-full">
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

            {/* AI Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Herramientas de IA</CardTitle>
                <CardDescription>Ejecuta análisis inteligentes sobre tus proyectos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col items-start"
                    disabled={!selectedProjectId || runClashDetection.isPending}
                    onClick={() => selectedProjectId && runClashDetection.mutate({ projectId: selectedProjectId })}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold">Detección de Colisiones</span>
                    </div>
                    <span className="text-xs text-gray-600 text-left">
                      Identifica interferencias entre modelos
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col items-start"
                    disabled={!selectedProjectId}
                    onClick={() => toast.info("Función en desarrollo")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Análisis de Riesgos</span>
                    </div>
                    <span className="text-xs text-gray-600 text-left">
                      Predicción de problemas potenciales
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col items-start"
                    disabled={!selectedProjectId}
                    onClick={() => toast.info("Función en desarrollo")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Control de Calidad</span>
                    </div>
                    <span className="text-xs text-gray-600 text-left">
                      Verifica cumplimiento de estándares
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col items-start"
                    disabled={!selectedProjectId}
                    onClick={() => toast.info("Función en desarrollo")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Optimización de Costos</span>
                    </div>
                    <span className="text-xs text-gray-600 text-left">
                      Sugerencias para reducir gastos
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis History */}
            {selectedProjectId && analyses && analyses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Análisis</CardTitle>
                  <CardDescription>{analyses.length} análisis realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyses.map((analysis, index) => (
                      <div key={`analysis-${index}`} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {statusIcons[analysis.status]}
                            <span className="font-semibold capitalize">
                              {analysis.analysisType.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge className={statusColors[analysis.status]}>
                            {analysis.status}
                          </Badge>
                        </div>
                        {analysis.recommendations && (
                          <p className="text-sm text-gray-600 mt-2">
                            {analysis.recommendations}
                          </p>
                        )}
                        {analysis.confidence && (
                          <p className="text-xs text-gray-500 mt-2">
                            Confianza: {(analysis.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(analysis.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - AI Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Asistente Virtual BIM
                </CardTitle>
                <CardDescription>Pregunta sobre metodología BIM</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm">
                        Haz una pregunta sobre BIM, coordinación de proyectos, 
                        o cualquier consulta técnica
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-lg p-3 ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin text-purple-500" />
                          <span className="text-sm text-gray-600">Pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || chatMutation.isPending}
                    size="icon"
                    className="h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
