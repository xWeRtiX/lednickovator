'use client';
import { useState } from 'react';
import debounce from 'lodash.debounce';

interface PackageData {
  fridge: string;
  shelf: string;
  name: string;
}

async function savePackage(data: PackageData): Promise<void> {
  if (!data.fridge || !data.shelf || !data.name) {
    console.error('Invalid data:', data);
    return;
  }

  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Posíláme tělo jako JSON
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Save failed:', errorData?.error || response.statusText);
    }
  } catch (error) {
    console.error('Error sending save request:', error);
  }
}

async function searchPackages(name: string): Promise<PackageData[]> {
  if (!name) {
    console.error('Search name is empty');
    return [];
  }

  try {
    const response = await fetch(
      `/api/search?name=${encodeURIComponent(name)}`
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Search failed:', errorData?.error || response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching packages:', error);
    return [];
  }
}

export default function Home() {
  const [formData, setFormData] = useState<PackageData>({
    fridge: '',
    shelf: '',
    name: '',
  });

  const [searchName, setSearchName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PackageData[]>([]);

  const handleSave = async () => {
    await savePackage(formData);
    setFormData({ ...formData, name: '' }); // Zachovat "fridge" a "shelf"
  };

  const debouncedSearch = debounce(async (name: string) => {
    if (!name.trim()) return setSearchResults([]);
    const results = await searchPackages(name);
    setSearchResults(results);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSearchName(name);
    debouncedSearch(name);
  };

  const handleClearSearch = () => {
    setSearchName('');
    setSearchResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-8">
        Správce balíčků v lednici
      </h1>

      <div className="mb-8 p-6 bg-gray-100 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Přidat balíček
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            type="text"
            placeholder="Lednice"
            value={formData.fridge}
            onChange={(e) =>
              setFormData({ ...formData, fridge: e.target.value })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            type="text"
            placeholder="Polička"
            value={formData.shelf}
            onChange={(e) =>
              setFormData({ ...formData, shelf: e.target.value })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            type="text"
            placeholder="Jméno"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <button
          className="mt-4 w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleSave}
        >
          Uložit balíček
        </button>
      </div>

      <div className="p-6 bg-gray-100 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Vyhledat balíčky
        </h2>
        <div className="flex gap-4">
          <input
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            type="text"
            placeholder="Vyhledat podle jména"
            value={searchName}
            onChange={handleSearchChange}
          />
          <button
            className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={handleClearSearch}
          >
            Vymazat
          </button>
        </div>
        <ul className="mt-4 divide-y divide-gray-200">
          {searchResults.map((result, index) => (
            <li className="py-4" key={index}>
              <span className="block text-gray-700">
                <strong>Lednice:</strong> {result.fridge}
              </span>
              <span className="block text-gray-700">
                <strong>Polička:</strong> {result.shelf}
              </span>
              <span className="block text-gray-700">
                <strong>Jméno:</strong> {result.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
