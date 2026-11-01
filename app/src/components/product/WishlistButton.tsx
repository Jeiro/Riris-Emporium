import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlist } from '../../hooks/useWishlist';

export function WishlistButton({ productId, className, size = 18 }: { productId: string; className?: string; size?: number }) {
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const saved = wishlist.ids.includes(productId);
  return <button
    type="button" className={className} aria-pressed={saved}
    aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
    disabled={pending || wishlist.isLoading}
    onClick={async event => {
      event.preventDefault();
      event.stopPropagation();
      if (busy.current) return;
      if (wishlist.error) { toast.error(wishlist.error); void wishlist.retry(); return; }
      if (!wishlist.userId) { navigate('/login'); return; }
      busy.current = true;
      setPending(true);
      try {
        await wishlist.toggle(productId);
        toast.success(saved ? 'Removed from wishlist' : 'Saved to your wishlist on this device');
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save wishlist'); }
      finally { busy.current = false; setPending(false); }
    }}
  ><Heart size={size} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-red-500' : undefined} /></button>;
}
