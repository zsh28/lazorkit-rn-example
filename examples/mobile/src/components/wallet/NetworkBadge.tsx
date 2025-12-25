import React from 'react';
import { Badge } from '../ui/Badge';

interface NetworkBadgeProps {
  network?: 'devnet' | 'mainnet' | 'testnet';
  className?: string;
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({
  network = 'devnet',
  className,
}) => {
  const getNetworkLabel = () => {
    switch (network) {
      case 'devnet':
        return 'DEVNET';
      case 'testnet':
        return 'TESTNET';
      case 'mainnet':
        return 'MAINNET';
      default:
        return 'DEVNET';
    }
  };

  const getVariant = () => {
    switch (network) {
      case 'devnet':
        return 'devnet';
      case 'testnet':
        return 'warning';
      case 'mainnet':
        return 'success';
      default:
        return 'devnet';
    }
  };

  return (
    <Badge variant={getVariant() as any} size="small" className={className}>
      {getNetworkLabel()}
    </Badge>
  );
};
