import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface LotteryStatus {
  current_round: number;
  total_investment_usd: number;
  total_participants: number;
  prize_fund_1_usd: number;
  prize_fund_2_usd: number;
  prize_fund_3_usd: number;
  total_prize_fund_usd: number;
  draw_date?: string;
  is_active: boolean;
  prize_percentages: {
    '1st_place': number;
    '2nd_place': number;
    '3rd_place': number;
    total: number;
  };
}

interface LotteryPrizeWidgetProps {
  className?: string;
  showParticipants?: boolean;
}

const LotteryPrizeWidget: React.FC<LotteryPrizeWidgetProps> = ({ 
  className = '',
  showParticipants = true 
}) => {
  const [lotteryStatus, setLotteryStatus] = useState<LotteryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'https://functions.poehali.dev/84895621-7397-4c97-a683-4c67fcfd0bad';

  const fetchLotteryStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=status`);
      
      if (response.ok) {
        const data = await response.json();
        setLotteryStatus(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch lottery status');
      }
    } catch (err) {
      setError('Ошибка загрузки призового фонда');
      console.error('Lottery fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotteryStatus();
    
    // Update every 30 seconds
    const interval = setInterval(fetchLotteryStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !lotteryStatus) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Loader2" size={20} className="animate-spin text-orange-500" />
            <span className="text-sm text-gray-600">Загрузка призового фонда...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !lotteryStatus) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <Icon name="AlertCircle" size={20} className="mx-auto mb-2" />
            <p className="text-sm">{error || 'Ошибка загрузки'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Icon name="Trophy" size={24} className="mr-2 text-orange-500" />
          <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Благотворительный Джекпот
          </span>
          <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
            Раунд {lotteryStatus.current_round}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Prize Fund */}
        <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {formatCurrency(lotteryStatus.total_prize_fund_usd)}
          </div>
          <div className="text-sm text-gray-600">Общий призовой фонд</div>
          <div className="text-xs text-gray-500 mt-1">
            {lotteryStatus.prize_percentages.total}% от всех инвестиций
          </div>
        </div>

        {/* Prize Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded">
            <div className="flex items-center">
              <Icon name="Medal" size={16} className="mr-2 text-yellow-600" />
              <span className="text-sm font-medium">1-е место</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-yellow-700">
                {formatCurrency(lotteryStatus.prize_fund_1_usd)}
              </div>
              <div className="text-xs text-gray-600">10%</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-gray-100 to-orange-100 rounded">
            <div className="flex items-center">
              <Icon name="Award" size={16} className="mr-2 text-gray-600" />
              <span className="text-sm font-medium">2-е место</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-700">
                {formatCurrency(lotteryStatus.prize_fund_2_usd)}
              </div>
              <div className="text-xs text-gray-600">3%</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded">
            <div className="flex items-center">
              <Icon name="Star" size={16} className="mr-2 text-amber-600" />
              <span className="text-sm font-medium">3-е место</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-amber-700">
                {formatCurrency(lotteryStatus.prize_fund_3_usd)}
              </div>
              <div className="text-xs text-gray-600">1%</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-orange-200">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {formatCurrency(lotteryStatus.total_investment_usd)}
            </div>
            <div className="text-xs text-gray-600">Всего инвестировано</div>
          </div>
          
          {showParticipants && (
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {lotteryStatus.total_participants}
              </div>
              <div className="text-xs text-gray-600">Участников</div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <Icon name="Info" size={16} className="mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-medium">Как работает:</p>
              <p>• Каждая инвестиция участвует в розыгрыше</p>
              <p>• За каждые $10 - 1 лотерейный билет</p>
              <p>• 14% от всех инвестиций = призовой фонд</p>
              <p>• Розыгрыш проводится прозрачно</p>
              <p>• <a href="/lottery" className="text-blue-700 underline font-medium">Смотреть розыгрыш →</a></p>
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <div className="text-center">
          <button 
            onClick={fetchLotteryStatus}
            disabled={loading}
            className="text-xs text-orange-600 hover:text-orange-800 disabled:opacity-50"
          >
            <Icon 
              name="RefreshCw" 
              size={12} 
              className={`inline mr-1 ${loading ? 'animate-spin' : ''}`} 
            />
            Обновить
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LotteryPrizeWidget;