import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '../../data/whatsapp';
import { Button } from './Button';

interface WhatsAppButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function WhatsAppButton({
  variant = 'secondary',
  size = 'md',
  label = 'تواصل عبر واتساب',
  className = '',
}: WhatsAppButtonProps) {
  return (
    <Button
      as="a"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل مع م. إسراء سمير عبر واتساب"
      variant={variant}
      size={size}
      className={`bg-whatsapp hover:bg-whatsapp-dark border-0 ${className}`}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      {label}
    </Button>
  );
}
