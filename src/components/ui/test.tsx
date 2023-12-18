import React, { useState } from 'react';

const ProposalComponent: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [voteFor, setVoteFor] = useState<number>(0);
  const [voteAgainst, setVoteAgainst] = useState<number>(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateProposal = async () => {
    try {
      const response = await fetch(
        'https://hirohack3marcoijazcodetech.loca.lt/api/events',
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
                        walletId: 110013,
                        proposalTitle: title,
                        proposalDescription: description,
                        voteForNum: 0,
                        voteAgainstNum: 0,
                        voteForHistory: [110013, 120020],
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
      // Now you can enable the voteFor and voteAgainst inputs
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const handleUpdateVotes = async () => {
    // Similar to handleCreateProposal, update the proposal with voteFor and voteAgainst
    // Use the current proposal data and update the voteForNum and voteAgainstNum fields
    // Update state accordingly
    try {
      const response = await fetch('URL_TO_UPDATE_PROPOSAL', {
        method: 'PUT', // or 'PATCH' depending on your API
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voteForNum: voteFor,
          voteAgainstNum: voteAgainst
        })
      });

      const data = await response.json();
      // Update state or handle response data as needed
      console.log('Votes updated:', data);
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const handleConcludeProposal = async () => {
    try {
      setIsLoading(true);
      // Fetch all proposals
      const response = await fetch(
        'https://hirohack3marcoijazcodetech.loca.lt/api/events'
      );
      const data = await response.json();
      // Update state with the list of proposals, including the newly created one
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          className="mt-2 px-2 border bg-yellow-200 hover:bg-violet-600 hover:text-white"
          onClick={handleCreateProposal}
        >
          Submit Proposal
        </button>
      </div>
      <div className="mt-1">
        {/* Display and enable voteFor and voteAgainst inputs here */}
      </div>
      <div>
        <button
          className="mt-2 px-2 border bg-yellow-200 hover:bg-violet-600 hover:text-white"
          onClick={handleUpdateVotes}
        >
          Submit Votes
        </button>
      </div>
      <div>
        <button
          className="mt-2 px-2 border bg-yellow-200 hover:bg-violet-600 hover:text-white"
          onClick={handleConcludeProposal}
          disabled={isLoading}
        >
          Conclude Proposal
        </button>
      </div>
      <div>
        <ul>
          {proposals.map((proposal) => (
            <li key={proposal.id}>
              <strong>Title:</strong> {proposal.proposalTitle}
              <br />
              <strong>Description:</strong> {proposal.proposalDescription}
              <br />
              <strong>Vote For:</strong> {proposal.voteForNum}
              <br />
              <strong>Vote Against:</strong> {proposal.voteAgainstNum}
              <br />
              <strong>Vote For History:</strong>{' '}
              {proposal.voteForHistory.join(', ')}
              <br />
              <strong>Vote Against History:</strong>{' '}
              {proposal.voteAgainstHistory.join(', ')}
              <hr />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProposalComponent;
