import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface PaymentStats {
  total_payments: number;
  total_amount_usd: number;
  total_donations: number;
  total_investments: number;
  donations_amount_usd: number;
  investments_amount_usd: number;
  recent_payments_30d: number;
  recent_amount_30d_usd: number;
  average_payment_usd: number;
}

interface Payment {
  id: number;
  payment_intent_id: string;
  amount_usd: number;
  currency: string;
  payment_type: 'investment' | 'donation';
  status: string;
  customer_email?: string;
  customer_name?: string;
  description?: string;
  created_at: string;
  completed_at?: string;
}

interface PaymentsResponse {
  payments: Payment[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

interface ChartData {
  daily_payments: Array<{
    date: string;
    count: number;
    amount_usd: number;
    donations: number;
    investments: number;
  }>;
  payment_types: Array<{
    type: string;
    count: number;
    amount_usd: number;
  }>;
  period_days: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<PaymentsResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('all');

  const API_URL = 'https://functions.poehali.dev/42c57359-64f7-453e-95b5-c07175504edf';

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary stats
      const statsResponse = await fetch(`${API_URL}?endpoint=summary`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch payments
      const paymentsUrl = `${API_URL}?endpoint=payments&limit=20&offset=${currentPage * 20}${selectedType !== 'all' ? `&type=${selectedType}` : ''}`;
      const paymentsResponse = await fetch(paymentsUrl);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }

      // Fetch chart data
      const chartResponse = await fetch(`${API_URL}?endpoint=charts&days=30`);
      if (chartResponse.ok) {
        const chartDataResponse = await chartResponse.json();
        setChartData(chartDataResponse);
      }

    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'succeeded': 'default',
      'pending': 'secondary',
      'failed': 'destructive',
      'canceled': 'outline'
    };
    
    const labels: Record<string, string> = {
      'succeeded': 'Завершен',
      'pending': 'В процессе',
      'failed': 'Ошибка',
      'canceled': 'Отменен'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      'investment': 'default',
      'donation': 'secondary'
    };
    
    const labels: Record<string, string> = {
      'investment': 'Инвестиция',
      'donation': 'Пожертвование'
    };

    return (
      <Badge variant={variants[type] || 'outline'}>
        {labels[type] || type}
      </Badge>
    );
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Дашборд платежей</h1>
          <p className="text-lg text-gray-600">Анализ и статистика ваших платежей</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Всего платежей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total_payments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  За последние 30 дней: {stats.recent_payments_30d}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Общая сумма</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.total_amount_usd)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  За месяц: {formatCurrency(stats.recent_amount_30d_usd)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Пожертвования</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.total_donations}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.donations_amount_usd)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Инвестиции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.total_investments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.investments_amount_usd)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Tables */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Список платежей</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Платежи</CardTitle>
                    <CardDescription>История всех платежных операций</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedType('all');
                        setCurrentPage(0);
                      }}
                    >
                      Все
                    </Button>
                    <Button
                      variant={selectedType === 'donation' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedType('donation');
                        setCurrentPage(0);
                      }}
                    >
                      Пожертвования
                    </Button>
                    <Button
                      variant={selectedType === 'investment' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedType('investment');
                        setCurrentPage(0);
                      }}
                    >
                      Инвестиции
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payments && payments.payments.length > 0 ? (
                  <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 py-2 border-b font-medium text-sm text-gray-600">
                      <div className="col-span-2">Тип</div>
                      <div className="col-span-2">Сумма</div>
                      <div className="col-span-2">Статус</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-3">Дата</div>
                    </div>

                    {/* Table Rows */}
                    {payments.payments.map((payment) => (
                      <div key={payment.id} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 rounded">
                        <div className="col-span-2">
                          {getTypeBadge(payment.payment_type)}
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(payment.amount_usd)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm text-gray-600">
                            {payment.customer_email || 'Не указан'}
                          </span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm text-gray-500">
                            {formatDate(payment.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                      <p className="text-sm text-gray-600">
                        Показаны {currentPage * 20 + 1}-{Math.min((currentPage + 1) * 20, payments.total)} из {payments.total}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                        >
                          <Icon name="ChevronLeft" size={16} />
                          Назад
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!payments.has_more}
                        >
                          Вперед
                          <Icon name="ChevronRight" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="CreditCard" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Платежи не найдены</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Платежи по дням</CardTitle>
                    <CardDescription>За последние {chartData.period_days} дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {chartData.daily_payments.slice(0, 10).map((day, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            {day.date ? new Date(day.date).toLocaleDateString('ru-RU') : ''}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">{day.count} платежей</span>
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(day.amount_usd)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Распределение по типам</CardTitle>
                    <CardDescription>За последние {chartData.period_days} дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.payment_types.map((type, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(type.type)}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{type.count} платежей</div>
                            <div className="text-sm text-green-600 font-medium">
                              {formatCurrency(type.amount_usd)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="text-center">
          <Button onClick={fetchData} variant="outline" disabled={loading}>
            <Icon name="RefreshCw" size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить данные
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;