import { useState } from 'react';
import { Share2, Facebook, Twitter, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'icon';
}

export function ShareButtons({ url, title, description, variant = 'default' }: ShareButtonsProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || '';

  // Validate URL format for security
  const isValidUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!isValidUrl(shareUrl)) {
    if (import.meta.env.DEV) {
      console.error('Invalid URL format for sharing');
    }
    return null;
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: language === 'es' ? 'Enlace copiado' : 'Link copied',
        description: language === 'es' ? 'El enlace se copió al portapapeles' : 'The link was copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
      
      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'share', {
          method: 'copy_link',
          content_type: 'property',
          item_id: shareUrl,
        });
      }
    } catch (error) {
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' ? 'No se pudo copiar el enlace' : 'Could not copy link',
        variant: 'destructive',
      });
    }
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: 'facebook',
        content_type: 'property',
        item_id: shareUrl,
      });
    }
  };

  const handleShareTwitter = () => {
    const text = `${shareTitle}${shareDescription ? ' - ' + shareDescription : ''}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: 'twitter',
        content_type: 'property',
        item_id: shareUrl,
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        
        // Analytics event
        if (window.gtag) {
          window.gtag('event', 'share', {
            method: 'native',
            content_type: 'property',
            item_id: shareUrl,
          });
        }
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  if (variant === 'icon') {
    const shareLabel = language === 'es' ? 'Compartir' : 'Share';
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            aria-label={shareLabel}
            title={shareLabel}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                {language === 'es' ? 'Copiado' : 'Copied'}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {language === 'es' ? 'Copiar enlace' : 'Copy link'}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareFacebook}>
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareTwitter}>
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </DropdownMenuItem>
          {navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              {language === 'es' ? 'Más opciones' : 'More options'}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handleCopyLink}>
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Copiado' : 'Copied'}
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Copiar enlace' : 'Copy link'}
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        onClick={handleShareFacebook} 
        aria-label={language === 'es' ? 'Compartir en Facebook' : 'Share on Facebook'} 
        title={language === 'es' ? 'Compartir en Facebook' : 'Share on Facebook'}
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        onClick={handleShareTwitter} 
        aria-label={language === 'es' ? 'Compartir en Twitter' : 'Share on Twitter'} 
        title={language === 'es' ? 'Compartir en Twitter' : 'Share on Twitter'}
      >
        <Twitter className="h-4 w-4" />
      </Button>
      {navigator.share && (
        <Button 
          variant="outline" 
          onClick={handleNativeShare} 
          aria-label={language === 'es' ? 'Más opciones' : 'More options'} 
          title={language === 'es' ? 'Más opciones' : 'More options'}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
