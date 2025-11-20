import { useState } from 'react';
import { Share2, Facebook, Twitter, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    console.error('Invalid URL format for sharing');
    return null;
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('share.linkCopied', 'Enlace copiado'),
        description: t('share.linkCopiedDesc', 'El enlace se copió al portapapeles'),
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
        title: t('share.error', 'Error'),
        description: t('share.errorDesc', 'No se pudo copiar el enlace'),
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
    const shareLabel = t('share.share', 'Compartir');
    
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
                {t('share.copied', 'Copiado')}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {t('share.copyLink', 'Copiar enlace')}
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
              {t('share.more', 'Más opciones')}
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
            {t('share.copied', 'Copiado')}
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            {t('share.copyLink', 'Copiar enlace')}
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        onClick={handleShareFacebook} 
        aria-label={t('share.facebook', 'Compartir en Facebook')} 
        title={t('share.facebook', 'Compartir en Facebook')}
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        onClick={handleShareTwitter} 
        aria-label={t('share.twitter', 'Compartir en Twitter')} 
        title={t('share.twitter', 'Compartir en Twitter')}
      >
        <Twitter className="h-4 w-4" />
      </Button>
      {navigator.share && (
        <Button 
          variant="outline" 
          onClick={handleNativeShare} 
          aria-label={t('share.more', 'Más opciones')} 
          title={t('share.more', 'Más opciones')}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
