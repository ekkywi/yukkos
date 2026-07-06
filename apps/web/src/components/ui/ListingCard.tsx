import React from 'react';
import type { StatusListing, WebListing } from '../../services/listing.service';

interface ListingCardProps {
  listing: WebListing;
  onClick: (id: string) => void;
}

const statusMeta: Record<StatusListing, { label: string; className: string }> = {
  AVAILABLE: {
    label: 'Tersedia',
    className: 'bg-white text-emerald-700 ring-emerald-200',
  },
  FULL: {
    label: 'Penuh',
    className: 'bg-white text-slate-600 ring-slate-200',
  },
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(listing.monthlyPrice);

  const fallbackImage = 'https://placehold.co/900x600/e2e8f0/64748b?text=Hunian+Tanpa+Foto';
  const status = statusMeta[listing.status] || {
    label: listing.status,
    className: 'bg-white text-slate-600 ring-slate-200',
  };
  const providerName = listing.providerName.trim() || 'YukKos';

  return (
    <button
      type="button"
      onClick={() => onClick(listing.id)}
      className="group flex h-full min-h-[356px] w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-primary/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-100">
        <img
          src={listing.mainImage || fallbackImage}
          alt={`Foto ${listing.name}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/45 to-transparent" />
        <span className={`absolute left-2.5 top-2.5 rounded-md px-2.5 py-1 text-[11px] font-bold ring-1 ${status.className}`}>
          {status.label}
        </span>
        <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-md bg-slate-950/70 px-2 py-1 text-xs font-semibold text-white">
          {listing.city}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] break-words text-[15px] font-bold leading-5 text-slate-900 group-hover:text-brand-primary">
          {listing.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 min-h-[2.25rem] break-words text-xs leading-[18px] text-slate-500">
          {listing.shortDescription}
        </p>

        <div className="mt-auto pt-3">
          <div className="text-lg font-extrabold leading-none text-brand-primary">{formattedPrice}</div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Harga per bulan</div>

          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <span className="line-clamp-2 min-h-[2.25rem] break-words text-xs font-semibold leading-[18px] text-slate-700">
              {providerName}
            </span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="truncate text-[11px] font-medium text-slate-400">
                ID {listing.id.slice(0, 8)}
              </span>
              <span className="shrink-0 text-xs font-bold text-brand-primary">Lihat detail</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
