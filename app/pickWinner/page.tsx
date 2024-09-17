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
    const transaction = await contractInstance.pickWinner();
    await transaction.wait();
  };

  const resetLottery = async () => {
    const transaction = await contractInstance.resetContract();
    await transaction.wait();
  };

  return (
    <div className="container">
      <h1>Result Page</h1>
      {isComplete ? (
        <p>The winner is {winner}</p>
      ) : isOwnerConnected ? (
        <button className="Pick Winner" onClick={pickWinner}>
          Pick Winner
        </button>
      ) : (
        <p>You are not the owner</p>
      )}
      <div className="reset-container">
        <button className="Restart Lottery" onClick={resetLottery}>
          Reset Lottery
        </button>
      </div>
    </div>
  );
}

export default Pickwinner;
