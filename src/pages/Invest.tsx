import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useStripe } from '@/hooks/useStripe';

const Invest = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { createTestPayment, isLoading } = useStripe();

  const investmentOptions = [
    { amount: 1000, title: 'Начальный', description: 'Базовое участие в проекте', benefits: ['Сертификат участника', 'Отчеты о проекте'] },
    { amount: 5000, title: 'Стандартный', description: 'Активное участие', benefits: ['VIP приглашения', 'Эксклюзивные материалы', 'Личная консультация'] },
    { amount: 10000, title: 'Премиум', description: 'Полноценное партнерство', benefits: ['Участие в управлении', 'Приоритетные права', 'Персональный менеджер'] },
    { amount: 25000, title: 'Платиновый', description: 'Стратегическое партнерство', benefits: ['Место в совете директоров', 'Максимальные привилегии', 'Индивидуальные условия'] }
  ];

  const getInvestmentDescription = (amount: number): string => {
    const tier = investmentOptions.find(t => t.amount === amount);
    return tier ? `${tier.title} - ${tier.description}` : `Инвестиция $${amount.toLocaleString()}`;
  };

  const getInvestmentTier = (amount: number): string => {
    const tier = investmentOptions.find(t => t.amount === amount);
    return tier ? tier.title : 'Custom';
  };

  const handlePayment = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    try {
      const result = await createTestPayment({
        amount: amount * 100, // Stripe принимает сумму в центах
        currency: 'usd',
        payment_type: 'investment',
        description: getInvestmentDescription(amount),
        metadata: {
          investment_tier: getInvestmentTier(amount),
          amount_usd: amount.toString()
        }
      });

      if (result.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          alert(`✅ Инвестиция на сумму $${amount.toLocaleString()} успешно принята!\n\nID платежа: ${result.payment_intent_id}\n\nВ ближайшее время с вами свяжется наш менеджер для оформления инвестиционного соглашения.`);
        }, 500);
      } else {
        alert(`❌ Ошибка обработки платежа: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Произошла ошибка при обработке платежа. Попробуйте еще раз.');
      console.error('Payment error:', error);
    }
  };

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-white hover:text-orange-500"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="https://cdn.poehali.dev/files/24f2a03b-6914-4f71-99c6-2b8aa1cbab93.jpg" 
                alt="IBLC Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
              IBLC Investment
            </span>
          </div>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500 text-white px-4 py-2">
              Инвестиционная возможность
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Инвестируйте в будущее спорта
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Станьте частью революционного баскетбольного турнира. Ваши инвестиции помогут создать крупнейшее спортивное событие года с призовым фондом $13,000,000.
            </p>
          </div>

          {/* Investment Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {investmentOptions.map((option, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedAmount === option.amount 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500' 
                    : 'bg-gray-800 border-gray-600 hover:border-green-500/50'
                }`}
                onClick={() => {
                  setSelectedAmount(option.amount);
                  setCustomAmount('');
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">{option.title}</CardTitle>
                    <Badge className="bg-green-500 text-white">
                      ${option.amount.toLocaleString()}
                    </Badge>
                  </div>
                  <p className="text-gray-300">{option.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {option.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <Icon name="Check" size={16} className="text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <Card className="bg-gray-800 border-gray-600 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Индивидуальная сумма</CardTitle>
              <p className="text-gray-300">Укажите собственную сумму инвестиций</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl text-gray-300">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="Введите сумму"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                  min="100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {finalAmount > 0 && (
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl text-white">Сумма к оплате:</span>
                  <span className="text-3xl font-bold text-green-400">
                    ${finalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <Icon name="Shield" size={20} className="text-green-500 mb-2" />
                    <div className="text-white font-medium">Безопасность</div>
                    <div className="text-gray-300">256-bit SSL шифрование</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <Icon name="CreditCard" size={20} className="text-green-500 mb-2" />
                    <div className="text-white font-medium">Способы оплаты</div>
                    <div className="text-gray-300">Visa, MasterCard, PayPal</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <Icon name="CheckCircle" size={20} className="text-green-500 mb-2" />
                    <div className="text-white font-medium">Гарантия</div>
                    <div className="text-gray-300">100% возврат в течение 30 дней</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handlePayment}
              disabled={finalAmount === 0 || isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold text-xl px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Обработка...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon name="CreditCard" size={24} />
                  <span>Перейти к оплате ${finalAmount.toLocaleString()}</span>
                </div>
              )}
            </Button>
            
            <p className="text-gray-400 text-sm mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями инвестиционного соглашения
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invest;