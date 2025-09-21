import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStripe } from '@/hooks/useStripe';
import Icon from '@/components/ui/icon';

const PaymentDemo = () => {
  const [amount, setAmount] = useState(50);
  const [paymentType, setPaymentType] = useState<'investment' | 'donation'>('donation');
  const { createTestPayment, isLoading } = useStripe();

  const handleTestPayment = async () => {
    try {
      const result = await createTestPayment({
        amount: amount * 100,
        currency: 'usd',
        payment_type: paymentType,
        description: `Test ${paymentType} - $${amount}`,
        metadata: {
          test: 'true',
          demo: 'payment'
        }
      });

      if (result.success) {
        alert(`✅ Тестовый платеж успешен!\nID: ${result.payment_intent_id}\nСумма: $${amount}\nТип: ${paymentType}`);
      } else {
        alert(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Произошла ошибка при тестировании платежа');
      console.error('Test payment error:', error);
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Icon name="CreditCard" size={24} className="mr-2 text-purple-500" />
          Тест платежной системы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-gray-300 text-sm">Сумма ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            min="1"
          />
        </div>
        
        <div>
          <label className="text-gray-300 text-sm">Тип платежа</label>
          <div className="flex space-x-2 mt-1">
            <Button
              variant={paymentType === 'donation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentType('donation')}
              className={paymentType === 'donation' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
            >
              Пожертвование
            </Button>
            <Button
              variant={paymentType === 'investment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentType('investment')}
              className={paymentType === 'investment' ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
            >
              Инвестиция
            </Button>
          </div>
        </div>

        <Button
          onClick={handleTestPayment}
          disabled={amount === 0 || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Обработка...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Icon name="Play" size={16} />
              <span>Тестировать платеж</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentDemo;