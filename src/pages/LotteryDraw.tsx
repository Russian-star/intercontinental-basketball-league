import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import urls from '../../backend/func2url.json';

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
}

interface Participant {
  id: number;
  email: string;
  investment_usd: number;
  ticket_numbers: string[];
  tickets_count: number;
  payment_id: string;
  joined_at: string;
}

interface Winner {
  position: number;
  prize_usd: number;
  winning_ticket: string;
  winner_email: string;
  investment_usd: number;
  claimed: boolean;
  drawn_at: string;
}

interface DrawResult {
  success: boolean;
  round: number;
  winners: Winner[];
  total_participants: number;
  message: string;
}

const LotteryDraw: React.FC = () => {
  const [lotteryStatus, setLotteryStatus] = useState<LotteryStatus | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawInProgress, setDrawInProgress] = useState(false);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [randomAnimation, setRandomAnimation] = useState(false);
  const [currentRandomTicket, setCurrentRandomTicket] = useState<string>('');

  const API_URL = 'https://functions.poehali.dev/84895621-7397-4c97-a683-4c67fcfd0bad';

  const fetchLotteryData = async () => {
    try {
      setLoading(true);
      
      // Fetch lottery status
      const statusResponse = await fetch(`${API_URL}?action=status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setLotteryStatus(statusData);
        
        // Fetch participants
        const participantsResponse = await fetch(`${API_URL}?action=participants&round=${statusData.current_round}`);
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          setParticipants(participantsData.participants || []);
        }
        
        // Fetch winners
        const winnersResponse = await fetch(`${API_URL}?action=winners&round=${statusData.current_round}`);
        if (winnersResponse.ok) {
          const winnersData = await winnersResponse.json();
          setWinners(winnersData.winners || []);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных лотереи');
      console.error('Lottery fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotteryData();
  }, []);

  const getAllTickets = (): string[] => {
    const allTickets: string[] = [];
    participants.forEach(participant => {
      allTickets.push(...participant.ticket_numbers);
    });
    return allTickets;
  };

  const startRandomAnimation = () => {
    setRandomAnimation(true);
    const allTickets = getAllTickets();
    
    if (allTickets.length === 0) return;
    
    const interval = setInterval(() => {
      const randomTicket = allTickets[Math.floor(Math.random() * allTickets.length)];
      setCurrentRandomTicket(randomTicket);
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      setRandomAnimation(false);
    }, 3000);
    
    return interval;
  };

  const sendWinnerNotifications = async (winners: Winner[]) => {
    try {
      for (const winner of winners) {
        const message = `🎉 Поздравляем с ${winner.position === 1 ? '1-м' : winner.position === 2 ? '2-м' : '3-м'} местом!

Ваш выигрышный билет: ${winner.winning_ticket}
Размер приза: $${winner.prize_usd.toFixed(2)}
Раунд: ${lotteryStatus?.current_round}

Благодаря вашей инвестиции в размере $${winner.investment_usd} вы стали победителем нашей благотворительной лотереи!`;

        const response = await fetch(urls['email-notify'], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to_email: winner.winner_email,
            subject: `🎉 Поздравляем! Вы выиграли ${winner.position === 1 ? '1-е' : winner.position === 2 ? '2-е' : '3-е'} место в лотерее!`,
            message
          })
        });

        if (!response.ok) {
          console.error(`Failed to send email to ${winner.winner_email}:`, await response.text());
        } else {
          console.log(`Email notification sent successfully to ${winner.winner_email}`);
        }
      }
    } catch (error) {
      console.error('Error sending winner notifications:', error);
    }
  };

  const conductDraw = async () => {
    if (participants.length === 0) {
      setError('Нет участников для проведения розыгрыша');
      return;
    }

    try {
      setDrawInProgress(true);
      setError(null);
      
      // Start random animation
      startRandomAnimation();
      
      // Simulate draw process (in real implementation, this would call backend)
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const allTickets = getAllTickets();
      const selectedWinners: Winner[] = [];
      const usedTickets = new Set<string>();
      
      // Draw 3 winners
      const prizes = [
        { position: 1, prize_usd: lotteryStatus?.prize_fund_1_usd || 0 },
        { position: 2, prize_usd: lotteryStatus?.prize_fund_2_usd || 0 },
        { position: 3, prize_usd: lotteryStatus?.prize_fund_3_usd || 0 }
      ];
      
      for (const prize of prizes) {
        const availableTickets = allTickets.filter(ticket => !usedTickets.has(ticket));
        if (availableTickets.length === 0) break;
        
        const winningTicket = availableTickets[Math.floor(Math.random() * availableTickets.length)];
        usedTickets.add(winningTicket);
        
        // Find winner by ticket
        const winner = participants.find(p => p.ticket_numbers.includes(winningTicket));
        if (winner) {
          selectedWinners.push({
            position: prize.position,
            prize_usd: prize.prize_usd,
            winning_ticket: winningTicket,
            winner_email: winner.email,
            investment_usd: winner.investment_usd,
            claimed: false,
            drawn_at: new Date().toISOString()
          });
        }
      }
      
      setDrawResult({
        success: true,
        round: lotteryStatus?.current_round || 1,
        winners: selectedWinners,
        total_participants: participants.length,
        message: `Розыгрыш раунда ${lotteryStatus?.current_round} завершен!`
      });
      
      setWinners(selectedWinners);
      
      // Send email notifications to winners
      await sendWinnerNotifications(selectedWinners);
      
    } catch (err) {
      setError('Ошибка при проведении розыгрыша');
      console.error('Draw error:', err);
    } finally {
      setDrawInProgress(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Icon name="Crown" size={24} className="text-yellow-500" />;
      case 2: return <Icon name="Medal" size={24} className="text-gray-400" />;
      case 3: return <Icon name="Award" size={24} className="text-amber-600" />;
      default: return <Icon name="Star" size={24} className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-lg text-white">Загружаем данные лотереи...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-purple-500 text-white px-4 py-2 text-lg">
            Розыгрыш призов
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">
            Благотворительная лотерея
          </h1>
          <p className="text-lg text-purple-200">
            Раунд {lotteryStatus?.current_round || 1} • Призовой фонд: {formatCurrency(lotteryStatus?.total_prize_fund_usd || 0)}
          </p>
        </div>

        {/* Draw Animation */}
        {(drawInProgress || randomAnimation) && (
          <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-400 mb-6">
            <CardContent className="pt-6 text-center">
              <div className="text-white space-y-4">
                <div className="flex justify-center">
                  <Icon name="Sparkles" size={48} className="animate-spin text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold">Проводим розыгрыш...</h3>
                <div className="text-4xl font-mono bg-black/30 rounded-lg p-4 inline-block">
                  {currentRandomTicket || 'LT-ABC123'}
                </div>
                <p className="text-purple-200">Выбираем случайные билеты-победители</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draw Result */}
        {drawResult && (
          <Card className="bg-gradient-to-r from-green-800 to-emerald-800 border-green-400 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icon name="Trophy" size={24} className="mr-2 text-yellow-400" />
                Результаты розыгрыша
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white space-y-4">
                <p className="text-lg">{drawResult.message}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {drawResult.winners.map((winner) => (
                    <div key={winner.position} className="bg-black/20 rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {getPrizeIcon(winner.position)}
                      </div>
                      <div className="font-bold text-lg">{winner.position}-е место</div>
                      <div className="text-2xl font-bold text-green-400">
                        {formatCurrency(winner.prize_usd)}
                      </div>
                      <div className="text-sm text-gray-300 mt-2">
                        Билет: {winner.winning_ticket}
                      </div>
                      <div className="text-sm text-gray-300">
                        Email: {winner.winner_email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-400 bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-400">
                <Icon name="AlertCircle" size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-800">
            <TabsTrigger value="status" className="text-white">Статус</TabsTrigger>
            <TabsTrigger value="participants" className="text-white">Участники</TabsTrigger>
            <TabsTrigger value="winners" className="text-white">Победители</TabsTrigger>
            <TabsTrigger value="draw" className="text-white">Розыгрыш</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <Card className="bg-purple-800/50 border-purple-400">
              <CardHeader>
                <CardTitle className="text-white">Текущий статус лотереи</CardTitle>
              </CardHeader>
              <CardContent>
                {lotteryStatus && (
                  <div className="grid md:grid-cols-3 gap-6 text-white">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">
                        {formatCurrency(lotteryStatus.total_investment_usd)}
                      </div>
                      <div className="text-purple-200">Общий фонд</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {lotteryStatus.total_participants}
                      </div>
                      <div className="text-purple-200">Участников</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {formatCurrency(lotteryStatus.total_prize_fund_usd)}
                      </div>
                      <div className="text-purple-200">Призовой фонд</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card className="bg-purple-800/50 border-purple-400">
              <CardHeader>
                <CardTitle className="text-white">
                  Участники лотереи ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="bg-purple-700/30 rounded-lg p-3 text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{participant.email}</div>
                          <div className="text-sm text-purple-200">
                            Инвестиция: {formatCurrency(participant.investment_usd)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-600 text-white">
                            {participant.tickets_count} билетов
                          </Badge>
                          <div className="text-xs text-purple-200 mt-1">
                            {formatDate(participant.joined_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-purple-300 mt-2">
                        Билеты: {participant.ticket_numbers.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="winners" className="space-y-4">
            <Card className="bg-purple-800/50 border-purple-400">
              <CardHeader>
                <CardTitle className="text-white">
                  Победители раунда {lotteryStatus?.current_round}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {winners.length > 0 ? (
                  <div className="space-y-4">
                    {winners.map((winner) => (
                      <div key={winner.position} className="bg-gradient-to-r from-green-700/30 to-emerald-700/30 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getPrizeIcon(winner.position)}
                            <div className="ml-3">
                              <div className="font-bold text-lg">{winner.position}-е место</div>
                              <div className="text-sm text-green-200">{winner.winner_email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-400">
                              {formatCurrency(winner.prize_usd)}
                            </div>
                            <div className="text-sm text-green-200">
                              Билет: {winner.winning_ticket}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white py-8">
                    <Icon name="Trophy" size={48} className="mx-auto mb-4 text-purple-400" />
                    <p>Розыгрыш еще не проводился</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draw" className="space-y-4">
            <Card className="bg-purple-800/50 border-purple-400">
              <CardHeader>
                <CardTitle className="text-white">Провести розыгрыш</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-6">
                  <div className="text-white">
                    <p className="mb-4">Готовы провести розыгрыш раунда {lotteryStatus?.current_round}?</p>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-yellow-600/20 rounded-lg p-3">
                        <div className="font-bold">1-е место</div>
                        <div className="text-2xl">{formatCurrency(lotteryStatus?.prize_fund_1_usd || 0)}</div>
                      </div>
                      <div className="bg-gray-600/20 rounded-lg p-3">
                        <div className="font-bold">2-е место</div>
                        <div className="text-2xl">{formatCurrency(lotteryStatus?.prize_fund_2_usd || 0)}</div>
                      </div>
                      <div className="bg-amber-600/20 rounded-lg p-3">
                        <div className="font-bold">3-е место</div>
                        <div className="text-2xl">{formatCurrency(lotteryStatus?.prize_fund_3_usd || 0)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={conductDraw}
                    disabled={drawInProgress || participants.length === 0 || winners.length > 0}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4"
                  >
                    {drawInProgress ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Проводим розыгрыш...
                      </>
                    ) : winners.length > 0 ? (
                      <>
                        <Icon name="CheckCircle" size={20} className="mr-2" />
                        Розыгрыш завершен
                      </>
                    ) : (
                      <>
                        <Icon name="Play" size={20} className="mr-2" />
                        Начать розыгрыш
                      </>
                    )}
                  </Button>
                  
                  {participants.length === 0 && (
                    <p className="text-purple-300 text-sm">
                      Нет участников для проведения розыгрыша
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="text-center">
          <Button onClick={fetchLotteryData} variant="outline" disabled={loading}>
            <Icon name="RefreshCw" size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить данные
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LotteryDraw;