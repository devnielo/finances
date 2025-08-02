export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Prueba de Tailwind CSS v4
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Utilidades Básicas</h3>
            <div className="space-y-2">
              <div className="w-full h-4 bg-blue-500 rounded"></div>
              <div className="w-3/4 h-4 bg-green-500 rounded"></div>
              <div className="w-1/2 h-4 bg-red-500 rounded"></div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Flexbox</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="bg-blue-600 px-3 py-1 rounded text-sm">Item 1</span>
              <span className="bg-green-600 px-3 py-1 rounded text-sm">Item 2</span>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">
                Botón 1
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition-colors">
                Botón 2
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Responsive</h3>
            <div className="hidden md:block text-green-400 mb-2">✓ Visible en MD+</div>
            <div className="md:hidden text-red-400 mb-2">✓ Visible solo en SM</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-yellow-600 h-8 rounded"></div>
              <div className="bg-pink-600 h-8 rounded"></div>
              <div className="bg-teal-600 h-8 rounded lg:block hidden"></div>
              <div className="bg-orange-600 h-8 rounded lg:block hidden"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Test de Estado del Sistema
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Clases Utilizadas:</h3>
              <ul className="space-y-1 text-sm text-gray-400 font-mono">
                <li>• padding: p-6, p-8</li>
                <li>• margin: mb-4, mb-8</li>
                <li>• background: bg-gray-800, bg-black</li>
                <li>• text: text-white, text-purple-400</li>
                <li>• border: border, border-gray-700</li>
                <li>• rounded: rounded-lg, rounded-xl</li>
                <li>• grid: grid-cols-1, md:grid-cols-2</li>
                <li>• flex: flex, items-center</li>
                <li>• responsive: md:block, lg:grid-cols-4</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Estado Esperado:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Todas las utilidades de Tailwind funcionando</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Responsive breakpoints activos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Hover y transition efectos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Gradientes y colores</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Si puedes ver este diseño correctamente formateado, Tailwind CSS v4 está funcionando ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
