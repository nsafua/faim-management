import React from 'react';
import { Client } from '../types';
import { EnvelopeIcon, PencilSquareIcon, PhoneIcon } from './icons/DummyIcons';

interface ClientProfileHeaderProps {
  client: Client;
  onAmend?: () => void;
}

const getStatusColor = (status: Client['status']) => {
  switch (status) {
    case 'Active Client':
      return 'bg-green-100 text-green-800';
    case 'Refunded':
      return 'bg-yellow-100 text-yellow-800';
    case 'Reallocated':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ClientProfileHeader: React.FC<ClientProfileHeaderProps> = ({ client, onAmend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {client.photo ? (
            <img src={client.photo} alt="Client" className="w-24 h-24 rounded-full object-cover flex-shrink-0" />
        ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl flex-shrink-0">
                {client.initials}
            </div>
        )}
        <div className="flex-grow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Registered on: {client.regDate} | Property: <strong>{client.location} ({client.plot})</strong>
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 hover:text-blue-600">
              <EnvelopeIcon className="w-5 h-5" />
              <span>{client.email}</span>
            </a>
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-blue-600">
              <PhoneIcon className="w-5 h-5" />
              <span>{client.phone}</span>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
            {onAmend && (
                <button onClick={onAmend} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <PencilSquareIcon className="w-5 h-5" /> Amendment
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfileHeader;