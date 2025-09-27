import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

interface Coach {
  id: number;
  name: string;
  position: string;
  experience: string;
  photo: string;
  description: string;
}

interface TeamData {
  id: string;
  name: string;
  logo: string;
  description: string;
  founded: string;
  achievements: string[];
  players: Player[];
  coaches: Coach[];
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
        photo: '/img/acbc43a8-344e-40c0-bd5d-ed0ad7a2c08d.jpg'
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
        photo: '/img/5a37c0e5-cca5-4cd8-bb81-39773eb7f00c.jpg'
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
        photo: '/img/4046c76b-a87e-4887-9ebc-5e91025edb38.jpg'
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
        photo: '/img/2d7dc742-4215-4e28-88e2-91f96e907198.jpg'
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
        photo: '/img/291774da-2aab-4a24-ba83-9c32f443996d.jpg'
      },
      {
        id: 6,
        name: 'Кристиан Вуд',
        position: 'Центровой',
        number: 35,
        age: 29,
        height: '211 см',
        weight: '98 кг',
        description: 'Мобильный центровой с хорошим броском с дистанции.',
        photo: '/img/95cdff7c-7d77-4b48-b882-b1f9da14c4a2.jpg'
      },
      {
        id: 7,
        name: 'Гэйб Винсент',
        position: 'Защитник',
        number: 7,
        age: 27,
        height: '188 см',
        weight: '88 кг',
        description: 'Надежный защитник с опытом игры в плей-офф.',
        photo: '/img/be05a9d3-0737-4ab8-858d-578207c023b0.jpg'
      },
      {
        id: 8,
        name: 'Кэм Реддиш',
        position: 'Форвард',
        number: 17,
        age: 25,
        height: '203 см',
        weight: '95 кг',
        description: 'Перспективный крыловой игрок с атлетичными данными.',
        photo: '/img/eeb80700-699a-47a5-a6ee-beb9e21fe562.jpg'
      }
    ],
    coaches: [
      {
        id: 1,
        name: 'Дарвин Хэм',
        position: 'Главный тренер',
        experience: '2 года в НБА',
        photo: '/img/d3481dc8-e332-4e6c-b7e7-34a30908ef16.jpg',
        description: 'Опытный тренер с большим игровым опытом в НБА.'
      },
      {
        id: 2,
        name: 'Фил Хэнди',
        position: 'Помощник тренера',
        experience: '15 лет',
        photo: '/img/8ddf65ce-7e82-4d5b-9b0f-3cb473a3a4b6.jpg',
        description: 'Специалист по развитию игроков и тактической подготовке.'
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
        name: 'Серхио Льюлл',
        position: 'Разыгрывающий',
        number: 23,
        age: 36,
        height: '190 см',
        weight: '83 кг',
        description: 'Капитан команды, легенда Реал Мадрида.',
        photo: '/img/140cab67-9a41-4467-9ba0-c1055a68a949.jpg'
      },
      {
        id: 2,
        name: 'Уолтер Тавареш',
        position: 'Центровой',
        number: 22,
        age: 32,
        height: '221 см',
        weight: '118 кг',
        description: 'Доминирующий центровой, один из самых высоких игроков.',
        photo: '/img/773aa3ff-cfb7-4d1e-8972-3c69e97071a6.jpg'
      },
      {
        id: 3,
        name: 'Габриэль Дек',
        position: 'Форвард',
        number: 20,
        age: 29,
        height: '198 см',
        weight: '104 кг',
        description: 'Аргентинский форвард с отличными атакующими качествами.',
        photo: '/img/c17c7e43-c389-4398-ae37-d9612d4de7bd.jpg'
      },
      {
        id: 4,
        name: 'Марио Хезоня',
        position: 'Форвард',
        number: 8,
        age: 29,
        height: '203 см',
        weight: '102 кг',
        description: 'Опытный европейский форвард с хорошим броском.',
        photo: '/img/2c0414f5-44c8-4a11-853f-0dcde0d8217f.jpg'
      },
      {
        id: 5,
        name: 'Факундо Кампаццо',
        position: 'Разыгрывающий',
        number: 11,
        age: 33,
        height: '178 см',
        weight: '81 кг',
        description: 'Быстрый и техничный аргентинский разыгрывающий.',
        photo: '/img/a2b6e470-bda4-40a2-8770-07048fa4af69.jpg'
      },
      {
        id: 6,
        name: 'Джанан Муса',
        position: 'Форвард',
        number: 13,
        age: 25,
        height: '206 см',
        weight: '95 кг',
        description: 'Молодой боснийский форвард с большим потенциалом.',
        photo: '/img/a6d9557a-3e56-46f8-92ba-7aa5081d65fc.jpg'
      },
      {
        id: 7,
        name: 'Гершон Ябуселе',
        position: 'Форвард',
        number: 28,
        age: 28,
        height: '201 см',
        weight: '122 кг',
        description: 'Французский форвард с сильным телосложением.',
        photo: '/img/297a36ac-b87e-42ff-a0d5-6b75736560a1.jpg'
      }
    ],
    coaches: [
      {
        id: 1,
        name: 'Чус Матео',
        position: 'Главный тренер',
        experience: '3 года в Реал Мадрид',
        photo: '/img/39416474-b050-4c7b-aa95-21c81d15286c.jpg',
        description: 'Молодой перспективный тренер, воспитанник клуба.'
      },
      {
        id: 2,
        name: 'Луис Касимиро',
        position: 'Помощник тренера',
        experience: '20 лет',
        photo: '/img/3a60db96-3ed5-478b-8ae4-c803bd1b8be7.jpg',
        description: 'Опытный специалист с международным опытом.'
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
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Team Info */}
        <div className="text-center mb-12">
          <p className="text-gray-300 text-lg mb-4 max-w-3xl mx-auto">
            {team.description}
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div>
              <span className="text-gray-400">Основан:</span>
              <div className="text-white font-bold">{team.founded}</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-white text-lg font-semibold mb-3">Достижения:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {team.achievements.map((achievement, index) => (
                <span key={index} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Состав команды</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {/* Coaching Staff */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Тренерский состав</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {team.coaches.map((coach) => (
              <div key={coach.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="flex items-center mb-4">
                  <img 
                    src={coach.photo} 
                    alt={coach.name}
                    className="w-20 h-20 rounded-full mr-4 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/80x80/3B82F6/FFFFFF?text=${coach.name.split(' ').map(n => n[0]).join('')}`;
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{coach.name}</h3>
                    <p className="text-blue-400 font-semibold">{coach.position}</p>
                    <p className="text-gray-400 text-sm">Опыт: {coach.experience}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {coach.description}
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