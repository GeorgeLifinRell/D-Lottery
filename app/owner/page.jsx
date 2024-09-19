"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import constants from "../constants";
import toast, { Toaster } from "react-hot-toast";

function Owner() {
  const [, setOwner] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwnerConnected, setIsOwnerConnected] = useState(false);
  const [winner, setWinner] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setCurrentAccount(address);
          window.ethereum.on("accountsChanged", (accounts) => {
            setCurrentAccount(accounts[0]);
            toast("Account changed to: " + accounts[0], { icon: "🔄" }); // Inform on account change
          });
        } catch (err) {
          toast.error("Failed to load account. Please check MetaMask."); // Error handling
        }
      } else {
        toast.error("Please install MetaMask to continue.");
      }
    };

    const contract = async () => {
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
        setWinner(winner);
        const owner = await contractInstance.getManager();
        setOwner(owner);
        owner === currentAccount
          ? setIsOwnerConnected(true)
          : setIsOwnerConnected(false);
      } catch (err) {
        toast.error("Failed to load contract data.");
      }
    };

    loadBlockchainData();
    contract();
  }, [currentAccount]);

  const pickWinner = async () => {
    if (!isOwnerConnected) {
      toast.error("You are not the contract owner!");
      return;
    }
    try {
      toast.loading("Picking the winner...");
      const transaction = await contractInstance.pickWinner();
      await transaction.wait();
      toast.success("Winner has been picked! 🎉");
    } catch (err) {
      toast.error("Error picking winner. Please try again.");
    } finally {
      toast.dismiss(); // Remove the loading toast
    }
  };

  const resetLottery = async () => {
    if (!isOwnerConnected) {
      toast.error("You are not the contract owner!"); // Inform if not owner
      return;
    }
    try {
      toast.loading("Resetting the lottery...");
      const transaction = await contractInstance.resetContract();
      await transaction.wait();
      toast.success("Lottery has been reset! 🎲");
    } catch (err) {
      toast.error("Error resetting lottery. Please try again.");
    } finally {
      toast.dismiss(); // Remove the loading toast
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Toast container */}
      <h1 className="text-5xl font-bold mb-10 text-gray-800">Owner Panel</h1>
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8">
        {isComplete ? (
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-green-600 mb-4">
              🎉 The Winner is {winner}!
            </h2>
            <p className="text-lg text-gray-600">
              The lottery has been completed. Please reset the lottery to start
              a new round.
            </p>
          </div>
        ) : isOwnerConnected ? (
          <div className="text-center mb-8">
            <p className="text-xl font-semibold text-blue-600 mb-6">
              You are connected as the contract owner.
            </p>

            {/* Pick Winner Button */}
            <button
              className="px-8 py-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 mb-4"
              onClick={pickWinner}
            >
              Pick Winner
            </button>
          </div>
        ) : (
          <div className="text-center mb-8">
            <p className="text-xl font-semibold text-red-600 mb-4">
              You are not the contract owner.
            </p>
            <p className="text-lg text-gray-500">
              Please connect with the correct account to access owner functions.
            </p>
          </div>
        )}
        {isOwnerConnected ? (
          <button
            className="px-8 py-4 self-center bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            onClick={resetLottery}
          >
            Reset Lottery
          </button>
        ) : (
          <></>
        )}
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Contract Address: {constants.contractAddress}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Owner;
