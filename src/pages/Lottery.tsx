import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Lottery: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState(0);

  const ticketPrice = 100;
  const totalAmount = selectedTickets * ticketPrice;

  const prizes = [
    { place: '1-е место', amount: '$10,000,000', description: 'Главный приз турнира' },
    { place: '2-е место', amount: '$3,000,000', description: 'Приз за второе место' },
    { place: '3-е место', amount: '$1,000,000', description: 'Приз за третье место' },
    { place: 'Slam Dunk 1-е', amount: '$1,000,000', description: 'Конкурс слэм-данков' },
    { place: 'Slam Dunk 2-е', amount: '$500,000', description: 'Конкурс слэм-данков' },
    { place: 'Участие', amount: '$50,000', description: 'Гарантированные призы' },
  ];

  const charityInfo = [
    { title: 'Развитие спорта', description: 'Строительство спортивных площадок в малообеспеченных районах' },
    { title: 'Образование детей', description: 'Стипендии и спортивные программы для молодёжи' },
    { title: 'Медицинская помощь', description: 'Поддержка спортсменов и их семей' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-white hover:text-orange-400"
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <h1 className="text-3xl font-bold text-white">Благотворительная Беспроигрышная Лотерея</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Info */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-500/10 to-gold-400/10 rounded-2xl p-8 border border-orange-500/20 mb-8">
              <Icon name="Heart" size={48} className="text-orange-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">
                Поддержи спорт — выиграй призы!
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Участвуя в нашей благотворительной лотерее, вы не только получаете шанс выиграть 
                крупные денежные призы, но и поддерживаете развитие баскетбола по всему миру. 
                <span className="text-orange-400 font-semibold"> Каждый билет — это ваш вклад в будущее спорта!</span>
              </p>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <Icon name="Trophy" size={32} className="text-green-400 mr-3" />
                  <span className="text-2xl font-bold text-green-400">100% БЕСПРОИГРЫШНАЯ</span>
                </div>
                <p className="text-gray-300">
                  Каждый участник гарантированно получает приз! Минимальный выигрыш составляет стоимость билета.
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Charity Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Благотворительная программа</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20 mb-8">
              <div className="text-center mb-8">
                <Icon name="Heart" size={48} className="text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  50% от продаж билетов направляется на благотворительность
                </h3>
                <p className="text-gray-300 text-lg">
                  Ваше участие помогает развивать баскетбол и поддерживать спортивные программы по всему миру
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {charityInfo.map((info, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                    <div className="text-center mb-4">
                      <Icon 
                        name={index === 0 ? "Building" : index === 1 ? "GraduationCap" : "Stethoscope"} 
                        size={32} 
                        className="text-blue-400 mx-auto" 
                      />
                    </div>
                    <h4 className="text-white font-semibold text-center mb-3">{info.title}</h4>
                    <p className="text-gray-300 text-sm text-center">{info.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Purchase */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <h2 className="text-2xl font-bold text-white text-center">Купить билеты</h2>
              <p className="text-gray-300 text-center">Стоимость одного билета: ${ticketPrice}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <label htmlFor="tickets" className="block text-white font-semibold mb-4">
                  Количество билетов:
                </label>
                <div className="flex items-center justify-center space-x-4">
                  <Button 
                    onClick={() => setSelectedTickets(Math.max(0, selectedTickets - 1))}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold text-white min-w-[60px]">{selectedTickets}</span>
                  <Button 
                    onClick={() => setSelectedTickets(selectedTickets + 1)}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
                  >
                    +
                  </Button>
                </div>
              </div>

              {selectedTickets > 0 && (
                <div className="bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-xl p-6 border border-green-500/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      Итого: ${totalAmount}
                    </div>
                    <div className="text-green-400 mb-4">
                      На благотворительность: ${Math.floor(totalAmount * 0.5)}
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-orange-500 to-gold-400 hover:from-orange-600 hover:to-gold-500 text-black font-bold text-lg px-12 py-4"
                    >
                      <Icon name="CreditCard" size={20} className="mr-2" />
                      Купить билеты
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[1, 5, 10].map((count) => (
                    <Button 
                      key={count}
                      onClick={() => setSelectedTickets(count)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-400"
                    >
                      {count} билет{count > 1 ? (count === 5 ? 'ов' : 'ов') : ''}
                    </Button>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  Розыгрыш состоится во время финального матча IBLC
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <h2 className="text-2xl font-bold text-white text-center">Правила лотереи</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <Icon name="Check" size={20} className="text-green-400 mt-1 flex-shrink-0" />
                  <p>Каждый участник гарантированно получает приз не менее стоимости билета</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Check" size={20} className="text-green-400 mt-1 flex-shrink-0" />
                  <p>50% от продаж билетов направляется на развитие баскетбола и благотворительность</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Check" size={20} className="text-green-400 mt-1 flex-shrink-0" />
                  <p>Розыгрыш проводится во время финального матча IBLC в прямом эфире</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Check" size={20} className="text-green-400 mt-1 flex-shrink-0" />
                  <p>Победители получают призы в течение 30 дней после розыгрыша</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Check" size={20} className="text-green-400 mt-1 flex-shrink-0" />
                  <p>Все операции контролируются независимыми аудиторами</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-bold"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lottery;