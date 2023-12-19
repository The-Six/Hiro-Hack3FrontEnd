import React, { ReactElement, useState, useEffect } from 'react';
import { StacksTestnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  getAddressFromPublicKey,
  uintCV,
  cvToValue,
  standardPrincipalCV,
  noneCV,
  contractPrincipalCV
} from '@stacks/transactions';
import {
  AppConfig,
  FinishedAuthData,
  showConnect,
  UserSession,
  openSignatureRequestPopup
} from '@stacks/connect';
import { verifyMessageSignatureRsv } from '@stacks/encryption';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from './external-link';
import { ArrowRight } from 'lucide-react';
import { truncateAddress } from './lib/utils';

function App(): ReactElement {
  const [address, setAddress] = useState('');
  const [isSignatureVerified, setIsSignatureVerified] = useState(false);
  const [hasFetchedReadOnly, setHasFetchedReadOnly] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [voteFor, setVoteFor] = useState(0);
  const [voteAgainst, setVoteAgainst] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProposal, setCurrentProposal] = useState({});
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentVoteForHistory, setCurrentVoteForHistory] = useState([]);
  const [currentVoteAgainstHistory, setCurrentVoteAgainstHistory] = useState(
    []
  );
  const [concludeText, setConcludeText] = useState('');
  const [onChainGetProposalData, setOnChainGetProposalData] = useState('');

  // Initialize your app configuration and user session here
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const message = 'Hello, Hiro Hacks!';
  const network = new StacksTestnet();

  // Define your authentication options here
  const authOptions = {
    userSession,
    appDetails: {
      name: 'My App',
      icon: 'src/favicon.svg'
    },
    onFinish: (data: FinishedAuthData) => {
      // Handle successful authentication here
      let userData = data.userSession.loadUserData();
      setAddress(userData.profile.stxAddress.testnet); // or .testnet for testnet
    },
    onCancel: () => {
      // Handle authentication cancellation here
    },
    redirectTo: '/'
  };

  useEffect(() => {
    getAllProposalData();
  }, []);

  const connectWallet = () => {
    showConnect(authOptions);
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut('/');
      setAddress('');
    }
  };

  const fetchReadOnly = async (senderAddress: string) => {
    // Define your contract details here
    const contractAddress = 'SP000000000000000000002Q6VF78';
    const contractName = 'pox-3';
    const functionName = 'is-pox-active';

    const functionArgs = [uintCV(10)];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress
      });
      setHasFetchedReadOnly(true);
      console.log(cvToValue(result));
    } catch (error) {
      console.error('Error fetching read-only function:', error);
    }
  };

  const signMessage = () => {
    if (userSession.isUserSignedIn()) {
      openSignatureRequestPopup({
        message,
        network,
        onFinish: async ({ publicKey, signature }) => {
          // Verify the message signature using the verifyMessageSignatureRsv function
          const verified = verifyMessageSignatureRsv({
            message,
            publicKey,
            signature
          });
          if (verified) {
            // The signature is verified, so now we can check if the user is a keyholder
            setIsSignatureVerified(true);
            console.log(
              'Address derived from public key',
              getAddressFromPublicKey(publicKey, network.version)
            );
          }
        }
      });
    }
  };

  const handleCreateProposal = async () => {
    try {
      const response = await fetch(
        'https://hirohack3marcoijazcodetech.loca.lt/api/submitProposal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apply: [
              {
                transactions: [
                  {
                    metadata: {
                      receipt: '...'
                    },
                    operations: [
                      {
                        walletId: address,
                        proposalTitle: title,
                        proposalDescription: description,
                        voteForNum: 0,
                        voteAgainstNum: 0,
                        voteForHistory: [],
                        voteAgainstHistory: []
                      }
                    ]
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      // Update state or handle response data as needed
      console.log('Proposal created:', data);

      // It will set the current proposal without id from the Supabase database
      setCurrentProposal({
        walletId: address,
        proposalTitle: title,
        proposalDescription: description,
        voteForNum: 0,
        voteAgainstNum: 0,
        voteForHistory: [],
        voteAgainstHistory: []
      });
      setCurrentTitle(title);
      setCurrentDescription(description);
      setVoteFor(0);
      setVoteAgainst(0);
      setCurrentVoteForHistory([]);
      setCurrentVoteAgainstHistory([]);

      // Refresh the proposal history
      getAllProposalData();

      // Clear the conclude text
      setConcludeText('');

      // Now you can enable the voteFor and voteAgainst inputs
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const handleUpdateVoteFor = async () => {
    // Similar to handleCreateProposal, update the proposal with voteFor and voteAgainst
    // Update state accordingly

    try {
      const response = await fetch(
        'https://hirohack3marcoijazcodetech.loca.lt/api/voteFor',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: currentTitle,
            description: currentDescription,
            updatedNumVoteFor: voteFor + 1,
            updatedVoteForHistory: [...currentVoteForHistory, address]
          })
        }
      );

      const data = await response.json();
      // Update state or handle response data as needed
      console.log('Votes updated:', data);
      setVoteFor(voteFor + 1);
      setCurrentVoteForHistory([...currentVoteForHistory, address]);
      console.log('Array: ' + [...currentVoteForHistory, address]);

      // Refresh the proposal history
      getAllProposalData();
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const handleUpdateVoteAgainst = async () => {
    // Similar to handleCreateProposal, update the proposal with voteFor and voteAgainst
    // Update state accordingly

    try {
      const response = await fetch(
        'https://hirohack3marcoijazcodetech.loca.lt/api/voteAgainst',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: currentTitle,
            description: currentDescription,
            updatedNumVoteAgainst: voteAgainst + 1,
            updatedVoteAgainstHistory: [...currentVoteAgainstHistory, address]
          })
        }
      );

      const data = await response.json();
      // Update state or handle response data as needed
      console.log('Votes updated:', data);
      setVoteAgainst(voteAgainst + 1);
      setCurrentVoteAgainstHistory([...currentVoteAgainstHistory, address]);
      console.log('Array: ' + [...currentVoteAgainstHistory, address]);

      // Refresh the proposal history
      getAllProposalData();
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const handleConcludeProposal = async () => {
    if (voteFor > voteAgainst) {
      setConcludeText(
        'The number of vote-for is greater than the vote-against, hence the proposal can be granted and 3000 membership tokens can be assigned to the proposal.'
      );
    } else {
      setConcludeText(
        'The number of vote-for is not enough for the proposal to have the grant.'
      );
    }
  };

  const getAllProposalData = async () => {
    try {
      setIsLoading(true);
      // Fetch all proposals
      const response = await fetch(
        'https://hirohack3marcoijazcodetech.loca.lt/api/getAllProposal'
      );
      const data = await response.json();
      // Update state with the list of proposals, including the newly created one
      // reverse() will let the latest proposal be the first one in the list
      const reversedData = data.data.reverse();
      setProposals(reversedData);
      if (Object.keys(currentProposal).length === 0) {
        if (data.data.length > 0) {
          setCurrentProposal(reversedData[0]);
          setCurrentTitle(reversedData[0].proposaltitle);
          setCurrentDescription(reversedData[0].proposaldescription);
          setVoteFor(reversedData[0].votefornum);
          setVoteAgainst(reversedData[0].voteagainstnum);
          setCurrentVoteForHistory(reversedData[0].voteforhistory);
          setCurrentVoteAgainstHistory(reversedData[0].voteagainsthistory);
        }
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // This function interacts with the testnet
  const getProposalData = async () => {
    const senderAddress = 'ST3NN4DN22G3DWRFXB94PS3TXHY8CBA6H6JSD0RJD';
    const contractAddress = 'ST3NN4DN22G3DWRFXB94PS3TXHY8CBA6H6JSD0RJD';
    const contractName = 'proposal-voting';
    const functionName = 'get-proposal-data';
    const bootstrap = 'ST3NN4DN22G3DWRFXB94PS3TXHY8CBA6H6JSD0RJD';
    //const bootstrap2 =
    //  'ST3NN4DN22G3DWRFXB94PS3TXHY8CBA6H6JSD0RJD.edp001-dev-fund';
    const functionArgs = [contractPrincipalCV(bootstrap, 'edp001-dev-fund')];

    //const functionArgs = [standardPrincipalCV(bootstrap2)];
    // const functionArgs = [uintCV(10)];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress
      });
      setHasFetchedReadOnly(true);
      console.log('Success!');
      console.log(cvToValue(result));
      setOnChainGetProposalData(cvToValue(result));
      // console.log(result);
    } catch (error) {
      console.error('Error fetching read-only function:', error);
    }
  };

  return (
    <div className="mt-4 mb-4 rounded bg-amber-400">
      <div className="flex items-center justify-center min-h-screen">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-center">
            <img
              className="mb-4 mt-4 rounded-lg"
              src="../assets/marcoijazcodetech-coloured.png"
              alt="logo"
              width="150px"
            />
          </div>
          <div className="rounded-lg border bg-stone-700 p-8 text-white">
            <h1 className="mb-2 text-lg font-semibold">
              Welcome to Hiro Hacks!
            </h1>
            <p className="leading-normal text-muted-foreground text-neutral-400">
              This is an open source starter template built with{' '}
              <ExternalLink href="https://docs.hiro.so/stacks.js/overview">
                Stacks.js
              </ExternalLink>{' '}
              and a few integrations to help kickstart your app:
            </p>

            <div className="mt-4 flex flex-col items-start space-y-2">
              {userSession.isUserSignedIn() ? (
                <div className="flex justify-between w-full">
                  <Button
                    onClick={disconnectWallet}
                    variant="link"
                    className="h-auto p-0 text-base text-white"
                  >
                    1. Disconnect wallet
                    <ArrowRight size={15} className="ml-1" />
                  </Button>
                  {address && <span>{truncateAddress(address)}</span>}
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  variant="link"
                  className="h-auto p-0 text-base text-white"
                >
                  1. Connect your wallet
                  <ArrowRight size={15} className="ml-1" />
                </Button>
              )}
              <div className="flex justify-between w-full">
                <Button
                  onClick={signMessage}
                  variant="link"
                  className="h-auto p-0 text-base text-neutral-400"
                >
                  2. Sign a message
                  <ArrowRight size={15} className="ml-1" />
                </Button>
                {isSignatureVerified && <span>{message}</span>}
              </div>

              {userSession.isUserSignedIn() ? (
                <div className="flex justify-between w-full">
                  <Button
                    onClick={() => fetchReadOnly(address)}
                    variant="link"
                    className="h-auto p-0 text-base text-white"
                  >
                    3. Read from a smart contract
                    <ArrowRight size={15} className="ml-1" />
                  </Button>
                  {hasFetchedReadOnly && (
                    <span>
                      <Badge className="text-orange-500 bg-orange-100">
                        Success
                      </Badge>
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex justify-between w-full">
                  <Button
                    variant="link"
                    className="disabled h-auto p-0 text-base text-white"
                  >
                    3. Read from a smart contract
                    <ArrowRight size={15} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {userSession.isUserSignedIn() ? (
            <div className="mt-4 mb-4 rounded-lg border bg-stone-700 p-8 text-white">
              <div>
                <h1 className="text-xl underline text-center">
                  Custom Blockchain API Front-End
                </h1>
                <div className="mt-6">
                  <label>Title:</label>
                  <br />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label>Description:</label>
                  <br />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    className="mt-2 px-2 border bg-amber-400 text-gray-700 hover:bg-violet-600 hover:text-white"
                    onClick={handleCreateProposal}
                  >
                    Submit Proposal
                  </button>
                </div>
                <div className="mt-1">
                  {/* Display and enable voteFor and voteAgainst inputs here */}
                </div>
                <div className="flex">
                  <p className="flex items-center justify-center">
                    The current proposal selected:
                  </p>
                  <p className="font-bold">&nbsp;{currentTitle}</p>
                </div>
                <div className="flex items-center justify-center border py-4">
                  <div>
                    <p>Vote-For Number: {voteFor}</p>
                    <div>
                      <button
                        className="mt-2 px-2 border bg-amber-400 text-gray-700 hover:bg-violet-600 hover:text-white"
                        onClick={handleUpdateVoteFor}
                      >
                        Submit Vote-For
                      </button>
                    </div>
                  </div>
                  <div className="ml-8">
                    <p>Vote-Against Number: {voteAgainst}</p>
                    <div>
                      <button
                        className="mt-2 px-2 border bg-amber-400 text-gray-700 hover:bg-violet-600 hover:text-white"
                        onClick={handleUpdateVoteAgainst}
                      >
                        Submit Vote-Against
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    className="mt-4 px-2 border bg-red-600 text-white hover:bg-violet-600 hover:text-white"
                    onClick={handleConcludeProposal}
                    disabled={isLoading}
                  >
                    Conclude Proposal
                  </button>
                </div>
                <div>
                  <p className="mt-4">{concludeText}</p>
                </div>
                {/* <button
                  className="mt-4 px-2 border bg-amber-400 text-gray-700 hover:bg-violet-600 hover:text-white"
                  onClick={() => getAllProposalData()}
                >
                  Refresh All Proposal History
                </button> */}
                <hr className="mt-8 mb-2" />
                <div className="flex items-center justify-center">
                  <h1 className="text-lg mt-4">Proposal History</h1>
                </div>
                <div className="mt-4">
                  <ul>
                    {proposals.map((proposal) => (
                      <li key={proposal.id}>
                        <strong>Wallet ID:</strong> {proposal.walletid}
                        <br />
                        <strong>Title:</strong> {proposal.proposaltitle}
                        <br />
                        <strong>Description:</strong>{' '}
                        {proposal.proposaldescription}
                        <br />
                        <strong>Vote For:</strong> {proposal.votefornum}
                        <br />
                        <strong>Vote Against:</strong> {proposal.voteagainstnum}
                        <br />
                        <strong>Vote For History:</strong>{' '}
                        {proposal.voteforhistory.join(', ')}
                        <br />
                        <strong>Vote Against History:</strong>{' '}
                        {proposal.voteagainsthistory.join(', ')}
                        <hr className="mt-4 mb-4" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4">
                Notes: The following button will interact with the testnet.
              </p>
              <button
                className="mt-4 px-2 border bg-amber-400 text-gray-700 hover:bg-violet-600 hover:text-white"
                onClick={() => getProposalData()}
              >
                Get Proposal Data (On-Chain)
              </button>
              {onChainGetProposalData ? (
                <div>
                  <p>Type: {onChainGetProposalData.type}</p>
                  <p className="mt-4">
                    More info can be found in the Chrome console.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
