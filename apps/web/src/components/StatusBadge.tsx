import React from 'react';

type ListingStatus = 'AVAILABLE' | 'FEW_LEFT' | 'FULL';

interface StatusBadgeProps {
    status: ListingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusStyles = (currentStatus: ListingStatus) => {
        switch (currentStatus) {
            case 'AVAILABLE':
                return 'bg-status-normal/10 text-status-normal border-status-normal';
            case 'FEW_LEFT':
                return 'bg-status-warning/10 text-status-warning border-status-warning';
            case 'FULL':
                return 'bg-status-danger/10 text-status-danger border-status-danger';
            default:
                return 'bg-gray-100 text-gray-500 border-gray-500';
        }
    };

    const getStatusLabel = (currentStatus: ListingStatus) => {
        switch (currentStatus) {
            case 'AVAILABLE': return 'Tersedia';
            case 'FEW_LEFT': return 'Sisa Sedikit';
            case 'FULL': return 'Penuh';
            default: return 'Tidak Diketahui';
        }
    }

    return (
    <span className={`px-2 py-1 text-xs font-semibold border rounded-full ${getStatusStyles(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};