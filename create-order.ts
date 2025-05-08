import 'dotenv/config';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from '@paypal/paypal-server-sdk';

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || '',
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || ''
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true
    },
    logResponse: {
      logHeaders: true
    }
  },
});

const ordersController = new OrdersController(client);

const collect = {
  body: {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode: 'USD',
          value: '20.00',
        },
        description: 'Leather Bag',
      }
    ],
  },
  prefer: 'return=minimal'
}

async function createOrder() {
  try {
    const { result, ...httpResponse } = await ordersController.createOrder(collect);
    console.log('Order ID:', result.id);
  } catch (error) {
    if (error instanceof ApiError) {
      const errors = error.result;
      console.error('Error:', errors);
    }
  }
}

createOrder();
