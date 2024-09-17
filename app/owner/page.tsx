"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import constants from "../constants";

function Pickwinner() {
  const [owner, setOwner] = useState<string>("");
  const [contractInstance, setContractInstance] = useState<any>("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwnerConnected, setIsOwnerConnected] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");
  const [isComplete, setIsComplete] = useState<string>("");

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          console.log(address);
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
      setWinner(winner);
      const owner = await contractInstance.getManager();
      setOwner(owner);
      owner === currentAccount
        ? setIsOwnerConnected(true)
        : setIsOwnerConnected(false);
    };
    loadBlockchainData();
    contract();
  }, [currentAccount]);

  const pickWinner = async () => {
    try {
      const transaction = await contractInstance.pickWinner();
      await transaction.wait();
    } catch (err) {
      console.log(err);
    }
  };

  const resetLottery = async () => {
    try {
      const transaction = await contractInstance.resetContract();
      await transaction.wait();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400">Result Page</h1>

      {isComplete ? (
        <p className="text-xl font-semibold text-green-400 mb-4">
          The winner is {winner}
        </p>
      ) : isOwnerConnected ? (
        <button
          className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-300 mb-4"
          onClick={pickWinner}
        >
          Pick Winner
        </button>
      ) : (
        <p className="text-xl font-semibold text-red-400 mb-4">
          You are not the owner
        </p>
      )}

      <div className="reset-container mt-6">
        <button
          className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition duration-300"
          onClick={resetLottery}
        >
          Reset Lottery
        </button>
      </div>
    </div>
  );
}

export default Pickwinner;
