import { ADSENSE_ENABLED } from "@/config/site";

type AdSlotProps = {
  /** Placement identifier, used later when real AdSense units are configured. */
  placement: string;
  className?: string;
};

/**
 * Ad container. While ADSENSE_ENABLED is false nothing is rendered at all —
 * no placeholders, no fake adverts, and no layout impact on the content.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  if (!ADSENSE_ENABLED) return null;
  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placement}
      className={className}
      // Real AdSense markup is inserted here once a publisher ID exists.
    />
  );
}

export function TopAdSlot() {
  return <AdSlot placement="top" className="my-4" />;
}

export function InContentAdSlot() {
  return <AdSlot placement="in-content" className="my-6" />;
}

export function BottomAdSlot() {
  return <AdSlot placement="bottom" className="mt-8" />;
}
