// apps/web/src/pages/WebListingDetail.tsx

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../utils/api-client';
import type { WebListingResponseDto } from '../types/listing';
import { StatusBadge } from '../components/StatusBadge';

interface WebListingDetailProps {
  listingId: string; 
}

export const WebListingDetail: React.FC<WebListingDetailProps> = ({ listingId }) => {
  const [listing, setListing] = useState<WebListingResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadListingDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchApi<WebListingResponseDto>(`/v1/web/listings/${listingId}`);
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      loadListingDetail();
    }
  }, [listingId]);

  // Render State: Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Memuat data properti...</p>
      </div>
    );
  }

  // Render State: Error
  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="text-red-700 font-bold mb-2">Gagal Memuat Data</h2>
          <p className="text-red-600">{error || 'Properti tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  // Render State: Success
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.name}</h1>
          <p className="text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {listing.fullAddress}, {listing.city}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <StatusBadge status={listing.status} />
          <p className="text-2xl font-bold text-gray-900">
            Rp {listing.monthlyPrice.toLocaleString('id-ID')}
            <span className="text-sm font-normal text-gray-500"> / bulan</span>
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </div>

        {/* Facilities Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fasilitas</h2>
          {listing.facilities.length > 0 ? (
            <ul className="space-y-3">
              {listing.facilities.map((facility, index) => (
                <li key={index} className="flex items-center text-gray-700 gap-2">
                  <svg className="w-5 h-5 text-status-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  {facility}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada data fasilitas.</p>
          )}
        </div>
      </div>
    </div>
  );
};