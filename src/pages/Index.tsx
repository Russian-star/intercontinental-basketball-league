import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Icon name="Trophy" size={32} className="text-orange-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            IBLC
          </span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-orange-500 transition-colors">Главная</a>
          <a href="#teams" className="hover:text-orange-500 transition-colors">Команды</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Контакты</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url(/img/5ea2c084-6ce4-4ba7-9132-98564feeafe1.jpg)' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          <Badge className="mb-6 bg-orange-500 text-white px-6 py-2 text-lg">
            ПРЕМИАЛЬНАЯ ЛИГА
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-orange-300 to-gold-400 bg-clip-text text-transparent">
            Intercontinental Basketball League of Cups Inc.
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Элитный турнир мирового уровня с участием легендарных команд
          </p>
          
          {/* Prize Pool */}
          <div className="bg-gradient-to-r from-orange-500 to-gold-400 p-8 rounded-2xl mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Icon name="DollarSign" size={48} className="text-black" />
              <div className="text-black">
                <div className="text-3xl font-bold">$13,000,000</div>
                <div className="text-lg font-semibold">ПРИЗОВОЙ ФОНД</div>
              </div>
            </div>
          </div>

          <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4">
            Узнать больше
          </Button>
        </div>
      </section>

      {/* Teams Section */}
      <section id="teams" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            Команды-участники
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lakers Card */}
            <Card className="bg-gradient-to-br from-purple-900 to-yellow-500 border-none overflow-hidden hover:scale-105 transition-transform duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">Los Angeles Lakers</h3>
                    <p className="text-purple-100">Западная конференция</p>
                  </div>
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Icon name="Zap" size={32} className="text-purple-900" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-white">
                <img 
                  src="/img/309b765b-a7c8-41dd-a700-c1aef26b93b7.jpg" 
                  alt="Lakers Logo" 
                  className="w-full h-48 object-contain rounded-lg mb-4 bg-white/10 p-4"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-200">Чемпионства:</span>
                    <div className="font-bold text-lg">17</div>
                  </div>
                  <div>
                    <span className="text-purple-200">Основан:</span>
                    <div className="font-bold text-lg">1947</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real Madrid Card */}
            <Card className="bg-gradient-to-br from-white to-gray-100 text-black border-none overflow-hidden hover:scale-105 transition-transform duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Real Madrid</h3>
                    <p className="text-gray-600">Европейская элита</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Icon name="Crown" size={32} className="text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <img 
                  src="/img/29fa3c11-bbbd-4aa3-996e-9ba397c04919.jpg" 
                  alt="Real Madrid Logo" 
                  className="w-full h-48 object-contain rounded-lg mb-4 bg-gray-100/50 p-4"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Титулы Евролиги:</span>
                    <div className="font-bold text-lg">10</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Основан:</span>
                    <div className="font-bold text-lg">1932</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-500/10 to-gold-400/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">Статистика турнира</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <Icon name="Users" size={48} className="text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2</div>
              <div className="text-gray-300">Команды-участницы</div>
            </div>
            <div className="p-6">
              <Icon name="MapPin" size={48} className="text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2</div>
              <div className="text-gray-300">Континента</div>
            </div>
            <div className="p-6">
              <Icon name="Calendar" size={48} className="text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2024</div>
              <div className="text-gray-300">Сезон</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-400">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Icon name="Mail" size={20} className="inline mr-2" />
            interbasketcup@gmail.com
          </div>
          <p>&copy; 2024 Intercontinental Basketball League of Cups Inc. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;