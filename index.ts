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

async function cliOrderFlow() {
  try {
    // Step 1: Create the order
    const { result: createResult } = await ordersController.createOrder(collect);
    console.log('Order ID:', createResult.id);

    // Step 2: Print approval link
    const approvalLink = createResult.links?.find(link => link.rel === 'approve')?.href;
    if (approvalLink) {
      console.log('\nPlease approve the order by visiting this URL:');
      console.log(approvalLink);
    } else {
      console.error('No approval link found in the order response.');
      return;
    }

    // Step 3: Wait for user confirmation
    process.stdout.write('\nPress Enter after you have approved the order in your browser...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    // Step 4: Capture the order
    if (!createResult.id) {
      console.error('Order ID is missing. Cannot capture the order.');
      return;
    }

    const { result: captureResult } = await ordersController.captureOrder({ id: createResult.id });

    // Step 5: Print a readable response
    console.log('\nOrder captured successfully!');
    console.log('Status:', captureResult.status);
    if (captureResult.purchaseUnits && captureResult.purchaseUnits[0]?.payments?.captures) {
      const capture = captureResult.purchaseUnits[0].payments.captures[0];
      console.log('Capture ID:', capture.id);
      console.log('Amount:', `${capture?.amount?.currencyCode} ${capture?.amount?.value}`);
      console.log('Capture Status:', capture.status);
    } else {
      console.log('Capture details not found in response.');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.result);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

cliOrderFlow();
