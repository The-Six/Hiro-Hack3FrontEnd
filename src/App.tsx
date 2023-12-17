import React, { ReactElement, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  getAddressFromPublicKey,
  uintCV,
  cvToValue,
  standardPrincipalCV
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

  // Initialize your app configuration and user session here
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const message = 'Hello, Hiro Hacks!';
  const network = new StacksMainnet();

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
      setAddress(userData.profile.stxAddress.mainnet); // or .testnet for testnet
    },
    onCancel: () => {
      // Handle authentication cancellation here
    },
    redirectTo: '/'
  };

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

  const executeBootstrap = async () => {
    const senderAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = 'core';
    const functionName = 'construct';
    const bootstrap =
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edp000-bootstrap';
    const bootstrap2 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    const functionArgs = [standardPrincipalCV(bootstrap2)];
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
      console.log('Bootstrap Button clicked');
      console.log(cvToValue(result));
      // console.log(result);
    } catch (error) {
      console.error('Error fetching read-only function:', error);
    }
  };

  // const proposeContract = async () => {
  //   const senderAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  //   const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  //   const contractName = 'proposal-submission';
  //   const functionName = 'propose';
  //   const bootstrap =
  //     'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edp001-dev-fund';

  //   // const functionArgs = [
  //   //   standardPrincipalCV(bootstrap),
  //   //   'ProjectTitle',
  //   //   'ProjectDescription'
  //   // ];
  //   const functionArgs = [uintCV(10)];

  //   try {
  //     const result = await callReadOnlyFunction({
  //       network,
  //       contractAddress,
  //       contractName,
  //       functionName,
  //       functionArgs,
  //       senderAddress
  //     });
  //     setHasFetchedReadOnly(true);
  //     console.log('Bootstrap Button clicked');
  //     console.log(cvToValue(result));
  //     // console.log(result);
  //   } catch (error) {
  //     console.error('Error fetching read-only function:', error);
  //   }
  // };

  // const testIsExtension = async () => {
  //   // Define your contract details here
  //   // const senderAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  //   // const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  //   // const contractName = 'keys';
  //   // const functionName = 'is-keyholder';

  //   // const functionArgs = [standardPrincipalCV(senderAddress)];

  //   // const contractAddress = 'SP000000000000000000002Q6VF78';
  //   // const contractName = 'pox-3';
  //   // const functionName = 'is-pox-active';
  //   // const functionArgs = [uintCV(10)];

  //   const senderAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  //   const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  //   const contractName = 'core';
  //   const functionName = 'is-extension';
  //   const extensionAddress =
  //     'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.membership-token';

  //   // const functionArgs = [standardPrincipalCV(extensionAddress)];
  //   const functionArgs = [uintCV(10)];

  //   try {
  //     const result = await callReadOnlyFunction({
  //       network,
  //       contractAddress,
  //       contractName,
  //       functionName,
  //       functionArgs,
  //       senderAddress
  //     });
  //     setHasFetchedReadOnly(true);
  //     console.log('Button clicked');
  //     console.log(cvToValue(result));
  //     // console.log(result);
  //   } catch (error) {
  //     console.error('Error fetching read-only function:', error);
  //   }
  // };

  return (
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
        <div className="rounded-lg border bg-amber-400 p-8">
          <h1 className="mb-2 text-lg font-semibold">Welcome to Hiro Hacks!</h1>
          <p className="leading-normal text-muted-foreground">
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
                  className="h-auto p-0 text-base"
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
                className="h-auto p-0 text-base"
              >
                1. Connect your wallet
                <ArrowRight size={15} className="ml-1" />
              </Button>
            )}
            <div className="flex justify-between w-full">
              <Button
                onClick={signMessage}
                variant="link"
                className="h-auto p-0 text-base text-neutral-500"
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
                  className="h-auto p-0 text-base"
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
                  className="disabled h-auto p-0 text-base"
                >
                  3. Read from a smart contract
                  <ArrowRight size={15} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {userSession.isUserSignedIn() ? (
          <div className="mt-4 rounded-lg border bg-amber-400 p-8">
            <h1 className="text-xl underline text-center">Grants Program</h1>
            <h3 className="mt-4 text-lg">Instructions to run the program: </h3>
            <p className="mt-2">
              1. Go to terminal and open the clarinet console
            </p>
            <p className="text-white bg-black py-2 pl-4">clarinet console</p>
            <p className="mt-2">
              2. Execute the bootstrap proposal by inputting
            </p>
            <p className="text-white bg-black py-2 pl-4">
              (contract-call? .core construct .edp000-bootstrap)
            </p>
            <p className="mt-2">3. Submit the edp001-dev-fund proposal</p>
            <p className="text-white bg-black py-2 pl-4">
              (contract-call? .proposal-submission propose .edp001-dev-fund
              "Proposal-title" "Proposal-description")
            </p>
            <p className="mt-2">4. Advance the chain 144 blocks</p>
            <p className="text-white bg-black py-2 pl-4">
              ::advance_chain_tip 144
            </p>
            <p className="mt-2">
              5. Check the current proposal data before voting
            </p>
            <p className="text-white bg-black py-2 pl-4">
              (contract-call? .proposal-voting get-proposal-data
              .edp001-dev-fund)
            </p>
            <p className="mt-2">6. Vote Yes with 100 tokens</p>
            <p className="text-white bg-black py-2 pl-4">
              (contract-call? .proposal-voting vote u100 true .edp001-dev-fund)
            </p>
            <p className="mt-2">7. Check the updated proposal data</p>
            <p className="text-white bg-black py-2 pl-4">
              (contract-call? .proposal-voting get-proposal-data
              .edp001-dev-fund)
            </p>
            <p className="mt-2">8. Advance the chain tip</p>
            <p className="text-white bg-black py-2 pl-4">
              ::advance_chain_tip 1440
            </p>
            <p className="mt-2">9. Conclude the proposal vote</p>
            <p className="text-white bg-black py-2 pl-4">
              (contract-call? .proposal-voting conclude .edp001-dev-fund)
            </p>
            <p className="mt-2">10. Check the ede005-dev-fund contract now</p>
            <p className="text-white bg-black py-2 pl-4">::get_assets_maps</p>
            <p className="mt-4">
              Notes: Our contracts are not deployed on the blockchain and this
              is why we can only test the functionality locally through the
              clarinet console and not through a dynamic frontend. A button is
              created to validate this. Please open the Chrome Console to view
              the error message.
            </p>
            <button
              className="mt-4 px-2 border bg-yellow-200 hover:bg-violet-600 hover:text-white"
              onClick={() => executeBootstrap()}
            >
              Execute Bootstrap
            </button>
            {/* <br />
            <button
              className="mt-4 px-2 border hover:bg-violet-600 hover:text-white"
              onClick={() => proposeContract()}
            >
              Propose Contract
            </button>
            <br />
            <button
              className="mt-4 px-2 border hover:bg-violet-600 hover:text-white"
              onClick={() => testIsExtension()}
            >
              testIsExtension
            </button> */}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
