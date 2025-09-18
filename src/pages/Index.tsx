import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ContactForm from "@/components/ContactForm";
import { getTranslation } from "@/utils/translations";

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = (newLanguage: string) => {
    console.log('Changing language from', currentLanguage, 'to', newLanguage);
    setCurrentLanguage(newLanguage);
  };

  const t = (key: string) => {
    const translation = getTranslation(currentLanguage, key);
    console.log(`Translation for "${key}" in "${currentLanguage}":`, translation);
    return translation;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img 
              src="https://cdn.poehali.dev/files/24f2a03b-6914-4f71-99c6-2b8aa1cbab93.jpg" 
              alt="IBLC Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            IBLC
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-orange-500 transition-colors whitespace-nowrap">{t('home')}</a>
            <a href="#about" className="hover:text-orange-500 transition-colors whitespace-nowrap">{t('aboutUs')}</a>
            <a href="#teams" className="hover:text-orange-500 transition-colors whitespace-nowrap">{t('teams')}</a>
            <a href="#application" className="hover:text-orange-500 transition-colors whitespace-nowrap">{t('application')}</a>
            <a href="#contact-form" className="hover:text-orange-500 transition-colors whitespace-nowrap">{t('contactFormTitle')}</a>
            <a href="#contacts" className="hover:text-orange-500 transition-colors whitespace-nowrap">{t('contacts')}</a>
          </div>
          <LanguageSwitcher 
            currentLanguage={currentLanguage} 
            onLanguageChange={handleLanguageChange} 
          />
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
            {t('premiumLeague')}
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-orange-300 to-gold-400 bg-clip-text text-transparent">
            {t('heroTitle')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('heroDescription')}
          </p>
          
          {/* Prize Pool */}
          <div className="bg-gradient-to-r from-orange-500 to-gold-400 p-8 rounded-2xl mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Icon name="DollarSign" size={48} className="text-black" />
              <div className="text-black">
                <div className="text-3xl font-bold">$13,000,000</div>
                <div className="text-lg font-semibold">{t('prizePool')}</div>
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('learnMore')}
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            {t('aboutTitle')}
          </h2>
          
          <div className="space-y-12">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-orange-500/10 to-gold-400/10 rounded-2xl p-8 border border-orange-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">{t('introduction')}</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {t('introText')}
              </p>
            </div>

            {/* Opening Match */}
            <div className="bg-gradient-to-r from-purple-900/20 to-yellow-500/20 rounded-2xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Icon name="Trophy" size={28} className="mr-3 text-gold-400" />
                {t('openingMatch')}
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {t('openingText')} <span className="text-purple-400 font-semibold">Los Angeles Lakers</span> and <span className="text-blue-400 font-semibold">Real Madrid</span>.
              </p>
            </div>

            {/* Prize Pool Details */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-green-900/20 to-green-600/20 rounded-2xl p-8 border border-green-500/30">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Icon name="Award" size={28} className="mr-3 text-green-400" />
                  {t('prizePoolTitle')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gold-400 font-semibold">{t('firstPlace')}</span>
                    <span className="text-white font-bold text-xl">$10,000,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-semibold">{t('secondPlace')}</span>
                    <span className="text-white font-bold text-lg">$3,000,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-900/20 to-red-600/20 rounded-2xl p-8 border border-red-500/30">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Icon name="Zap" size={28} className="mr-3 text-orange-400" />
                  {t('slamDunkTitle')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gold-400 font-semibold">1st</span>
                    <span className="text-white font-bold">$1,000,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">2nd</span>
                    <span className="text-white">$500,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">3rd</span>
                    <span className="text-white">$300,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">4th</span>
                    <span className="text-gray-300">$150,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">5th</span>
                    <span className="text-gray-300">$50,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams Section */}
      <section id="teams" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            {t('teamsTitle')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lakers Card */}
            <Card className="bg-gradient-to-br from-purple-900 to-yellow-500 border-none overflow-hidden hover:scale-105 transition-transform duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">Los Angeles Lakers</h3>
                    <p className="text-purple-100">{t('westernConference')}</p>
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
                    <span className="text-purple-200">{t('championships')}</span>
                    <div className="font-bold text-lg">17</div>
                  </div>
                  <div>
                    <span className="text-purple-200">{t('founded')}</span>
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
                    <p className="text-gray-600">{t('europeanElite')}</p>
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
                    <span className="text-gray-600">{t('euroleagueTitles')}</span>
                    <div className="font-bold text-lg">10</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('founded')}</span>
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
          <h2 className="text-3xl font-bold mb-12 text-white">{t('tournamentStats')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <Icon name="Users" size={48} className="text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2</div>
              <div className="text-gray-300">{t('teams')}</div>
            </div>
            <div className="p-6">
              <Icon name="MapPin" size={48} className="text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2</div>
              <div className="text-gray-300">{t('continents')}</div>
            </div>
            <div className="p-6">
              <Icon name="Calendar" size={48} className="text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2024</div>
              <div className="text-gray-300">{t('season')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Section */}
      <section id="application" className="py-20 px-6 bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            {t('participateTitle')}
          </h2>
          
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-orange-500/10 to-gold-400/10 rounded-2xl p-8 border border-orange-500/20 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                <Icon name="Calendar" size={28} className="mr-3 text-gold-400" />
                {t('tournamentDate')}
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg mb-8">
                {t('applicationText')}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl p-6 border border-green-500/30">
                  <Icon name="Users" size={32} className="text-green-400 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">{t('teamsCard')}</h4>
                  <p className="text-gray-300 text-sm">{t('teamsDescription')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-400/10 rounded-xl p-6 border border-blue-500/30">
                  <Icon name="Trophy" size={32} className="text-blue-400 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">{t('prestigeCard')}</h4>
                  <p className="text-gray-300 text-sm">{t('prestigeDescription')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 rounded-xl p-6 border border-yellow-500/30">
                  <Icon name="DollarSign" size={32} className="text-yellow-400 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">{t('prizesCard')}</h4>
                  <p className="text-gray-300 text-sm">{t('prizesDescription')}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Icon name="Clock" size={24} className="text-red-400 mr-2" />
                  <span className="text-red-400 font-semibold">{t('important')}</span>
                </div>
                <p className="text-gray-300">
                  {t('deadlineText')}
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-gold-400 hover:from-orange-600 hover:to-gold-500 text-black font-bold text-lg px-12 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Icon name="FileText" size={20} className="mr-2" />
                  {t('applyButton')}
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/invest'}
                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Icon name="TrendingUp" size={20} className="mr-2" />
                    {t('investButton')}
                  </Button>
                  
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/donate'}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Icon name="Heart" size={20} className="mr-2" />
                    {t('donateButton')}
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mt-4">
                {t('applicationNote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <ContactForm t={t} />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacts" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-gold-400 bg-clip-text text-transparent">
            {t('contactTitle')}
          </h2>
          
          <div className="bg-gradient-to-r from-orange-500/10 to-gold-400/10 rounded-2xl p-8 border border-orange-500/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('companyName')}
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Icon name="Building" size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm">{t('ein')}</div>
                    <div className="text-white font-semibold text-lg">36-5149730</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Icon name="Mail" size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm">{t('email')}</div>
                    <a href="mailto:interbasketcup@gmail.com" className="text-white font-semibold text-lg hover:text-orange-400 transition-colors">
                      interbasketcup@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Icon name="Phone" size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm">{t('phone')}</div>
                    <a href="tel:+17272509790" className="text-white font-semibold text-lg hover:text-orange-400 transition-colors">
                      +1 (727) 250-9790
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Icon name="Globe" size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm">{t('website')}</div>
                    <a href="http://www.iblcup.com" className="text-white font-semibold text-lg hover:text-orange-400 transition-colors">
                      www.iblcup.com
                    </a>
                  </div>
                </div>
              </div>
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
          <p>&copy; 2024 Intercontinental Basketball League of Cups Inc. {t('allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;