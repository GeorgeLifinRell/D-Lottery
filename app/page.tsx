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
    <div className="container bg-slate-500">
      <h1>D-Lottery Page</h1>
      <div className="join-container">
        {isComplete ? (
          isWinner ? (
            <p>You are the winner</p>
          ) : (
            <p>Better luck next time</p>
          )
        ) : (
          <button className="enter-lottery" onClick={enterLottery}>
            Enter Lottery
          </button>
        )}
      </div>
    </div>
  );
}
