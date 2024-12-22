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
    console.error('Neplatná data:', data);
    return;
  }
  await fetch('/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

async function searchPackages(name: string): Promise<PackageData[]> {
  if (!name) {
    console.error('Vyhledávací jméno je prázdné');
    return [];
  }
  const response = await fetch(
    `/api/search?name=${encodeURIComponent(name.toLowerCase())}`
  );
  if (!response.ok) {
    console.error('Vyhledávání selhalo:', response.statusText);
    return [];
  }
  const results: PackageData[] = await response.json();
  return results.map((result) => ({
    ...result,
    name: result.name.charAt(0).toUpperCase() + result.name.slice(1), // Uprav první písmeno na velké
  }));
}

export default function Home() {
  const [formData, setFormData] = useState<PackageData>({
    fridge: 'Levá',
    shelf: 'První',
    name: '',
  });

  const [searchName, setSearchName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PackageData[]>([]);

  const handleSave = async () => {
    await savePackage(formData);
    setFormData({ ...formData, name: '' });
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
          <select
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            value={formData.fridge}
            onChange={(e) =>
              setFormData({ ...formData, fridge: e.target.value })
            }
          >
            <option value="Levá">Levá</option>
            <option value="Pravá">Pravá</option>
          </select>
          <select
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            value={formData.shelf}
            onChange={(e) =>
              setFormData({ ...formData, shelf: e.target.value })
            }
          >
            <option value="První">První</option>
            <option value="Druhá">Druhá</option>
            <option value="Třetí">Třetí</option>
            <option value="Čtvrtá">Čtvrtá</option>
          </select>
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
