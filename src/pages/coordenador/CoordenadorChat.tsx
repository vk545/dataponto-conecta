import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, Square, Play, Pause, Headphones } from "lucide-react";
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

export default function CoordenadorChat() {
  const { tecnicoId } = useParams();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [tecnicoNome, setTecnicoNome] = useState("Técnico");
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tecnicoId) {
      fetchTecnicoInfo();
      fetchMessages();
      subscribeToMessages();
    }
  }, [tecnicoId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTecnicoInfo = async () => {
    // Mock for now
    setTecnicoNome("Carlos Silva");
  };

  const fetchMessages = async () => {
    if (!profile?.id || !tecnicoId) return;
    
    // Mock messages for now
    setMessages([
      {
        id: "1",
        sender_id: tecnicoId,
        receiver_id: profile.id,
        content: "Bom dia Valdemar! Estou chegando no primeiro cliente.",
        audio_url: null,
        is_audio: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        lida: true,
      },
      {
        id: "2",
        sender_id: profile.id,
        receiver_id: tecnicoId,
        content: "Bom dia! Perfeito, me avise quando finalizar.",
        audio_url: null,
        is_audio: false,
        created_at: new Date(Date.now() - 3500000).toISOString(),
        lida: true,
      },
    ]);
    setLoading(false);
  };

  const subscribeToMessages = () => {
    // Will implement realtime subscription
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendTextMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !tecnicoId) return;

    const message: Message = {
      id: Date.now().toString(),
      sender_id: profile.id,
      receiver_id: tecnicoId,
      content: newMessage.trim(),
      audio_url: null,
      is_audio: false,
      created_at: new Date().toISOString(),
      lida: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simular resposta
    setTimeout(() => {
      const responses = [
        "Entendido! Vou verificar.",
        "Ok, já estou resolvendo.",
        "Certo, obrigado pela informação!",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender_id: tecnicoId,
        receiver_id: profile.id,
        content: randomResponse,
        audio_url: null,
        is_audio: false,
        created_at: new Date().toISOString(),
        lida: false,
      }]);
    }, 2000);
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (profile?.id && tecnicoId) {
          const message: Message = {
            id: Date.now().toString(),
            sender_id: profile.id,
            receiver_id: tecnicoId,
            content: null,
            audio_url: audioUrl,
            is_audio: true,
            created_at: new Date().toISOString(),
            lida: false,
          };

          setMessages(prev => [...prev, message]);
        }
        
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Áudio enviado",
          description: "Seu áudio foi enviado com sucesso!",
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

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex flex-col h-screen">
        <PageHeader title={`Chat com ${tecnicoNome}`} showBack backTo="/coordenador" />
        
        {/* Header do chat */}
        <div className="bg-card border-b p-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {tecnicoNome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{tecnicoNome}</h3>
            <p className="text-xs text-muted-foreground">Técnico</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
          {messages.map((message) => (
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
          ))}
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
              />
              <Button
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                onClick={sendTextMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
