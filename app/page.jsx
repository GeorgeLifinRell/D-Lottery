"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import constants from "./constants";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [players, setPlayers] = useState([]);
  const [, setOwner] = useState("");
  const [isOwnerConnected, setIsOwnerConnected] = useState(false);

  const paymentAddress = constants.ownerAddress;

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          const signer = provider.getSigner();
          const address = await signer.getAddress();

          // Only show toast if the currentAccount changes for the first time
          if (!currentAccount) {
            setCurrentAccount(address);
            toast.success("Connected with account: " + address);
          }

          const accounts = await provider.listAccounts();
          if (accounts.length === 0) {
            toast.error("No account connected. Please connect MetaMask.");
            const requestedAccounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            setCurrentAccount(requestedAccounts[0]);
            toast.success("Connected with account: " + requestedAccounts[0]);
          } else {
            // Set the current account if already connected
            const address = accounts[0];
            setCurrentAccount(address);
            toast.success("Connected with account: " + address);
          }

          window.ethereum.on("accountsChanged", (accounts) => {
            setCurrentAccount(accounts[0]);
            toast("Account changed to: " + accounts[0], { icon: "🔄" });
          });
        } catch (err) {
          toast.error("Error fetching account. Please check MetaMask.");
        }
      } else {
        toast.error("MetaMask is not installed. Please install MetaMask.");
      }
    };

    const contract = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          constants.contractAddress,
          constants.contractAbi,
          signer
        );
        setContractInstance(contractInstance);
        const isComplete = await contractInstance.isComplete();
        setIsComplete(isComplete);
        const winner = await contractInstance.getWinner();
        winner === currentAccount ? setIsWinner(true) : setIsWinner(false);
        const players = await contractInstance.getPlayers();
        setPlayers(players);
        const owner = await contractInstance.getManager();
        setOwner(owner);
        owner === currentAccount
          ? setIsOwnerConnected(true)
          : setIsOwnerConnected(false);
      } catch (err) {
        toast.error("Failed to load contract or players data.");
      }
    };

    loadBlockchainData();
    contract();
  }, [currentAccount]);

  const enterLottery = async () => {
    if (!contractInstance) {
      toast.error("Contract not loaded. Please refresh the page.");
      return;
    }

    try {
      const amountToSend = ethers.utils.parseEther("0.001");
      toast.loading("Entering lottery...");
      const transaction = await contractInstance.enter({ value: amountToSend });
      await transaction.wait();
      toast.success("Successfully entered the lottery! 🎉");
    } catch (err) {
      toast.error("Failed to enter the lottery. Please try again.");
    } finally {
      toast.dismiss();
    }
  };

  const handleNavToContractOwnerPage = async () => {
    isOwnerConnected
      ? (window.location.href = "/owner")
      : toast.error("You are not the owner.");
  };

  const sendPayment = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask.");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const tx = await signer.sendTransaction({
        to: paymentAddress,
        value: ethers.utils.parseEther("0.01"),
      });
      toast.loading("Sending ETH...");
      await tx.wait();
      toast.success(
        "Payment successful 🎉\nYour support motivates me to do more! "
      );
    } catch (err) {
      toast.error("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 relative">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            minWidth: "auto",
            maxWidth: "100%",
            wordWrap: "break-word",
          },
        }}
      />{" "}
      {/* Toast container */}
      <h1 className="text-5xl font-extrabold mb-4 text-gray-800">D-Lottery</h1>
      <h3 className="text-2xl font-bold mb-8 text-gray-600">
        Decentralized lottery made with fairness at it&apos;s core!
      </h3>
      {/* Rules Button */}
      <button
        className="absolute top-8 left-8 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
        onClick={() => (window.location.href = "/rules")}
      >
        Rules Page
      </button>
      {/* Status Light */}
      <div className="flex items-center mb-4">
        <div
          className={`w-4 h-4 rounded-full mr-2 animate-blink ${
            isComplete
              ? "bg-red-600 animate-blink-red"
              : "bg-green-500 animate-blink-green"
          }`}
        ></div>
        <p className="text-xl font-semibold">
          {isComplete ? "Lottery Ended" : "Lottery Ongoing"}
        </p>
      </div>
      <div className="join-container w-full max-w-lg p-8 bg-white shadow-lg rounded-lg border border-gray-200">
        {isComplete ? (
          isWinner ? (
            <p className="text-2xl font-semibold text-green-600 mb-6">
              🎉 Congratulations! You are the winner!
            </p>
          ) : (
            <p className="text-2xl font-semibold text-red-600 mb-6">
              You&apos;re one step behind being the Web3 billionaire. Better
              luck next time!
            </p>
          )
        ) : (
          <>
            <button
              className="enter-lottery w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300 mb-4"
              onClick={enterLottery}
            >
              Enter Lottery
            </button>

            {/* Scrollable list of players */}
            <div className="w-full h-40 overflow-y-auto bg-gray-100 p-4 border border-gray-200 rounded-md mb-4">
              <h2 className="text-xl font-semibold mb-2">Players:</h2>
              {players.length > 0 ? (
                players.map((player, index) => (
                  <p key={index} className="text-gray-700">
                    {player}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No players yet...</p>
              )}
            </div>
          </>
        )}
      </div>
      <div className="absolute bottom-8 right-8 flex space-x-4">
        <a
          href="https://www.buymeacoffee.com/georgelifinrell"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300"
        >
          Buy me a coffee ☕
        </a>

        {/* Support Creator ETH Payment Button */}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          onClick={sendPayment}
        >
          Support Creator 💰
        </button>
        {/* Contract Owner Button */}
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition duration-300"
          onClick={handleNavToContractOwnerPage}
        >
          Contract Owner Page
        </button>
      </div>
    </div>
  );
}
