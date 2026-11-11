import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

interface QuickContactActionsProps {
  whatsapp?: string | null;
  whatsappClean?: string | null;
  email?: string | null;
}

export const QuickContactActions: React.FC<QuickContactActionsProps> = ({
  whatsapp,
  whatsappClean,
  email,
}) => {
  const digits =
    whatsappClean || (whatsapp ? whatsapp.replace(/\D/g, '') : '');

  return (
    <div className="inline-flex items-center gap-2">
      {digits ? (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      ) : (
        <span className="text-xs text-slate-400">Sem WhatsApp</span>
      )}

      {email ? (
        <a
          href={`mailto:${email}`}
          aria-label="Enviar E-mail"
          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <Mail className="h-3.5 w-3.5" />
          E-mail
        </a>
      ) : (
        <span className="text-xs text-slate-400">Sem e-mail</span>
      )}
    </div>
  );
};

