import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Clock, Users } from 'lucide-react';

interface AlertsPanelProps {
  inactiveContractors: number;
  unclaimedLeads: number;
  lowWalletBalances: number;
}

interface AlertItem {
  type: 'warning' | 'error';
  icon: React.ReactNode;
  message: string;
}

export function AlertsPanel({ inactiveContractors, unclaimedLeads, lowWalletBalances }: AlertsPanelProps) {
  const alerts: AlertItem[] = [];

  if (inactiveContractors > 0) {
    alerts.push({
      type: 'warning',
      icon: <Users className="h-4 w-4" />,
      message: `${inactiveContractors} contractors inactive for 30+ days`
    });
  }

  if (unclaimedLeads > 5) {
    alerts.push({
      type: 'error',
      icon: <Clock className="h-4 w-4" />,
      message: `${unclaimedLeads} leads unclaimed for >24h`
    });
  }

  if (lowWalletBalances > 0) {
    alerts.push({
      type: 'warning',
      icon: <AlertTriangle className="h-4 w-4" />,
      message: `${lowWalletBalances} contractors with low wallet balance`
    });
  }

  if (alerts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Users className="h-4 w-4" />
        <AlertDescription className="text-green-700">
          All systems operating normally - no alerts at this time
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <Alert 
          key={index} 
          className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}
        >
          {alert.icon}
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-yellow-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
