async function cliOrderFlow() {
  // Step 1: Prompt the user for information about the order   

  // Step 2: Create the order. The user should be redirected to https://example.org after checkout.

  // Step 3: Print approval link

  // Step 4: Wait for user confirmation

  // Step 5: Capture the order

  // Step 6: Print the order status, the buyer's name and break down the seller's sales
}

cliOrderFlow()
.catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
