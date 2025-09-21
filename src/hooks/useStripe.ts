import { useState } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

// Публичный ключ Stripe (будет получен из переменных окружения)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz'; // Временный ключ для разработки

interface PaymentData {
  amount: number; // в центах
  currency: string;
  payment_type: 'investment' | 'donation';
  description?: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  error?: string;
  requires_action?: boolean;
}

export const useStripe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  // Инициализация Stripe
  const initializeStripe = async () => {
    if (!stripe) {
      const stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);
      return stripeInstance;
    }
    return stripe;
  };

  // Создание платежного намерения на сервере
  const createPaymentIntent = async (paymentData: PaymentData) => {
    try {
      const response = await fetch('https://functions.poehali.dev/cefde31e-d07f-4343-9318-1bf393b6f5e1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  };

  // Обработка платежа
  const processPayment = async (
    paymentData: PaymentData,
    elements: StripeElements,
    cardElement: any
  ): Promise<PaymentResult> => {
    setIsLoading(true);
    
    try {
      // Инициализируем Stripe
      const stripeInstance = await initializeStripe();
      if (!stripeInstance) {
        throw new Error('Stripe не инициализирован');
      }

      // Создаем платежное намерение на сервере
      const { client_secret, payment_intent_id } = await createPaymentIntent(paymentData);

      // Подтверждаем платеж
      const { error, paymentIntent } = await stripeInstance.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentData.customer_name,
            email: paymentData.customer_email,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Ошибка при обработке платежа',
        };
      }

      if (paymentIntent?.status === 'succeeded') {
        return {
          success: true,
          payment_intent_id: paymentIntent.id,
        };
      }

      if (paymentIntent?.status === 'requires_action') {
        return {
          success: false,
          requires_action: true,
          error: 'Требуется дополнительная аутентификация',
        };
      }

      return {
        success: false,
        error: 'Неожиданный статус платежа',
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Произошла ошибка при обработке платежа',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Создание платежной формы без подтверждения (для тестирования)
  const createTestPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    setIsLoading(true);
    
    try {
      // Симуляция задержки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Симуляция успешного платежа
      return {
        success: true,
        payment_intent_id: `pi_test_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка тестового платежа',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stripe,
    isLoading,
    initializeStripe,
    processPayment,
    createTestPayment,
    createPaymentIntent,
  };
};