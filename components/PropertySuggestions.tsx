import React, { useState } from 'react';
import { Client, Property } from '../types';
import { suggestProperties, PropertySuggestion } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoaderIcon } from './icons/LoaderIcon';

interface PropertySuggestionsProps {
  client: Client;
  properties: Property[];
}

const PropertySuggestions: React.FC<PropertySuggestionsProps> = ({ client, properties }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PropertySuggestion[]>([]);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await suggestProperties(client, properties);
      setSuggestions(result);
    } catch (err) {
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyById = (id: number) => properties.find(p => p.id === id);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">AI-Powered Property Suggestions</h3>
        <button
          onClick={handleGetSuggestions}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoaderIcon className="w-5 h-5 animate-spin" />
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
          <span>{loading ? 'Generating...' : 'Get Suggestions'}</span>
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {suggestions.length > 0 && (
        <div className="space-y-4 mt-4">
          {suggestions.map(({ propertyId, reason }) => {
            const property = getPropertyById(propertyId);
            if (!property) return null;

            return (
              <div key={property.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{property.location}</p>
                        <p className="text-sm text-gray-500">{property.size} Plot(s) - GHC {property.price.toLocaleString()}</p>
                      </div>
                       <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Match</span>
                  </div>
                <p className="mt-2 text-sm text-gray-700 border-l-4 border-blue-400 pl-3">
                  <span className="font-semibold">Reason:</span> {reason}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && suggestions.length === 0 && !error &&(
        <div className="text-center py-8">
            <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Click "Get Suggestions" to find matching properties for this client.</p>
        </div>
      )}
    </div>
  );
};

export default PropertySuggestions;