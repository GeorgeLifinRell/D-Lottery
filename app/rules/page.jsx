"use client";
function Rules() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-800">
        Lottery Prerequisites & Rules
      </h1>

      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-3xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-8">
          <li>You must have MetaMask installed on your browser.</li>
          <li>
            A minimum of <strong>0.001 ETH</strong> is required to enter the
            lottery.
          </li>
          <li>
            You must be connected to the Ethereum network (Sepolia testnet).
          </li>
          <li>
            Ensure your MetaMask account is connected to this Dapp (check the
            top right corner for account details).
          </li>
        </ul>

        <h2 className="text-3xl font-semibold mb-4">Lottery Rules</h2>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Each participant can only enter the lottery once per round.</li>
          <li>
            The lottery ends when a predefined condition is met (e.g., a
            specific number of players).
          </li>
          <li>
            A random winner is chosen when the lottery is complete, and all
            funds are sent to the winner.
          </li>
          <li>
            If you win, you will receive all the collected funds minus any
            transaction fees.
          </li>
          <li>The lottery is irreversible once entered.</li>
        </ul>

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Rules;
