import { useState, useRef, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, Square, Play, Pause, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: "tecnico" | "valdemar";
  type: "text" | "audio";
  content: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: Date;
  read: boolean;
}

export default function TecnicoChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "valdemar",
      type: "text",
      content: "Bom dia! Como está o atendimento de hoje?",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
    },
    {
      id: "2",
      sender: "tecnico",
      type: "text",
      content: "Bom dia Valdemar! Já finalizei o primeiro cliente, estou indo para o segundo.",
      timestamp: new Date(Date.now() - 3500000),
      read: true,
    },
    {
      id: "3",
      sender: "valdemar",
      type: "text",
      content: "Ótimo! O cliente da tarde ligou confirmando o horário.",
      timestamp: new Date(Date.now() - 1800000),
      read: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendTextMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "tecnico",
      type: "text",
      content: newMessage.trim(),
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simular resposta do Valdemar após 2 segundos
    setTimeout(() => {
      const responses = [
        "Entendido! Qualquer coisa me avise.",
        "Ok, vou anotar aqui.",
        "Perfeito, obrigado pela atualização!",
        "Certo, pode seguir com o atendimento.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const valdemarMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "valdemar",
        type: "text",
        content: randomResponse,
        timestamp: new Date(),
        read: false,
      };
      setMessages(prev => [...prev, valdemarMessage]);
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
        
        const message: Message = {
          id: Date.now().toString(),
          sender: "tecnico",
          type: "audio",
          content: "",
          audioUrl,
          audioDuration: recordingTime,
          timestamp: new Date(),
          read: false,
        };

        setMessages(prev => [...prev, message]);
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

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex flex-col h-screen">
        <PageHeader title="Chat com Valdemar" showBack backTo="/tecnico" />
        
        {/* Header do chat */}
        <div className="bg-card border-b p-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              V
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Valdemar</h3>
            <p className="text-xs text-muted-foreground">Coordenador de Chamados</p>
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
              className={`flex ${message.sender === "tecnico" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === "tecnico"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border rounded-bl-md"
                }`}
              >
                {message.type === "text" ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        message.sender === "tecnico" 
                          ? "hover:bg-primary-foreground/20" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => message.audioUrl && playAudio(message.audioUrl, message.id)}
                    >
                      {playingAudioId === message.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex items-center gap-1">
                      <Headphones className="h-3 w-3" />
                      <span className="text-xs">
                        {message.audioDuration ? formatTime(message.audioDuration) : "0:00"}
                      </span>
                    </div>
                  </div>
                )}
                <p className={`text-[10px] mt-1 ${
                  message.sender === "tecnico" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                }`}>
                  {formatMessageTime(message.timestamp)}
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
