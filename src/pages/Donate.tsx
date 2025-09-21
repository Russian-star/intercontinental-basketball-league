import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useStripe } from '@/hooks/useStripe';

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const { createTestPayment, isLoading } = useStripe();

  const donationOptions = [
    { amount: 25, title: 'Мяч', description: 'Новый баскетбольный мяч для тренировок', icon: 'Circle' },
    { amount: 50, title: 'Форма', description: 'Спортивная форма для юного спортсмена', icon: 'Shirt' },
    { amount: 100, title: 'Обувь', description: 'Профессиональные кроссовки для игры', icon: 'Footprints' },
    { amount: 250, title: 'Оборудование', description: 'Корзина и тренировочное оборудование', icon: 'Target' },
    { amount: 500, title: 'Тренировки', description: 'Месяц профессиональных тренировок', icon: 'Users' },
    { amount: 1000, title: 'Стипендия', description: 'Спортивная стипендия на год', icon: 'GraduationCap' }
  ];

  const handleDonation = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    try {
      const result = await createTestPayment({
        amount: amount * 100, // Stripe принимает сумму в центах
        currency: 'usd',
        payment_type: 'donation',
        description: getDonationDescription(amount),
        metadata: {
          donation_type: getDonationType(amount),
          amount_usd: amount.toString()
        }
      });

      if (result.success) {
        setTimeout(() => {
          alert(`💝 Пожертвование на сумму $${amount.toLocaleString()} успешно принято!\n\nID платежа: ${result.payment_intent_id}\n\nСпасибо за вашу поддержку детского спорта! Ваша помощь очень важна для юных спортсменов.`);
        }, 500);
      } else {
        alert(`❌ Ошибка обработки пожертвования: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Произошла ошибка при обработке пожертвования. Попробуйте еще раз.');
      console.error('Donation error:', error);
    }
  };

  const getDonationDescription = (amount: number): string => {
    const option = donationOptions.find(o => o.amount === amount);
    return option ? `${option.title} - ${option.description}` : `Пожертвование $${amount.toLocaleString()}`;
  };

  const getDonationType = (amount: number): string => {
    const option = donationOptions.find(o => o.amount === amount);
    return option ? option.title : 'Custom';
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
            className="text-white hover:text-purple-500"
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
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">
              IBLC Charity
            </span>
          </div>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500 text-white px-4 py-2">
              Благотворительность
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-300 to-rose-400 bg-clip-text text-transparent">
              Поддержите детский спорт
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Ваше пожертвование поможет талантливым детям получить доступ к профессиональным тренировкам, оборудованию и возможности развивать свои спортивные способности.
            </p>
            
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                <Icon name="Users" size={32} className="text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-gray-300">Детей получили помощь</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                <Icon name="MapPin" size={32} className="text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">25</div>
                <div className="text-gray-300">Спортивных школ</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                <Icon name="Trophy" size={32} className="text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">150</div>
                <div className="text-gray-300">Юных чемпионов</div>
              </div>
            </div>
          </div>

          {/* Donation Options */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {donationOptions.map((option, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedAmount === option.amount 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500' 
                    : 'bg-gray-800 border-gray-600 hover:border-purple-500/50'
                }`}
                onClick={() => {
                  setSelectedAmount(option.amount);
                  setCustomAmount('');
                }}
              >
                <CardHeader className="text-center pb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name={option.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{option.title}</CardTitle>
                  <Badge className="bg-purple-500 text-white mx-auto">
                    ${option.amount}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 text-sm">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <Card className="bg-gray-800 border-gray-600 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Своя сумма</CardTitle>
              <p className="text-gray-300">Укажите собственную сумму пожертвования</p>
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
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Impact Information */}
          {finalAmount > 0 && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl text-white">Ваше пожертвование:</span>
                  <span className="text-3xl font-bold text-purple-400">
                    ${finalAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-bold mb-2 flex items-center">
                    <Icon name="Heart" size={20} className="text-purple-500 mr-2" />
                    Ваша помощь поможет:
                  </h3>
                  <ul className="text-gray-300 space-y-1">
                    {finalAmount >= 25 && <li>• Купить спортивное оборудование</li>}
                    {finalAmount >= 50 && <li>• Оплатить тренировки для детей</li>}
                    {finalAmount >= 100 && <li>• Организовать спортивные соревнования</li>}
                    {finalAmount >= 250 && <li>• Поддержать талантливых юных спортсменов</li>}
                    {finalAmount >= 500 && <li>• Развивать спортивную инфраструктуру</li>}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <Icon name="Shield" size={20} className="text-purple-500 mb-2" />
                    <div className="text-white font-medium">Прозрачность</div>
                    <div className="text-gray-300">100% средств идет на помощь детям</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <Icon name="FileText" size={20} className="text-purple-500 mb-2" />
                    <div className="text-white font-medium">Отчетность</div>
                    <div className="text-gray-300">Ежемесячные отчеты о расходах</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Donation Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleDonation}
              disabled={finalAmount === 0 || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-xl px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Обработка...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon name="Heart" size={24} />
                  <span>Пожертвовать ${finalAmount.toLocaleString()}</span>
                </div>
              )}
            </Button>
            
            <p className="text-gray-400 text-sm mt-4">
              Все пожертвования проходят через безопасную платежную систему
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;