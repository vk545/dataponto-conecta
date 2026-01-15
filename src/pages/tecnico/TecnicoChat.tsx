import { useState, useRef, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, Square, Play, Pause, Headphones, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  audio_url: string | null;
  is_audio: boolean;
  created_at: string;
  lida: boolean;
}

export default function TecnicoChat() {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [coordenadorId, setCoordenadorId] = useState<string | null>(null);
  const [coordenadorNome, setCoordenadorNome] = useState("Valdemar");
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchCoordenador();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (coordenadorId && profile?.id) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return () => {
        unsubscribe();
      };
    }
  }, [coordenadorId, profile?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCoordenador = async () => {
    try {
      // Buscar o coordenador (tipo = coordenador)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome")
        .eq("tipo", "coordenador")
        .limit(1)
        .single();

      if (error) {
        console.log("Nenhum coordenador encontrado");
        setLoading(false);
        return;
      }

      setCoordenadorId(data.id);
      setCoordenadorNome(data.nome || "Valdemar");
    } catch (error) {
      console.error("Erro ao buscar coordenador:", error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!profile?.id || !coordenadorId) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${coordenadorId}),and(sender_id.eq.${coordenadorId},receiver_id.eq.${profile.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Marcar mensagens como lidas
      await supabase
        .from("chat_messages")
        .update({ lida: true })
        .eq("receiver_id", profile.id)
        .eq("sender_id", coordenadorId);

    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("chat-messages-tech")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Verificar se a mensagem é relevante para este chat
          if (
            (newMsg.sender_id === profile?.id && newMsg.receiver_id === coordenadorId) ||
            (newMsg.sender_id === coordenadorId && newMsg.receiver_id === profile?.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
            
            // Marcar como lida se for mensagem recebida
            if (newMsg.receiver_id === profile?.id) {
              supabase
                .from("chat_messages")
                .update({ lida: true })
                .eq("id", newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendTextMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !coordenadorId || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("chat_messages").insert({
        sender_id: profile.id,
        receiver_id: coordenadorId,
        content: messageContent,
        is_audio: false,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Áudio gravado",
          description: "Funcionalidade de áudio em desenvolvimento.",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const playAudio = (audioUrl: string, messageId: string) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      return;
    }
    
    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingAudioId(messageId);
    
    audio.onended = () => {
      setPlayingAudioId(null);
    };
  };

  const isMine = (senderId: string) => senderId === profile?.id;

  if (loading) {
    return (
      <MobileLayout showHeader={false} showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!coordenadorId) {
    return (
      <MobileLayout showHeader={false} showBottomNav={false}>
        <PageHeader title="Chat" showBack backTo="/tecnico" />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhum coordenador disponível no momento.</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex flex-col h-screen">
        <PageHeader title={`Chat com ${coordenadorNome}`} showBack backTo="/tecnico" />
        
        {/* Header do chat */}
        <div className="bg-card border-b p-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {coordenadorNome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{coordenadorNome}</h3>
            <p className="text-xs text-muted-foreground">Coordenador de Chamados</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMine(message.sender_id) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMine(message.sender_id)
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border rounded-bl-md"
                  }`}
                >
                  {message.is_audio && message.audio_url ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${
                          isMine(message.sender_id) 
                            ? "hover:bg-primary-foreground/20" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => playAudio(message.audio_url!, message.id)}
                      >
                        {playingAudioId === message.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-1">
                        <Headphones className="h-3 w-3" />
                        <span className="text-xs">Áudio</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${
                    isMine(message.sender_id) 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        <div className="bg-card border-t p-3">
          {isRecording ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-destructive/10 rounded-full px-4 py-2">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-destructive">
                  Gravando... {formatTime(recordingTime)}
                </span>
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full h-10 w-10"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full h-10 w-10 shrink-0"
                onClick={startRecording}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-full"
                onKeyDown={(e) => e.key === "Enter" && sendTextMessage()}
                disabled={sending}
              />
              <Button
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                onClick={sendTextMessage}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
