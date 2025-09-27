import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  age: number;
  height: string;
  weight: string;
  description: string;
  photo: string;
}

interface TeamData {
  id: string;
  name: string;
  logo: string;
  description: string;
  founded: string;
  achievements: string[];
  players: Player[];
}

const teamsData: Record<string, TeamData> = {
  'lakers': {
    id: 'lakers',
    name: 'Los Angeles Lakers',
    logo: '/teams/lakers-logo.png',
    description: 'Легендарная команда НБА с богатой историей и множеством чемпионских титулов.',
    founded: '1947',
    achievements: ['17 чемпионств НБА', '32 финала НБА', 'Зал славы'],
    players: [
      {
        id: 1,
        name: 'Леброн Джеймс',
        position: 'Форвард',
        number: 6,
        age: 39,
        height: '206 см',
        weight: '113 кг',
        description: 'Четырехкратный чемпион НБА, один из величайших игроков всех времен.',
        photo: '/players/lebron.jpg'
      },
      {
        id: 2,
        name: 'Энтони Дэвис',
        position: 'Центровой/Форвард',
        number: 3,
        age: 31,
        height: '208 см',
        weight: '115 кг',
        description: 'Доминирующий в краске игрок с отличными защитными навыками.',
        photo: '/players/davis.jpg'
      },
      {
        id: 3,
        name: 'Остин Ривз',
        position: 'Защитник',
        number: 15,
        age: 26,
        height: '196 см',
        weight: '89 кг',
        description: 'Молодой талантливый защитник с отличным броском.',
        photo: '/players/reaves.jpg'
      },
      {
        id: 4,
        name: 'Д\'Анджело Рассел',
        position: 'Разыгрывающий',
        number: 1,
        age: 28,
        height: '193 см',
        weight: '88 кг',
        description: 'Опытный разыгрывающий с отличным трехочковым броском.',
        photo: '/players/russell.jpg'
      },
      {
        id: 5,
        name: 'Руи Хачимура',
        position: 'Форвард',
        number: 28,
        age: 26,
        height: '203 см',
        weight: '104 кг',
        description: 'Универсальный форвард с хорошими атакующими навыками.',
        photo: '/players/hachimura.jpg'
      }
    ]
  },
  'real-madrid': {
    id: 'real-madrid',
    name: 'Real Madrid Baloncesto',
    logo: '/teams/real-madrid-logo.png',
    description: 'Один из самых успешных европейских баскетбольных клубов.',
    founded: '1932',
    achievements: ['11 титулов Евролиги', '36 чемпионств Испании', 'Кубок Интерконтиненталь'],
    players: [
      {
        id: 1,
        name: 'Фасеку Кауфманн',
        position: 'Центровой',
        number: 16,
        age: 22,
        height: '208 см',
        weight: '118 кг',
        description: 'Молодой перспективный центровой с отличной физикой.',
        photo: '/players/kauffmann.jpg'
      },
      {
        id: 2,
        name: 'Серхио Льюлл',
        position: 'Разыгрывающий',
        number: 23,
        age: 36,
        height: '190 см',
        weight: '83 кг',
        description: 'Капитан команды, легенда Реал Мадрида.',
        photo: '/players/llull.jpg'
      },
      {
        id: 3,
        name: 'Уолтер Тавареш',
        position: 'Центровой',
        number: 22,
        age: 32,
        height: '221 см',
        weight: '118 кг',
        description: 'Доминирующий центровой, один из самых высоких игроков.',
        photo: '/players/tavares.jpg'
      },
      {
        id: 4,
        name: 'Габриэль Дек',
        position: 'Форвард',
        number: 20,
        age: 29,
        height: '198 см',
        weight: '104 кг',
        description: 'Аргентинский форвард с отличными атакующими качествами.',
        photo: '/players/deck.jpg'
      },
      {
        id: 5,
        name: 'Марио Хезоня',
        position: 'Форвард',
        number: 8,
        age: 29,
        height: '203 см',
        weight: '102 кг',
        description: 'Опытный европейский форвард с хорошим броском.',
        photo: '/players/hezonja.jpg'
      }
    ]
  }
};

const Team: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  
  const team = teamId ? teamsData[teamId] : null;

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Команда не найдена</h1>
          <Button onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:text-orange-400"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src={team.logo} 
              alt={team.name}
              className="w-32 h-32 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/128x128/FFA500/FFFFFF?text=${team.name.slice(0, 2)}`;
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{team.name}</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">{team.description}</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-orange-400 font-semibold">Основан: </span>
              <span className="text-white">{team.founded}</span>
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Достижения</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {team.achievements.map((achievement, index) => (
                <span 
                  key={index}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black px-4 py-2 rounded-full font-semibold"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Состав команды</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.players.map((player) => (
              <div key={player.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-colors">
                <div className="text-center mb-4">
                  <img 
                    src={player.photo} 
                    alt={player.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/96x96/FFA500/FFFFFF?text=${player.name.split(' ').map(n => n[0]).join('')}`;
                    }}
                  />
                  <div className="bg-orange-500 text-black font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    {player.number}
                  </div>
                  <h3 className="text-xl font-bold text-white">{player.name}</h3>
                  <p className="text-orange-400 font-semibold">{player.position}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Возраст:</span>
                    <span className="text-white">{player.age} лет</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Рост:</span>
                    <span className="text-white">{player.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Вес:</span>
                    <span className="text-white">{player.weight}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mt-4 leading-relaxed">
                  {player.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Teams */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold hover:from-orange-600 hover:to-yellow-600"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Вернуться к командам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Team;