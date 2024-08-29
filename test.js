async function test(){
    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    body:
      JSON.stringify({
        "publicKey": '79gS49BKiRvLgvZtTVg8nhu8xZeqxra746VNEeWX92mZ',
        "action": "sell",                                                   // "buy" or "sell"
        "mint": "ANg6tcUR85qtz8xThj1EUaM9Cu3sQL3edSpL2XHUpump",             // Token mint address
        "denominatedInSol": "false", // "true" if amount is in SOL, "false" if in tokens
        "amount": 1000,                    // Amount of SOL or tokens
        "slippage": 10,                // Percent slippage allowed
        "priorityFee": 0.00001,          // Priority fee
        "pool": "pump" ,                        // Exchang e to trade on, "pump" or "raydium"
    })
    });
    if (response.status === 200) { // Successfully generated transaction
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        tx.sign([wallet]); // Sign the transaction with your wallet keypair
  
        const signature = await connection.sendTransaction(tx);
        console.log("Transaction: https://solscan.io/tx/" + signature);
  
        return signature; // Return the transaction signature
      } else {
        console.log(response.statusText); // Log error if the response is not successful
      }
}
