import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { 
  MessageSquare, ArrowLeft, Send, Hash, 
  Users, Plus, AlertCircle, CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Communications() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showIssues, setShowIssues] = useState(false);
  
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: channels } = trpc.communications.channels.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );
  const { data: messages, refetch: refetchMessages } = trpc.communications.messages.useQuery(
    { channelId: selectedChannelId! },
    { enabled: !!selectedChannelId }
  );
  const { data: issues } = trpc.issues.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId && showIssues }
  );

  const sendMessageMutation = trpc.communications.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      toast.success("Mensaje enviado");
    },
  });

  const handleSendMessage = () => {
    if (!selectedChannelId || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      channelId: selectedChannelId,
      content: newMessage,
    });
  };

  const selectedChannel = channels?.find(c => c.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
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
                <MessageSquare className="h-8 w-8 text-orange-500" />
                Comunicaciones
              </h1>
              <p className="text-gray-600">
                Chat en tiempo real, issues y colaboración en equipo
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={showIssues ? "default" : "outline"}
                onClick={() => setShowIssues(!showIssues)}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {showIssues ? "Ver Chat" : "Ver Issues"}
              </Button>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seleccionar Proyecto</CardTitle>
            <CardDescription>Elige un proyecto para acceder a sus canales de comunicación</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedProjectId?.toString() || ""} 
              onValueChange={(value) => {
                setSelectedProjectId(Number(value));
                setSelectedChannelId(null);
              }}
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

        {selectedProjectId && !showIssues && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Channels Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Canales</CardTitle>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => toast.info("Función en desarrollo")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {channels?.map((channel, index) => (
                      <button
                        key={`channel-${index}`}
                        onClick={() => setSelectedChannelId(channel.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedChannelId === channel.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          <span className="font-medium text-sm">{channel.name}</span>
                        </div>
                        <p className="text-xs mt-1 opacity-80">{channel.description}</p>
                      </button>
                    ))}
                    {channels?.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay canales aún
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-20rem)] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedChannel ? (
                      <>
                        <Hash className="h-5 w-5" />
                        {selectedChannel.name}
                      </>
                    ) : (
                      "Selecciona un canal"
                    )}
                  </CardTitle>
                  {selectedChannel?.description && (
                    <CardDescription>{selectedChannel.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {selectedChannelId ? (
                    <>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {messages && messages.length > 0 ? (
                          messages.map((msg, index) => (
                            <div key={`msg-${index}`} className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                                  {msg.user?.name?.charAt(0) || 'U'}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {msg.user?.name || 'Usuario'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(msg.message.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{msg.message.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 mt-8">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-sm">No hay mensajes aún. ¡Sé el primero en escribir!</p>
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p>Selecciona un canal para comenzar a chatear</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Issues View */}
        {selectedProjectId && showIssues && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {issues && issues.length > 0 ? (
              issues.map((issue, index) => (
                <Card key={`issue-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{issue.title}</CardTitle>
                        <CardDescription>{issue.description}</CardDescription>
                      </div>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estado:</span>
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <Badge variant="outline">{issue.type}</Badge>
                      </div>
                      {issue.discipline && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Disciplina:</span>
                          <span className="font-medium">{issue.discipline}</span>
                        </div>
                      )}
                      {issue.detectedByAI && (
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Detectado por IA</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 pt-2">
                        Creado: {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="lg:col-span-2">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay issues en este proyecto</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!selectedProjectId && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {projects?.length === 0 
                  ? "No tienes proyectos aún. Crea uno para comenzar."
                  : "Selecciona un proyecto para acceder a las comunicaciones"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'text-red-600',
    in_progress: 'text-blue-600',
    resolved: 'text-green-600',
    closed: 'text-gray-600',
  };
  return colors[status] || 'text-gray-600';
}
