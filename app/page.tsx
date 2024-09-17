"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import constants from "./constants";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [contractInstance, setContractInstance] =
    useState<ethers.Contract>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isWinner, setIsWinner] = useState<boolean>(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider: ethers.providers.Web3Provider =
          new ethers.providers.Web3Provider(window.ethereum);
        try {
          const signer: ethers.providers.JsonRpcSigner = provider.getSigner();
          const address: string = await signer.getAddress();
          setCurrentAccount(address);
          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            setCurrentAccount(accounts[0]);
            console.log(accounts[0]);
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        alert("Please install METAMASK to continue...");
      }
    };

    const contract = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance: ethers.Contract = new ethers.Contract(
        constants.contractAddress,
        constants.contractAbi,
        signer
      );
      setContractInstance(contractInstance);
      const isComplete = await contractInstance.isComplete();
      setIsComplete(isComplete);
      const winner = await contractInstance.getWinner();
      winner == currentAccount ? setIsWinner(true) : setIsWinner(false);
    };

    loadBlockchainData();
    contract();
  }, [currentAccount]);

  const enterLottery = async () => {
    const amountToSend = ethers.utils.parseEther("0.001");
    const transaction = await contractInstance.enter({ value: amountToSend });
    await transaction.wait();
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 relative">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-800">D-Lottery</h1>

      {/* Contract Owner Button */}
      <button
        className="absolute top-8 right-8 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition duration-300"
        onClick={() => (window.location.href = "/owner")}
      >
        Contract Owner Page
      </button>

      <div className="join-container w-full max-w-lg p-8 bg-white shadow-lg rounded-lg border border-gray-200">
        {isComplete ? (
          isWinner ? (
            <p className="text-2xl font-semibold text-green-600 mb-6">
              🎉 Congratulations! You are the winner!
            </p>
          ) : (
            <p className="text-2xl font-semibold text-red-600 mb-6">
              Sorry, better luck next time!
            </p>
          )
        ) : (
          <button
            className="enter-lottery w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300"
            onClick={enterLottery}
          >
            Enter Lottery
          </button>
        )}
      </div>
    </div>
  );
}
